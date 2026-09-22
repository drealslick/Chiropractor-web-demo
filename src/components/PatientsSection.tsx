import React from 'react';
import { Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { testimonials, featuredStory } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface PatientsSectionProps {
  clinic?: ClinicInfo;
}

export const PatientsSection: React.FC<PatientsSectionProps> = ({ clinic }) => {
  const list = clinic?.customTestimonials || testimonials;

  return (
    <section id="results" className="py-14 md:py-20 bg-stone-900 text-stone-100 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 block mb-3">
            {clinic?.patientsSectionSubtitle || "Real Outcomes"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            {clinic?.patientsSectionTitle || "Patients"}
          </h2>
        </motion.div>

        {/* 3 Testimonial Quotes */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {list.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="p-8 rounded-2xl bg-stone-800 border border-stone-700 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-stone-800 text-base sm:text-lg font-serif italic leading-snug mb-6">
                  "{item.quote}"
                </blockquote>
              </div>
              
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-900 text-sm">
                  — {item.author}
                </span>
                {item.condition && (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Story (One, below the quotes) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-stone-200/90 p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-6">
              <Trophy className="w-3.5 h-3.5 text-emerald-700" />
              {clinic?.patientsSectionFeaturedTitle || "Featured Patient Story"}
            </span>

            <div className="grid sm:grid-cols-12 gap-8 items-center">
              {/* Small photo */}
              <div className="sm:col-span-4">
                <div className="relative rounded-xl overflow-hidden aspect-square border border-stone-200 shadow-sm bg-stone-100">
                  <img
                    src={clinic?.patientImage || featuredStory.image}
                    alt={`${clinic?.patientStoryName || featuredStory.patientName} success story`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs text-stone-500 text-center mt-2 font-medium">
                  {clinic?.patientStoryName || featuredStory.patientName} · {clinic?.patientStoryRole || "Tennis enthusiast"}
                </p>
              </div>

              {/* Story Copy */}
              <div className="sm:col-span-8 space-y-4 text-stone-700 text-base leading-relaxed">
                <p>
                  {clinic?.patientStorySummary || featuredStory.summary}
                </p>
                <p className="text-stone-600 text-sm italic">
                  {clinic?.patientStoryTimeline || featuredStory.timeline}
                </p>
                <p className="font-semibold text-stone-900 text-lg font-serif">
                  {clinic?.patientStoryOutcome || featuredStory.outcome}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
