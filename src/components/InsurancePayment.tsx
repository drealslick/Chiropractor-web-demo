import React, { useState } from 'react';
import { CreditCard, PhoneCall, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo } from '../types';
import { InsuranceLogoItem } from './InsuranceLogos';
import { useClinic } from '../data/ClinicContext';

interface InsurancePaymentProps {
  clinic: ClinicInfo;
}

export const InsurancePayment: React.FC<InsurancePaymentProps> = ({ clinic }) => {
  const { openBookingModal } = useClinic();
  const [showCoverNotice, setShowCoverNotice] = useState(false);

  const insurances =
    clinic.customInsurances && clinic.customInsurances.length > 0
      ? clinic.customInsurances
      : ['Bupa', 'AXA Health', 'Aviva', 'Vitality', 'WPA', 'Cigna', 'Self-pay'];

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
          {clinic.insuranceTitle || "Insurance & Approved Networks"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm sm:text-base md:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          {clinic.insuranceSubtitle || "We work with major health insurers and provide stamped medical receipts for cash plan reimbursement."}
        </motion.p>

        {/* Grayscale Provider Logos */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 max-w-3xl mx-auto mb-6"
        >
          {insurances.map((ins, i) => (
            <InsuranceLogoItem key={i} name={ins} className="filter grayscale hover:grayscale-0 transition-all duration-200" />
          ))}
        </motion.div>

        {/* Check My Cover Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => setShowCoverNotice(!showCoverNotice)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Check My Cover</span>
          </button>
        </motion.div>

        {/* Expandable Cover Guidance */}
        <AnimatePresence>
          {showCoverNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8 max-w-xl mx-auto text-left"
            >
              <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-stone-800 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>How We Verify Your Insurance Coverage:</span>
                </div>
                <p className="text-stone-700 leading-relaxed text-xs">
                  Simply provide your insurer name (e.g. Bupa, AXA Health, Aviva) and membership/authorization code during booking. We confirm your benefit tier directly to ensure a smooth, transparent claims process.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openBookingModal('Insurance Verification')}
                    className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer text-xs"
                  >
                    Book with insurance details →
                  </button>
                  <span className="text-stone-300">•</span>
                  <a
                    href={`tel:${clinic.phoneRaw || clinic.phone}`}
                    className="inline-flex items-center gap-1 font-bold text-stone-700 hover:text-stone-900 text-xs"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-700" />
                    <span>Call {clinic.phone}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
