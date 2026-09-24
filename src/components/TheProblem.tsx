import React, { useState } from 'react';
import { ArrowRight, Activity, CheckCircle2, ChevronRight, Sparkles, Stethoscope, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProblemCondition, ClinicInfo } from '../types';

interface TheProblemProps {
  conditions: ProblemCondition[];
  onSelectCondition: (conditionTitle: string) => void;
  clinic?: ClinicInfo;
}

export const TheProblem: React.FC<TheProblemProps> = ({ conditions, onSelectCondition, clinic }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCondition = conditions[activeIdx] || conditions[0] || {};

  const sectionTitle = clinic?.conditionsTitle || "Targeted Care for Specific Mechanical Pain";
  const sectionSubtitle = clinic?.conditionsSubtitle || "Clinical Focus Areas";

  return (
    <section id="care" className="py-12 sm:py-16 md:py-24 bg-stone-100/50 border-b border-stone-200/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block mb-3">
              {sectionSubtitle}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight [text-wrap:balance]">
              {sectionTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Pain is rarely random. We isolate the exact nerve irritation, joint restriction, or postural compensation causing your symptoms.
          </p>
        </div>

        {/* Mobile Horizontal Condition Picker Bar */}
        <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 -mx-4 px-4">
          {conditions.map((item, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Master-Detail Interactive Diagnostic Canvas */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Condition Navigation List (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
              Select Condition to Inspect Protocol:
            </div>
            {conditions.map((item, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-1 ring-black/5'
                      : 'bg-white text-stone-800 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="pr-3">
                    <div className={`font-serif text-lg font-bold ${isActive ? 'text-white' : 'text-stone-900'}`}>
                      {item.title}
                    </div>
                    <div className={`text-xs mt-1 line-clamp-1 ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isActive ? 'bg-emerald-600 text-white translate-x-1' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Clinical Breakdown Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCondition.id || activeIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/90 shadow-md space-y-5 sm:space-y-6"
              >
                {/* Condition Header Badge & Title */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-stone-100 pb-4 sm:pb-5">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                      Diagnostic Profile #{activeIdx + 1}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                      {activeCondition.title}
                    </h3>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-mono self-start">
                    <Compass className="w-4 h-4 text-emerald-700" />
                    <span>Targeted Protocol</span>
                  </div>
                </div>

                {/* Biomechanical Root-Cause Description */}
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {activeCondition.description}
                </p>

                {/* Common Symptoms Pill Cloud */}
                {activeCondition.symptoms && activeCondition.symptoms.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                      Common Warning Signs:
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {activeCondition.symptoms.map((sym, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200/70"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Clinical Strategy Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                    <span>How We Restore Function:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {activeCondition.approach || activeCondition.howWeHelp || "Precise spinal adjustments paired with targeted muscular mobilization and kinetic stability training."}
                  </p>
                </div>

                {/* Interactive Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Evaluated during your 45-minute initial exam</span>
                  </div>
                  <button
                    onClick={() => onSelectCondition(activeCondition.title)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>Request Visit For This</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
