import React from 'react';
import { Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface HeroProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ clinic, onBookClick }) => {
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Sub-label location pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/80 text-stone-700 text-xs font-semibold tracking-wide uppercase mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Accepting New Patients in {clinic.cityState}</span>
        </motion.div>

        {/* HERO TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.1] mb-6"
        >
          {clinic.heroHeadline || "Get Back to What Pain Took Away."}
        </motion.h1>

        {/* HERO SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
        >
          {clinic.heroSubheadline || `Personalized chiropractic care in ${clinic.city} for people who refuse to slow down.`}
        </motion.p>

        {/* HERO CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <button
            onClick={onBookClick}
            id="hero-book-first-visit-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-stone-900 hover:bg-emerald-900 text-stone-50 text-base font-semibold tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer group uppercase"
          >
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>{clinic.heroCtaText || "BOOK YOUR FIRST VISIT"}</span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Micro-guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-xs text-stone-500 font-medium"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>No long contracts · Transparent pricing · Comprehensive exam included</span>
        </motion.div>

      </div>

      {/* Real Clinic Photo Below */}
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.35, ease: [0.21, 0.45, 0.27, 0.9] }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-100 group">
          <img
            src={clinic.heroImage}
            alt="Doctor examining patient in treatment room at Columbus Chiropractic Care"
            className="w-full h-[360px] sm:h-[480px] md:h-[560px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Subtle natural photo caption badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-stone-900/85 backdrop-blur-md text-stone-100 px-4 py-2 rounded-lg text-xs font-medium border border-white/10 flex items-center gap-2 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Dr. {clinic.doctorName.replace('Dr. ', '')} in the {clinic.city} treatment suite</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
