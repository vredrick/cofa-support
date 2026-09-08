// Form fields and PDF coordinates adapted from the user-supplied election form filler.
// Templates: https://www.fsmned.fm/PDFgallery.htm (checked 2026-09-08).
const usDate = iso => { if(!iso) return ""; const [y,m,d] = iso.split("-"); return `${m}/${d}/${y}`; };
export const OFFICES = {
  Chuuk:  ["Chuuk NEC Office","P.O. Box 10","Weno, Chuuk FM 96942"],
  Kosrae: ["Kosrae NEC Office","P.O. Box 340","Tofol, Kosrae FM 96944"],
  Pohnpei:["Pohnpei NEC Office","P.O. Box 1924","Kolonia, Pohnpei FM 96941"],
  Yap:    ["Yap NEC Office","P.O. Box 849","Colonia, Yap FM 96943"]
};
const STATES = ["Chuuk","Kosrae","Pohnpei","Yap"];

/* =====================================================================
   FORM REGISTRY
   To add a form: append an object here with its pdf key, sections and
   coordinates. Nothing else in the app needs to change.

   Coordinate notes — page is 612 x 1008 pt for both current forms.
   `at` = {x, w, bot, size}: x is the left edge, w the usable width
   (text auto-shrinks to fit), bot the bottom of the printed rule
   measured top-down. `box` = {x, bot} plus optional dx/dy/size.
   ===================================================================== */
export const FORMS = [
{
  id:"absentee",
  title:"Absentee Ballot Application",
  who:"For voters who are already registered",
  blurb:"Prepare a request for the March 2, 2027 election. Choose the request type that applies to you.",
  pdf:"absentee",
  filename:"FSM-Absentee-Application.pdf",
  intro:{kind:"note", html:"<b>This form is for voters who are already registered.</b> If you are unsure of your registration status, check with your state election office before using this form."},
  sections:[
    {h:"Your name", lede:"Exactly as it appears on your birth certificate or passport.", fields:[
      {k:"first",  l:"First",  t:"text", cols:3, ac:"given-name",      at:{x:63.0,  w:162.0, bot:217.2, size:11}},
      {k:"middle", l:"Middle", t:"text", cols:3, ac:"additional-name", at:{x:233.8, w:114.1, bot:217.2, size:11}},
      {k:"last",   l:"Last",   t:"text", cols:3, ac:"family-name",     at:{x:356.7, w:179.9, bot:217.2, size:11}},
      {k:"dob",    l:"Date of birth", t:"date", at:{x:191.3, w:108.5, bot:256.5, size:11}}
    ]},
    {h:"Your polling place", lede:"Where you are registered in the FSM — not where you live now.",
     hint:"Box # and ED # are printed on your voter ID card. If you don't know them, leave them blank and ask your election office — don't guess.",
     infoFor:"state", fields:[
      {k:"box",     l:"Box #", t:"text", cols:2, im:"numeric", info:"The ballot box number for your polling place, printed on your voter ID card. It is not your mailing P.O. box. If you do not have a card yet, leave it blank and ask your election office.", at:{x:63.0,  w:30.1,  bot:305.8, size:11}},
      {k:"ed",      l:"ED #",  t:"text", cols:2, im:"numeric", info:"Your Election District. FSM congressional districts are single-member districts within your state: Chuuk has 5, Pohnpei has 3, Yap has 1 and Kosrae has 1. If your state has only one, it is ED 1. Otherwise the number is printed on your voter ID card. If you are not sure, leave it blank and ask your election office rather than guessing — a wrong district can send your ballot to the wrong race.", at:{x:351.2, w:54.2,  bot:305.8, size:11}},
      {k:"village", l:"Village", t:"text", ph:"e.g. Palikir", info:"The village where you are registered in the FSM, not where you live now. Use the name your election office would recognise on official records.", at:{x:99.0,  w:120.2, bot:305.8, size:11}},
      {k:"muni",    l:"Municipality", t:"text", ph:"e.g. Sokehs", at:{x:243.1, w:96.4, bot:305.8, size:11}},
      {k:"state",   l:"State", t:"select", options:STATES,      at:{x:423.3, w:90.1,  bot:305.8, size:11}}
    ]},
    {h:"Where to send your ballot", lede:"Your blank ballot is posted to this address. Check it twice.", fields:[
      {k:"street",   l:"Street or P.O. Box", t:"text", ac:"street-address", at:{x:63.0,  w:156.2, bot:392.2, size:11}},
      {k:"city",     l:"City / Apt #", t:"text", cols:2, ac:"address-level2", at:{x:228.0, w:138.5, bot:392.2, size:11}},
      {k:"scountry", l:"State / Country", t:"text", cols:2, ph:"NC, USA",     at:{x:375.3, w:114.4, bot:392.2, size:11}},
      {k:"zip",      l:"ZIP code", t:"text", im:"numeric", ac:"postal-code",  at:{x:504.3, w:60.2,  bot:392.2, size:11}}
    ]},
    {h:"Type of request", lede:"Choose the request type that applies to you. These dates are printed on the form for the March 2, 2027 election.", fields:[
      {k:"type", t:"cards", options:[
        {v:"A", l:"A — Absentee ballot by mail", due:"Deadline: January 21, 2027", sub:"Have your ballot sent to your mailing address.", box:{x:111.7,bot:450.8,dx:1.5,dy:5}},
        {v:"B", l:"B — Special Polling Place (SPP)", due:"Deadline: January 31, 2027", sub:"Vote in person at a designated site. Confirm available locations with your election office.", box:{x:109.2,bot:493.6,dx:1.5,dy:5}},
        {v:"C", l:"C — Prior to traveling", due:"Deadline: March 1, 2027", sub:"Within the FSM only. Attach travel itinerary and valid ID.", box:{x:108.8,bot:535.8,dx:1.5,dy:5}},
        {v:"D", l:"D — Another polling place in the FSM", due:"Deadline: February 23, 2027", sub:"Within the FSM only.", box:{x:109.9,bot:577.9,dx:1.5,dy:5}},
        {v:"E", l:"E — Confined or mobile voting", due:"Deadline: March 1, 2027", sub:"Within the FSM only.", box:{x:108.8,bot:617.9,dx:1.5,dy:5}}
      ]},
      {k:"pickup", t:"check", l:"I intend to pick up my absentee ballot at the Embassy or Consulate",
       showIf:{k:"type",eq:"A"}, box:{x:124.3,bot:466.8,dx:1,dy:4,size:9}},
      {k:"permB", t:"check", l:"I wish to vote at this polling place permanently",
       showIf:{k:"type",eq:"B"}, box:{x:124.3,bot:507.9,dx:1,dy:4,size:9}},
      {k:"permD", t:"check", l:"I wish to vote at this polling place permanently",
       showIf:{k:"type",eq:"D"}, box:{x:124.3,bot:590.0,dx:1,dy:4,size:9}}
    ]}
  ],
  derived:[
    {at:{x:34.2, w:108.0, bot:921.6, size:9}, get:v=>[v.first,v.middle,v.last].filter(Boolean).join(' ')},
    {at:{x:145.5,w:84.0,  bot:921.6, size:9}, get:v=>usDate(v.dob)},
    {at:{x:232.7,w:107.7, bot:921.6, size:9}, get:v=>[v.village,v.muni].filter(Boolean).join(', ')},
    {at:{x:343.4,w:101.8, bot:921.6, size:9}, get:v=>v.type||''}
  ],
  /* signature sits on the ruled line; date goes on the line beside it */
  signature:{x:99.0, bot:729.7, w:233.9, h:34, pad:4},
  dateAt:{x:351.2, w:119.9, bot:729.7, size:10}
},
{
  id:"registration",
  title:"Voter Registration Application",
  who:"For first-time registration, or to change your details",
  blurb:"Complete your voter registration application and sworn affidavit, then print and sign it.",
  pdf:"registration",
  filename:"FSM-Voter-Registration.pdf",
  intro:{kind:"note", html:"<b>This fills the form only.</b> Print it, sign inside the signature box without touching the borders, and follow your election office’s submission instructions."},
  sections:[
    {h:"1. Purpose of application", fields:[
      {k:"purpose", t:"cards", options:[
        {v:"first",    l:"Registration to vote for the first time", box:{x:256.5,bot:176.6}},
        {v:"chgstate", l:"Changing state and/or election district",  box:{x:257.2,bot:203.8}},
        {v:"chgname",  l:"Changing name of registration",            box:{x:258.0,bot:230.0}}
      ]}
    ]},
    {h:"2–4. Name, birth, gender", lede:"Name exactly as it appears on the ID you're sending.", fields:[
      {k:"first", l:"First", t:"text", cols:3, ac:"given-name",  at:{x:133.6,w:162.6,bot:260.4,size:11}},
      {k:"mi",    l:"M.I.",  t:"text", cols:3, max:3,            at:{x:305.1,w:84.0, bot:260.4,size:11}},
      {k:"last",  l:"Last",  t:"text", cols:3, ac:"family-name", at:{x:403.8,w:138.2,bot:260.4,size:11}},
      {k:"dob",   l:"Date of birth", t:"date",                   at:{x:171.1,w:168.1,bot:297.5,size:11}},
      {k:"gender", t:"seg", options:[
        {v:"male",   l:"Male",   box:{x:122.2,bot:322.9}},
        {v:"female", l:"Female", box:{x:181.5,bot:322.9}}
      ]}
    ]},
    {h:"5. SS # and Hosp. #",
     ask:"Ask your state election office whether these identifiers are needed for your application. Leave them blank if you are unsure; do not guess.",
     fields:[
      {k:"ss",   l:"SS #",     t:"text", cols:2, at:{x:304.6,w:88.6,bot:324.9,size:10}},
      {k:"hosp", l:"Hosp. #",  t:"text", cols:2, at:{x:456.6,w:82.5,bot:324.9,size:10}}
    ]},
    {h:"6. Polling place", lede:"Where you are registering in the FSM.",
     hint:"If you don't know your ED #, leave it blank and ask — don't guess.", fields:[
      {k:"village", l:"Village", t:"text", ph:"e.g. Palikir", info:"The village where you are registered in the FSM, not where you live now. Use the name your election office would recognise on official records.", at:{x:150,w:150,bot:350.4,size:11}},
      {k:"muni",    l:"Municipality", t:"text", ph:"e.g. Sokehs", at:{x:305,w:105,bot:350.4,size:11}},
      {k:"ed",      l:"ED #",  t:"text", cols:2, im:"numeric", info:"Your Election District. FSM congressional districts are single-member districts within your state: Chuuk has 5, Pohnpei has 3, Yap has 1 and Kosrae has 1. If your state has only one, it is ED 1. Otherwise the number is printed on your voter ID card. If you are not sure, leave it blank and ask your election office rather than guessing — a wrong district can send your ballot to the wrong race.", at:{x:415,w:65,bot:350.4,size:11}},
      {k:"state",   l:"State", t:"select", cols:2, options:STATES, at:{x:487,w:67,bot:350.4,size:11}}
    ]},
    {h:"7. Current mailing address", lede:"Where you live now. Your voter ID card and correspondence go here.", fields:[
      {k:"street", l:"P.O. Box # or street no.", t:"text", ph:"123 Main St, Apt 4", ac:"street-address", at:{x:206,w:139,bot:381.4,size:10}},
      {k:"city",   l:"City / village", t:"text", cols:2, ac:"address-level2",   at:{x:350,w:102,bot:381.4,size:10}},
      {k:"mstate", l:"State", t:"text", cols:2, ph:"NC", ac:"address-level1",            at:{x:457,w:55, bot:381.4,size:10}},
      {k:"zip",    l:"Zip code", t:"text", im:"numeric", ac:"postal-code",      at:{x:517,w:40, bot:381.4,size:10}}
    ]},
    {h:"8. Previously registered in the FSM?", fields:[
      {k:"prev", t:"seg", options:[
        {v:"y", l:"Yes", box:{x:327.0,bot:417.6}},
        {v:"n", l:"No",  box:{x:399.8,bot:418.4}}
      ]},
      {k:"pvillage", l:"Prior village", t:"text", showIf:{k:"prev",eq:"y"}, at:{x:80, w:160,bot:453.8,size:10}},
      {k:"pmuni",    l:"Prior municipality", t:"text", showIf:{k:"prev",eq:"y"}, at:{x:245,w:137,bot:453.8,size:10}},
      {k:"ped",      l:"Prior ED #", t:"text", cols:2, showIf:{k:"prev",eq:"y"}, at:{x:387,w:103,bot:453.8,size:10}},
      {k:"pstate",   l:"Prior state", t:"text", cols:2, showIf:{k:"prev",eq:"y"}, at:{x:495,w:38, bot:453.8,size:10}},
      {k:"pname",    l:"Under the name of", t:"text", showIf:{k:"prev",eq:"y"}, at:{x:168.2,w:170.7,bot:484.4,size:11}}
    ]},
    {h:"9–12. Declarations", lede:"Answer each honestly — this is a sworn affidavit.", fields:[
      {q:"9. I am a citizen of the FSM"},
      {k:"cit", t:"seg", options:[
        {v:"y", l:"Yes", box:{x:223.5,bot:510.8}},
        {v:"n", l:"No",  box:{x:296.2,bot:510.8}}
      ]},
      {q:"10. I have resided in the state and election district since"},
      {k:"since", l:"Resident since", t:"text", ph:"Date or residence history", info:"Enter the date or description that accurately reflects your residence in this district. Ask your state election office if you are unsure what to enter.", at:{x:466.8,w:72,bot:533.0,size:10}},
      {q:"11. I am currently under parole, probation or sentence for any felony for which I have been convicted by any court of the FSM"},
      {k:"fel", t:"seg", options:[
        {v:"y", l:"Yes", box:{x:225.0,bot:566.8}},
        {v:"n", l:"No",  box:{x:294.8,bot:566.8}}
      ]},
      {q:"12. I am currently under a judgment of mental incompetency or insanity"},
      {k:"men", t:"seg", options:[
        {v:"y", l:"Yes", box:{x:440.2,bot:588.4}},
        {v:"n", l:"No",  box:{x:510.8,bot:588.4}}
      ]},
      {warnIf:v=>v.fel==="y"||v.men==="y",
       html:"<b>Check the requirements with your election office.</b> Answer truthfully — this is a sworn affidavit — and contact your election office to ask where you stand."}
    ]},
    {h:"Voter identification card", lede:"Request a Voter ID card in the above name?", fields:[
      {k:"vid", t:"seg", options:[
        {v:"y", l:"Yes", box:{x:427.5,bot:621.7}},
        {v:"n", l:"No",  box:{x:481.5,bot:621.7}}
      ]},
      {askIf:{k:"vid",eq:"y"}, html:"The form asks for a current passport-size 2″ × 2″ photo. Confirm how to provide it with your election office."}
    ]}
  ],
  derived:[],
  /* the printed box is x 63.8-312.0, top 678.7, bottom 766.1.
     pad keeps the signature clear of the borders, as the form requires. */
  signature:{x:63.8, bot:766.1, w:248.2, h:87.4, pad:9},
  dateAt:{x:320.9, w:184.5, bot:763.8, size:10}
}
];
