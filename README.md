# COFA Support

A free, independent form-filling website for FSM citizens. Choose a form, enter your details, and download a PDF to print and sign. The site does not renew passports, submit applications, register voters, or request ballots on anyone's behalf.

## Available forms

- **Passport application:** the existing guided FSM Form 500B filler, with review and PDF download.
- **Voter registration:** the application and sworn affidavit from the supplied election form tool.
- **Absentee ballot application:** the supplied form for the March 2, 2027 Congressional General Election.

Answers are processed in the browser and are not sent to a server or saved between visits. Download your PDF before leaving. No account or analytics. The original COFA logo is retained.

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
- `public/elections/pdf.mjs`: original-template PDF generation, plus optional print instructions.
- `public/forms/`: election PDF templates extracted unchanged from the supplied HTML.
- `script/election-forms.test.mjs`: generation, page-size, conditional-answer and overflow tests.

## Election sources

Form labels, deadlines and print/submission instructions were checked against the [FSM National Election Office form gallery](https://www.fsmned.fm/PDFgallery.htm) on September 8, 2026, including its [registration form](https://www.fsmned.fm/PDF/RegistrationForm_322027_CongressionalGeneralElection.pdf) and [absentee application](https://www.fsmned.fm/PDF/AbsenteebyMailRequestForm_322027_CongressionalGeneralElection.pdf).

The election workflow fills forms for printing and leaves signatures and dates blank for signing by hand. State-specific email addresses, claimed verbal office advice, electronic signatures, and email packets from the supplied standalone page are not part of this print-focused workflow. Users are directed to their state election office for submission requirements. The PDF's official-use-only fields are left untouched.
