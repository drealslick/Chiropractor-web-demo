import React from 'react';
import { Star, Clock, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TrustBarProps {
  clinic: ClinicInfo;
}

export const TrustBar: React.FC<TrustBarProps> = ({ clinic }) => {
  return (
    <section className="border-y border-stone-200/90 bg-stone-100/70 py-6 sm:py-8 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.5, staggerChildren: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-4 text-stone-800"
        >
          
          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <div className="flex flex-col">
              {clinic.reviewsUrl ? (
                <a
                  href={clinic.reviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-stone-900 text-base leading-tight underline"
                >
                  {clinic.trustRatingLabel || "4.9 Google"}
                </a>
              ) : (
                <span className="font-bold text-stone-900 text-base leading-tight">
                  {clinic.trustRatingLabel || "4.9 Google"}
                </span>
              )}
              <span className="text-xs text-stone-500">
                {clinic.trustRatingSub || "Verified Patient Reviews"}
              </span>
            </div>
          </motion.div>

          <div className="hidden sm:block w-px h-8 bg-stone-300" />

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-stone-900 text-base leading-tight">
                {clinic.trustExperienceLabel || `${clinic.doctorYears || '15'}+ Years`}
              </span>
              <span className="text-xs text-stone-500">
                {clinic.trustExperienceSub || "Clinical Excellence"}
              </span>
            </div>
          </motion.div>

          <div className="hidden sm:block w-px h-8 bg-stone-300" />

          {/* Patients */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-stone-900 text-base leading-tight">
                {clinic.trustPatientsLabel || "2,000+ Patients"}
              </span>
                            <span className="text-xs text-stone-500">
                {clinic.trustPatientsSub || `Treated in ${clinic.city || clinic.cityState || 'clinic'}`}
              </span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
