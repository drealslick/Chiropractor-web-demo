import React from 'react';
import { ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { processSteps } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface TheProcessProps {
  clinic?: ClinicInfo;
}

export const TheProcess: React.FC<TheProcessProps> = ({ clinic }) => {
  const steps = clinic?.customProcessSteps || processSteps;

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
            {clinic?.processSectionSubtitle || "How It Works"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic?.processSectionTitle || "The Process"}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 relative">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between h-full relative group hover:border-emerald-700/50 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <span className="text-3xl font-serif font-bold text-emerald-800/80 block mb-3 group-hover:text-emerald-700 transition-colors">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Arrow separator for mobile (down) or desktop (right) */}
              {idx < steps.length - 1 && (
                <div className="flex md:hidden justify-center py-1 text-stone-400">
                  <ArrowDown className="w-5 h-5 text-emerald-700" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};
