import React from 'react';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { StickyOfferBanner } from '../components/StickyOfferBanner';
import { MobileStickyBar } from '../components/MobileStickyBar';
import { LocationSection } from '../components/LocationSection';
import { FAQSection } from '../components/FAQSection';
import {
  PracticeHero,
  PracticeCareIndex,
  PracticeApproach,
  PracticeJourney,
  PracticePeople,
  PracticeSpace,
  PracticeFees,
  PracticeFinal,
} from '../components/PublicSiteV2';

/**
 * The homepage is a patient guide, not a marketing-component showcase.
 * Every chapter remains controlled by the existing Practice OS section switches.
 * Booking remains delegated to the shared clinic context.
 */
export default function Home() {
  const { clinicData: clinic, openBookingModal, isBookingModalOpen } = useClinic();
  usePageMeta('Home', clinic.seoDescription || clinic.tagline);
  const openBooking = () => openBookingModal();

  return (
    <div className="pv2-home">
      {clinic.showStickyBanner !== false && clinic.offerHeadline && (
        <StickyOfferBanner clinic={clinic} onClaim={() => openBookingModal('Back pain')} />
      )}
      {clinic.showSectionHero !== false && <PracticeHero clinic={clinic} onBookClick={openBooking} />}
      {clinic.showConditions !== false && <PracticeCareIndex clinic={clinic} onBookClick={openBooking} />}
      {clinic.showWhyUs !== false && <PracticeApproach clinic={clinic} />}
      {clinic.showTheProcess !== false && <PracticeJourney clinic={clinic} />}
      {clinic.showTheDoctor !== false && <PracticePeople clinic={clinic} />}
      {clinic.showTheClinic !== false && <PracticeSpace clinic={clinic} />}
      {clinic.showInsurancePayment !== false && <PracticeFees clinic={clinic} />}
      {clinic.showSectionLocation !== false && <div className="pv2-legacy-location"><LocationSection clinic={clinic} /></div>}
      {clinic.showFAQ !== false && <div className="pv2-legacy-faq"><FAQSection clinic={clinic} /></div>}
      {clinic.showSectionFinalCta !== false && <PracticeFinal clinic={clinic} onBookClick={openBooking} />}
      {clinic.showMobileStickyBar !== false && !isBookingModalOpen && (
        <MobileStickyBar clinic={clinic} onBookClick={openBooking} />
      )}
    </div>
  );
}
