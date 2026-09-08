import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as PDFLib from 'pdf-lib';
import { FORMS } from '../public/elections/definitions.mjs';
import { createElectionPdf, allFields } from '../public/elections/pdf.mjs';

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
