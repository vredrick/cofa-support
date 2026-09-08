/** Find actual ink, ignoring all transparent margins around a signature. */
export function inkBounds({ data, width, height }) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 0) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export function createSignaturePad(canvas, onChange) {
  // Normalized strokes survive a resize, rotation, or hiding and reopening the pad.
  const strokes = [];
  let active = null, pointer = null, cssWidth = 0, cssHeight = 0, ratio = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  function redraw() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.strokeStyle = '#102a43'; context.fillStyle = '#102a43';
    context.lineWidth = 2.2; context.lineCap = 'round'; context.lineJoin = 'round';
    for (const stroke of strokes) {
      if (stroke.length === 1) {
        context.beginPath(); context.arc(stroke[0].x * cssWidth, stroke[0].y * cssHeight, 1.1, 0, Math.PI * 2); context.fill();
      } else {
        context.beginPath();
        stroke.forEach((point, i) => context[i ? 'lineTo' : 'moveTo'](point.x * cssWidth, point.y * cssHeight));
        context.stroke();
      }
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    // Never initialize against the zero-width rectangle of a hidden panel.
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    if (cssWidth === rect.width && cssHeight === rect.height && ratio === dpr) return;
    cssWidth = rect.width; cssHeight = rect.height; ratio = dpr;
    canvas.width = Math.round(cssWidth * ratio); canvas.height = Math.round(cssHeight * ratio);
    redraw();
  }
  const point = event => {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || pointer !== null) return;
    event.preventDefault(); resize();
    pointer = event.pointerId; active = [point(event)]; strokes.push(active);
    canvas.setPointerCapture(pointer); redraw(); onChange();
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || !active) return;
    event.preventDefault();
    const samples = event.getCoalescedEvents?.();
    for (const sample of samples?.length ? samples : [event]) active.push(point(sample));
    redraw(); onChange();
  });
  const end = event => {
    if (event.pointerId !== pointer) return;
    active = null; pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('lostpointercapture', end);
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);
  return {
    resize,
    clear() { strokes.length = 0; active = null; pointer = null; redraw(); onChange(); },
    png() {
      resize();
      const bounds = inkBounds(context.getImageData(0, 0, canvas.width, canvas.height));
      if (!bounds) throw new Error('Draw your signature, or choose Print & sign by hand.');
      const cropped = document.createElement('canvas');
      cropped.width = bounds.width; cropped.height = bounds.height;
      cropped.getContext('2d').drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
      return cropped.toDataURL('image/png');
    }
  };
}
