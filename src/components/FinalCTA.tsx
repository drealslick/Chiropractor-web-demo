import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface FinalCTAProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ clinic, onBookClick }) => {
  return (
    <section className="py-20 md:py-28 bg-stone-900 text-stone-100 relative overflow-hidden">
      {/* Subtle organic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/25 blur-3xl rounded-full pointer-events-none -z-0" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white mb-6">
          It's time to feel like yourself again.
        </h2>

        <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto mb-10 leading-relaxed">
          Book online in under two minutes or call our front desk directly. We’re ready to help you recover.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <button
            onClick={onBookClick}
            id="final-cta-book-visit-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-base rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer group"
          >
            <Calendar className="w-5 h-5 text-emerald-200" />
            <span>BOOK YOUR VISIT</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="text-sm text-stone-400">
          or call{' '}
          <a
            href={`tel:${clinic.phoneRaw}`}
            className="text-amber-400 hover:text-amber-300 font-semibold underline decoration-amber-400/40 hover:decoration-amber-300 transition-colors"
          >
            {clinic.phone}
          </a>
        </div>

      </motion.div>
    </section>
  );
};
