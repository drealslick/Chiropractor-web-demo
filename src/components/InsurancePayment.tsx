import React from 'react';
import { CreditCard, PhoneCall, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface InsurancePaymentProps {
  clinic: ClinicInfo;
}

export const InsurancePayment: React.FC<InsurancePaymentProps> = ({ clinic }) => {
  const insurances = clinic.customInsurances || ["Anthem Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Medical Mutual", "Medicare", "Cigna", "HSA / FSA Accepted"];

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-white border-b border-stone-200/80 overflow-hidden relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-5"
        >
          <CreditCard className="w-6 h-6" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3 sm:mb-4"
        >
          {clinic.insuranceTitle || "Insurance & Payment"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm sm:text-base md:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed mb-6"
        >
          {clinic.insuranceSubtitle || "We accept most major insurance. Cash-pay options available for patients without coverage."}
        </motion.p>

        {/* Insurance pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-7"
        >
          {insurances.map((ins, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-full hover:bg-stone-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{ins}</span>
            </span>
          ))}
        </motion.div>

        {/* Questions link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-200/60"
        >
          <span className="text-xs sm:text-sm text-stone-600">{clinic.insuranceQuestionLabel || "Questions about your plan?"}</span>
          <a
            href={`tel:${clinic.phoneRaw}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-600/40 hover:decoration-emerald-950 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            <span>{clinic.insuranceCallCta || "Call us →"}</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
