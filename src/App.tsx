import React, { useState, useEffect } from 'react';
import { defaultClinic, conditionsData } from './data/clinicData';
import { agencyDemoPresets } from './data/presets';
import { colorPalettes, ColorPaletteId, resolvePalette } from './data/colorPalettes';
import { ClinicInfo } from './types';
import { Navbar } from './components/Navbar';
import { StickyOfferBanner } from './components/StickyOfferBanner';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { TheProblem } from './components/TheProblem';
import { WhyUs } from './components/WhyUs';
import { TheProcess } from './components/TheProcess';
import { TheDoctor } from './components/TheDoctor';
import { PatientsSection } from './components/PatientsSection';
import { TheClinic } from './components/TheClinic';
import { FirstVisitSection } from './components/FirstVisitSection';
import { InsurancePayment } from './components/InsurancePayment';
import { LocationSection } from './components/LocationSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { BookingModal } from './components/BookingModal';
import { AgencyWorkspace } from './components/AgencyWorkspace';

const STORAGE_KEY = 'agency_clinic_config_v1';

export default function App() {
  const [clinic, setClinic] = useState<ClinicInfo>(() => {
    try {
      // 1. Check if URL contains a demo preset e.g. ?demo=austin or ?demo=denver
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const demoKey = urlParams.get('demo') || urlParams.get('preset') || urlParams.get('client');
        if (demoKey && agencyDemoPresets[demoKey.toLowerCase()]) {
          return { ...defaultClinic, ...agencyDemoPresets[demoKey.toLowerCase()] };
        }
      }

      // 2. Check localStorage saved changes
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultClinic, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return defaultClinic;
  });

  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);
  const [selectedConditionForBooking, setSelectedConditionForBooking] = useState<string>('Back pain');

  // Check URL query params on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam = urlParams.get('admin') === 'true' || urlParams.get('agency') === 'true' || urlParams.get('staff') === 'true' || urlParams.get('edit') === 'true';
      if (hasAdminParam) {
        setIsStaffMode(true);
        setIsManagerOpen(true);
      }
    } catch {
      // Ignore if iframe restricts search params
    }

    // Agency internal shortcut: Cmd/Ctrl + Shift + C
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

  // Update root CSS variables whenever clinic.colorPalette or custom color overrides change
  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });

      // Apply overrides if they exist
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

  // Dynamic Fonts Injection
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
      // default: classic-editorial
      url = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap';
      headingVal = "'Playfair Display', serif";
      bodyVal = "'Plus Jakarta Sans', sans-serif";
    }

    // Link loading
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;

    // Apply inline root styles
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

  // Dynamic SEO Title and Meta Update
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

  const handleUpdateClinic = (updated: ClinicInfo) => {
    setClinic(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetDefault = () => {
    setClinic(defaultClinic);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleOpenBooking = (conditionTitle?: string) => {
    if (clinic.bookingMode === 'external' && clinic.externalBookingUrl) {
      window.open(clinic.externalBookingUrl, '_blank');
      return;
    }
    if (conditionTitle) {
      // Map to standard form condition
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
      
      {/* 1. STICKY OFFER BANNER */}
      <StickyOfferBanner
        clinic={clinic}
        onClaim={() => handleOpenBooking('Back pain')}
      />

      {/* 2. NAV */}
      <Navbar
        clinic={clinic}
        onBookClick={() => handleOpenBooking()}
      />

      <main className="flex-1">
        {/* 3. HERO */}
        <Hero
          clinic={clinic}
          onBookClick={() => handleOpenBooking()}
        />

        {/* 4. TRUST BAR */}
        {(clinic.showTrustBar !== false) && <TrustBar clinic={clinic} />}

        {/* 5. THE PROBLEM */}
        {(clinic.showConditions !== false) && (
          <TheProblem
            conditions={clinic.customConditions || conditionsData}
            onSelectCondition={(cond) => handleOpenBooking(cond)}
          />
        )}

        {/* 6. WHY US */}
        {(clinic.showWhyUs !== false) && <WhyUs clinic={clinic} />}

        {/* 7. THE PROCESS */}
        {(clinic.showTheProcess !== false) && <TheProcess clinic={clinic} />}

        {/* 8. THE DOCTOR */}
        {(clinic.showTheDoctor !== false) && <TheDoctor clinic={clinic} />}

        {/* 9. PATIENTS */}
        {(clinic.showPatients !== false) && <PatientsSection clinic={clinic} />}

        {/* 10. THE CLINIC */}
        {(clinic.showTheClinic !== false) && <TheClinic clinic={clinic} />}

        {/* 11. YOUR FIRST VISIT */}
        <FirstVisitSection clinic={clinic} />

        {/* 12. INSURANCE & PAYMENT */}
        {(clinic.showInsurancePayment !== false) && <InsurancePayment clinic={clinic} />}

        {/* 13. LOCATION */}
        <LocationSection clinic={clinic} />

        {/* 14. FAQ */}
        {(clinic.showFAQ !== false) && <FAQSection clinic={clinic} />}

        {/* 15. FINAL CTA */}
        <FinalCTA
          clinic={clinic}
          onBookClick={() => handleOpenBooking()}
        />
      </main>

      {/* 16. FOOTER */}
      <Footer
        clinic={clinic}
        onOpenManager={() => {
          setIsStaffMode(true);
          setIsManagerOpen(true);
        }}
      />

      {/* 17. MOBILE STICKY BOTTOM BAR [CALL] [BOOK] */}
      <MobileStickyBar
        clinic={clinic}
        onBookClick={() => handleOpenBooking()}
      />

      {/* 18. BOOKING FLOW MODAL */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        clinic={clinic}
        initialCondition={selectedConditionForBooking}
      />

      {/* 19. AGENCY WORKSPACE COMMAND SUITE */}
      <AgencyWorkspace
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        clinic={clinic}
        onUpdateClinic={handleUpdateClinic}
        onResetDefault={handleResetDefault}
      />

    </div>
  );
}
