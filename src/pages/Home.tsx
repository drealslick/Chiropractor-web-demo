import React, { useState, useEffect } from 'react';
import { conditionsData } from '../data/clinicData';
import { resolvePalette } from '../data/colorPalettes';
import { useClinic } from '../data/ClinicContext';
import { StickyOfferBanner } from '../components/StickyOfferBanner';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { TheProblem } from '../components/TheProblem';
import { WhyUs } from '../components/WhyUs';
import { TheProcess } from '../components/TheProcess';
import { TheDoctor } from '../components/TheDoctor';
import { PatientsSection } from '../components/PatientsSection';
import { TheClinic } from '../components/TheClinic';
import { FirstVisitSection } from '../components/FirstVisitSection';
import { InsurancePayment } from '../components/InsurancePayment';
import { LocationSection } from '../components/LocationSection';
import { FAQSection } from '../components/FAQSection';
import { FinalCTA } from '../components/FinalCTA';
import { MobileStickyBar } from '../components/MobileStickyBar';
import { BookingModal } from '../components/BookingModal';
import { usePageMeta } from '../data/usePageMeta';
import { AgencyWorkspace } from '../components/AgencyWorkspace';

export default function Home() {
  const { clinicData: clinic, updateClinic, resetClinic } = useClinic();
  usePageMeta('Home', clinic.seoDescription || clinic.tagline);

  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);
  const [selectedConditionForBooking, setSelectedConditionForBooking] = useState<string>('Back pain');

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam = urlParams.get('admin') === 'true' || urlParams.get('agency') === 'true' || urlParams.get('staff') === 'true' || urlParams.get('edit') === 'true';
      if (hasAdminParam) {
        setIsStaffMode(true);
        setIsManagerOpen(true);
      }
    } catch {
      // Ignore search param errors
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsStaffMode(true);
        setIsManagerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });

      if (clinic.customPrimaryColor) {
        root.style.setProperty('--theme-primary-500', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-600', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-700', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-800', clinic.customPrimaryColor);
      }
      if (clinic.customAccentColor) {
        root.style.setProperty('--theme-accent', clinic.customAccentColor);
      }
      if (clinic.customBgColor) {
        root.style.setProperty('--theme-bg-page', clinic.customBgColor);
      }
      if (clinic.customTextColor) {
        root.style.setProperty('--theme-primary-950', clinic.customTextColor);
      }
    }
  }, [clinic.colorPalette, clinic.customPrimaryColor, clinic.customAccentColor, clinic.customBgColor, clinic.customTextColor]);

  useEffect(() => {
    const fontPair = clinic.fontPairing || 'classic-editorial';
    let url = '';
    let headingVal = "'Playfair Display', serif";
    let bodyVal = "'Plus Jakarta Sans', sans-serif";

    if (fontPair === 'modern-avant-garde') {
      url = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap';
      headingVal = "'Syne', sans-serif";
      bodyVal = "'Space Grotesk', sans-serif";
    } else if (fontPair === 'serene-academic') {
      url = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap';
      headingVal = "'Lora', serif";
      bodyVal = "'Inter', sans-serif";
    } else if (fontPair === 'timeless-luxury') {
      url = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Montserrat:wght@100..900&display=swap';
      headingVal = "'Cinzel', serif";
      bodyVal = "'Montserrat', sans-serif";
    } else {
      url = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap';
      headingVal = "'Playfair Display', serif";
      bodyVal = "'Plus Jakarta Sans', sans-serif";
    }

    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;

    const styleId = 'dynamic-font-styles';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      :root {
        --font-heading: ${headingVal};
        --font-body: ${bodyVal};
      }
      h1, h2, h3, h4, .font-serif {
        font-family: var(--font-heading), Georgia, Cambria, "Times New Roman", Times, serif !important;
      }
      body, p, span, div, button, input, textarea, select, .font-sans {
        font-family: var(--font-body), system-ui, -apple-system, sans-serif !important;
      }
    `;
  }, [clinic.fontPairing]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = clinic.seoTitle || `${clinic.name} | Professional Chiropractic Care`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', clinic.seoDescription || clinic.tagline || 'Chiropractic Care Specialist');
    }
  }, [clinic.seoTitle, clinic.seoDescription, clinic.name, clinic.tagline]);

  const handleUpdateClinic = updateClinic;
  const handleResetDefault = resetClinic;

  const handleOpenBooking = (conditionTitle?: string) => {
    if (clinic.bookingMode === 'external' && clinic.externalBookingUrl) {
      window.open(clinic.externalBookingUrl, '_blank');
      return;
    }
    if (conditionTitle) {
      if (conditionTitle.includes('Back')) {
        setSelectedConditionForBooking('Back pain');
      } else if (conditionTitle.includes('Neck') || conditionTitle.includes('Shoulder')) {
        setSelectedConditionForBooking('Neck pain');
      } else if (conditionTitle.includes('Sports')) {
        setSelectedConditionForBooking('Sports injury');
      } else if (conditionTitle.includes('Headache')) {
        setSelectedConditionForBooking('Headaches');
      } else {
        setSelectedConditionForBooking(conditionTitle);
      }
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans relative pb-16 md:pb-0 overflow-x-hidden">
      <StickyOfferBanner
        clinic={clinic}
        onClaim={() => handleOpenBooking('Back pain')}
      />

      <main className="flex-1">
        <Hero
          clinic={clinic}
          onBookClick={() => handleOpenBooking()}
        />

        {(clinic.showTrustBar !== false) && <TrustBar clinic={clinic} />}

        {(clinic.showConditions !== false) && (
          <TheProblem
            conditions={clinic.customConditions || conditionsData}
            onSelectCondition={(cond) => handleOpenBooking(cond)}
          />
        )}

        {(clinic.showWhyUs !== false) && <WhyUs clinic={clinic} />}

        {(clinic.showTheProcess !== false) && <TheProcess clinic={clinic} />}

        {(clinic.showTheDoctor !== false) && <TheDoctor clinic={clinic} />}

        {(clinic.showPatients !== false) && <PatientsSection clinic={clinic} />}

        {(clinic.showTheClinic !== false) && <TheClinic clinic={clinic} />}

        <FirstVisitSection clinic={clinic} />

        {(clinic.showInsurancePayment !== false) && <InsurancePayment clinic={clinic} />}

        <LocationSection clinic={clinic} />

        {(clinic.showFAQ !== false) && <FAQSection clinic={clinic} />}

        <FinalCTA
          clinic={clinic}
          onBookClick={() => handleOpenBooking()}
        />
      </main>

      <MobileStickyBar
        clinic={clinic}
        onBookClick={() => handleOpenBooking()}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        clinic={clinic}
        initialCondition={selectedConditionForBooking}
      />

      {isManagerOpen && (
        !isUnlocked ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-xs rounded-xl border border-stone-800 bg-stone-900 p-6 text-white shadow-2xl">
              <h3 className="mb-1 text-base font-semibold">Admin Verification</h3>
              <p className="mb-4 text-xs text-stone-400">Enter passcode to open Agency Manager.</p>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (passcode === 'Slick2026!') {
                  setIsUnlocked(true);
                  setError('');
                } else {
                  setError('Incorrect passcode');
                }
              }}>
                <input
                  type="password"
                  placeholder="Enter secret passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-stone-700 bg-stone-800 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsManagerOpen(false)}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <AgencyWorkspace
            isOpen={isManagerOpen}
            onClose={() => setIsManagerOpen(false)}
            clinic={clinic}
            onUpdateClinic={handleUpdateClinic}
            onResetDefault={handleResetDefault}
          />
        )
      )}
    </div>
  );
}