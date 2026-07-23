'use client';

interface I94ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function I94Modal({ open, onClose }: I94ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl border border-ocean/20 shadow-smooth overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-ocean-deep text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-white/80">flight_land</span>
            <div>
              <h2 className="text-xl font-bold">I-94 Record Lookup</h2>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-wide">U.S. Customs &amp; Border Protection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Intro */}
          <section>
            <p className="text-sm text-muted leading-relaxed">
              Your I-94 is proof of your legal admission into the United States. As a COFA citizen,
              your I-94 records are available <strong className="text-ink">indefinitely</strong> — not
              just the standard 10 years. You can retrieve and print your record at any time from
              the official CBP website.
            </p>
          </section>

          {/* Passport number callout */}
          <section>
            <div className="flex gap-3 bg-gold/10 border border-gold/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-[20px] text-gold shrink-0 mt-0.5">info</span>
              <div className="text-sm text-ink leading-relaxed">
                <strong>Which passport number do I use?</strong> Your I-94 is tied to the passport
                you last used to enter the United States. If you&apos;ve renewed your passport since
                your last trip, you&apos;ll need to enter the <strong>previous passport number</strong> you
                traveled with — not the new one. If your current passport is the one you last
                entered with, use that number.
              </div>
            </div>
          </section>

          {/* What you'll need */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-ocean text-[22px]">checklist</span>
              <h3 className="font-bold text-ink text-lg font-mono">What You&apos;ll Need</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: 'badge', label: 'First & last name (as on passport)' },
                { icon: 'cake', label: 'Date of birth' },
                { icon: 'menu_book', label: 'Passport number last used to enter the U.S.' },
                { icon: 'flag', label: 'Country of passport issuance' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm text-muted">
                  <span className="material-symbols-outlined text-[18px] text-ocean/60">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </section>

          {/* CBP One tip */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-ocean text-[22px]">smartphone</span>
              <h3 className="font-bold text-ink text-lg font-mono">Mobile Option</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              You can also retrieve your I-94 using the <strong className="text-ink">CBP One</strong> mobile
              app, which lets you scan your passport to auto-fill the lookup form.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-ocean/10 p-4 space-y-2">
          <div className="flex gap-3">
            <a
              href="https://i94.cbp.dhs.gov/search/recent-search"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Retrieve Your I-94
            </a>
          </div>
          <div className="flex gap-3">
            <a
              href="https://i94.cbp.dhs.gov/search/history-search"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap !text-base"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              View Travel History
            </a>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 !text-base">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
