import React from 'react';
import { VolumeX, Wind, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TheClinicProps {
  clinic: ClinicInfo;
}

export const TheClinic: React.FC<TheClinicProps> = ({ clinic }) => {
  return (
    <section className="py-16 md:py-24 bg-stone-950 text-stone-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800/80 px-3 py-1 rounded-md inline-block mb-3">
            {clinic.clinicSectionSubtitle || "Our Practice Environment"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {clinic.clinicSectionTitle || "A Sanctuary Designed for Focused Healing"}
          </h2>
          <p className="text-stone-400 text-sm sm:text-base mt-3 leading-relaxed">
            We intentionally designed our space to feel like a tranquil private retreat rather than a sterile medical office.
          </p>
        </div>

        {/* Big Architectural Photography Carrier */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900 mb-10 group">
          <img
            src={clinic.clinicImage}
            alt={`Private treatment room at ${clinic.name}`}
            className="w-full h-[360px] sm:h-[480px] md:h-[540px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex items-end">
            <div className="p-6 sm:p-10 text-white max-w-xl">
              <p className="text-xl sm:text-2xl font-serif italic text-white font-medium">
                "{clinic.clinicQuote || "The clinical environment directly affects the nervous system."}"
              </p>
              <p className="text-xs sm:text-sm text-stone-300 mt-2">
                {clinic.clinicQuoteDescription ||
                  "A calm, quiet clinic environment designed for focused diagnostic assessment, unhurried care, and deep restorative recovery."}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Sanctuary Features Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <VolumeX className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-bold text-sm text-stone-100">Private Acoustic Suites</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              No curtain cubicles or crowded gym floors. Every consult and treatment takes place in private, sound-dampened rooms.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <Clock className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-bold text-sm text-stone-100">Zero-Wait Guarantee</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              We never double-book time slots. When you arrive for your scheduled time, your doctor is ready for you.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
            <Wind className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-bold text-sm text-stone-100">Clean Air & Natural Light</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Continuous medical-grade HEPA filtration, organic botanical accents, and calming circadian illumination.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
