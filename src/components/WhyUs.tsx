import React from 'react';
import { UserCheck, Stethoscope, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { whyUsFeatures } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface WhyUsProps {
  clinic?: ClinicInfo;
}

export const WhyUs: React.FC<WhyUsProps> = ({ clinic }) => {
  const icons = [
    <UserCheck className="w-6 h-6 text-emerald-700" />,
    <Stethoscope className="w-6 h-6 text-emerald-700" />,
    <Target className="w-6 h-6 text-emerald-700" />
  ];

  const sectionTitle = clinic?.whyUsTitle || "Healthcare should feel personal again.";
  const sectionSubtitle = clinic?.whyUsSubtitle || "Our Standard";

  const pillars = [
    {
      title: clinic?.whyUsPillar1Title || whyUsFeatures[0]?.title || "A real conversation.",
      description: clinic?.whyUsPillar1Desc || whyUsFeatures[0]?.description || "No rush. We listen first."
    },
    {
      title: clinic?.whyUsPillar2Title || whyUsFeatures[1]?.title || "An actual plan.",
      description: clinic?.whyUsPillar2Desc || whyUsFeatures[1]?.description || "Targeted physical rehab and modern adjustments."
    },
    {
      title: clinic?.whyUsPillar3Title || whyUsFeatures[2]?.title || "Respect for your goals.",
      description: clinic?.whyUsPillar3Desc || whyUsFeatures[2]?.description || "No high-pressure sales. No lifetime contracts."
    }
  ];

  return (
    <section id="about" className="py-12 md:py-16 bg-white border-b border-stone-200 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-left max-w-2xl mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-3">
            {sectionSubtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {sectionTitle}
          </h2>
        </motion.div>

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
          {pillars.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="flex flex-col p-8 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-stone-300 transition-all hover:shadow-md hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-6 shadow-xs">
                {icons[index]}
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
