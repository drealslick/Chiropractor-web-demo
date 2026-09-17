import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TheDoctorProps {
  clinic: ClinicInfo;
}

export const TheDoctor: React.FC<TheDoctorProps> = ({ clinic }) => {
  return (
    <section className="py-20 md:py-28 bg-white border-b border-stone-200 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Big Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-stone-100 aspect-[3/4] group">
              <img
                src={clinic.doctorImage}
                alt={`${clinic.doctorName}, Lead Chiropractor`}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
            </div>
          </motion.div>

          {/* Doctor Info & Quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 flex flex-col justify-center space-y-6"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              {clinic.doctorSectionSubtitle || "Meet Your Chiropractor"}
            </span>

            <div className="relative">
              <Quote className="w-10 h-10 text-emerald-100 absolute -top-4 -left-3 -z-10" />
              <blockquote className="text-2xl sm:text-3xl font-serif italic text-stone-900 leading-snug">
                "{clinic.doctorQuote}"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                {clinic.doctorName}
              </h3>
              <p className="text-stone-600 text-sm font-medium mt-1">
                {clinic.doctorCredentials} · {clinic.doctorYears} Years in Practice
              </p>
              <p className="text-stone-500 text-xs mt-0.5">
                {clinic.doctorSubCredentials || "Board Certified Chiropractic Physician"} · {clinic.cityState}
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
