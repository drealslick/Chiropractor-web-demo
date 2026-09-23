import React from 'react';
import { Star, Shield, Award, Clock, HeartHandshake } from 'lucide-react';
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
      primary: `${rating} ★ Rating`,
      secondary: `${reviewCount} Verified Reviews`,
      link: clinic.reviewsUrl,
    },
    {
      icon: Award,
      primary: clinic.doctorCredentials || 'Board Certified DC',
      secondary: 'Licensed & Insured',
    },
    {
      icon: Clock,
      primary: 'No Rushed Visits',
      secondary: 'Dedicated 1-on-1 Doctor Time',
    },
    {
      icon: Shield,
      primary: 'Zero Long Contracts',
      secondary: 'Discharged Once You Heal',
    },
  ];

  return (
    <section className="border-y border-stone-200/90 bg-stone-100/70 py-4 sm:py-5 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80">
          {trustHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`flex items-center gap-3 ${idx > 0 ? 'pt-3 sm:pt-0 sm:pl-6' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight min-w-0">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs sm:text-sm text-stone-900 hover:text-emerald-800 hover:underline truncate block"
                    >
                      {item.primary}
                    </a>
                  ) : (
                    <span className="font-bold text-xs sm:text-sm text-stone-900 truncate block">
                      {item.primary}
                    </span>
                  )}
                  <span className="text-[11px] text-stone-500 truncate block mt-0.5">
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
