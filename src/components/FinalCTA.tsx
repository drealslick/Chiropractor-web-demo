import React from 'react';
import { Calendar, ArrowRight, Phone, ShieldCheck, Clock } from 'lucide-react';
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-950/30 blur-3xl rounded-full pointer-events-none -z-0" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>Priority Booking Available</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.1] [text-wrap:balance]">
          {clinic.finalCtaHeadline || "It's time to feel like yourself again."}
        </h2>

        <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed">
          {clinic.finalCtaSubheadline ||
            "Book your comprehensive initial consultation in under two minutes, or speak directly with our clinic desk. We’re ready to help you regain comfortable movement."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onBookClick}
            id="final-cta-book-visit-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide rounded-xl shadow-xl transition-all active:scale-[0.98] cursor-pointer group uppercase"
          >
            <Calendar className="w-5 h-5 text-emerald-200" />
            <span>{clinic.finalCtaButtonText || "BOOK YOUR VISIT"}</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {clinic.phoneRaw && (
            <a
              href={`tel:${clinic.phoneRaw}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm rounded-xl border border-stone-700 transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {clinic.phone || clinic.phoneRaw}</span>
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-stone-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>No long-term packages required · Transparent pricing · Comprehensive exam</span>
        </div>

      </motion.div>
    </section>
  );
};
