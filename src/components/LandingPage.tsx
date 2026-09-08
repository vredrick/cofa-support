'use client';

import { FORMS } from '@/data/forms';

interface LandingPageProps { onStartApplication: () => void; }
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

function DocumentIcon() {
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" fill="none" aria-hidden="true">
      <path d="M4 1.5h16l10 10V35a1.5 1.5 0 0 1-1.5 1.5h-25A1.5 1.5 0 0 1 2 35V3A1.5 1.5 0 0 1 4 1.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 2v8a2 2 0 0 0 2 2h7M9 17h14M9 23h14M9 29h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage({ onStartApplication }: LandingPageProps) {
  return (
    <div className="forms-home">
      <a href="#forms" className="skip-link">Skip to forms</a>
      <header className="library-header">
        <div className="library-header-inner">
          <a href={`${basePath}/`} className="library-brand" aria-label="COFA Support home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}/cofa-supports-logo.svg`} width="36" height="36" alt="" />
            <span>COFA Support</span>
          </a>
          <nav aria-label="Main navigation"><a href="#forms">Forms</a><a href="#how-it-works">How it works</a></nav>
        </div>
      </header>
      <main className="library-main">
        <section className="library-intro" aria-labelledby="page-title">
          <h1 id="page-title">Your forms. Ready to print.</h1>
          <p className="library-description">Choose a form, fill it out on your phone or computer, and download a PDF to print and sign.</p>
          <p className="library-audience">For FSM citizens. Free to use. No account needed.</p>
        </section>
        <section id="forms" aria-labelledby="forms-title" tabIndex={-1}>
          <div className="library-list-heading"><h2 id="forms-title">Choose a form</h2><span>{FORMS.length} forms available</span></div>
          <ul className="library-list">
            {FORMS.map((form) => (
              <li key={form.id} className="library-row">
                <div className="library-document"><DocumentIcon /></div>
                <div className="library-form-info"><h3>{form.title}</h3><p>{form.description}</p></div>
                <span className="library-category">{form.category}</span>
                {form.id === 'passport' ? (
                  <button type="button" className="library-fill" onClick={onStartApplication} aria-label={`Fill form: ${form.title}`}>Fill form <span aria-hidden="true">→</span></button>
                ) : (
                  <a className="library-fill" href={`${basePath}${form.href}`} aria-label={`Fill form: ${form.title}`}>Fill form <span aria-hidden="true">→</span></a>
                )}
              </li>
            ))}
          </ul>
          <p className="library-more">More forms will be added here over time.</p>
        </section>
        <section id="how-it-works" className="library-how" aria-label="How it works">
          <ol>{['Choose your form', 'Fill in your details', 'Download & print'].map((step, i) => (
            <li key={step}><span className="library-step">{i + 1}</span><span>{step}</span>{i < 2 && <span className="library-next" aria-hidden="true">⟶</span>}</li>
          ))}</ol>
        </section>
      </main>
      <footer className="library-footer">
        <p>COFA Support is an independent community tool. Forms are prepared here; you submit them to the relevant office.</p>
        <p>Your answers stay in your browser.</p>
      </footer>
    </div>
  );
}
