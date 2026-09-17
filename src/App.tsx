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
import { ClientManagerDrawer } from './components/ClientManagerDrawer';

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

  // Update root CSS variables whenever clinic.colorPalette changes
  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });
    }
  }, [clinic.colorPalette]);

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
        <TrustBar clinic={clinic} />

        {/* 5. THE PROBLEM */}
        <TheProblem
          conditions={conditionsData}
          onSelectCondition={(cond) => handleOpenBooking(cond)}
        />

        {/* 6. WHY US */}
        <WhyUs />

        {/* 7. THE PROCESS */}
        <TheProcess />

        {/* 8. THE DOCTOR */}
        <TheDoctor clinic={clinic} />

        {/* 9. PATIENTS */}
        <PatientsSection />

        {/* 10. THE CLINIC */}
        <TheClinic clinic={clinic} />

        {/* 11. YOUR FIRST VISIT */}
        <FirstVisitSection />

        {/* 12. INSURANCE & PAYMENT */}
        <InsurancePayment clinic={clinic} />

        {/* 13. LOCATION */}
        <LocationSection clinic={clinic} />

        {/* 14. FAQ */}
        <FAQSection />

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

      {/* 19. AGENCY CLIENT MANAGER DRAWER */}
      <ClientManagerDrawer
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        clinic={clinic}
        onUpdateClinic={handleUpdateClinic}
        onResetDefault={handleResetDefault}
      />

    </div>
  );
}
