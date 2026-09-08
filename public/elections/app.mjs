import { FORMS, OFFICES } from './definitions.mjs';
import { createElectionPdf, printNotes } from './pdf.mjs';

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
let revision = 0;
const matches = condition => !condition || values[condition.k] === condition.eq;

function clearResult() {
  revision++;
  $('result').hidden = true;
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
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
    const input = el(field.t === 'select' ? 'select' : 'input');
    input.id = label.htmlFor; input.name = field.k;
    if (field.t === 'select') {
      const empty = el('option', '', 'Choose…'); empty.value = ''; input.append(empty);
      for (const option of field.options) { const item = el('option', '', option); item.value = option; input.append(item); }
    } else {
      input.type = field.t === 'date' ? 'date' : 'text';
      if (field.ph) input.placeholder = field.ph;
      if (field.ac) input.autocomplete = field.ac;
      if (field.im) input.inputMode = field.im;
      if (field.max) input.maxLength = field.max;
    }
    input.addEventListener('input', () => changed(field.k, input.value));
    node.append(label, input);
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
  const finish = el('section', 'section'); finish.append(el('h2', '', 'Print and sign by hand'), el('p', 'lede', printNotes(current)));
  finish.append(el('p', 'hint', 'Check every answer before creating your PDF. Unknown fields may be left blank to complete by hand. The signature and date spaces stay blank.'));
  $('form').append(finish);
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
  try {
    if (!window.PDFLib) throw new Error('The PDF tool could not load. Reload this page and try again, or download the blank form.');
    const response = await fetch(`../forms/fsm-${current.id}.pdf`);
    if (!response.ok) throw new Error('The form template could not load. Please try again.');
    const bytes = await createElectionPdf(current, snapshot, await response.arrayBuffer(), $('guide').checked, window.PDFLib);
    if (startedAt !== revision) throw new Error('Your answers changed while the PDF was being created. Create it again to include your latest answers.');
    blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    $('download').href = blobUrl; $('download').download = current.filename;
    $('preview').href = blobUrl;
    $('result-notes').textContent = printNotes(current);
    $('result').hidden = false; $('result').focus(); $('result').scrollIntoView({ block: 'center' });
  } catch (error) {
    $('error').textContent = error.message || 'The PDF could not be created. Please try again.';
    $('error').hidden = false; $('error').scrollIntoView({ block: 'center' });
  } finally { button.disabled = false; button.textContent = 'Create filled PDF'; }
});
window.addEventListener('pagehide', () => { if (blobUrl) URL.revokeObjectURL(blobUrl); });
window.addEventListener('pageshow', event => { if (event.persisted) clearResult(); });
