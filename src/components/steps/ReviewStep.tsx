'use client';

import { useState, useEffect, useRef } from 'react';
import { FormData, Address, PreviousPassportInfo } from '@/types/form';
import { fillPassportPdf, generateFilename, downloadPdf } from '@/lib/pdf-filler';

interface ReviewStepProps {
  data: FormData;
  onEdit: (step: number) => void;
  onBack: () => void;
}

function formatAddress(addr: Address): string {
  const street = [addr.street, addr.unit].map(s => s.trim()).filter(Boolean).join(', ');
  return [street, addr.city, addr.state, addr.zip, addr.country]
    .map(s => s.trim()).filter(Boolean).join(', ');
}

function formatPrevPassport(d: PreviousPassportInfo): string {
  return [d.country, d.date, d.passportNumber]
    .map(s => s.trim()).filter(Boolean).join(', ');
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="card-hard">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{title}</h3>
        <button type="button" onClick={onEdit} className="flex items-center gap-1 text-sm font-semibold text-ocean hover:text-ocean-light transition-colors">
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</dt>
      <dd className="text-lg text-ink font-medium mt-0.5">{value}</dd>
    </div>
  );
}

const PASSPORT_TYPE_LABELS: Record<string, string> = {
  ordinary: 'Ordinary',
  official: 'Official',
  diplomatic: 'Diplomatic',
};

const GENDER_LABELS: Record<string, string> = {
  miss: 'Miss',
  mrs: 'Mrs.',
  ms: 'Ms.',
  mr: 'Mr.',
};

const CITIZENSHIP_LABELS: Record<string, string> = {
  birth: 'Birth',
  naturalization: 'Naturalization',
  other: 'Other',
};

function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] });
  } catch {
    return false;
  }
}

export default function ReviewStep({ data, onEdit, onBack }: ReviewStepProps) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [shareSupported, setShareSupported] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const dataSnapshotRef = useRef<string | null>(null);

  // Check if form data changed since the last generation
  const currentDataJson = JSON.stringify(data);
  const dataChanged = dataSnapshotRef.current !== null && dataSnapshotRef.current !== currentDataJson;
  const hasCachedPdf = status === 'success' && pdfUrl !== null;

  useEffect(() => {
    setShareSupported(canShareFiles());
  }, []);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Scroll to top when PDF is ready
  useEffect(() => {
    if (status === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  const handleGenerate = async () => {
    setStatus('generating');
    setErrorMsg('');
    // Revoke old URL if regenerating
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    try {
      const bytes = await fillPassportPdf(data);
      setPdfBytes(bytes);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStatus('success');
      setShowPreview(true);
      // Snapshot the data used for this generation
      dataSnapshotRef.current = JSON.stringify(data);
    } catch (e) {
      console.error('PDF generation failed:', e);
      setErrorMsg(e instanceof Error ? e.message : 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (pdfBytes) {
      downloadPdf(pdfBytes, generateFilename(data));
    }
  };

  const handleShare = async () => {
    if (!pdfBytes) return;
    const filename = generateFilename(data);
    const file = new File([pdfBytes.buffer as ArrayBuffer], filename, { type: 'application/pdf' });
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      // User cancelled or share failed — ignore AbortError
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Share failed:', e);
      }
    }
  };

  const a = data.applicant;
  const f = data.father;
  const m = data.mother;

  const homeAddressStr = formatAddress(a.homeAddress);
  const shippingAddressStr = a.shippingAddressSameAsHome
    ? 'Same as home address'
    : formatAddress(a.shippingAddress);

  const prevPassportValue = a.previousPassport === 'yes'
    ? `Yes — ${formatPrevPassport(a.previousPassportDetails)}`
    : a.previousPassport === 'no' ? 'No' : '';

  if (showPreview && pdfUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-ink">Your form is <span className="font-serif italic text-ocean">ready to print</span></h2>
          <p className="text-lg text-muted mt-2">Review your filled PDF, then download, print, and sign it. Submit it yourself to the appropriate office.</p>
        </div>

        <iframe
          src={pdfUrl}
          className="w-full h-[80vh] min-h-[600px] rounded-2xl border border-ocean/15 shadow-card"
          title="PDF Preview"
        />

        {/* Sticky bottom bar */}
        <div className="sticky-nav-glass -mx-4 px-4 sm:-mx-8 sm:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={handleDownload} className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download PDF
              </span>
            </button>
            {shareSupported && (
              <button type="button" onClick={handleShare} className="btn-secondary flex-1">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  Share PDF
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="btn-secondary w-full"
          >
            Back to Edit Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-ink">Review Your <span className="font-serif italic text-ocean">Application</span></h2>
        <p className="text-lg text-muted mt-2">Please verify all information is correct before generating your PDF.</p>
      </div>

      <Section title="Passport Type" onEdit={() => onEdit(0)}>
        <Field label="Type" value={PASSPORT_TYPE_LABELS[data.passportType] || ''} />
      </Section>

      <Section title="Applicant" onEdit={() => onEdit(1)}>
        <Field label="Name" value={[a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ')} />
        {a.otherNames && <Field label="Other Names" value={a.otherNames} />}
        <Field label="Date of Birth" value={a.dateOfBirth} />
        <Field label="Title" value={GENDER_LABELS[a.gender] || ''} />
        <Field label="Height" value={a.heightFeet && a.heightInches ? `${a.heightFeet}'${a.heightInches}"` : ''} />
        <Field label="Hair Color" value={a.hairColor} />
        <Field label="Eye Color" value={a.eyeColor} />
        <Field label="Birth Place" value={a.birthPlace} />
        <Field label="Citizenship" value={CITIZENSHIP_LABELS[a.citizenshipMethod] || ''} />
      </Section>

      <Section title="Contact & Address" onEdit={() => onEdit(1)}>
        <Field label="Home Address" value={homeAddressStr} />
        <Field label="Shipping Address" value={shippingAddressStr} />
        <Field label="Email" value={a.email} />
        <Field label="Phone" value={a.phone} />
        <Field label="Previous Passport" value={prevPassportValue} />
        <Field label="Convicted" value={a.convicted === 'yes' ? `Yes — ${a.convictedExplanation}` : a.convicted === 'no' ? 'No' : ''} />
        <Field label="Name Changed" value={a.nameChanged === 'yes' ? `Yes — ${a.nameChangedExplanation}` : a.nameChanged === 'no' ? 'No' : ''} />
      </Section>

      <Section title="Father" onEdit={() => onEdit(2)}>
        <Field label="Name" value={[f.firstName, f.middleName, f.lastName].filter(Boolean).join(' ')} />
        <Field label="Date of Birth" value={f.birthDate} />
        <Field label="Birth Place" value={f.birthPlace} />
        <Field label="FSM Citizen" value={f.fsmCitizen === 'yes' ? 'Yes' : f.fsmCitizen === 'no' ? `No — ${f.nationality}` : ''} />
      </Section>

      <Section title="Mother" onEdit={() => onEdit(3)}>
        <Field label="Name" value={[m.firstName, m.middleName, m.lastName].filter(Boolean).join(' ')} />
        <Field label="Date of Birth" value={m.birthDate} />
        <Field label="Birth Place" value={m.birthPlace} />
        <Field label="FSM Citizen" value={m.fsmCitizen === 'yes' ? 'Yes' : m.fsmCitizen === 'no' ? `No — ${m.nationality}` : ''} />
      </Section>

      {status === 'error' && (
        <div className="bg-error/5 border border-error/30 rounded-2xl p-4 text-center">
          <p className="text-base text-error font-bold">PDF generation failed</p>
          <p className="text-sm text-error/80 mt-1">{errorMsg}</p>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="sticky-nav-glass -mx-4 px-4 sm:-mx-8 sm:px-8 space-y-3">
        {hasCachedPdf && !dataChanged ? (
          <button type="button" onClick={() => { setShowPreview(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-primary">
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              View Generated PDF
            </span>
          </button>
        ) : (status === 'idle' || status === 'error' || (hasCachedPdf && dataChanged)) && (
          <button type="button" onClick={handleGenerate} className="btn-primary">
            {hasCachedPdf && dataChanged
              ? 'Regenerate PDF (data changed)'
              : status === 'error' ? 'Try Again' : 'Generate PDF Application'}
          </button>
        )}

        {status === 'generating' && (
          <button type="button" disabled className="btn-primary flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating PDF...
          </button>
        )}

        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
      </div>
    </div>
  );
}
