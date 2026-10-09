import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo, HeroTriageOption } from '../types';
import { defaultTriageOptions } from '../data/clinicData';

interface HeroProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ clinic, onBookClick }) => {
  const isTriageEnabled = clinic.showHeroTriage !== false;
  const triageList: HeroTriageOption[] =
    clinic.customTriageOptions && clinic.customTriageOptions.length > 0
      ? clinic.customTriageOptions
      : defaultTriageOptions;

  const [activeTriage, setActiveTriage] = useState<HeroTriageOption>(triageList[0] || defaultTriageOptions[0]);

  // Keep active option in sync if list changes or item was removed in admin
  useEffect(() => {
    if (!triageList.some((t) => t.id === activeTriage.id)) {
      setActiveTriage(triageList[0] || defaultTriageOptions[0]);
    }
  }, [triageList, activeTriage.id]);

  const triageHeadline = clinic.heroTriageHeadline || 'Select Primary Discomfort:';
  const triageSubheadline = clinic.heroTriageSubheadline || 'Personalized pathway';

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 bg-[#f3efe6]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3 mb-6 sm:mb-8 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-stone-800 text-sm sm:text-base">
              {clinic.heroAcceptingPillText || `Accepting New Patients in ${clinic.cityState || clinic.city || 'Practice Area'}`}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-stone-500 font-medium text-xs">
            <span>{clinic.hoursWeekday || 'Mon–Fri 8:30–6:30'}</span>
            <span aria-hidden="true">·</span>
            <span>Direct Doctor Consultations</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">{clinic.examFee ? `${clinic.examFee} Initial Special` : 'No Long Contracts'}</span>
          </div>
        </div>

        {/* Hero Asymmetric Two-Column Editorial Spread */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold Headline & Interactive Symptom Triage */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#1a1814] tracking-[-0.02em] leading-[1.05] [text-wrap:balance]">
                {clinic.heroHeadline || "Get Back to What Pain Took Away."}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04, ease: [0.23, 1, 0.32, 1] }}
              className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-xl font-normal"
            >
              {clinic.heroSubheadline || `Personalized, root-cause chiropractic care in ${clinic.city || 'our practice'}. We find the biomechanical source of your discomfort and build a clear plan to restore natural mobility.`}
            </motion.p>

            {/* Interactive Clinical Triage Preview Box (Toggleable via Admin) */}
            {isTriageEnabled && triageList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
                className="p-4 sm:p-5 border-t border-[#1a1814]/15 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif italic text-stone-700 text-sm">
                    {triageHeadline}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">{triageSubheadline}</span>
                </div>

                {/* Triage Switcher Tabs */}
                <div className={`grid gap-2 ${
                  triageList.length === 1
                    ? 'grid-cols-1'
                    : triageList.length === 2
                    ? 'grid-cols-2'
                    : triageList.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {triageList.map((opt) => {
                    const isActive = activeTriage?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActiveTriage(opt)}
                        className={`px-2 py-2 text-xs text-center truncate cursor-pointer border-b ${
                          isActive
                            ? 'border-[#1a1814] text-[#1a1814] font-medium'
                            : 'border-transparent text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        <span className="sm:hidden">{opt.shortLabel || opt.label.split(' & ')[0]}</span>
                        <span className="hidden sm:inline">{opt.label.split(' & ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Triage Output */}
                {activeTriage && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTriage.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900">{activeTriage.focus}</div>
                        <div className="text-stone-500 text-[11px] mt-0.5 leading-snug">{activeTriage.summary}</div>
                      </div>
                      {activeTriage.typicalVisits && (
                        <div className="shrink-0 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] self-start sm:self-auto">
                          {activeTriage.typicalVisits}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* CTAs and Doctor Reassurance */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-3 pt-1 sm:pt-2"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onBookClick}
                  id="hero-book-first-visit-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-stone-900 hover:bg-emerald-900 text-stone-50 text-xs sm:text-sm font-bold tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer group uppercase min-h-[48px]"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{clinic.heroCtaText || "BOOK YOUR FIRST VISIT"}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-2 px-2 py-1 text-xs text-stone-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{clinic.heroGuaranteeText || "Zero long contracts · Upfront pricing"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Architectural Visual Carrier with Doctor Quote */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 bg-stone-100">
              <picture>
                <source srcSet={'/images/hero-placeholder.svg'} type="image/svg+xml" />
                <img
                  src={'/images/hero-placeholder.svg'}
                  alt={`Treatment studio at ${clinic.name}`}
                  className="w-full h-[280px] sm:h-[380px] lg:h-[440px] object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </picture>
              
              {/* Subtle bottom gradient scrim */}
              <figcaption className="px-1 pt-3 text-[#1a1814]">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-serif">{clinic.doctorName || 'Dr. Marcus Reed'}</span>
                  <span className="text-xs text-stone-500">{clinic.doctorCredentials || 'D.C., CCSP'}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600 leading-snug">
                  Every spine tells a specific mechanical story. We listen before we adjust.
                </p>
              </figcaption>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
