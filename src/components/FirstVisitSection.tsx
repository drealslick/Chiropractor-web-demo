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
    <section className="py-20 md:py-28 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block mb-3">
            {clinic?.firstVisitSubtitle || "What to Expect"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic?.firstVisitTitle || "Your First Visit"}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-start hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-3xl font-serif font-bold text-emerald-800/80 block mb-3">
                {step.number}
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">
                {step.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
