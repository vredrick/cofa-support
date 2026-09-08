# COFA Support

A free, independent form-filling website for FSM citizens. Choose a form, enter your details, and download a filled PDF. Election forms also offer a drawn signature; printing and signing by hand remains the default. The site does not renew passports, submit applications, register voters, or request ballots on anyone's behalf.

## Available forms

- **Passport application:** the existing guided FSM Form 500B filler, with review and PDF download.
- **Voter registration:** the application and sworn affidavit from the supplied election form tool.
- **Absentee ballot application:** the supplied form for the March 2, 2027 Congressional General Election.

Answers, signatures and optional document copies are processed in the browser and are not sent to a server or saved between visits. Download your PDF before leaving. No account or analytics. The original COFA logo is retained.

## Development

Use Node 22 (the VPS has 22.18.0 installed).

```sh
npm ci
npm run dev
npm run lint
npm test
GITHUB_PAGES=true npm run build
```

`predev` and `prebuild` copy the installed, lockfile-pinned pdf-lib browser bundle and its license into `public/vendor/`. No external PDF-library CDN is needed. Generated vendor files are excluded from Git.

## Hosting

- Repository: https://github.com/vredrick/cofa-support
- Website: https://vredrick.github.io/cofa-support/
- VPS checkout: `/home/vredrick/cofa-support`
- The existing GitHub Actions workflow builds a Next.js static export and deploys `out/` to GitHub Pages on a push to `main`.
- `next.config.mjs` sets `/cofa-support` as the production base path. Public asset URLs must respect this path. Election pages use relative URLs so they work both locally and under GitHub Pages.

## Adding another form

1. Add its original PDF template to `public/forms/`.
2. Build its field definitions and PDF mapping. Simple election-style forms can use the reusable engine in `public/elections/`; more involved forms can have their own React flow.
3. Add a title, description, category, and link in `src/data/forms.ts`. Only list forms that are available to fill.
4. Check the source instructions, test conditional answers and PDF output, and verify the download on mobile and desktop.

## Key files

- `src/data/forms.ts`: homepage form catalog.
- `src/components/LandingPage.tsx`: simple form library.
- `src/app/page.tsx`: homepage and passport wizard, including `?form=passport` links.
- `src/components/Wizard.tsx` and `src/lib/pdf-filler.ts`: existing passport questions and PDF mapping.
- `public/elections/definitions.mjs`: fields and original coordinate mapping from the supplied election tool.
- `public/elections/app.mjs`: accessible election fields, conditional answers, download and preview.
- `public/elections/pdf.mjs`: original-template PDF generation, signature placement and optional document merging.
- `public/elections/guide.mjs`: legal-size instruction sheets and submission copy.
- `public/elections/signing.mjs`, `signature.mjs`, `attachments.mjs`: signature UI, alpha cropping and local document preparation.
- `public/forms/`: election PDF templates extracted unchanged from the supplied HTML.
- `script/election-forms.test.mjs`: generation, page-size, conditional-answer and overflow tests.

## Election sources

Form labels, deadlines and print/submission instructions were checked against the [FSM National Election Office form gallery](https://www.fsmned.fm/PDFgallery.htm) on September 8, 2026, including its [registration form](https://www.fsmned.fm/PDF/RegistrationForm_322027_CongressionalGeneralElection.pdf) and [absentee application](https://www.fsmned.fm/PDF/AbsenteebyMailRequestForm_322027_CongressionalGeneralElection.pdf).

The residence, SS-number and email submission guidance was supplied by the site owner from an email by DeeAnn David, Administrative Clerk, cc Deputy Director Esmeralda Panuelo. The owner subsequently clarified that the guidance and registration email option should cover all four FSM states. The help text refers to the National Election Office without repeated regional callouts, and the residence field has a single explanation. The official [office overview](https://www.fsmned.fm/about.htm) describes the national agency and its state commissioners; the [staff directory](https://www.fsmned.fm/staff.htm) lists the supplied contacts. The specific email advice remains user-supplied and should not be replaced merely because it is absent from the public website or Title 9.

## Election signatures and submission

- **Print & sign by hand** is the default on both forms. The PDF signature and date stay blank.
- **Draw it** uses pointer events and a canvas sized only when visible. Transparent margins are cropped before embedding the PNG; signatures preserve their aspect ratio, with 9-point padding inside the registration box. A date is included only in Draw mode.
- **Voter registration (all four FSM states):** the signed form, birth certificate copy and one photo ID copy can be emailed to both `election@election.fm` and `deeann.david@election.fm`. Signing on screen allows the form PDF to be emailed directly. The default is **I'll attach them myself**. Merging scanned PDFs or images is a deliberate opt-in; it is reset when clearing the selected state or switching back to print-and-sign mode. Images are resized to at most 2000 pixels on the long edge; HEIC is rejected with JPEG conversion guidance; files over 20 MB produce an email-size warning.
- **Absentee application:** must be printed and submitted by post or hand delivery even with a drawn signature. No email or document-merge flow is offered.
- The optional instruction sheet uses a legal-size page with numbered steps and a **KEEP THIS PAGE. DO NOT SEND IT.** strip. For signed registrations with any of the four states selected it downloads separately and is never included in the email packet. Other forms append the sheet for printing. Steps reflect the chosen signing mode and selected state office.
- The guides include the January 21, 2027 mailed-ballot request deadline and March 2, 2027 ballot-arrival deadline, scanning guidance and National Election Office contacts. The time-zone note distinguishes the 15-hour lead during US daylight time from 16 hours during standard time.

The PDF's official-use-only fields and original form templates are left untouched. Nothing is submitted by this website.
