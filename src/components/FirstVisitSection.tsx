import React from 'react';
import { motion } from 'motion/react';
import { firstVisitSteps } from '../data/clinicData';

import { ClinicInfo } from '../types';

interface FirstVisitSectionProps {
  clinic?: ClinicInfo;
}

export const FirstVisitSection: React.FC<FirstVisitSectionProps> = ({ clinic }) => {
  const steps = clinic?.customFirstVisitSteps || firstVisitSteps;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-xl mx-auto mb-8 sm:mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block mb-2.5">
            {clinic?.firstVisitSubtitle || "What to Expect"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic?.firstVisitTitle || "Your First Visit"}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-3.5 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-start hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800/80 block">
                  {step.number}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                  Step 0{index + 1}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-1.5 leading-snug">
                {step.title}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
