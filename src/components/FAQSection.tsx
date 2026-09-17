import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { faqs } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface FAQSectionProps {
  clinic?: ClinicInfo;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ clinic }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first open by default

  const toggle = (idx: number) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  const list = clinic?.customFaqs 
    ? clinic.customFaqs.map(f => ({ question: f.q, answer: f.a }))
    : faqs;

  return (
    <section id="faq" className="py-20 md:py-28 bg-white border-b border-stone-200 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-2">
            {clinic?.faqSectionSubtitle || "Clear Answers"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic?.faqSectionTitle || "Frequently Asked Questions"}
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Real questions patients actually ask before their first appointment.
          </p>
        </motion.div>

        <div className="space-y-3">
          {list.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border border-stone-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 bg-white hover:bg-stone-50/80 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-stone-900 pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-stone-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-800' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-stone-100 bg-stone-50/50"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
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
