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
    <section id="care" className="py-16 md:py-24 bg-stone-100/50 border-b border-stone-200/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block mb-3">
              {sectionSubtitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight [text-wrap:balance]">
              {sectionTitle}
            </h2>
          </div>
          <p className="text-sm text-stone-600 max-w-md leading-relaxed">
            Pain is rarely random. We isolate the exact nerve irritation, joint restriction, or postural compensation causing your symptoms.
          </p>
        </div>

        {/* Master-Detail Interactive Diagnostic Canvas */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Condition Navigation List */}
          <div className="lg:col-span-5 space-y-2">
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-lg space-y-6"
              >
                {/* Condition Header Badge & Title */}
                <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded uppercase font-semibold">
                      Diagnostic Profile 0{activeIdx + 1}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
                      {activeCondition.title}
                    </h3>
                    <p className="text-sm sm:text-base text-stone-600 mt-1">
                      {activeCondition.description}
                    </p>
                  </div>
                </div>

                {/* Common Symptoms / Indications */}
                {activeCondition.symptoms && activeCondition.symptoms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-700" />
                      Typical Clinical Presentation:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {activeCondition.symptoms.map((sym: string, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{sym}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Treatment Approach */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                    Our Gentle Clinical Protocol:
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {activeCondition.approach ||
                      "Detailed orthopedic testing, gentle low-force segmental realignment, targeted soft-tissue mobilization, and customized kinetic chain stabilization routines."}
                  </p>
                </div>

                {/* Direct Booking Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    Includes full orthopedic exam & personalized plan.
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectCondition(activeCondition.title || 'Condition')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                  >
                    <span>Book Exam for {activeCondition.title}</span>
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
