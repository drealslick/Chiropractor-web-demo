import React, { useState } from 'react';
import {
  ShieldAlert,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { ClinicInfo } from '../../types';

interface LegalPolicyManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const defaultPrivacyPolicyText = (clinicName: string, phone: string, email: string) => `
1. Information We Collect
${clinicName} is committed to protecting patient confidentiality and data privacy in full compliance with HIPAA regulations and GDPR data security standards. When you request an appointment or submit a contact inquiry on this website, we collect your name, email address, telephone number, and primary area of clinical concern.

2. Use of Information
Your contact details are strictly utilized to coordinate appointment scheduling, confirm diagnostic review consultations, and deliver clinical care updates. We never sell, rent, or trade patient contact information to third-party advertisers or data brokers.

3. Protected Health Information (PHI)
Any clinical intake forms or medical disclosures submitted electronically are transmitted via encrypted, HIPAA-compliant communication channels and stored within our certified Electronic Health Records (EHR) database.

4. Data Retention and Deletion Rights
Under applicable privacy statutes, you have the right to request access to your stored records, request corrections, or ask for the deletion of marketing communication logs at any time.

5. Contact Our Privacy Officer
For questions regarding our privacy protocol, please reach out via phone at ${phone}${email ? ` or email at ${email}` : ''}.
`.trim();

export const defaultTermsText = (clinicName: string) => `
1. Scope of Website Information
All educational materials, articles, triage self-assessments, and anatomical graphics published on the ${clinicName} website are provided for general informational purposes only. Content on this site does not constitute formal medical diagnosis or establish an official doctor-patient relationship.

2. In-Person Clinical Assessment Required
Definitive chiropractic care, spinal adjustments, and personalized therapeutic rehabilitation regimens begin exclusively following an in-person clinical history, orthopedic examination, and doctor evaluation at our facility.

3. Appointment Booking and Financial Terms
Published initial exam fees and follow-up treatment rates represent standard pricing and introductory promotional packages. Health insurance coverage, copayments, and HSA/FSA eligibility are verified upon arrival prior to treatment.

4. Intellectual Property
All website copy, clinical imagery, and branding assets are the exclusive intellectual property of ${clinicName}.
`.trim();

export const defaultCancellationPolicyText = (clinicName: string, phone: string) => `
1. 24-Hour Notice Requirement
To ensure our doctors can accommodate patients experiencing acute spinal pain and urgent mobility restrictions, ${clinicName} requests at least 24 hours advance notice for appointment cancellations or rescheduling.

2. Late Arrivals
If you arrive more than 15 minutes past your scheduled appointment time, we will make every effort to accommodate you, but your treatment session may be shortened to maintain on-time service for subsequent patients.

3. How to Cancel or Reschedule
You can reschedule or modify your appointment by calling our front desk directly at ${phone} or replying to your automated appointment confirmation message.
`.trim();

export const LegalPolicyManager: React.FC<LegalPolicyManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cancellation'>('privacy');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const clinicName = clinic.name || 'Columbus Chiropractic Care';
  const clinicPhone = clinic.phone || '(614) 555-0192';
  const clinicEmail = clinic.email || 'care@columbuschiropractic.com';

  const currentPrivacy = clinic.privacyPolicyText || defaultPrivacyPolicyText(clinicName, clinicPhone, clinicEmail);
  const currentTerms = clinic.termsOfServiceText || defaultTermsText(clinicName);
  const currentCancellation = clinic.cancellationPolicyText || defaultCancellationPolicyText(clinicName, clinicPhone);

  const handleReset = (type: 'privacy' | 'terms' | 'cancellation') => {
    if (confirm('Reset this legal policy to standard HIPAA/GDPR clinical defaults?')) {
      if (type === 'privacy') {
        onUpdateClinic({ ...clinic, privacyPolicyText: defaultPrivacyPolicyText(clinicName, clinicPhone, clinicEmail) });
      } else if (type === 'terms') {
        onUpdateClinic({ ...clinic, termsOfServiceText: defaultTermsText(clinicName) });
      } else {
        onUpdateClinic({ ...clinic, cancellationPolicyText: defaultCancellationPolicyText(clinicName, clinicPhone) });
      }
      setSavedNotification('Reset policy to standard clinical template.');
      setTimeout(() => setSavedNotification(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Legal Pages & Clinical Policies</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            HIPAA-ready Privacy Policy, Terms of Service, and Clinic Cancellation standards for footer links and booking compliance.
          </p>
        </div>

        {savedNotification && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'privacy', label: '1. Privacy Policy (HIPAA / GDPR)' },
          { id: 'terms', label: '2. Terms of Service' },
          { id: 'cancellation', label: '3. Cancellation & Consent' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === t.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-850 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Editor */}
      {activeTab === 'privacy' && (
        <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> HIPAA & GDPR Privacy Policy
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Renders on the <code>/privacy</code> page and footer legal links.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleReset('privacy')}
              className="text-[11px] text-stone-400 hover:text-amber-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={currentPrivacy}
            onChange={(e) => onUpdateClinic({ ...clinic, privacyPolicyText: e.target.value })}
            className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 text-xs text-stone-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
          />

          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Changes save in real-time and update your live privacy page instantly.</span>
          </p>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" /> Terms of Service & Clinical Disclaimer
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Renders on the <code>/terms</code> page and patient booking intake.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleReset('terms')}
              className="text-[11px] text-stone-400 hover:text-amber-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={currentTerms}
            onChange={(e) => onUpdateClinic({ ...clinic, termsOfServiceText: e.target.value })}
            className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 text-xs text-stone-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {activeTab === 'cancellation' && (
        <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Cancellation & Rescheduling Policy
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Included in appointment confirmation emails and booking modals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleReset('cancellation')}
              className="text-[11px] text-stone-400 hover:text-amber-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={currentCancellation}
            onChange={(e) => onUpdateClinic({ ...clinic, cancellationPolicyText: e.target.value })}
            className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 text-xs text-stone-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}
    </div>
  );
};
