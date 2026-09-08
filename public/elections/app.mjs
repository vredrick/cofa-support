import { FORMS, OFFICES } from './definitions.mjs';
import { createElectionPdf, createInstructionPdf, printNotes } from './pdf.mjs';
import { createSigningSection } from './signing.mjs';
import { EMAIL_WARNING_BYTES } from './attachments.mjs';
import { districtChoices, districtForChoice, DISTRICT_SOURCE } from './districts.mjs';

const $ = id => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
// Only trusted static template copy is rendered as markup. Answers use textContent.
const copy = (className, html) => { const node = el('div', className); node.innerHTML = html; return node; };
const current = FORMS.find(form => form.id === new URLSearchParams(location.search).get('form'));
const values = {};
let blobUrl = null;
let instructionUrl = null;
let signing;
let revision = 0;
const matches = condition => !condition || values[condition.k] === condition.eq;

function clearResult() {
  revision++;
  $('result').hidden = true;
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
  if (instructionUrl) { URL.revokeObjectURL(instructionUrl); instructionUrl = null; }
  $('instructions-download').hidden = true;
  $('instructions-download').removeAttribute('href');
  $('download').removeAttribute('href');
  $('preview').removeAttribute('href');
}
function changed(key, value) {
  values[key] = value;
  clearResult();
  $('error').hidden = true;
  refresh();
}
function refresh() {
  document.querySelectorAll('select[data-district-state]').forEach(input => {
    const state = values[input.dataset.districtState] || '';
    if (input.dataset.loadedState === state) return;
    input.dataset.loadedState = state;
    values[input.name] = '';
    input.replaceChildren();
    const empty = el('option', '', state ? 'Choose your home place…' : 'Choose a state first');
    empty.value = ''; input.append(empty); input.disabled = !state;
    let group;
    for (const choice of districtChoices(state)) {
      if (group?.label !== `ED ${choice.ed}`) {
        group = el('optgroup'); group.label = `ED ${choice.ed}`; input.append(group);
      }
      const option = el('option', '', `${choice.place} — ED ${choice.ed}`);
      option.value = choice.value; group.append(option);
    }
  });
  signing?.refresh(values);
  $('guide-label').textContent = signing?.email ? 'Create a separate instruction sheet' : 'Include print instructions';
  document.querySelectorAll('[data-condition]').forEach(node => { node.hidden = !matches(JSON.parse(node.dataset.condition)); });
  document.querySelectorAll('[data-warn]').forEach(node => { node.hidden = !(values.fel === 'y' || values.men === 'y'); });
  const address = $('office-address');
  if (address) {
    address.hidden = !OFFICES[values.state];
    address.textContent = OFFICES[values.state] ? `Mailing address printed on the form: ${OFFICES[values.state].join(', ')}` : '';
  }
}
function fieldNode(field, groupLabel) {
  if (field.q) return el('p', 'question', field.q);
  if (field.askAfter) return copy('note', field.askAfter);
  if (field.warnIf) { const node = copy('note', field.html); node.dataset.warn = 'true'; node.hidden = true; return node; }
  if (field.askIf) { const node = copy('note', field.html); node.dataset.condition = JSON.stringify(field.askIf); node.hidden = true; return node; }
  let node;
  if (field.t === 'cards' || field.t === 'seg') {
    node = el('fieldset', 'choice-group');
    node.append(el('legend', 'sr-only', groupLabel));
    const choices = el('div', field.t === 'seg' ? 'segments' : 'choices');
    for (const option of field.options) {
      const label = el('label', 'choice');
      const input = el('input'); input.type = 'radio'; input.name = field.k; input.value = option.v;
      input.addEventListener('change', () => changed(field.k, input.value));
      const text = el('span'); text.append(el('b', '', option.l));
      if (option.due) text.append(el('small', 'due', option.due));
      if (option.sub) text.append(el('small', '', option.sub));
      label.append(input, text); choices.append(label);
    }
    node.append(choices);
  } else if (field.t === 'check') {
    node = el('label', 'check');
    const input = el('input'); input.type = 'checkbox'; input.name = field.k;
    input.addEventListener('change', () => changed(field.k, input.checked));
    node.append(input, el('span', '', field.l));
  } else {
    node = el('div', 'field');
    const label = el('label', '', field.l || groupLabel); label.htmlFor = `field-${field.k}`;
    const input = el(field.t === 'select' || field.t === 'district' ? 'select' : 'input');
    input.id = label.htmlFor; input.name = field.k;
    if (field.t === 'district') {
      input.dataset.districtState = field.stateKey;
    } else if (field.t === 'select') {
      const empty = el('option', '', 'Choose…'); empty.value = ''; input.append(empty);
      for (const option of field.options) { const item = el('option', '', option); item.value = option; input.append(item); }
    } else {
      input.type = field.t === 'date' ? 'date' : 'text';
      if (field.ph) input.placeholder = field.ph;
      if (field.ac) input.autocomplete = field.ac;
      if (field.im) input.inputMode = field.im;
      if (field.max) input.maxLength = field.max;
    }
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () =>
      changed(field.k, field.t === 'district' ? districtForChoice(values[field.stateKey], input.value) : input.value));
    node.append(label, input);
    if (field.t === 'district') {
      const help = el('p', 'hint', 'Places are grouped by electoral division. Your selection fills only the ED number on the PDF. ');
      help.id = `${input.id}-help`; input.setAttribute('aria-describedby', help.id);
      const source = el('a', '', 'View the official district list');
      source.href = DISTRICT_SOURCE; source.target = '_blank'; source.rel = 'noopener';
      help.append(source); node.append(help);
    }
    if (field.info) {
      const details = el('details', 'info'); details.append(el('summary', '', `About ${field.l || 'this field'}`), el('p', '', field.info)); node.append(details);
    }
  }
  if (field.showIf) node.dataset.condition = JSON.stringify(field.showIf);
  return node;
}

function showForm() {
  document.title = `${current.title} | COFA Support`;
  $('title').textContent = current.title;
  $('subtitle').textContent = current.who;
  $('form').hidden = false; $('action-bar').hidden = false;
  if (current.intro) $('form').append(copy('note', current.intro.html));
  const blank = el('a', 'blank', 'Download the blank form instead ↗');
  blank.href = `../forms/fsm-${current.id}.pdf`; blank.download = `FSM-${current.id}-blank.pdf`;
  $('form').append(blank);
  for (const section of current.sections) {
    const host = el('section', 'section');
    if (section.h) host.append(el('h2', '', section.h));
    if (section.lede) host.append(el('p', 'lede', section.lede));
    if (section.ask) host.append(copy('note', section.ask));
    let groupLabel = section.h || 'Choose an answer';
    let columns = null;
    for (const field of section.fields || []) {
      if (field.q) { groupLabel = field.q; columns = null; host.append(el('p', 'question', field.q)); continue; }
      const node = fieldNode(field, groupLabel);
      if (field.cols && !field.showIf) {
        if (!columns) { columns = el('div', 'cols'); host.append(columns); }
        columns.append(node);
      } else { columns = null; host.append(node); }
    }
    if (section.hint) host.append(el('p', 'hint', section.hint));
    if (section.infoFor) { const address = el('p', 'address'); address.id = 'office-address'; address.hidden = true; host.append(address); }
    $('form').append(host);
  }
  signing = createSigningSection(current, () => { clearResult(); $('error').hidden = true; refresh(); });
  $('form').append(signing.node);
  refresh();
}
if (current) showForm();
else {
  for (const form of [...FORMS].reverse()) {
    const link = el('a', 'form-pick'); link.href = `?form=${form.id}`;
    link.append(el('h2', '', form.title), el('p', '', form.blurb), el('span', '', 'Fill form →')); $('picker').append(link);
  }
}

$('guide').addEventListener('change', clearResult);
$('form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!current) return;
  const button = $('generate'); button.disabled = true; button.textContent = 'Creating PDF…';
  clearResult(); $('error').hidden = true;
  const startedAt = revision;
  const snapshot = { ...values };
  const includeGuide = $('guide').checked;
  try {
    if (!window.PDFLib) throw new Error('The PDF tool could not load. Reload this page and try again, or download the blank form.');
    const options = signing.snapshot();
    const email = signing.email;
    const response = await fetch(`../forms/fsm-${current.id}.pdf`);
    if (!response.ok) throw new Error('The form template could not load. Please try again.');
    const bytes = await createElectionPdf(current, snapshot, await response.arrayBuffer(), includeGuide, window.PDFLib, options);
    const instructions = email && includeGuide ? await createInstructionPdf(current, snapshot, true, window.PDFLib) : null;
    if (startedAt !== revision) throw new Error('Your answers changed while the PDF was being created. Create it again to include your latest answers.');
    blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    $('download').href = blobUrl; $('download').download = current.filename;
    $('preview').href = blobUrl;
    if (instructions) {
      instructionUrl = URL.createObjectURL(new Blob([instructions], { type: 'application/pdf' }));
      $('instructions-download').href = instructionUrl;
      $('instructions-download').download = 'FSM-registration-instructions-KEEP.pdf';
      $('instructions-download').hidden = false;
    }
    $('result-title').textContent = email ? 'Your signed registration PDF is ready' : 'Your form is ready to print';
    $('preview').textContent = email ? 'Preview signed PDF' : 'Open PDF to print';
    $('result-notes').textContent = printNotes(current, snapshot, !!options.signature, !!options.attachments?.length);
    $('result-help').textContent = email ? 'Download and check the PDF, then attach it to your email. The instruction sheet is separate. Nothing has been submitted.' : 'In the PDF viewer, choose Print or press Ctrl+P (Command+P on a Mac). Nothing has been submitted.';
    $('size-warning').hidden = !email || bytes.byteLength <= EMAIL_WARNING_BYTES;
    $('size-warning').textContent = `This PDF is ${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB, over 20 MB. Email services may reject a large attachment. Choose “I'll attach them myself” and send smaller document files, or reduce your scanned PDFs before trying again.`;
    $('result').hidden = false; $('result').focus(); $('result').scrollIntoView({ block: 'center' });
  } catch (error) {
    $('error').textContent = error.message || 'The PDF could not be created. Please try again.';
    $('error').hidden = false; $('error').scrollIntoView({ block: 'center' });
  } finally { button.disabled = false; button.textContent = 'Create filled PDF'; }
});
window.addEventListener('pagehide', clearResult);
window.addEventListener('pageshow', event => { if (event.persisted) clearResult(); });
