import { drawInstructionPage, isEmailRegistration, REGISTRATION_EMAILS } from './guide.mjs';
export const allFields = form => form.sections.flatMap(section => section.fields || []).filter(field => field.k);
export const formatDate = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };
const applies = (field, values) => !field.showIf || values[field.showIf.k] === field.showIf.eq;

export function printNotes(form, values = {}, signed = false, merged = false) {
  if (form.id === 'registration') {
    const email = isEmailRegistration(form, values, signed);
    const action = email
      ? 'No printing needed. Check your drawn signature and date in the PDF.'
      : signed
        ? 'Print on legal paper (8.5 × 14 in), or choose Fit to page. Check the signature and date already on the form; the signature must stay inside the box without touching its borders.'
        : 'Print on legal paper (8.5 × 14 in), or choose Fit to page. Sign inside the signature box without touching its borders and write the date.';
    const route = `Registration email contacts: ${REGISTRATION_EMAILS.join(' and ')}. Send ${email ? 'your signed PDF' : 'a scanned copy of the signed form'} plus a birth certificate and one photo ID. Send copies only.`;
    return `${action} ${route} ${email && merged ? 'Your selected document copies are included in the PDF. Check that all required documents are there.' : 'Attach the document copies to the email yourself.'} Keep the instruction sheet; do not send it.`;
  }
  return `Print on legal paper (8.5 × 14 in), or choose Fit to page. ${signed ? 'Check the signature and date already on your form.' : 'Sign and date it by hand.'} Personally mail or deliver it to your state election office before the deadline printed for your request type. Do not email this form.`;
}

export async function createInstructionPdf(form, values, signed, PDFLib) {
  const doc = await PDFLib.PDFDocument.create();
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  drawInstructionPage(doc, form, values, signed, {font,bold}, PDFLib);
  return doc.save();
}

export function signaturePlacement(target, imageWidth, imageHeight, pageHeight = 1008) {
  const availableWidth = target.w - target.pad * 2;
  const availableHeight = target.h - target.pad * 2;
  const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale, height = imageHeight * scale;
  return { x: target.x + target.pad + (availableWidth-width)/2, y: pageHeight-target.bot+target.pad+(availableHeight-height)/2, width, height };
}

/** Draw on the original template; never write in the official-use-only section. */
export async function createElectionPdf(form, values, template, includeGuide, PDFLib, options = {}) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const doc = await PDFDocument.load(template);
  const page = doc.getPages()[0];
  const height = page.getHeight();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(.05, .09, .25);
  const draw = (text, at, label) => {
    if (!text) return;
    let size = at.size;
    let width;
    try { width = font.widthOfTextAtSize(text, size); }
    catch { throw new Error(`${label || 'An answer'} contains a character this PDF cannot print. Use a Latin-letter spelling for this field, or fill it by hand after printing.`); }
    while (size > 6 && width > at.w - 4) { size -= .5; width = font.widthOfTextAtSize(text, size); }
    if (width > at.w - 4) throw new Error(`${label || 'An answer'} is too long for its space on the PDF. Shorten it or fill that field by hand after printing.`);
    page.drawText(text, { x: at.x + 2, y: height - at.bot + 3.5, size, font, color: ink });
  };
  const tick = box => page.drawText('X', { x: box.x + (box.dx ?? 2), y: height - box.bot + (box.dy ?? 3), size: box.size ?? 11, font: bold, color: ink });
  for (const field of allFields(form)) {
    if (!applies(field, values)) continue;
    const value = values[field.k];
    if (field.t === 'cards' || field.t === 'seg') {
      const selected = field.options.find(option => option.v === value);
      if (selected?.box) tick(selected.box);
    } else if (field.t === 'check') {
      if (value && field.box) tick(field.box);
    } else if (field.at) {
      draw(field.t === 'date' ? formatDate(value) : String(value || '').trim(), field.at, field.l);
    }
  }
  for (const derived of form.derived || []) draw(derived.get(values), derived.at, 'Receipt details');
  const signed = !!options.signature;
  if (signed) {
    if (!options.signature.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.signature.date)) throw new Error('Choose the date beside your signature.');
    const png = await doc.embedPng(options.signature.png);
    page.drawImage(png, signaturePlacement(form.signature, png.width, png.height, height));
    draw(formatDate(options.signature.date), form.dateAt, 'Signature date');
  }
  const email = isEmailRegistration(form, values, signed);
  if (options.attachments?.length && !email) throw new Error('Document merging is only available when the signed-registration email option is shown.');
  // A sendable email packet must never contain the KEEP / DO NOT SEND guide.
  if (includeGuide && !email) drawInstructionPage(doc, form, values, signed, {font,bold}, PDFLib);
  for (const attachment of options.attachments || []) {
    if (attachment.kind === 'pdf') {
      const source = await PDFDocument.load(attachment.data);
      for (const copied of await doc.copyPages(source, source.getPageIndices())) doc.addPage(copied);
    } else {
      const image = await doc.embedJpg(attachment.data);
      const attachmentPage = doc.addPage([612,792]);
      const scale = Math.min(564/image.width,744/image.height);
      const width = image.width*scale, height = image.height*scale;
      attachmentPage.drawImage(image,{x:(612-width)/2,y:(792-height)/2,width,height});
    }
  }
  return doc.save();
}
