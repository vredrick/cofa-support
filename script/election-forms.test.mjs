import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as PDFLib from 'pdf-lib';
import { inkBounds, createSignaturePad } from '../public/elections/signature.mjs';
import { imageDimensions, attachmentKind } from '../public/elections/attachments.mjs';
import { guideContent } from '../public/elections/guide.mjs';
import { FORMS } from '../public/elections/definitions.mjs';
import { DISTRICTS, districtChoices, districtForChoice } from '../public/elections/districts.mjs';
import { createElectionPdf, createInstructionPdf, signaturePlacement, allFields } from '../public/elections/pdf.mjs';

test('Official district choices preserve every listed place and ambiguous Yap names', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(DISTRICTS).map(([state, groups]) => [state, groups.map(g => g.length)])), {
    Chuuk: [11,3,5,8,13], Kosrae: [6], Pohnpei: [5,2,4], Yap: [10,8,6,4,3],
  });
  assert.equal(districtForChoice('Pohnpei', '1:Sokehs'), '1');
  assert.equal(districtForChoice('Chuuk', '2:Weno'), '2');
  assert.equal(districtForChoice('Kosrae', '1:Walung'), '1');
  assert.equal(districtForChoice('Yap', '2:Falalop'), '2');
  assert.equal(districtForChoice('Yap', '3:Falalop'), '3');
  assert.equal(districtForChoice('Yap', '5:Lamotrek'), '5');
  assert.equal(districtForChoice('Chuuk', '1:Sokehs'), '');
  assert.deepEqual(districtChoices(''), []);
});

test('Both PDFs accept official ED numbers and reject districts from the wrong state', async () => {
  for (const form of FORMS) {
    const template = await readFile(new URL(`../public/forms/fsm-${form.id}.pdf`, import.meta.url));
    for (const state of Object.keys(DISTRICTS)) {
      const ed = String(DISTRICTS[state].length);
      const bytes = await createElectionPdf(form, {state, ed}, template, false, PDFLib);
      assert.equal((await PDFLib.PDFDocument.load(bytes)).getPageCount(), 1);
    }
    await assert.rejects(createElectionPdf(form, {state:'Kosrae', ed:'5'}, template, false, PDFLib), /Choose Election district/);
    if (form.id === 'registration') {
      await assert.rejects(createElectionPdf(form, {prev:'y', pstate:'Kosrae', ped:'5'}, template, false, PDFLib), /Choose Prior ED/);
    }
  }
});

for (const form of FORMS) {
  test(`${form.id}: fills the legal template and optionally appends print instructions`, async () => {
    const template = await readFile(new URL(`../public/forms/fsm-${form.id}.pdf`, import.meta.url));
    const values = { first: 'TEST', last: 'EXAMPLE', dob: '1990-01-02', state: 'Pohnpei', type: 'A', purpose: 'first', cit: 'y', prev: 'n', fel: 'n', men: 'n', vid: 'n' };
    for (const withGuide of [false, true]) {
      const bytes = await createElectionPdf(form, values, template, withGuide, PDFLib);
      const pdf = await PDFLib.PDFDocument.load(bytes);
      assert.equal(pdf.getPageCount(), withGuide ? 2 : 1);
      assert.equal(pdf.getPages()[0].getWidth(), 612);
      assert.equal(pdf.getPages()[0].getHeight(), 1008);
      if (withGuide) assert.deepEqual(pdf.getPages()[1].getSize(), { width:612, height:1008 });
    }
  });
  test(`${form.id}: hidden answers do not alter the exported PDF`, async () => {
    const template = await readFile(new URL(`../public/forms/fsm-${form.id}.pdf`, import.meta.url));
    const conditional = allFields(form).find(field => field.showIf);
    const visibleValues = { first: 'TEST', last: 'EXAMPLE' };
    const hiddenValues = { ...visibleValues, [conditional.k]: conditional.t === 'check' ? true : 'HIDDEN' };
    const left = await createElectionPdf(form, visibleValues, template, false, PDFLib);
    const right = await createElectionPdf(form, hiddenValues, template, false, PDFLib);
    const contentStreams = async bytes => {
      const doc = await PDFLib.PDFDocument.load(bytes);
      return doc.getPages()[0].node.Contents().asArray().map(ref => Array.from(doc.context.lookup(ref).getContents()));
    };
    assert.deepEqual(await contentStreams(left), await contentStreams(right));
  });
}
test('Long answers produce a useful error instead of overflowing the official form', async () => {
  const form = FORMS[0];
  const template = await readFile(new URL('../public/forms/fsm-absentee.pdf', import.meta.url));
  await assert.rejects(createElectionPdf(form, { first: 'W'.repeat(150) }, template, false, PDFLib), /First is too long/);
});

test('Cropping finds alpha ink at the edges and handles a blank canvas', () => {
  const pixels = { width: 10, height: 8, data: new Uint8ClampedArray(10*8*4) };
  assert.equal(inkBounds(pixels), null);
  pixels.data[(2*10+3)*4+3] = 1;
  pixels.data[(7*10+9)*4+3] = 255;
  assert.deepEqual(inkBounds(pixels), { x:3,y:2,width:7,height:6 });
});

test('Touch pointer strokes initialize only when visible and survive DPI and size changes', () => {
  const originalWindow = globalThis.window, originalObserver = globalThis.ResizeObserver;
  const calls = [];
  const context = {
    setTransform() {}, clearRect() { calls.length = 0; }, beginPath() {}, arc() {}, fill() {}, stroke() {},
    moveTo(x,y) { calls.push(['move',x,y]); }, lineTo(x,y) { calls.push(['line',x,y]); },
  };
  let rect = {left:100,top:200,width:0,height:0};
  const canvas = new EventTarget(); canvas.width = 300; canvas.height = 150;
  canvas.getContext = () => context; canvas.getBoundingClientRect = () => rect;
  let captured = null, changes = 0;
  canvas.setPointerCapture = id => { captured = id; };
  canvas.hasPointerCapture = id => captured === id;
  canvas.releasePointerCapture = () => { captured = null; };
  const dispatch = (type, x, y) => canvas.dispatchEvent(Object.assign(new Event(type), {pointerId:7,pointerType:'touch',isPrimary:true,clientX:x,clientY:y}));
  try {
    globalThis.window = {devicePixelRatio:2,addEventListener(){}};
    globalThis.ResizeObserver = class { observe() {} };
    const pad = createSignaturePad(canvas,()=>changes++);
    pad.resize(); assert.equal(canvas.width,300); // Hidden: keep the untouched default bitmap.
    rect = {...rect,width:400,height:200}; pad.resize();
    assert.equal(canvas.width,800); assert.equal(canvas.height,400);
    dispatch('pointerdown',150,250); dispatch('pointermove',300,300);
    assert.equal(captured,7); assert.deepEqual(calls,[['move',50,50],['line',200,100]]);
    dispatch('pointerup',300,300); assert.equal(captured,null);
    rect = {...rect,width:200,height:100}; window.devicePixelRatio=3; pad.resize();
    assert.equal(canvas.width,600); assert.equal(canvas.height,300);
    assert.deepEqual(calls,[['move',25,25],['line',100,50]]);
    assert.equal(changes,2); pad.clear(); assert.deepEqual(calls,[]);
  } finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window=originalWindow;
    if (originalObserver === undefined) delete globalThis.ResizeObserver; else globalThis.ResizeObserver=originalObserver;
  }
});

test('Wide and tall signatures preserve aspect ratio and required border padding', () => {
  for (const form of FORMS) for (const [w,h] of [[1200,30],[30,1200],[700,200]]) {
    const target = form.signature, at = signaturePlacement(target,w,h);
    assert.ok(at.x >= target.x+target.pad-1e-8);
    assert.ok(at.x+at.width <= target.x+target.w-target.pad+1e-8);
    assert.ok(at.y >= 1008-target.bot+target.pad-1e-8);
    assert.ok(at.y+at.height <= 1008-target.bot+target.h-target.pad+1e-8);
    assert.ok(Math.abs(at.width/at.height-w/h)<1e-8);
    assert.ok(Math.abs(at.x+at.width/2-(target.x+target.w/2))<1e-8);
    assert.ok(Math.abs(at.y+at.height/2-(1008-target.bot+target.h/2))<1e-8);
  }
});

const templateFor = form => readFile(new URL(`../public/forms/fsm-${form.id}.pdf`, import.meta.url));
const registration = FORMS.find(f=>f.id==='registration');
const absentee = FORMS.find(f=>f.id==='absentee');
const streams = async bytes => {
  const doc = await PDFLib.PDFDocument.load(bytes);
  const contents = doc.getPages()[0].node.Contents();
  const refs = contents instanceof PDFLib.PDFArray ? contents.asArray() : [contents];
  return refs.map(ref => Buffer.from(PDFLib.decodePDFRawStream(doc.context.lookup(ref)).decode()).toString()).join('\n');
};

test('Drawn signatures embed an image and date; print mode adds neither', async () => {
  for (const form of FORMS) {
    const template = await templateFor(form);
    const plain = await createElectionPdf(form, {}, template, false, PDFLib);
    const signed = await createElectionPdf(form, {}, template, false, PDFLib, {signature});
    const plainStream = await streams(plain), signedStream = await streams(signed);
    assert.equal(plainStream.includes('30392F30382F32303236'),false);
    assert.equal(signedStream.includes('30392F30382F32303236'),true); // 09/08/2026
    assert.equal((signedStream.match(/ Do/g)||[]).length,(plainStream.match(/ Do/g)||[]).length+1);
    await assert.rejects(createElectionPdf(form,{},template,false,PDFLib,{signature:{...signature,date:''}}),/Choose the date/);
  }
});

test('Registration email packets work for all four states and exclude the instruction sheet', async () => {
  const template = await templateFor(registration);
  const values = {state:'Pohnpei'};
  const signed = await createElectionPdf(registration,values,template,true,PDFLib,{signature});
  assert.equal((await PDFLib.PDFDocument.load(signed)).getPageCount(),1);
  const sample = await PDFLib.PDFDocument.create(); sample.addPage([612,792]);
  const attachments = [{kind:'pdf',data:await sample.save()}];
  const merged = await createElectionPdf(registration,values,template,true,PDFLib,{signature,attachments});
  assert.equal((await PDFLib.PDFDocument.load(merged)).getPageCount(),2);
  const instructions = await PDFLib.PDFDocument.load(await createInstructionPdf(registration,values,true,PDFLib));
  assert.equal(instructions.getPageCount(),1);
  assert.deepEqual(instructions.getPages()[0].getSize(),{width:612,height:1008});
  for (const state of ['Chuuk','Kosrae','Yap']) {
    const standalone = await createElectionPdf(registration,{state},template,true,PDFLib,{signature});
    assert.equal((await PDFLib.PDFDocument.load(standalone)).getPageCount(),1);
    const packet = await createElectionPdf(registration,{state},template,true,PDFLib,{signature,attachments});
    assert.equal((await PDFLib.PDFDocument.load(packet)).getPageCount(),2);
  }
  await assert.rejects(createElectionPdf(registration,{state:''},template,false,PDFLib,{signature,attachments}),/only available/);
  await assert.rejects(createElectionPdf(registration,values,template,false,PDFLib,{attachments}),/only available/);
  await assert.rejects(createElectionPdf(absentee,values,await templateFor(absentee),false,PDFLib,{signature,attachments}),/only available/);
});

test('Document images keep proportions, cap at 2000 px and do not upscale small scans', () => {
  assert.deepEqual(imageDimensions(6000,4000),{width:2000,height:1333});
  assert.deepEqual(imageDimensions(900,2400),{width:750,height:2000});
  assert.deepEqual(imageDimensions(600,900),{width:600,height:900});
  assert.throws(()=>attachmentKind({name:'scan.HEIC',type:''}),/Photos as a JPEG/);
  assert.throws(()=>attachmentKind({name:'scan',type:'image/heif'}),/Photos as a JPEG/);
  assert.throws(()=>attachmentKind({name:'scan.svg',type:'image/svg+xml'}),/Choose a PDF/);
  assert.equal(attachmentKind({name:'scan.pdf',type:''}),'pdf');
});

test('Every state and request type gets legal-sized instructions, with signing-mode-aware steps', async () => {
  for (const form of FORMS) for (const state of ['Pohnpei','Chuuk','Kosrae','Yap','']) for (const signed of [false,true]) {
    const types = form.id==='absentee' ? ['A','B','C','D','E'] : [''];
    for (const type of types) {
      const content = guideContent(form,{state,type},signed);
      assert.equal(content.steps[1].title,signed?'Check your signature':'Sign in ink');
      if (form.id==='absentee') assert.ok(content.steps.some(step=>step.title==='DO NOT EMAIL THIS FORM'));
      const pdf = await PDFLib.PDFDocument.load(await createInstructionPdf(form,{state,type},signed,PDFLib));
      assert.deepEqual(pdf.getPages()[0].getSize(),{width:612,height:1008});
    }
  }
});

const signature = { date: '2026-09-08', png: Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAA80lEQVR4nO2UwQ2DQBADKSF1pI30XxP5RkgoJNzd2ut5+MmO5TmxPZ6vjfRNeQGCYIJgguDQlBcg8wXvH5kJg1PAOR44RqYonDmCR8q3GKQb547gX8VbDNKN8+3AaPnyg3Tj3DmgKt1ieAfBquIthncWvEr8WV+L4bsLrnwAEsMnCr7ynZJ09d1sBKvKt9jNpmih9LPOFrvZFB3IWSFfZjel4RU4iuIRvIhTJR/BApyZ4hEszCn/5asNksRZIt9pkBTOUPEdBkniIDiYg+BEjk1ROAiGg+A8jk1ROAiGg+A8jk1ROP8LJo1TXoAgmCCYIDg0b5FwE4cZGcpZAAAAAElFTkSuQmCC', 'base64')) };
