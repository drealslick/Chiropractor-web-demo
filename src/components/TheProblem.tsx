import React, { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProblemCondition, ClinicInfo } from '../types';

interface TheProblemProps {
  conditions: ProblemCondition[];
  onSelectCondition: (conditionTitle: string) => void;
  clinic?: ClinicInfo;
}

export const TheProblem: React.FC<TheProblemProps> = ({ conditions, onSelectCondition, clinic }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const sectionTitle = clinic?.conditionsTitle || "Pain shouldn't determine how you live your life.";
  const sectionSubtitle = clinic?.conditionsSubtitle || "Targeted Relief";

  return (
    <section id="care" className="py-12 md:py-16 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-left max-w-2xl mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block mb-3">
            {sectionSubtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {sectionTitle}
          </h2>
        </motion.div>

        {/* 5 Conditions List */}
        <div className="space-y-4">
          {conditions.map((item, index) => {
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`rounded-xl border transition-all duration-200 ${
                  isExpanded
                    ? 'border-stone-400 bg-white shadow-md ring-1 ring-stone-300'
                    : 'border-stone-200/90 bg-white/70 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleExpand(item.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors py-1 px-2.5 rounded hover:bg-emerald-50 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Less' : 'Explore'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-emerald-900' : 'text-emerald-700'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expandable details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-stone-100 bg-stone-50/70 rounded-b-xl"
                    >
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-4">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-emerald-700" />
                              Common Symptoms We See
                            </h4>
                            <ul className="space-y-1.5">
                              {item.symptoms.map((sym, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{sym}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                              Our Treatment Approach
                            </h4>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                              {item.approach}
                            </p>
                            <button
                              onClick={() => onSelectCondition(item.title)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-stone-900 hover:bg-emerald-900 text-stone-50 text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
                            >
                              <span>Book care for {item.title.split('&')[0].trim()}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
