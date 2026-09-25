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
import { usePageMeta } from '../data/usePageMeta';

export default function Home() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  usePageMeta('Home', clinic.seoDescription || clinic.tagline);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans relative pb-16 md:pb-0 overflow-x-hidden">
      {clinic.showStickyBanner !== false && (
        <StickyOfferBanner
          clinic={clinic}
          onClaim={() => openBookingModal('Back pain')}
        />
      )}

      <main className="flex-1">
        {clinic.showSectionHero !== false && (
          <Hero
            clinic={clinic}
            onBookClick={() => openBookingModal()}
          />
        )}

        {clinic.showTrustBar !== false && <TrustBar clinic={clinic} />}

        {clinic.showConditions !== false && (
          <TheProblem
            conditions={clinic.customConditions || conditionsData}
            onSelectCondition={(cond) => openBookingModal(cond)}
          />
        )}

        {clinic.showWhyUs !== false && <WhyUs clinic={clinic} />}

        {clinic.showTheProcess !== false && <TheProcess clinic={clinic} />}

        {clinic.showTheDoctor !== false && <TheDoctor clinic={clinic} />}

        {clinic.showPatients !== false && <PatientsSection clinic={clinic} />}

        {clinic.showTheClinic !== false && <TheClinic clinic={clinic} />}

        {clinic.showSectionFirstVisit !== false && <FirstVisitSection clinic={clinic} />}

        {clinic.showInsurancePayment !== false && <InsurancePayment clinic={clinic} />}

        {clinic.showSectionLocation !== false && <LocationSection clinic={clinic} />}

        {clinic.showFAQ !== false && <FAQSection clinic={clinic} />}

        {clinic.showSectionFinalCta !== false && (
          <FinalCTA
            clinic={clinic}
            onBookClick={() => openBookingModal()}
          />
        )}
      </main>

      {clinic.showMobileStickyBar !== false && (
        <MobileStickyBar
          clinic={clinic}
          onBookClick={() => openBookingModal()}
        />
      )}
    </div>
  );
}
