import { createSignaturePad } from './signature.mjs';
import { prepareAttachment } from './attachments.mjs';
import { isEmailRegistration } from './guide.mjs';

export function createSigningSection(form, onChange) {
  const node = document.createElement('section'); node.className = 'section';
  // This markup is static. Uploaded filenames and all user answers use textContent.
  node.innerHTML = `<h2>Your signature</h2>
    <p class="lede">Check every answer before creating your PDF. You can leave unknown fields blank to complete by hand.</p>
    <fieldset class="choice-group"><legend>How would you like to sign?</legend><div class="segments">
      <label class="choice"><input type="radio" name="signature-mode" value="print" checked><span><b>Print &amp; sign by hand</b><small>Signature and date stay blank.</small></span></label>
      <label class="choice"><input type="radio" name="signature-mode" value="draw"><span><b>Draw it</b><small>Sign with a mouse, trackpad or finger.</small></span></label>
    </div></fieldset>
    <div id="draw-panel" hidden>
      <p id="signature-help" class="hint">Draw your signature in the space below. It will be fitted to the signature space on the form.</p>
      <div class="signature-frame"><canvas id="signature-canvas" aria-label="Draw your signature" aria-describedby="signature-help">Choose Print &amp; sign by hand if you cannot use the drawing area.</canvas></div>
      <div class="signature-tools"><button id="clear-signature" class="button secondary" type="button">Clear signature</button><p class="small">Preview the PDF to check your signature before sending it.</p></div>
      <div class="field signature-date"><label for="signature-date">Date beside your signature</label><input id="signature-date" type="date"></div>
    </div>`;
  const $ = id => node.querySelector(`#${id}`);
  const pad = createSignaturePad($('signature-canvas'), onChange);
  const today = new Date();
  $('signature-date').value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  $('signature-date').addEventListener('input', onChange);
  $('clear-signature').addEventListener('click', () => pad.clear());
  if (form.id === 'registration') $('signature-help').textContent = 'Draw your signature below. It will fit inside the official signature box with space around every border.';
  else {
    const note = document.createElement('p'); note.className = 'note';
    note.textContent = 'Do not email this form. Even with a drawn signature, you must print it and submit it by post or hand delivery.';
    node.append(note);
  }
  let values = {}, mode = 'print', email = false, merging = false, attachments = [], processing = false, batch = 0;
  if (form.id === 'registration') {
    const section = document.createElement('div'); section.id = 'email-options'; section.hidden = true;
    section.innerHTML = `<div class="note"><b>Pohnpei: you can skip printing.</b> Email the signed PDF with a copy of your birth certificate and one photo ID to both <a href="mailto:election@election.fm">election@election.fm</a> and <a href="mailto:deeann.david@election.fm">deeann.david@election.fm</a>. Check that the government seal and every word in the scans are legible.</div>
      <fieldset class="choice-group"><legend>Your birth certificate and photo ID</legend>
        <label class="choice"><input type="radio" name="attachment-mode" value="separate" checked><span><b>I'll attach them myself</b><small>Download the signed form and attach your document copies to the email yourself.</small></span></label>
        <label class="choice"><input type="radio" name="attachment-mode" value="merge"><span><b>Add copies to this PDF</b><small>Optional. Choose your scans to combine with the signed registration.</small></span></label>
      </fieldset>
      <div id="attachment-panel" hidden><label for="attachment-files" class="upload-label">Add scanned documents (PDF, JPEG, PNG or WebP)</label><input id="attachment-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif">
        <p class="hint">Send copies only. Images are resized to a maximum of 2000 pixels on the long edge. HEIC photos must first be shared from Photos as a JPEG. Files stay in this browser.</p>
        <p id="attachment-status" class="hint" role="status"></p><p id="attachment-error" class="error" role="alert" hidden></p><ul id="attachment-list" class="attachment-list"></ul>
      </div>`;
    node.append(section);
    node.querySelectorAll('[name="attachment-mode"]').forEach(input => input.addEventListener('change', () => {
      merging = input.value === 'merge'; $('attachment-panel').hidden = !merging;
      if (!merging) resetAttachments();
      onChange();
    }));
    $('attachment-files').addEventListener('change', async event => {
      const files = [...event.target.files]; event.target.value = '';
      if (!files.length) return;
      const thisBatch = ++batch; processing = true; onChange();
      $('attachment-status').textContent = 'Preparing document copies…'; $('attachment-error').hidden = true;
      $('attachment-files').disabled = true;
      try {
        if (!window.PDFLib) throw new Error('Reload the page to load the PDF tool, then try again.');
        const added = [];
        for (const file of files) added.push(await prepareAttachment(file, window.PDFLib));
        if (thisBatch !== batch) return;
        attachments.push(...added); renderAttachments();
      } catch (error) {
        if (thisBatch === batch) { $('attachment-error').textContent = error.message; $('attachment-error').hidden = false; }
      } finally {
        if (thisBatch === batch) { processing = false; $('attachment-status').textContent = ''; $('attachment-files').disabled = false; onChange(); }
      }
    });
  }
  function renderAttachments() {
    $('attachment-list').replaceChildren();
    attachments.forEach((attachment, index) => {
      const item = document.createElement('li'), name = document.createElement('span'), remove = document.createElement('button');
      name.textContent = `${attachment.name} (${(attachment.data.byteLength/1024/1024).toFixed(1)} MB)`;
      remove.type = 'button'; remove.className = 'button secondary'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${attachment.name}`);
      remove.addEventListener('click', () => { attachments.splice(index, 1); renderAttachments(); onChange(); });
      item.append(name, remove); $('attachment-list').append(item);
    });
  }
  function resetAttachments() {
    batch++; attachments = []; processing = false;
    $('attachment-files').disabled = false; $('attachment-status').textContent = ''; $('attachment-error').hidden = true;
    renderAttachments();
  }
  function refresh(nextValues) {
    values = nextValues;
    const nextEmail = isEmailRegistration(form, values, mode === 'draw');
    if (form.id === 'registration') {
      $('email-options').hidden = !nextEmail;
      if (email && !nextEmail) {
        merging = false; node.querySelector('[name="attachment-mode"][value="separate"]').checked = true;
        $('attachment-panel').hidden = true; resetAttachments();
      }
    }
    email = nextEmail;
    $('draw-panel').hidden = mode !== 'draw';
    if (mode === 'draw') pad.resize();
  }
  node.querySelectorAll('[name="signature-mode"]').forEach(input => input.addEventListener('change', () => {
    mode = input.value; refresh(values); onChange();
  }));
  return {
    node, refresh,
    get email() { return email; },
    get signed() { return mode === 'draw'; },
    snapshot() {
      if (mode === 'print') return {};
      if (!$('signature-date').value || !$('signature-date').validity.valid) throw new Error('Choose the date beside your signature.');
      if (processing) throw new Error('Wait for your document copies to finish preparing, then create your PDF.');
      const signature = { png: pad.png(), date: $('signature-date').value };
      if (email && merging && !attachments.length) throw new Error('Add your document copies, or choose “I\'ll attach them myself.”');
      return { signature, attachments: email && merging ? [...attachments] : [] };
    }
  };
}
