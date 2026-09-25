import React, { useState } from 'react';
import {
  ShieldAlert,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Globe,
  Check,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import {
  MarketRegion,
  getMarketCompliance,
  generateMarketPrivacyPolicy,
  generateMarketTerms,
} from '../../data/marketCompliance';

interface LegalPolicyManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const defaultCancellationPolicyText = (clinicName: string, phone: string) => `
1. 24-Hour Notice Requirement
To ensure our doctors can accommodate patients experiencing acute spinal pain and urgent mobility restrictions, ${clinicName} requests at least 24 hours advance notice for appointment cancellations or rescheduling.

2. Late Arrivals
If you arrive more than 15 minutes past your scheduled appointment time, we will make every effort to accommodate you, but your treatment session may be shortened to maintain on-time service for subsequent patients.

3. How to Cancel or Reschedule
You can reschedule or modify your appointment by accessing our online Patient Self-Service Portal, calling our front desk directly at ${phone}, or replying to your automated appointment confirmation message.
`.trim();

export const LegalPolicyManager: React.FC<LegalPolicyManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cancellation'>('privacy');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const marketRegion: MarketRegion = clinic.marketRegion || 'UK';
  const compliance = getMarketCompliance(marketRegion);

  const clinicName = clinic.name || 'Vance Health Practice Architecture';
  const clinicPhone = clinic.phone || '+44 20 7946 0192';
  const clinicEmail = clinic.email || 'reception@vancehealth.co.uk';

  const currentPrivacy = clinic.privacyPolicyText || generateMarketPrivacyPolicy(clinicName, clinicPhone, clinicEmail, marketRegion);
  const currentTerms = clinic.termsOfServiceText || generateMarketTerms(clinicName, marketRegion);
  const currentCancellation = clinic.cancellationPolicyText || defaultCancellationPolicyText(clinicName, clinicPhone);

  const handleSwitchMarket = (newRegion: MarketRegion) => {
    const newCompliance = getMarketCompliance(newRegion);
    const newPrivacy = generateMarketPrivacyPolicy(clinicName, clinicPhone, clinicEmail, newRegion);
    const newTerms = generateMarketTerms(clinicName, newRegion);

    onUpdateClinic({
      ...clinic,
      marketRegion: newRegion,
      privacyPolicyText: newPrivacy,
      termsOfServiceText: newTerms,
      paymentPolicy: clinic.paymentPolicy
        ? {
            ...clinic.paymentPolicy,
            currencySymbol: newCompliance.currencySymbol,
          }
        : clinic.paymentPolicy,
    });

    setSavedNotification(`Switched market to ${newCompliance.regionLabel} (${newCompliance.privacyFramework})`);
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const handleReset = (type: 'privacy' | 'terms' | 'cancellation') => {
    if (confirm(`Reset this policy to standard ${compliance.regionLabel} clinical templates?`)) {
      if (type === 'privacy') {
        onUpdateClinic({
          ...clinic,
          privacyPolicyText: generateMarketPrivacyPolicy(clinicName, clinicPhone, clinicEmail, marketRegion),
        });
      } else if (type === 'terms') {
        onUpdateClinic({
          ...clinic,
          termsOfServiceText: generateMarketTerms(clinicName, marketRegion),
        });
      } else {
        onUpdateClinic({
          ...clinic,
          cancellationPolicyText: defaultCancellationPolicyText(clinicName, clinicPhone),
        });
      }
      setSavedNotification(`Reset policy to ${marketRegion} clinical template.`);
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
            Configure jurisdiction compliance (UK GDPR vs US HIPAA), terms of service, and cancellation notice rules.
          </p>
        </div>

        {savedNotification && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* 1. Market & Regulatory Jurisdiction Selector */}
      <div className="p-4 sm:p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Practice Market & Regulatory Jurisdiction</span>
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Instantly toggle statutory governance, privacy frameworks, and health authority citations.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-300 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-750 self-start sm:self-center">
            Active: {compliance.flag} {compliance.regionLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* UK Option */}
          <button
            type="button"
            onClick={() => handleSwitchMarket('UK')}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-3 ${
              marketRegion === 'UK'
                ? 'bg-emerald-950/40 border-emerald-600 text-white shadow-sm'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🇬🇧</span>
                <span className="font-bold text-xs text-stone-100">United Kingdom (UK)</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                <strong>Framework:</strong> UK GDPR, DPA 2018 & PECR
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Regulator: General Chiropractic Council (GCC) • NICE Guidelines • £ GBP
              </p>
            </div>
            {marketRegion === 'UK' && (
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
          </button>

          {/* US Option */}
          <button
            type="button"
            onClick={() => handleSwitchMarket('US')}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-3 ${
              marketRegion === 'US'
                ? 'bg-emerald-950/40 border-emerald-600 text-white shadow-sm'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🇺🇸</span>
                <span className="font-bold text-xs text-stone-100">United States (US)</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                <strong>Framework:</strong> HIPAA Privacy & Security Rules (HITECH)
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Regulator: State Chiropractic Board & ACA • NIH/PubMed Citations • $ USD
              </p>
            </div>
            {marketRegion === 'US' && (
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'privacy', label: `1. Privacy Policy (${marketRegion === 'US' ? 'HIPAA Notice' : 'UK GDPR Notice'})` },
          { id: 'terms', label: '2. Terms of Care & Disclaimers' },
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
                <Lock className="w-3.5 h-3.5" /> {compliance.flag} {compliance.privacyFramework}
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Renders on the <code>/privacy</code> page, booking consent modals, and footer legal links.
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
            rows={14}
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
                Included in appointment confirmation emails, patient portal itinerary, and booking modals.
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
