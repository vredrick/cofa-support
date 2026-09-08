# COFA Support

## Current purpose

A form library for FSM citizens: choose a form, fill it out, download, print, and sign. The site is an independent community tool and does not submit applications or renew passports. Keep the original logo in `public/cofa-supports-logo.svg`.

The homepage catalog is `src/data/forms.ts`; `LandingPage.tsx` renders three simple form rows. Passport Form 500B uses the existing React wizard at `?form=passport`. The election fillers at `public/elections/?form=registration` and `?form=absentee` reuse the supplied templates and field coordinates. Their answers stay in memory, and signatures are completed by hand after printing. The election PDF library is copied from the locked npm dependency by `script/prepare-static.mjs` before development and builds. Read README.md for current setup, source links, and instructions for adding forms.

The existing passport implementation notes below remain useful, but earlier nation-selector and marketing landing-page descriptions are historical. Do not reintroduce them.

## Technology Stack

- **Framework:** Next.js 14.2 with App Router, static export (`output: 'export'`)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 with custom theme colors (`ocean`, `gold`, `surface`, `ink`, `muted`, `error`)
- **Fonts:** Public Sans (body), DM Serif Display (serif accents), Space Mono (monospace labels) — loaded via `next/font/google` with CSS variable strategy
- **Icons:** Material Symbols Outlined (loaded via `<link>` in layout)
- **PDF generation:** pdf-lib 1.17
- **React:** 18.x (all client components, no server components)
- **Linting:** ESLint with next/core-web-vitals and next/typescript
- **Hosting:** GitHub Pages via GitHub Actions (static deploy)
- **Testing:** Vitest plus election PDF tests (`npm test`)

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Build static export to out/
npm run lint      # Run ESLint
npm run start     # Start production server (not typically used; app is static)

# GitHub Pages build (sets basePath to /cofa-support)
GITHUB_PAGES=true npm run build
```

## Project Structure

```
cofa-support/
├── CLAUDE.md                 # This file
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions: build + deploy to GitHub Pages
├── next.config.mjs           # Next.js config: static export, basePath for GitHub Pages
├── tailwind.config.ts        # Custom colors, fonts, shadows, borderWidth
├── tsconfig.json             # Strict mode, path alias @/* -> src/*
├── .eslintrc.json            # next/core-web-vitals + next/typescript
├── package.json              # Dependencies and scripts
├── public/
│   ├── AmendedPassportApplication0001.pdf  # FSM Form 500B PDF template
│   ├── cofa-supports-logo.svg # COFA Supports logo (footer branding)
│   ├── passport-fsm.webp     # FSM passport cover image (landing page)
│   ├── passport-rmi.png      # RMI passport cover image (landing page)
│   └── passport-palau.png    # Palau passport cover image (landing page)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (Public Sans + DM Serif Display + Space Mono fonts, Material Symbols link, metadata)
│   │   ├── page.tsx          # Home page: view toggle (landing/wizard), navigation state
│   │   ├── globals.css       # Tailwind directives + component classes (btn, card, form-input) + landing page styles (nav-pill, feature-card, step-card, etc.)
│   │   ├── favicon.ico
│   │   └── fonts/            # Geist font files (woff, legacy — not currently used)
│   ├── components/
│   │   ├── LandingPage.tsx   # Full landing page: floating nav, hero, nation cards (FSM/RMI/Palau), old way vs better way, how it works steps, footer
│   │   ├── DetailsModal.tsx  # FSM passport info modal (requirements, fees, offices)
│   │   ├── Sidebar.tsx       # Desktop sidebar nav (w-80) + right-side mobile drawer (step tracking only)
│   │   ├── MobileHeader.tsx  # Sticky mobile header: back arrow (left), title, step badge + hamburger (right)
│   │   ├── PrivacyNotice.tsx # Dismissible privacy banner with Material Symbol icon
│   │   ├── Wizard.tsx        # Form state manager, step renderer (nav state lifted to page.tsx)
│   │   ├── steps/
│   │   │   ├── PassportTypeStep.tsx   # Step 0: Card grid with Material Symbol icons
│   │   │   ├── ApplicantInfoStep.tsx  # Step 1: All applicant fields with section separators
│   │   │   ├── ParentInfoStep.tsx     # Steps 2-3: Reused for father/mother
│   │   │   └── ReviewStep.tsx         # Step 4: Split review cards + sticky PDF generate/download/share
│   │   └── ui/
│   │       ├── index.ts       # Barrel export for all UI components
│   │       ├── TextInput.tsx  # Text input with auto-uppercase, 56px height, bold labels
│   │       ├── DateInput.tsx  # MM/DD/YYYY auto-formatting input
│   │       ├── RadioGroup.tsx # Stacked (with shadow) or inline radio button group
│   │       └── YesNoToggle.tsx # Two-button yes/no selector (TriState), 56px height
│   ├── data/
│   │   └── nations.ts        # COFA nation definitions, FSM passport info (fees, offices, etc.)
│   ├── lib/
│   │   ├── pdf-filler.ts     # PDF generation: fill template + draw checkmarks + read-only flatten
│   │   ├── field-mapping.ts  # AcroForm field IDs extracted from template
│   │   └── validation.ts     # Per-step validation + date formatting helper
│   └── types/
│       └── form.ts           # All TypeScript types + initial form data constants
```

## Key Concepts

### Architecture

- **Fully client-side:** Every component uses `'use client'`. There are no server components, no API routes, and no server-side data fetching. The build output (`out/`) is a set of static HTML/JS/CSS files.
- **Privacy-first:** The PDF template is fetched from `public/`, filled in-browser with pdf-lib, and downloaded/shared directly. Nothing touches a server.
- **Static export:** `next.config.mjs` sets `output: 'export'` and `images: { unoptimized: true }`. The app can be hosted on any static file server (S3, GitHub Pages, Netlify, etc.).
- **GitHub Pages deploy:** When `GITHUB_PAGES=true` is set, `next.config.mjs` adds `basePath: '/cofa-support'` and `assetPrefix: '/cofa-support/'`. The `NEXT_PUBLIC_BASE_PATH` env var is exposed so runtime asset fetches (PDF template, passport images) use the correct subpath. The GitHub Actions workflow in `.github/workflows/deploy.yml` handles build and deploy automatically on push to `main`.

### View Architecture

`page.tsx` manages a `view` state (`'landing' | 'wizard'`) to toggle between two top-level views without route changes:

- **Landing view (`'landing'`):** Renders `<LandingPage>` — a multi-section landing page with floating pill navbar, hero with CTA, nation passport cards (FSM active, RMI/Palau coming soon), "The Old Way vs A Better Way" messaging, how-it-works steps, and footer. On mobile, nation cards scroll horizontally with snap-to-center; FSM appears first in DOM order, with CSS `order` classes repositioning it to center on desktop.
- **Wizard view (`'wizard'`):** Renders the existing Sidebar + MobileHeader + Wizard layout for FSM Form 500B.

Clicking "Passport Renewal" or "Start Application" in the landing page/modal sets view to `'wizard'`. The Sidebar accepts an optional `onBackToLanding` prop and renders a "Back to Home" button (with home icon) under the branding in both the desktop sidebar and mobile drawer.

### Layout Architecture

The wizard view uses a sidebar + content layout:

- **Desktop (lg+):** Fixed sidebar (`w-80`) on the left with vertical step navigation; main content area centered at `max-w-[800px]`.
- **Mobile (<lg):** Sticky `MobileHeader` with logo/title (left) and hamburger menu (right); drawer slides in from the right with step navigation, "Back to Home" button, and "Download Blank Form" link. The `slide-in-right` animation is defined in `globals.css`.
- **Navigation state** (`currentStep`, `completedSteps`, `goToStep`, `markCompleteAndAdvance`) lives in `page.tsx` and is passed as props to both `Sidebar` and `Wizard`.

The sidebar maps 5 internal wizard steps to 4 visual items:
| Sidebar Item    | Internal Steps | Active When   | Completed When       |
|-----------------|---------------|---------------|----------------------|
| Passport Type   | 0             | step === 0    | step 0 completed     |
| Your Details    | 1             | step === 1    | step 1 completed     |
| Parental Info   | 2, 3          | step 2 or 3   | both 2 and 3 done    |
| Review & Print  | 4             | step === 4    | step 4 completed     |

### Wizard Flow

The wizard has 5 steps (indexed 0-4), defined in `STEP_LABELS` in `src/types/form.ts`:

| Step | Label     | Component            | Description                        |
|------|-----------|----------------------|------------------------------------|
| 0    | Type      | PassportTypeStep     | Select ordinary/official/diplomatic |
| 1    | Applicant | ApplicantInfoStep    | All personal info, addresses, legal |
| 2    | Father    | ParentInfoStep       | Father's info (reusable component) |
| 3    | Mother    | ParentInfoStep       | Mother's info (same component)     |
| 4    | Review    | ReviewStep           | Summary cards, PDF generate/download/share |

`Wizard.tsx` owns all form data state via `useState<FormData>`. Navigation state is owned by `page.tsx` and passed in as props. There is no context provider or state management library.

### Form Data Model

Defined in `src/types/form.ts`. The root type is `FormData`:

```typescript
FormData
├── passportType: PassportType       // '' | 'ordinary' | 'official' | 'diplomatic'
├── applicant: ApplicantInfo         // Name, DOB, gender, addresses, legal, citizenship
│   ├── homeAddress: Address
│   ├── shippingAddress: Address
│   └── previousPassportDetails: PreviousPassportInfo
├── father: ParentInfo               // Name, birth info, FSM citizenship
└── mother: ParentInfo
```

Custom union types: `TriState` (`'' | 'yes' | 'no'`), `Gender` (`'' | 'miss' | 'mrs' | 'ms' | 'mr'`), `CitizenshipMethod` (`'' | 'birth' | 'naturalization' | 'other'`).

Initial state constants (`INITIAL_FORM_DATA`, `INITIAL_APPLICANT`, etc.) are exported for use in state initialization and resets.

### Validation

`src/lib/validation.ts` exports three validators:

- `validatePassportType(type)` -- Step 0
- `validateApplicantInfo(info)` -- Step 1
- `validateParentInfo(info, label)` -- Steps 2 and 3

Each returns a `ValidationErrors` object (a `Record<string, string>`). Error keys use dot notation for nested fields (e.g., `'homeAddress.street'`, `'previousPassportDetails.country'`).

Validation runs on submit. After the first submit attempt, `ApplicantInfoStep` and `ParentInfoStep` enable live validation via `useEffect` so errors clear as the user corrects them.

Date format: `MM/DD/YYYY`. The `formatDateInput()` helper auto-inserts slashes as the user types.

### PDF Generation

`src/lib/pdf-filler.ts` contains `fillPassportPdf(data)` which:

1. Fetches the PDF template from `public/AmendedPassportApplication0001.pdf`
2. Opens it with `PDFDocument.load()`
3. Fills text fields via `form.getTextField(id).setText(value)`
4. Draws checkbox marks as vector lines directly on the page (two lines forming a checkmark)
5. Calls `form.updateFieldAppearances()` to bake text into appearance streams
6. Sets all fields to read-only via `field.enableReadOnly()` to produce a non-editable PDF
7. Returns `Uint8Array` of the final PDF bytes

Field IDs are defined in `src/lib/field-mapping.ts` as the `FIELD_IDS` constant. These IDs were extracted from the template's AcroForm dictionary and look like `text_4dr`, `checkbox_57vsoy`, etc.

## Development Guidelines

### Commit & Deploy

- **Always verify the build before pushing.** Run `npm run build` locally after making changes. The GitHub Pages deploy will fail if ESLint or TypeScript errors exist (e.g., unused variables, missing props). Fix all errors before committing.
- **Push triggers deploy.** Pushing to `main` automatically triggers the GitHub Actions workflow that builds and deploys to GitHub Pages. Always push after committing so changes go live.
- **Check deploy status.** After pushing, run `gh run list --limit 2` to confirm the deploy workflow succeeds. If it fails, check logs with `gh run view <run-id> --log-failed`, fix the issue, and push again.

### Code Conventions

- **File naming:** Component files use PascalCase (`TextInput.tsx`, `ApplicantInfoStep.tsx`). Library files use kebab-case (`pdf-filler.ts`, `field-mapping.ts`).
- **Path alias:** Use `@/*` to import from `src/*`. Example: `import { TextInput } from '@/components/ui'`.
- **UI barrel export:** All `src/components/ui/` components are re-exported from `src/components/ui/index.ts`. Import from the barrel, not individual files.
- **TextInput auto-uppercase:** The `TextInput` component uppercases input by default (`uppercase={true}`). Pass `uppercase={false}` for email and phone fields.
- **Tailwind component classes:** Reusable utility classes are defined in `src/app/globals.css` under `@layer components`: `btn-primary`, `btn-secondary`, `form-input`, `form-input-error`, `card`, `card-hard`, `card-title`, `error-text`. Landing page classes are defined outside `@layer`: `nav-pill`, `mono-label`, `feature-card`, `step-card`, `noise-overlay`, `grid-bg`, `passport-hover`, `scrollbar-hide`. Use these instead of repeating Tailwind utilities.
- **Arbitrary border width:** Use `border-[3px]` instead of extending Tailwind's `borderWidth` config — custom `borderWidth` values don't resolve inside `@apply` directives in Tailwind CSS 3.4.

### Theme Colors

Defined in `tailwind.config.ts`:

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| `ocean`        | `#1B4F72` | Primary blue (buttons, headers, borders) |
| `ocean-light`  | `#2471A3` | Hover state                    |
| `ocean-dark`   | `#154360` | Active/pressed state           |
| `ocean-deep`   | `#0B2136` | Dark backgrounds (FSM card, footer, modal header) |
| `gold`         | `#C4952A` | Accent                         |
| `gold-light`   | `#D4AC2B` | Accent variant                 |
| `gold-dark`    | `#A67C22` | Accent variant                 |
| `gold-focus`   | `#FFD700` | Focus ring color (accessibility) |
| `surface`      | `#F0F4F8` | Page background, input backgrounds |
| `ink`          | `#102A43` | Primary text color             |
| `muted`        | `#486581` | Secondary text, labels         |
| `error`        | `#D64545` | Error states, required asterisks |

### Design System

- **Input height:** 56px (`h-[56px]`) with 3px blue borders, light blue-gray backgrounds
- **Button height:** 56px (`h-14`) with 3px borders
- **Typography:** Bold labels (`text-lg font-bold`), large headings (`text-4xl font-bold tracking-tight`)
- **Cards:** `.card` for standard sections, `.card-hard` for brutalist shadow (`4px 4px 0 #1B4F72`)
- **Focus rings:** Gold (`focus:ring-4 focus:ring-gold-focus`) for accessibility
- **Icons:** Material Symbols Outlined, referenced as `<span className="material-symbols-outlined">icon_name</span>`
- **Shadows:** `shadow-hard` (4px 4px 0 #1B4F72), `shadow-hard-sm` (2px 2px 0 #1B4F72), `shadow-premium` / `shadow-premium-hover` (landing page cards), `shadow-smooth` (modals)
- **Sticky navigation bar:** Back/Continue buttons in all wizard steps (0-4) use a sticky bottom bar (`sticky bottom-0 z-10`) with `bg-surface` background and `border-t border-ocean/10` separator. Negative margins (`-mx-4 px-4 sm:-mx-8 sm:px-8`) extend the background to the edges of the content container.

### Adding New Form Fields

1. Add the TypeScript type/property to `src/types/form.ts` and its initial value constant
2. Add the corresponding PDF field ID to `src/lib/field-mapping.ts` (extract from the PDF template's AcroForm)
3. Add validation logic to the appropriate validator in `src/lib/validation.ts`
4. Add the UI input to the appropriate step component
5. Add the field mapping in `src/lib/pdf-filler.ts` (use `setTextField` for text, `checkBox` for checkboxes)
6. Add the field to `ReviewStep.tsx` for display in the summary

### Adding New COFA Nations

When adding RMI or Palau support:

1. Update the nation's `status` from `'coming-soon'` to `'available'` in `src/data/nations.ts`
2. Add a new PDF template to `public/`
3. Create a new field mapping file (or extend `field-mapping.ts` with nation-specific sections)
4. Add a passport info object (like `FSM_PASSPORT_INFO`) to `src/data/nations.ts` for the details modal
5. The form data model may need new types if the other nation's form has different fields
6. The wizard steps may need conditional sections or entirely new step components
7. Add a new card to the landing page nation cards section in `LandingPage.tsx` (follow the FSM card pattern for active nations, RMI/Palau pattern for coming-soon)

## Important Gotchas

### PDF Checkbox Rendering

Chrome's built-in PDF viewer ignores checkbox form field appearance streams entirely. Setting a checkbox via `cb.check()` produces a check that appears in Adobe Reader and Mac Preview but is invisible in Chrome. The workaround is to draw checkmark lines directly on the page using `page.drawLine()` at the widget rectangle coordinates. The `checkBox()` helper in `pdf-filler.ts` implements this.

### PDF Flattening

- **`form.flatten()` crashes:** Calling `form.flatten()` on this template throws `Could not find page for PDFRef 471 0 R` due to orphaned widget references.
- **Stripping AcroForm loses text:** Deleting the AcroForm dictionary (`catalog.delete(PDFName.of('AcroForm'))`) removes font references needed by text field appearance streams, causing all text to disappear in downloaded PDFs while checkmarks (drawn as vector lines) survive.
- **Current approach:** All fields are set to read-only via `field.enableReadOnly()`. This preserves text rendering while preventing editing.

### PDF Template Quirks

- **Checkbox on-value:** The template uses `Yes_nlga` as the checkbox on-value, not the standard `Yes`. This is why `cb.check()` alone does not work correctly and the vector drawing approach is used instead.
- **Checkbox widget size:** Checkbox rectangles in the template are very small (5-7 points). The checkmark line drawing uses proportional coordinates (15%-85% of the widget rect) to fit properly.

### Tailwind @apply Limitations

Custom values added to `borderWidth` in `tailwind.config.ts` (e.g., `'3': '3px'`) do **not** resolve when used via `@apply` in CSS files under Tailwind CSS 3.4. Use arbitrary values (`border-[3px]`) instead. This applies to all custom theme extensions used inside `@apply`.

### Static Export & GitHub Pages Constraints

- No `getServerSideProps`, `getStaticProps`, or API routes
- No `next/image` optimization (images are unoptimized)
- The PDF template must be in `public/` and is fetched at runtime via `fetch()`
- All routing is client-side; there is one page (`/`) with a view state toggle (landing vs wizard)
- **BasePath handling:** When deployed to GitHub Pages, all assets live under `/cofa-support/`. Next.js handles `basePath` for JS/CSS bundles and `<Link>` components automatically. For raw `<img>` tags and `fetch()` calls to `public/` files, you must prefix with `process.env.NEXT_PUBLIC_BASE_PATH` (see `LandingPage.tsx` and `pdf-filler.ts` for examples). Locally this env var is empty, so paths resolve to `/` as usual.

### Share API

`ReviewStep.tsx` checks for `navigator.canShare()` support and conditionally shows a "Share PDF" button. This uses the Web Share API Level 2 (file sharing), which is supported on mobile Safari, Chrome on Android, and some desktop browsers. The check happens in a `useEffect` to avoid SSR/hydration mismatches. The Share API requires a **secure context** (HTTPS or localhost) — it will not appear when testing via local network IP over plain HTTP.

### Review Step Layout

The review step splits applicant info into two cards: **Applicant** (personal details + citizenship) and **Contact & Address** (addresses, phone, email, legal). Both link back to step 1 for editing. The PDF preview (iframe) renders inline above the sticky bottom bar. The sticky bar shows contextual actions: Generate PDF (idle), Download/Share (success), Try Again (error), with Back always visible. There is no "Regenerate" button — navigating back and making edits resets the PDF state, requiring a fresh generate.

## Navigation Guide

This is a small project with a flat structure. The key files to understand are:

| File | Purpose |
|------|---------|
| `src/types/form.ts` | All types and initial data — start here to understand the data model |
| `src/data/nations.ts` | COFA nation definitions + FSM passport info (fees, offices, requirements) |
| `src/app/page.tsx` | View toggle (landing/wizard) + navigation state |
| `src/components/LandingPage.tsx` | Nation selector — passport cover cards, hero, FSM actions |
| `src/components/DetailsModal.tsx` | FSM passport info modal — requirements, fees, processing, offices |
| `src/components/Wizard.tsx` | Form state hub — owns all form data, renders current step |
| `src/components/Sidebar.tsx` | Desktop sidebar + right-side mobile drawer — step nav only on mobile |
| `src/components/MobileHeader.tsx` | Mobile sticky header — back arrow (left), hamburger + step badge (right) |
| `src/lib/pdf-filler.ts` | PDF generation logic — the core value of the app |
| `src/lib/field-mapping.ts` | PDF field IDs — map between form data and PDF template fields |
| `src/lib/validation.ts` | Validation rules — defines what is required and format constraints |
| `src/components/steps/` | Individual wizard steps — the UI for data entry |
| `src/components/ui/` | Reusable form components — shared across all steps |
| `src/app/globals.css` | Tailwind component classes + landing page styles + slide-in-right animation |
| `next.config.mjs` | Static export config + GitHub Pages basePath/assetPrefix |
| `.github/workflows/deploy.yml` | GitHub Actions workflow — auto-deploys to GitHub Pages on push to main |
