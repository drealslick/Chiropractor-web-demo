import React, { useState } from 'react';
import { Calendar, ShieldCheck, ArrowRight, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo } from '../types';

interface HeroProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

const triageOptions = [
  {
    id: 'back',
    label: 'Lower Back & Sciatica',
    summary: 'Lumbar facet restriction or disc decompression protocol.',
    typicalVisits: '3–5 visits to lasting relief',
    focus: 'Decompression & Spinal Alignment',
  },
  {
    id: 'neck',
    label: 'Neck & Desk Strain',
    summary: 'Cervical alignment, thoracic mobilization & ergonomic posture rehab.',
    typicalVisits: '2–4 visits to full range',
    focus: 'Cervical & Postural Correction',
  },
  {
    id: 'headache',
    label: 'Headaches & Migraines',
    summary: 'Suboccipital tension release and upper cervical nerve pathway care.',
    typicalVisits: 'Rapid relief in 1–3 visits',
    focus: 'Cervicogenic Tension Release',
  },
  {
    id: 'sports',
    label: 'Athletic & Joint Injury',
    summary: 'Functional biomechanics, extremity adjusting & kinetic chain rehab.',
    typicalVisits: 'Custom return-to-sport arc',
    focus: 'Sports Recovery & Performance',
  },
];

export const Hero: React.FC<HeroProps> = ({ clinic, onBookClick }) => {
  const [activeTriage, setActiveTriage] = useState(triageOptions[0]);

  return (
    <section className="relative pt-6 pb-14 md:pt-10 md:pb-20 overflow-hidden bg-stone-50/50">
      {/* Editorial Decorative Grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3 mb-8 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-medium text-stone-900 tracking-tight">
              {clinic.heroAcceptingPillText || `Accepting New Patients in ${clinic.cityState}`}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-stone-500 font-medium">
            <span>{clinic.hoursWeekday || 'Mon–Fri 8:30–6:30'}</span>
            <span aria-hidden="true">·</span>
            <span>Direct Doctor Consultations</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">{clinic.examFee ? `${clinic.examFee} Special` : 'No Long Contracts'}</span>
          </div>
        </div>

        {/* Hero Asymmetric Two-Column Editorial Spread */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Bold Headline & Interactive Symptom Triage */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.08] [text-wrap:balance]">
                {clinic.heroHeadline || "Get Back to What Pain Took Away."}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-normal"
            >
              {clinic.heroSubheadline || `Personalized, root-cause chiropractic care in ${clinic.city}. We find the biomechanical source of your discomfort and build a clear plan to restore natural mobility.`}
            </motion.p>

            {/* Interactive Clinical Triage Preview Box */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  Select Your Primary Discomfort:
                </span>
                <span className="text-[11px] text-stone-400">Personalized pathway</span>
              </div>

              {/* Triage Switcher Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl">
                {triageOptions.map((opt) => {
                  const isActive = activeTriage.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setActiveTriage(opt)}
                      className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-all text-center truncate cursor-pointer ${
                        isActive
                          ? 'bg-white text-stone-900 shadow-xs ring-1 ring-black/5 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                      }`}
                    >
                      {opt.label.split(' & ')[0]}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Triage Output */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTriage.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-stone-900">{activeTriage.focus}</div>
                    <div className="text-stone-500 text-[11px] mt-0.5">{activeTriage.summary}</div>
                  </div>
                  <div className="shrink-0 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px]">
                    {activeTriage.typicalVisits}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CTAs and Doctor Reassurance */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3 pt-2"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onBookClick}
                  id="hero-book-first-visit-btn"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-stone-900 hover:bg-emerald-900 text-stone-50 text-sm font-bold tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer group uppercase"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{clinic.heroCtaText || "BOOK YOUR FIRST VISIT"}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs text-stone-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{clinic.heroGuaranteeText || "Zero long contracts · Upfront pricing"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Layered Architectural Visual Carrier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 bg-stone-100">
              <img
                src={clinic.heroImage}
                alt={`Treatment studio at ${clinic.name}`}
                className="w-full h-[380px] sm:h-[460px] object-cover object-center"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              
              {/* Measured gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Floating Doctor & Room Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="p-3.5 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {clinic.doctorName || 'Dr. Alistair Vance'}
                    </span>
                    <span className="text-[11px] text-stone-300 font-mono">
                      {clinic.doctorCredentials || 'D.C., CCSP'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-200 leading-snug">
                    "Every spine tells a specific mechanical story. Our job is to listen thoroughly before we ever adjust."
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Quantitative Outcome Stamp */}
            <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white border border-stone-200 rounded-2xl p-3 shadow-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left pr-2">
                <div className="text-xs font-bold text-stone-900">98.4% Mobility Restored</div>
                <div className="text-[10px] text-stone-500">Verified patient milestone metric</div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
