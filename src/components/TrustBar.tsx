import React from 'react';
import { Star, Shield, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TrustBarProps {
  clinic: ClinicInfo;
}

export const TrustBar: React.FC<TrustBarProps> = ({ clinic }) => {
  const rating = Number(clinic.googleRating) || 4.9;
  const reviewCount = clinic.googleReviewsCount || clinic.googleReviewCount || '140+';

  const trustHighlights = [
    {
      icon: Star,
      primary: clinic.trustItem1Primary || clinic.trustRatingLabel || `${rating} ★ Google Rating`,
      secondary: clinic.trustItem1Secondary || `${reviewCount} Verified Reviews`,
      link: clinic.reviewsUrl,
    },
    {
      icon: Award,
      primary: clinic.trustItem2Primary || clinic.doctorCredentials || 'Board Certified DC',
      secondary: clinic.trustItem2Secondary || 'Licensed & Insured',
      link: undefined,
    },
    {
      icon: Clock,
      primary: clinic.trustItem3Primary || 'No Rushed Visits',
      secondary: clinic.trustItem3Secondary || 'Dedicated 1-on-1 Doctor Time',
      link: undefined,
    },
    {
      icon: Shield,
      primary: clinic.trustItem4Primary || 'Zero Long Contracts',
      secondary: clinic.trustItem4Secondary || 'Discharged Once You Heal',
      link: undefined,
    },
  ];

  return (
    <section className="border-y border-stone-200/90 bg-stone-100/80 py-3.5 sm:py-5 overflow-hidden">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {trustHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="flex items-start sm:items-center gap-2.5 sm:gap-3 p-2.5 sm:p-0 rounded-xl bg-white/60 sm:bg-transparent border border-stone-200/60 sm:border-0 shadow-xs sm:shadow-none min-h-[56px] sm:min-h-0"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 sm:bg-stone-200/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Icon className="w-4 h-4 text-emerald-800" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      title={item.primary}
                      className="font-bold text-xs sm:text-sm text-stone-900 hover:text-emerald-800 hover:underline break-words leading-snug block"
                    >
                      {item.primary}
                    </a>
                  ) : (
                    <span
                      title={item.primary}
                      className="font-bold text-xs sm:text-sm text-stone-900 break-words leading-snug block"
                    >
                      {item.primary}
                    </span>
                  )}
                  <span
                    title={item.secondary}
                    className="text-[10px] sm:text-[11px] text-stone-500 break-words leading-tight block mt-0.5"
                  >
                    {item.secondary}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
