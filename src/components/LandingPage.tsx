'use client';

import { useState } from 'react';
import DetailsModal from '@/components/DetailsModal';
import I94Modal from '@/components/I94Modal';

interface LandingPageProps {
  onStartApplication: () => void;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const heroSteps = [
  {
    icon: 'assignment',
    title: 'Guided questions',
    description: 'Answer each section once instead of guessing where it goes on the PDF.',
  },
  {
    icon: 'fact_check',
    title: 'Built-in review',
    description: 'Required fields are checked before you create the final form.',
  },
  {
    icon: 'print',
    title: 'Print-ready PDF',
    description: 'Download Form 500B ready to sign, notarize, and submit.',
  },
];

const startChecklist = [
  'Applicant details and contact information',
  'Father and mother information for the form',
  'Previous passport, birth certificate, and photo ID details',
];

const trustItems = [
  { icon: 'lock', label: 'Your answers stay in this browser' },
  { icon: 'description', label: 'Uses the official FSM Form 500B PDF' },
  { icon: 'business', label: 'Final submission still goes to a passport office' },
];

export default function LandingPage({ onStartApplication }: LandingPageProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [i94Open, setI94Open] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      <button
        type="button"
        onClick={onStartApplication}
        className="sr-only focus:not-sr-only fixed left-4 top-4 z-[60] rounded-lg bg-ocean px-4 py-3 text-sm font-bold text-white shadow-smooth focus:outline-none focus:ring-4 focus:ring-gold-focus"
      >
        Skip to application form
      </button>

      {/* ─── Section 1: Floating Pill Navbar ─── */}
      {/* Desktop navbar */}
      <nav className="nav-pill hidden md:flex md:items-center" aria-label="Primary navigation">
        <div className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/cofa-supports-logo.svg`}
            alt="COFA Supports logo"
            width={22}
            height={22}
          />
          <span className="font-bold text-ink text-sm">COFA Supports</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-ocean/5 hover:text-ocean focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            Requirements &amp; fees
          </button>
          <button
            type="button"
            onClick={() => setI94Open(true)}
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-ocean/5 hover:text-ocean focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            I-94 help
          </button>
          <a
            href="#privacy"
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-ocean/5 hover:text-ocean focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            Privacy
          </a>
        </div>

        <button
          type="button"
          onClick={onStartApplication}
          className="shrink-0 whitespace-nowrap rounded-full bg-ocean px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ocean-light focus:outline-none focus:ring-4 focus:ring-gold-focus"
        >
          Start FSM form
        </button>
      </nav>

      {/* Mobile navbar */}
      <nav className="fixed top-4 left-4 right-4 z-40 flex md:hidden items-center px-2 py-2 rounded-2xl border border-ocean/15 bg-white/90 backdrop-blur-xl" style={{ boxShadow: '0 12px 32px -8px rgba(0,0,0,0.12)' }}>
        {/* Left: Hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-ocean/5 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-focus"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined text-[22px] text-ink">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Center: Logo + name */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/cofa-supports-logo.svg`}
            alt="COFA Supports logo"
            width={18}
            height={18}
          />
          <span className="font-bold text-ink text-xs">COFA Supports</span>
        </div>

        {/* Right: Start button */}
        <button
          type="button"
          onClick={onStartApplication}
          className="px-4 py-2 bg-ocean text-white text-xs font-bold rounded-xl hover:bg-ocean-light transition-colors whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-focus"
        >
          Start form
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
      {menuOpen && (
        <div className="fixed top-[72px] left-4 right-4 z-40 md:hidden bg-white/95 backdrop-blur-xl rounded-2xl border border-ocean/15 p-1.5" style={{ boxShadow: '0 12px 32px -8px rgba(0,0,0,0.12)' }}>
          <button
            type="button"
            onClick={() => { setMenuOpen(false); setDetailsOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium text-ink hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            <span className="material-symbols-outlined text-[20px] text-ocean">checklist</span>
            Requirements &amp; Fees
          </button>
          <button
            type="button"
            onClick={() => { setMenuOpen(false); setI94Open(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium text-ink hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            <span className="material-symbols-outlined text-[20px] text-ocean">flight_land</span>
            I-94 Record Lookup
          </button>
          <a
            href="#privacy"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-medium text-ink hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-focus"
          >
            <span className="material-symbols-outlined text-[20px] text-ocean">lock</span>
            Privacy &amp; Security
          </a>
        </div>
      )}

      {/* ─── Section 2: Hero ─── */}
      <section className="relative min-h-[92svh] bg-surface overflow-hidden pt-28 pb-14 sm:pt-32 lg:flex lg:items-center">
        <div className="absolute inset-0 grid-bg" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.75fr)] lg:gap-14">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-ocean/15 bg-white/70 px-4 py-2 text-muted shadow-card backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ocean" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.14em]">
                  FSM Form 500B available now
                </span>
              </div>

              <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.04] text-ink sm:text-5xl lg:mx-0 lg:text-6xl">
                Complete your FSM passport application with{' '}
                <span className="font-serif italic font-normal text-gold">less guesswork.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl lg:mx-0">
                A guided form fills the official PDF for you, checks required answers, and gives
                you a print-ready file to sign, notarize, and submit.
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={onStartApplication}
                  className="group relative inline-flex min-h-[58px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-ocean px-7 py-4 text-base font-bold text-white transition-all duration-300 hover:shadow-glow-ocean focus:outline-none focus:ring-4 focus:ring-gold-focus"
                >
                  <span className="absolute inset-0 bg-ocean-light translate-x-[-101%] transition-transform duration-300 group-hover:translate-x-0" />
                  <span className="relative flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px]">edit_document</span>
                    Start the guided form
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-xl border border-ocean/20 bg-white/80 px-6 py-4 text-base font-bold text-ocean transition-colors hover:border-ocean/35 hover:bg-white focus:outline-none focus:ring-4 focus:ring-gold-focus"
                >
                  <span className="material-symbols-outlined text-[20px]">checklist</span>
                  Check requirements
                </button>
              </div>

            </div>

            <aside className="rounded-2xl border border-ocean/15 bg-white/85 p-5 shadow-premium backdrop-blur-md sm:p-6 lg:row-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-ocean-deep p-3 shadow-card sm:h-36 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${basePath}/passport-fsm.webp`}
                    alt="FSM passport"
                    className="max-h-full w-auto rounded-md drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ocean">Before you start</p>
                  <h2 className="mt-2 text-2xl font-bold leading-tight text-ink">
                    Have the basics nearby.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    The form takes less effort when your details are in front of you.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {startChecklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-gold">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid gap-2">
                {trustItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5 text-sm text-muted">
                    <span className="material-symbols-outlined text-[18px] text-ocean">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setI94Open(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-ocean/20 bg-white px-4 py-3 text-sm font-bold text-ocean transition-colors hover:border-ocean/35 hover:bg-ocean/5 focus:outline-none focus:ring-4 focus:ring-gold-focus"
                >
                  <span className="material-symbols-outlined text-[18px]">flight_land</span>
                  I-94 help
                </button>
                <button
                  type="button"
                  onClick={onStartApplication}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-light focus:outline-none focus:ring-4 focus:ring-gold-focus"
                >
                  Begin
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </aside>

            <div className="grid gap-3 text-left sm:grid-cols-3 lg:col-start-1 lg:row-start-2">
              {heroSteps.map((step) => (
                <div key={step.title} className="rounded-xl border border-ocean/10 bg-white/65 p-4 shadow-card backdrop-blur-sm">
                  <span className="material-symbols-outlined mb-3 block text-[24px] text-ocean">
                    {step.icon}
                  </span>
                  <h3 className="text-sm font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Nation Feature Cards ─── */}
      <section className="relative py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="mb-12">
            <span className="mono-label">Available passport tool</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mt-3">
              Start with FSM today. <span className="font-serif italic text-ocean">RMI and Palau are planned.</span>
            </h2>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 items-center">
            {/* FSM first in DOM (shows first on mobile scroll) — centered on desktop via order-2 */}
            <div className="feature-card bg-ocean-deep min-w-[80vw] snap-center md:min-w-0 md:h-[500px] flex flex-col border border-ocean/30 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 shrink-0 md:order-2">
              <div className="flex-1 flex items-center justify-center p-8 pb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${basePath}/passport-fsm.webp`}
                  alt="FSM passport"
                  className="passport-hover w-full max-w-[200px] h-auto rounded-md drop-shadow-[0_16px_32px_rgba(0,0,0,0.4)] hover:scale-105 hover:-translate-y-1"
                />
              </div>

              <div className="p-6 pt-2 space-y-4">
                <div>
                  <h3 className="font-bold text-xl text-white">FSM</h3>
                  <p className="font-mono text-xs text-white/50 mt-0.5">Federated States of Micronesia</p>
                </div>

                <button
                  type="button"
                  onClick={onStartApplication}
                  className="w-full py-3 bg-gold text-white font-bold rounded-xl hover:bg-gold-light transition-colors"
                >
                  Start FSM Form
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="w-full text-center font-mono text-xs text-white/60 hover:text-white transition-colors py-1"
                >
                  Requirements &amp; Fees
                </button>
              </div>
            </div>

            {/* RMI — second in DOM (swipe right on mobile), first column on desktop via order-1 */}
            <div className="feature-card bg-surface border border-ocean/10 min-w-[75vw] snap-center md:min-w-0 min-h-[360px] md:h-[440px] flex flex-col shrink-0 md:order-1">
              <div className="flex-1 flex items-center justify-center p-8 pb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${basePath}/passport-rmi.png`}
                  alt="RMI passport"
                  className="w-full max-w-[160px] h-auto rounded-md opacity-25 grayscale"
                />
              </div>

              <div className="p-6 pt-2 space-y-3">
                <div>
                  <h3 className="font-bold text-xl text-ink/40">RMI</h3>
                  <p className="font-mono text-xs text-muted/40 mt-0.5">Republic of the Marshall Islands</p>
                </div>

                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Palau — third in DOM and on desktop via order-3 */}
            <div className="feature-card bg-surface border border-ocean/10 min-w-[75vw] snap-center md:min-w-0 min-h-[360px] md:h-[440px] flex flex-col shrink-0 md:order-3">
              <div className="flex-1 flex items-center justify-center p-8 pb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${basePath}/passport-palau.png`}
                  alt="Palau passport"
                  className="w-full max-w-[160px] h-auto rounded-md opacity-25 grayscale"
                />
              </div>

              <div className="p-6 pt-2 space-y-3">
                <div>
                  <h3 className="font-bold text-xl text-ink/40">Palau</h3>
                  <p className="font-mono text-xs text-muted/40 mt-0.5">Republic of Palau</p>
                </div>

                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: The Old Way vs A Better Way ─── */}
      <section id="privacy" className="py-20 sm:py-28 bg-surface scroll-mt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: The Old Way */}
            <div className="text-ink/20 space-y-4">
              <span className="mono-label !text-ink/15">The Old Way</span>
              <p className="text-2xl sm:text-3xl font-bold leading-snug">
                Download the form. Print it out. Fill it in by hand. Make a mistake.
                Cross it out. Start over with a fresh copy. Hope it&apos;s neat enough.
                Drive to get it notarized. Find out you missed a field...
              </p>
            </div>

            {/* Right: A Better Way */}
            <div className="space-y-5">
              <span className="mono-label text-gold">A Better Way</span>
              <p className="text-3xl sm:text-4xl font-serif italic text-ink leading-tight">
                Fill it out right<br />
                <span className="text-gold">the first time.</span>
              </p>
              <p className="text-base text-muted leading-relaxed max-w-md">
                This app walks you through the FSM passport application step by step.
                When you&apos;re done, print your completed form &mdash; ready to sign and notarize.
                No more handwriting mistakes. No more starting over.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted/70 pt-1">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Your information stays on your device. We don&apos;t collect or store anything.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Process Steps ─── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="mb-12">
            <span className="mono-label">How the form works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mt-3">
              Three steps. <span className="font-serif italic text-ocean">That&apos;s it.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="step-card group">
              <span className="font-mono text-7xl font-bold text-ocean/10 group-hover:text-gold/20 transition-colors duration-500 leading-none">
                01
              </span>
              <div className="relative mt-4 mb-3">
                <span className="material-symbols-outlined text-[32px] text-ocean group-hover:text-gold transition-colors duration-500">
                  public
                </span>
                {/* Spinning dashed circle on hover */}
                <div className="absolute -inset-2 border border-dashed border-ocean/0 group-hover:border-gold/30 rounded-full group-hover:animate-spin-slow transition-colors duration-500" />
              </div>
              <h3 className="font-bold text-lg text-ink">Choose Passport Type</h3>
              <p className="font-mono text-xs text-muted mt-2 leading-relaxed">
                Select ordinary, official, or diplomatic so the PDF is marked correctly.
              </p>
            </div>

            {/* Step 02 */}
            <div className="step-card group">
              <span className="font-mono text-7xl font-bold text-ocean/10 group-hover:text-gold/20 transition-colors duration-500 leading-none">
                02
              </span>
              <div className="relative mt-4 mb-3">
                <span className="material-symbols-outlined text-[32px] text-ocean group-hover:text-gold transition-colors duration-500">
                  edit_note
                </span>
                <div className="absolute -inset-2 border border-dashed border-ocean/0 group-hover:border-gold/30 rounded-full group-hover:animate-spin-slow transition-colors duration-500" />
              </div>
              <h3 className="font-bold text-lg text-ink">Enter Details</h3>
              <p className="font-mono text-xs text-muted mt-2 leading-relaxed">
                Move through applicant and parent sections one screen at a time.
              </p>
            </div>

            {/* Step 03 */}
            <div className="step-card group">
              <span className="font-mono text-7xl font-bold text-ocean/10 group-hover:text-gold/20 transition-colors duration-500 leading-none">
                03
              </span>
              <div className="relative mt-4 mb-3">
                <span className="material-symbols-outlined text-[32px] text-ocean group-hover:text-gold transition-colors duration-500">
                  print
                </span>
                <div className="absolute -inset-2 border border-dashed border-ocean/0 group-hover:border-gold/30 rounded-full group-hover:animate-spin-slow transition-colors duration-500" />
              </div>
              <h3 className="font-bold text-lg text-ink">Review and Print</h3>
              <p className="font-mono text-xs text-muted mt-2 leading-relaxed">
                Check your answers, generate the PDF, then print it for submission.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-ocean/10 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Ready to fill the form?</h3>
              <p className="mt-1 text-sm text-muted">You can come back to requirements or I-94 help anytime.</p>
            </div>
            <button
              type="button"
              onClick={onStartApplication}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-ocean px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean-light focus:outline-none focus:ring-4 focus:ring-gold-focus sm:w-auto"
            >
              Start the guided form
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Section 6: Footer ─── */}
      <footer className="bg-ocean-deep text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          {/* Logo + brand text */}
          <div className="flex items-center gap-6 mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/cofa-supports-logo.svg`}
              alt="COFA Supports logo"
              className="h-20 sm:h-28 lg:h-32 w-auto invert opacity-80"
            />
            <h2
              className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(36,113,163,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              COFA<br />SUPPORTS
            </h2>
          </div>

          {/* Status line */}
          <div className="flex items-center gap-2.5 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              System Status: Operational
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 mb-10">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="font-mono text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
            >
              Requirements
            </button>
            <a
              href="https://github.com/AikenOZ/cofa-passport"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
            >
              GitHub Repo
            </a>
          </div>

          {/* Disclaimer + copyright */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            <p className="text-xs text-white/30 max-w-2xl leading-relaxed">
              This is not an official government website. This tool helps you fill out passport
              application forms that must be printed and submitted to the appropriate passport office.
            </p>
            <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.15em]">
              &copy; {new Date().getFullYear()} COFA Supports
            </p>
          </div>
        </div>
      </footer>

      <DetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onStartApplication={() => {
          setDetailsOpen(false);
          onStartApplication();
        }}
      />
      <I94Modal
        open={i94Open}
        onClose={() => setI94Open(false)}
      />
    </div>
  );
}
