import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import {
  firstVisitSteps,
  clinicRoomImg,
  doctorImg,
  heroImg,
} from '../data/clinicData';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Car,
  MessageSquare,
  Search,
  ClipboardCheck,
  Activity,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  FolderCheck,
  Shirt,
  FileText,
  ArrowRight,
  ExternalLink,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { usePageMeta } from '../data/usePageMeta';
import { ProcessStep } from '../types';

const DEFAULT_BRING_ITEMS = [
  'Photo ID or Government Identification (Driver’s License, Passport)',
  'Private Health Insurance card or policy details (if claiming cover)',
  'List of current medications, supplements, and previous surgeries',
  'Previous spinal X-ray, MRI, or CT scan imaging reports (if available)',
];

export default function FirstVisit() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  usePageMeta(
    clinic.firstVisitTitle || 'Your First Visit Guide',
    clinic.firstVisitSubtitle || 'Step-by-step walkthrough of what to expect during your initial consultation.'
  );

  const extra = clinic as typeof clinic & {
    firstVisitDuration?: string;
    firstVisitBring?: string;
    firstVisitWear?: string;
    firstVisitAfter?: string;
    firstVisitForms?: string;
  };

  const steps: ProcessStep[] =
    clinic.customFirstVisitSteps && clinic.customFirstVisitSteps.length > 0
      ? clinic.customFirstVisitSteps
      : firstVisitSteps;

  const bringList: string[] =
    clinic.firstVisitBringList && clinic.firstVisitBringList.length > 0
      ? clinic.firstVisitBringList
      : clinic.firstVisitBring
        ? clinic.firstVisitBring.split('\n').filter(Boolean)
        : DEFAULT_BRING_ITEMS;

  // Google Maps Embed Query
  const mapQuery = encodeURIComponent(
    `${clinic.address || ''}, ${clinic.cityState || clinic.city || ''} ${clinic.zip || ''}`
  );
  const mapSrc =
    clinic.firstVisitMapUrl ||
    clinic.googleMapsEmbedUrl ||
    `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const renderStepIcon = (iconName?: string) => {
    switch (iconName) {
      case 'search':
        return <Search className="w-4 h-4 text-emerald-700" />;
      case 'clipboard':
        return <ClipboardCheck className="w-4 h-4 text-emerald-700" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-emerald-700" />;
      case 'stethoscope':
        return <Stethoscope className="w-4 h-4 text-emerald-700" />;
      case 'shield':
        return <ShieldCheck className="w-4 h-4 text-emerald-700" />;
      case 'chat':
      default:
        return <MessageSquare className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        
        {/* 1. HERO SECTION: 2-COLUMN SPLIT LAYOUT ON DESKTOP */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Reassurance Microcopy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{clinic.firstVisitSubtitle || 'What to Expect'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {clinic.firstVisitTitle || 'Your first visit'}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-xl">
              {extra.firstVisitDuration ||
                `Plan about 45–60 minutes at ${clinic.name}. You’ll leave with a clear plan, not a sales pitch.`}
            </p>

            {/* Reassurance Micro-Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>45–60 Min Unhurried Time</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero High-Pressure Sales</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Co-Created Care Roadmap</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => openBookingModal('First Visit Consultation')}
                className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer text-center"
              >
                Schedule First Visit
              </button>
              <a
                href="#before-you-arrive"
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-sm transition text-center"
              >
                What to Bring Checklist ↓
              </a>
            </div>
          </div>

          {/* Right Column: Warm, Welcoming Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl bg-stone-100 aspect-4/3 sm:aspect-5/4">
              <img
                src={clinic.firstVisitHeroImage || clinicRoomImg || heroImg}
                alt="Clinic reception and examination suite"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent pointer-events-none" />

              {/* Floating Reassurance Pill Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-md text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated 1-on-1 Doctor Time</span>
                </div>
                <p className="text-stone-500 text-[11px] pl-5.5">
                  Calm, unhurried consultations without waiting room delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THE STEPS: VERTICAL TIMELINE (REPLACING HUGE EMPTY CARDS) */}
        <section className="space-y-6">
          <div className="text-center sm:text-left space-y-1 border-b border-stone-200 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Step-by-Step: What Actually Happens
            </h2>
            <p className="text-sm text-stone-600">
              No guesswork or ambiguous procedures. Here is the exact clinical sequence for your 45-minute visit.
            </p>
          </div>

          {/* Vertical Timeline Container */}
          <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3.5 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-600 before:via-emerald-400 before:to-stone-300">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {/* Timeline Node Indicator Circle */}
                <div className="absolute -left-6 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-emerald-600 shadow-sm flex items-center justify-center -translate-x-1/2 group-hover:scale-110 group-hover:border-emerald-700 transition-all">
                  <span className="text-[11px] font-bold text-emerald-800 font-mono">
                    {step.number || `0${i + 1}`}
                  </span>
                </div>

                {/* Step Card with Tightened Padding & Rich Details */}
                <div className="p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:border-emerald-500/70 transition-all space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
                        {renderStepIcon(step.icon)}
                      </div>
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                        {step.title}
                      </h3>
                    </div>

                    {step.duration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-medium border border-emerald-200/70">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{step.duration}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bullet Highlights */}
                  {step.details && step.details.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      {step.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-stone-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. "BEFORE YOU ARRIVE" & "GETTING HERE" (2-COLUMN GRID ON DESKTOP) */}
        <section id="before-you-arrive" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Before You Arrive (Icon-Driven Checklist) */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-5">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Preparation Guide
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Before you arrive
              </h2>
            </div>

            {/* What to Bring Checklist */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block flex items-center gap-1.5">
                <FolderCheck className="w-4 h-4 text-emerald-600" />
                <span>What to Bring:</span>
              </span>

              <div className="space-y-2">
                {bringList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs sm:text-sm text-stone-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Wear Guidance */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <Shirt className="w-4 h-4 text-emerald-700" />
                <span>What to Wear:</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                {extra.firstVisitWear ||
                  'Comfortable clothes you can move in (e.g. gym shorts, sweatpants, or flexible t-shirt). Avoid restrictive jeans, dresses, or stiff formal suits so we can assess spinal movement freely.'}
              </p>
            </div>

            {/* Digital Forms Guidance */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Intake Paperwork:</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {extra.firstVisitForms ||
                  'If we sent digital intake forms via SMS or email, please complete them online prior to arrival so your visit begins without paperwork delays.'}
              </p>
            </div>
          </div>

          {/* Right Column: Getting Here & Embedded Google Map */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-5">
            <div className="space-y-1 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Directions & Parking
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Getting here
              </h2>
            </div>

            {/* Address & Logistics Details */}
            <div className="space-y-3 text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-stone-900">Clinic Address</div>
                  <p className="text-stone-600 text-xs sm:text-sm">
                    {clinic.address}
                    {clinic.cityState ? `, ${clinic.cityState}` : ''}
                    {clinic.zip ? ` ${clinic.zip}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-stone-900">Practice Hours</div>
                  <p className="text-stone-600 text-xs">Mon–Fri: {clinic.hoursWeekday || '8:30am – 6:30pm'}</p>
                  <p className="text-stone-600 text-xs">Sat: {clinic.hoursSaturday || '9:00am – 2:00pm'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Car className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-stone-900">Parking & Accessibility</div>
                  <p className="text-stone-600 text-xs">
                    {clinic.parkingNote || 'Dedicated client parking behind the facility with ground-floor step-free access.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map (Massive UX Win!) */}
            {clinic.showFirstVisitMap !== false && (
              <div className="space-y-2 pt-2">
                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 h-52 sm:h-56 relative shadow-inner">
                  <iframe
                    title="Clinic Location Map"
                    src={mapSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-mono text-[11px]">
                    Step-free ground access
                  </span>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. "HUMAN" ELEMENT: MEET YOUR DOCTOR (REDUCING PATIENT ANXIETY) */}
        <section className="p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Doctor Headshot Portrait */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-600/30 shadow-md shrink-0 bg-stone-100">
              <img
                src={clinic.doctorImage || doctorImg}
                alt={clinic.doctorName || 'Lead Clinician'}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Doctor Introduction & Direct Reassurance */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Meet Your Doctor</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                You'll be seen directly by {clinic.doctorName || 'Dr. Alistair Vance'}
              </h3>

              <div className="text-xs font-semibold text-emerald-700">
                {clinic.doctorCredentials || 'D.C., DACBSP'} • {clinic.doctorTitle || 'Lead Chiropractic Biomechanist'}
              </div>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed pt-1">
                {clinic.firstVisitDoctorNote ||
                  `You'll be seen directly by ${clinic.doctorName || 'Dr. Vance'}, who brings over 12 years of clinical experience in advanced spinal mechanics and disc decompression. We never pass you off to junior assistants or rush your appointment.`}
              </p>

              {clinic.doctorQuote && (
                <blockquote className="text-xs sm:text-sm italic text-stone-500 font-serif border-l-2 border-emerald-600 pl-3 pt-1">
                  "{clinic.doctorQuote}"
                </blockquote>
              )}
            </div>
          </div>
        </section>

        {/* 5. AFTER THE VISIT TRANSPARENT PROMISE */}
        <section className="p-6 sm:p-7 bg-emerald-950 text-white rounded-3xl shadow-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>After the visit guarantee</span>
          </div>
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans">
            {extra.firstVisitAfter ||
              'You’ll know what we found, what we recommend, how long it usually takes, and what it costs before you commit to a care plan. Zero long-term lock-in contracts.'}
          </p>
        </section>

        {/* 6. FINAL CTA: HIGH-CONVERTING APPOINTMENT CARD */}
        <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-4 shadow-xl border border-stone-800">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Limited Weekly Consultations
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {clinic.offerHeadline || 'Book your first visit'}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {clinic.offerSubtext ||
              `Initial 45-minute comprehensive spinal examination and report of findings. Call ${clinic.phone || '(614) 555-0192'}`}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openBookingModal('First Visit Consultation')}
              className="w-full sm:w-auto inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-sm"
            >
              {clinic.offerCtaText || 'Claim Initial Consultation →'}
            </button>
            <a
              href={`tel:${clinic.phoneRaw || clinic.phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-sm transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {clinic.phone}</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
