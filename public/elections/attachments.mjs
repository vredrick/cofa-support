export const EMAIL_WARNING_BYTES = 20 * 1024 * 1024;
export function imageDimensions(width, height) {
  const scale = Math.min(1, 2000 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
export function attachmentKind(file) {
  if (/\.hei[cf]$/i.test(file.name) || /image\/hei[cf]/i.test(file.type)) throw new Error('HEIC photos cannot be added. Share the photo from Photos as a JPEG first, then choose that JPEG.');
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
  if (/^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)) return 'image';
  throw new Error('Choose a PDF, JPEG, PNG or WebP scan of your document.');
}
export async function prepareAttachment(file, PDFLib) {
  const kind = attachmentKind(file);
  if (kind === 'pdf') {
    const data = new Uint8Array(await file.arrayBuffer());
    try { await PDFLib.PDFDocument.load(data); }
    catch { throw new Error('This PDF could not be opened. Choose an unlocked, readable PDF or an image scan.'); }
    return { name: file.name, kind, data };
  }
  let bitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { throw new Error('This image could not be opened. Export it as a JPEG from Photos and try again.'); }
  try {
    const canvas = document.createElement('canvas');
    const dimensions = imageDimensions(bitmap.width, bitmap.height);
    canvas.width = dimensions.width; canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .9));
    if (!blob) throw new Error('This image could not be prepared. Try a smaller JPEG scan.');
    return { name: file.name, kind, data: new Uint8Array(await blob.arrayBuffer()) };
  } finally { bitmap.close(); }
}
