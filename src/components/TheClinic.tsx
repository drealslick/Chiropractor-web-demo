import React from 'react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TheClinicProps {
  clinic: ClinicInfo;
}

export const TheClinic: React.FC<TheClinicProps> = ({ clinic }) => {
  return (
    <section className="py-0 bg-stone-950 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="sr-only"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-2">
            {clinic.clinicSectionSubtitle || "Our Space"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic.clinicSectionTitle || "The Clinic"}
          </h2>
        </motion.div>

        {/* Big Photo — treatment room, waiting area, or detail shot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 25 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100 mb-8 group"
        >
          <img
            src={clinic.clinicImage}
            alt={`Modern treatment room at ${clinic.name}`}
            className="w-full h-[360px] sm:h-[480px] md:h-[560px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 sm:p-10 text-white max-w-xl"
            >
              <p className="text-2xl sm:text-3xl font-serif italic text-white font-medium">
                "{clinic.clinicQuote || "The experience matters."}"
              </p>
              <p className="text-xs sm:text-sm text-stone-200/90 mt-2">
                {clinic.clinicQuoteDescription || "A calm, quiet clinic environment designed for focused assessment, unhurried care, and complete recovery."}
              </p>
            </motion.div>
        {((clinic as ClinicInfo & { clinicGallery?: string[] }).clinicGallery || []).length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4 px-4 sm:px-0 max-w-5xl mx-auto pb-10">
            {((clinic as ClinicInfo & { clinicGallery?: string[] }).clinicGallery || []).map((src) => (
              <img
                key={src}
                src={src}
                alt={`${clinic.name} clinic`}
                className="w-full h-40 sm:h-56 object-cover rounded-xl"
              />
            ))}
          </div>
        )}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
