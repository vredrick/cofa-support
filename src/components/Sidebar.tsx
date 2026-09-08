'use client';

interface SidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onBackToLanding?: () => void;
}

const SIDEBAR_STEPS = [
  { label: 'Passport Type', icon: 'badge', steps: [0] },
  { label: 'Your Details', icon: 'person', steps: [1] },
  { label: 'Parental Info', icon: 'family_restroom', steps: [2, 3] },
  { label: 'Review & Print', icon: 'description', steps: [4] },
];

export default function Sidebar({
  currentStep,
  completedSteps,
  onStepClick,
  mobileOpen,
  onMobileClose,
  onBackToLanding,
}: SidebarProps) {
  const isActive = (steps: number[]) => steps.includes(currentStep);
  const isCompleted = (steps: number[]) => steps.every((s) => completedSteps.has(s));
  const isClickable = (steps: number[]) => {
    // Review & Print (step 4) requires all prior steps completed
    if (steps.includes(4)) {
      return [0, 1, 2, 3].every((s) => completedSteps.has(s));
    }
    // All other steps are always clickable
    return true;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="p-6 border-b border-ocean/8">
        <button
          type="button"
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
              onMobileClose();
            }
          }}
          className={`flex items-center gap-3 ${onBackToLanding ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/cofa-supports-logo.svg`}
            alt="COFA Support logo"
            width={40}
            height={40}
            className="flex-shrink-0"
          />
          <div className="text-left">
            <h1 className="text-lg font-bold text-ink leading-tight">COFA Support</h1>
            <p className="text-xs text-muted">FSM Passport Application · Form 500B</p>
          </div>
        </button>
        {onBackToLanding && (
          <button
            type="button"
            onClick={() => {
              onBackToLanding();
              onMobileClose();
            }}
            className="flex items-center gap-1 mt-3 px-3 py-2 text-sm font-semibold text-ocean bg-ocean/5 hover:bg-ocean/10 border border-ocean/15 rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            All forms
          </button>
        )}
      </div>

      {/* Step Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {SIDEBAR_STEPS.map((item) => {
            const active = isActive(item.steps);
            const completed = isCompleted(item.steps);
            const clickable = isClickable(item.steps);
            const targetStep = item.steps[0];

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => {
                    if (clickable) {
                      onStepClick(targetStep);
                      onMobileClose();
                    }
                  }}
                  disabled={!clickable}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    active
                      ? 'bg-ocean/8 text-ocean border-l-[3px] border-ocean'
                      : completed
                      ? 'text-ocean hover:bg-ocean/5 cursor-pointer'
                      : clickable
                      ? 'text-ink hover:bg-surface cursor-pointer'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {completed && !active ? 'check_circle' : item.icon}
                  </span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Download Blank Form */}
      <div className="px-3 pb-2">
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/AmendedPassportApplication0001.pdf`}
          download="FSM-Form-500B.pdf"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ocean hover:bg-ocean/5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[22px]">download</span>
          Download Blank Form
        </a>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-ocean/8">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="material-symbols-outlined text-[16px]">shield_lock</span>
          <span>All data stays in your browser</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-white/80 backdrop-blur-xl border-r border-ocean/8 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay — slides in from the right */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl h-full shadow-2xl rounded-l-2xl animate-slide-in-right">
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute top-4 right-4 z-10 p-1 text-muted hover:text-ink"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
