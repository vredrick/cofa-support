export const allFields = form => form.sections.flatMap(section => section.fields || []).filter(field => field.k);
export const formatDate = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };
const applies = (field, values) => !field.showIf || values[field.showIf.k] === field.showIf.eq;

export function printNotes(form) {
  return form.id === 'registration'
    ? 'Print on legal paper (8.5 × 14 in), or choose Fit to page. Sign inside the signature box without touching its borders and write the date. Follow your state election office’s instructions for identification and submission.'
    : 'Print on legal paper (8.5 × 14 in), or choose Fit to page. Sign and date it by hand, then personally mail or deliver it to your state election office before the deadline printed for your request type.';
}

/** Draw on the original template; never write in the official-use-only section. */
export async function createElectionPdf(form, values, template, includeGuide, PDFLib) {
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
  if (includeGuide) {
    const guide = doc.addPage([612, 792]);
    guide.drawText('COFA Support | Print instructions', { x: 48, y: 732, size: 19, font: bold, color: ink });
    guide.drawText(form.title, { x: 48, y: 701, size: 13, font, color: ink });
    const lines = [
      '1. Check the answers on your filled form before printing.',
      '2. The form uses legal paper: 8.5 x 14 inches. If printing on letter',
      '   paper, select Fit to page and check that all text is readable.',
      '3. Sign and date the form by hand after printing.',
      ...(form.id === 'registration' ? [
        '   Keep your signature inside the box without touching its borders.',
        '4. The form asks for one proof of identification: passport, driver\'s',
        '   license, birth certificate, or baptismal certificate. A voter ID',
        '   card request also requires a current 2 x 2 inch photo.',
        '5. Confirm submission requirements with your state election office.',
      ] : [
        '4. Personally mail or deliver the application to your state election',
        '   office. Use the addresses and deadlines printed on the form.',
        '5. Your application must arrive by the deadline for your request type.',
      ]),
      '',
      'This tool fills forms. It does not submit an application, register',
      'you to vote, or request a ballot on your behalf.',
      '',
      'Official forms and instructions: https://www.fsmned.fm/PDFgallery.htm',
    ];
    lines.forEach((line, i) => guide.drawText(line, { x: 48, y: 662 - i * 24, size: 11, font, color: ink }));
  }
  return doc.save();
}
