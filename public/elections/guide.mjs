import { OFFICES } from './definitions.mjs';
export const REGISTRATION_EMAILS = ['election@election.fm', 'deeann.david@election.fm'];
export const isEmailRegistration = (form, values, signed = false) => form.id === 'registration' && Object.hasOwn(OFFICES, values.state) && signed;

export function guideContent(form, values, signed = false) {
  const email = isEmailRegistration(form, values, signed);
  const office = OFFICES[values.state];
  const scan = [
    'Use a real flatbed scanner first. Old birth certificates and passports do not lie flat and photograph badly. Public libraries usually have a scanner free to use and can email the file directly.',
    'Next choice: a home printer with a lifting lid. Then try a copy shop, which usually charges a fee.',
    'Only as a last resort, use a phone: Notes on iPhone or Google Drive on Android. Choose the Scan feature, not the normal camera. Check that the government seal and every word are legible.'
  ];
  if (form.id === 'registration') {
    return {
      title: 'Your registration, step by step',
      subtitle: 'Registration instructions',
      steps: [
        { title: email ? 'Check the filled form - no printing needed' : 'Print your filled form', body: [email ? 'Review every answer in your signed PDF. You can email the form directly to the National Election Office; keep this instruction sheet separate.' : 'Use legal paper (8.5 x 14 in). If using letter paper, choose Fit to page and make sure every word is readable. Keep this instruction page.'] },
        { title: signed ? 'Check your signature' : 'Sign in ink', body: [signed ? 'Your drawn signature and date are already on the form. Check that they are clear and entirely inside the signature box, without touching the borders.' : 'Sign with a blue or black pen, inside the signature box without touching its borders. Write the date beside it.'] },
        { title: 'Gather your document copies', body: ['Include a birth certificate and one photo ID. Send copies only, never originals. If requesting a voter ID card, include the required current 2 x 2 inch photo.'] },
        { title: email ? 'Scan your supporting documents' : 'Scan the signed form and your documents', body: scan },
        { title: 'Email your registration', body: [
          `Send ${email ? 'your signed PDF' : 'a scanned copy of your signed form'} plus your birth certificate and photo ID to both addresses:`,
          REGISTRATION_EMAILS.join(' and '),
          `Subject: Voter Registration - your full name. ${email ? 'Attach your document copies yourself, or check that they are included in your merged PDF.' : 'Attach the scanned form and document copies.'} Do not send this instruction page.`,
        ] },
      ],
      reminder: 'Being registered does not send you a ballot. You must also submit the Absentee Ballot Application. For a ballot by mail, that request must arrive by January 21, 2027.',
    };
  }
  const option = form.sections.flatMap(s => s.fields || []).find(f => f.k === 'type')?.options.find(o => o.v === values.type);
  return {
    title: 'Your absentee request, step by step',
    subtitle: 'For the March 2, 2027 Congressional General Election',
    steps: [
      { title: 'Print your filled form', body: ['Use legal paper (8.5 x 14 in), or select Fit to page on letter paper. Check that all answers and the printed instructions are readable.'] },
      { title: signed ? 'Check your signature' : 'Sign in ink', body: [signed ? 'Your drawn signature and date are already on the form. Check that both are clear. You must still print and post or hand-deliver this application.' : 'Sign with a blue or black pen on the signature line and write the date beside it.'] },
      { title: 'DO NOT EMAIL THIS FORM', body: ['Unlike voter registration, an absentee application can only be accepted by post or hand delivery. An emailed request does not count.'], emphasis: true },
      { title: 'Address the envelope', body: office ? [`For ${values.state}, use the address printed on your form:`, office.join(', ')] : ['Select your state in the form to include its office address here. Use the appropriate state office address printed on the application.'] },
      { title: 'Post early and keep the tear-off receipt', body: ['Allow four to six weeks each way for postal delivery. Keep the tear-off receipt for your records.', 'For a ballot by mail, your request must ARRIVE by January 21, 2027.', 'Aim to post the voted ballot back by around mid-January if you have received it. If it arrives later, contact the office promptly about returning it in time.', 'The voted ballot must have ARRIVED by March 2, 2027. A postmark is not enough.', ...(option && values.type !== 'A' ? [`Your selected option is ${option.l}. ${option.due}. January 21 is the deadline for requests for a ballot by mail.`] : [])] },
    ],
    reminder: 'Do not confuse the application with the ballot. Send the request first; complete and return the ballot when you receive it. A signature drawn here does not make the absentee application emailable.',
  };
}

function wrap(text, font, size, width) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > width) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export function drawInstructionPage(doc, form, values, signed, fonts, PDFLib) {
  const { rgb } = PDFLib;
  const { font, bold } = fonts;
  const content = guideContent(form, values, signed);
  const navy = rgb(.055,.21,.32), ocean = rgb(.106,.31,.45), ink = rgb(.06,.16,.25), muted = rgb(.25,.36,.45);
  const pale = rgb(.93,.96,.98), rust = rgb(.62,.23,.10), cream = rgb(.99,.95,.91), white = rgb(1,1,1);
  const page = doc.addPage([612,1008]);
  page.drawRectangle({x:0,y:892,width:612,height:116,color:navy});
  page.drawText('COFA SUPPORT / ELECTION FORMS', {x:42,y:974,size:10,font:bold,color:rgb(.72,.84,.92)});
  page.drawText(content.title, {x:42,y:940,size:22,font:bold,color:white});
  page.drawText(content.subtitle, {x:42,y:916,size:10.5,font,color:white});
  page.drawRectangle({x:36,y:850,width:540,height:30,color:cream});
  page.drawText('KEEP THIS PAGE. DO NOT SEND IT.', {x:48,y:860,size:12,font:bold,color:rust});
  // Fit the content with measured line wrapping; never let text run into the footer.
  let size = 11, leading = 14.8;
  let sections, reminderLines, total;
  do {
    sections = content.steps.map(step => ({...step, lines: step.body.flatMap((text,i) => [...(i ? [''] : []),...wrap(text,font,size,482)])}));
    reminderLines = wrap(content.reminder,font,size,504);
    total = sections.reduce((sum,s) => sum + 25 + s.lines.reduce((n,l) => n + (l ? leading : 5),0) + 16,0) + reminderLines.length*leading + 25;
    if (total <= 722 || size <= 10.5) break;
    size -= .25; leading -= .4;
  } while (true);
  if (total > 722) throw new Error('The instruction sheet is too long to fit on one page.');
  let top = 829;
  for (let i=0;i<sections.length;i++) {
    const step = sections[i];
    page.drawCircle({x:49,y:top-7,size:12,color:step.emphasis ? rust : ocean});
    page.drawText(String(i+1),{x:45.8,y:top-11,size:11,font:bold,color:white});
    page.drawText(step.title,{x:74,y:top-11,size:13,font:bold,color:step.emphasis ? rust : ink});
    top -= 30;
    for (const line of step.lines) {
      if (line) { page.drawText(line,{x:74,y:top,size,font,color:muted}); top-=leading; }
      else top-=5;
    }
    top -= 11;
  }
  const boxHeight = reminderLines.length*leading + 20;
  page.drawRectangle({x:36,y:top-boxHeight+4,width:540,height:boxHeight,color:pale});
  reminderLines.forEach((line,i)=>page.drawText(line,{x:48,y:top-10-i*leading,size,font,color:ink}));
  page.drawLine({start:{x:36,y:84},end:{x:576,y:84},thickness:.6,color:rgb(.76,.83,.87)});
  page.drawText('FSM National Election Office | (691) 320-4125',{x:36,y:66,size:10,font:bold,color:navy});
  page.drawText('deeann.david@election.fm',{x:36,y:50,size:10,font,color:ocean});
  page.drawText('Pohnpei is 15 hours ahead of the US east coast during daylight time; 16 in standard time.',{x:36,y:33,size:8.8,font,color:muted});
  return page;
}
