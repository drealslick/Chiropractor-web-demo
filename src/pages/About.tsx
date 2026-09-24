import React from 'react';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { doctorImg, clinicRoomImg, heroImg, michaelImg } from '../data/clinicData';
import {
  defaultPhilosophyPillars,
  defaultAboutGallery,
  defaultAboutAssociations,
  defaultAboutJourney,
} from '../data/defaultAboutData';
import {
  Sparkles,
  Quote,
  ShieldCheck,
  Award,
  Search,
  Heart,
  Shield,
  Activity,
  Compass,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  Clock,
  Layers,
  Building,
} from 'lucide-react';
import { AboutPhilosophyPillar, AboutGalleryImage, AboutAssociation } from '../types';

export default function About() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  usePageMeta(
    `About ${clinic.name || 'Our Practice'} | Doctor Bio & Clinical Philosophy`,
    clinic.aboutDoctorBio || 'Meet Dr. Alistair Vance and discover our evidence-based, unhurried approach to restorative chiropractic care.'
  );

  // Safe fallback data
  const pillars: AboutPhilosophyPillar[] =
    clinic.aboutPhilosophyPillars && clinic.aboutPhilosophyPillars.length > 0
      ? clinic.aboutPhilosophyPillars
      : defaultPhilosophyPillars;

  const gallery: AboutGalleryImage[] =
    clinic.aboutGallery && clinic.aboutGallery.length > 0
      ? clinic.aboutGallery
      : defaultAboutGallery;

  const associations: AboutAssociation[] =
    clinic.aboutAssociations && clinic.aboutAssociations.length > 0
      ? clinic.aboutAssociations
      : defaultAboutAssociations;

  const doctorPhoto = clinic.doctorImage || doctorImg;
  const doctorName = clinic.doctorName || 'Dr. Alistair Vance';
  const doctorCredentials = clinic.doctorCredentials || 'D.C., CCSP, MSc';
  const doctorTitle = clinic.doctorTitle || 'Lead Practitioner & Biomechanist';
  const doctorQuote =
    clinic.aboutDoctorQuote || clinic.doctorQuote || defaultAboutJourney.quote;

  const journeyP1 = clinic.aboutJourneyParagraph1 || defaultAboutJourney.paragraph1;
  const journeyP2 = clinic.aboutJourneyParagraph2 || defaultAboutJourney.paragraph2;
  const journeyP3 = clinic.aboutJourneyParagraph3 || defaultAboutJourney.paragraph3;

  const renderPillarIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart className="w-5 h-5 text-emerald-700" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-700" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-emerald-700" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-emerald-700" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-700" />;
      case 'search':
      default:
        return <Search className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">

        {/* 1. HERO & DOCTOR BIO: SPLIT-SCREEN 2-COLUMN LAYOUT ON DESKTOP */}
        <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Doctor Portrait */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100 aspect-4/5">
                <img
                  src={doctorPhoto}
                  alt={doctorName}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />

                {/* Verified Credential Tag */}
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GCC Statutory Registered</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-500">
                    Reg #04821
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Bio & Doctor Pull Quote */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{doctorTitle}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                  {doctorName}
                  <span className="block text-lg sm:text-xl font-sans font-normal text-emerald-800 mt-1">
                    {doctorCredentials}
                  </span>
                </h1>
              </div>

              {/* Bio Narrative */}
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {clinic.aboutDoctorBio ||
                  clinic.aboutApproach ||
                  `Specializing in complex spine kinematics, disc decompression, and athletic rehabilitation. With over ${clinic.doctorYears || '12'} years of clinical practice in ${clinic.cityState || clinic.city || 'central London'}, Dr. Vance works with patients seeking root-cause answers rather than temporary symptom management.`}
              </p>

              {/* Personal Doctor Pull Quote (Builds Instant Trust) */}
              {doctorQuote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 relative space-y-2">
                  <Quote className="w-6 h-6 text-emerald-600/40 absolute top-3 right-3" />
                  <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-relaxed pr-6">
                    "{doctorQuote}"
                  </p>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    — {doctorName}
                  </div>
                </div>
              )}

              {/* Education & Clinical Focus Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="font-bold text-stone-900 block mb-0.5">Education & Degrees</span>
                  <span className="text-stone-600">
                    {clinic.aboutDoctorEducation || clinic.aboutEducation || 'Doctor of Chiropractic (D.C.), MSc Sports Medicine'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="font-bold text-stone-900 block mb-0.5">Clinical Specialization</span>
                  <span className="text-stone-600">
                    {clinic.aboutDoctorSpecialty || 'Spinal Biomechanics & Disc Decompression'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. CREDENTIALS & ASSOCIATIONS TRUST BAR */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              Professional Accreditations & Clinical Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {associations.map((assoc) => (
              <div
                key={assoc.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-500/60 transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-900">
                    {assoc.abbreviation}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="text-xs font-semibold text-stone-800 line-clamp-1">
                  {assoc.name}
                </div>
                {assoc.role && (
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">
                    {assoc.role}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. OUR PHILOSOPHY (REPLACING "HOW WE WORK" & "WHY THIS PRACTICE") */}
        <section className="space-y-6">
          <div className="text-center sm:text-left space-y-1 border-b border-stone-200 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {clinic.aboutPhilosophySubtitle || 'Our Clinical Standard'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {clinic.aboutPhilosophyTitle || 'The Four Tenets of Our Care'}
            </h2>
            <p className="text-sm text-stone-600">
              How private chiropractic medicine ought to be practiced: unhurried, evidence-informed, and honest.
            </p>
          </div>

          {/* 4-Pillar Grid Matching Homepage Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={pillar.id || idx}
                className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:border-emerald-500/70 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {renderPillarIcon(pillar.icon)}
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/50">
                    Pillar 0{idx + 1}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. "THE JOURNEY" EDITORIAL STORY (WITH LARGE DROP-CAP) */}
        <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm space-y-6">
          <div className="space-y-1.5 border-b border-stone-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {clinic.aboutJourneySubtitle || 'Our Founding Story'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {clinic.aboutJourneyTitle || 'The Journey Behind Vance Health'}
            </h2>
          </div>

          {/* Editorial Narrative with Drop-Cap Styling */}
          <div className="space-y-5 text-sm sm:text-base text-stone-700 leading-relaxed font-sans max-w-3xl">
            {/* Paragraph 1 with Drop Cap */}
            <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:mr-3.5 first-letter:text-emerald-800 first-letter:leading-none">
              {journeyP1}
            </p>

            {/* Paragraph 2 */}
            <p>{journeyP2}</p>

            {/* Paragraph 3 */}
            <p>{journeyP3}</p>
          </div>

          {/* Doctor Sign-Off Guarantee */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-600/40 shrink-0">
                <img src={doctorPhoto} alt={doctorName} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="font-bold text-stone-900 text-sm">{doctorName}</div>
                <div className="text-emerald-700 text-[11px]">{doctorTitle} • Founder</div>
              </div>
            </div>

            <div className="italic text-stone-400 font-serif">
              "Honest clinical answers from day one."
            </div>
          </div>
        </section>

        {/* 5. "THE CLINIC" SANCTUARY GALLERY (DARK CONTRAST NARRATIVE BLOCK) */}
        <section className="space-y-6">
          {/* Dark Contrast Narrative Block (Like Pricing Finance Block) */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 border border-stone-800 shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" />
                <span>The Practice Environment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                {clinic.aboutSanctuaryTitle || 'A Sanctuary Designed for Healing'}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {clinic.aboutSanctuaryDescription ||
                  'Every detail of our practice—from acoustic privacy and motorized drop tables to natural daylight—was engineered to reduce neurological stress and promote tissue recovery.'}
              </p>
            </div>
          </div>

          {/* 3-Image Photographic Grid with Architectural Captions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gallery.slice(0, 3).map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition space-y-3 p-3 flex flex-col"
              >
                <div className="rounded-xl overflow-hidden aspect-4/3 relative bg-stone-100">
                  <img
                    src={item.url}
                    alt={item.alt || item.caption}
                    className="w-full h-full object-cover"
                  />
                  {item.tag && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-stone-950/80 backdrop-blur-sm text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-stone-800">
                      {item.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-snug px-1 pb-1 flex-1 font-sans">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FINAL APPOINTMENT CTA */}
        <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-4 shadow-xl border border-stone-800">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Begin With An Accurate Diagnosis
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Ready to find out what's causing your symptoms?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Schedule an initial 45-minute comprehensive examination with {doctorName}. Unhurried, honest, and co-created care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openBookingModal('About Page Consultation')}
              className="w-full sm:w-auto inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-sm"
            >
              Book Initial Consultation →
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
