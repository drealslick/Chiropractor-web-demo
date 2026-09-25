import React, { useState } from 'react';
import { Eye, EyeOff, Layout, Globe, Sliders, CheckCircle2 } from 'lucide-react';
import { ClinicInfo } from '../../types';

interface SectionVisibilityManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const SectionVisibilityManager: React.FC<SectionVisibilityManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const toggleFlag = (key: string, currentVal: boolean) => {
    const next = { ...clinic, [key]: !currentVal };
    onUpdateClinic(next);
    showNotice('Visibility setting updated!');
  };

  const homepageToggles = [
    { key: 'showSectionHero', label: 'Hero Section (Main Banner)', defaultVal: true },
    { key: 'showTrustBar', label: 'Trust Bar (Google Rating & Certs)', defaultVal: true },
    { key: 'showConditions', label: 'Conditions / Problem Section', defaultVal: true },
    { key: 'showWhyUs', label: 'Why Choose Us Section', defaultVal: true },
    { key: 'showTheProcess', label: 'Treatment Process Steps', defaultVal: true },
    { key: 'showTheDoctor', label: 'Lead Doctor Profile', defaultVal: true },
    { key: 'showPatients', label: 'Patient Testimonials & Reviews', defaultVal: true },
    { key: 'showTheClinic', label: 'Clinic Interior & Facilities', defaultVal: true },
    { key: 'showSectionFirstVisit', label: 'First Visit Overview Section', defaultVal: true },
    { key: 'showInsurancePayment', label: 'Insurance & Payment Options', defaultVal: true },
    { key: 'showSectionLocation', label: 'Location & Map Section', defaultVal: true },
    { key: 'showFAQ', label: 'Frequently Asked Questions (FAQ)', defaultVal: true },
    { key: 'showSectionFinalCta', label: 'Final Call-to-Action Banner', defaultVal: true },
    { key: 'showStickyBanner', label: 'Sticky Top Offer Banner', defaultVal: true },
    { key: 'showMobileStickyBar', label: 'Mobile Sticky Bottom Bar', defaultVal: true },
  ];

  const pageToggles = [
    { key: 'showPageConditions', label: 'Conditions Page (/conditions)', defaultVal: true },
    { key: 'showPageFirstVisit', label: 'First Visit Page (/first-visit)', defaultVal: true },
    { key: 'showPageAbout', label: 'About Page (/about)', defaultVal: true },
    { key: 'showPageTeam', label: 'Team Page (/team)', defaultVal: true },
    { key: 'showPagePricing', label: 'Pricing Page (/pricing)', defaultVal: true },
    { key: 'showPageBlog', label: 'Blog Page (/blog)', defaultVal: true },
    { key: 'showPagePortal', label: 'Patient Portal Page (/portal)', defaultVal: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <span>Homepage Elements & Page Visibility</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Instantly turn ON or OFF any section on the homepage and toggle individual pages across the website (Contact remains active).
          </p>
        </div>

        {notice && (
          <span className="text-xs px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{notice}</span>
          </span>
        )}
      </div>

      {/* HOMEPAGE SECTION TOGGLES */}
      <div className="space-y-4">
        <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Homepage Elements Toggle (On / Off)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {homepageToggles.map((item) => {
            const isEnabled = clinic[item.key] !== false;
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isEnabled ? 'bg-stone-900 border-stone-800' : 'bg-stone-950 border-stone-900 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-500'}`}>
                    {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-stone-100">{item.label}</p>
                    <p className="text-[10px] text-stone-400">{isEnabled ? 'Visible on homepage' : 'Hidden from homepage'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(item.key, isEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                    isEnabled ? 'bg-emerald-600' : 'bg-stone-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGE TOGGLES (EXCEPT CONTACT) */}
      <div className="space-y-4 pt-4 border-t border-stone-800">
        <div>
          <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Website Pages Toggle (Except Contact)</span>
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Disabling a page removes it from the navigation menu and returns 404 if accessed directly. Contact is permanently active.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pageToggles.map((item) => {
            const isEnabled = clinic[item.key] !== false;
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isEnabled ? 'bg-stone-900 border-stone-800' : 'bg-stone-950 border-stone-900 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-500'}`}>
                    {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-stone-100">{item.label}</p>
                    <p className="text-[10px] text-stone-400">{isEnabled ? 'Page Active' : 'Page Disabled'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(item.key, isEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                    isEnabled ? 'bg-emerald-600' : 'bg-stone-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}

          {/* Contact Page (Always Active) */}
          <div className="p-3.5 rounded-xl border bg-stone-900 border-stone-800 opacity-90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-xs text-stone-100">Contact Page (/contact) [Required]</p>
                <p className="text-[10px] text-emerald-400">Permanently active per requirements</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-stone-800 text-stone-400">Locked ON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
