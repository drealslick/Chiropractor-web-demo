import React, { useState } from 'react';
import { Star, Trophy, ArrowRight, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { testimonials, featuredStory } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface PatientsSectionProps {
  clinic?: ClinicInfo;
}

const categories = ['All Outcomes', 'Lower Back & Disc', 'Desk & Neck Posture', 'Sports & Running'];

export const PatientsSection: React.FC<PatientsSectionProps> = ({ clinic }) => {
  const [selectedFilter, setSelectedFilter] = useState('All Outcomes');
  const list = clinic?.customTestimonials || testimonials;

  const filteredList = list.filter((item) => {
    if (selectedFilter === 'All Outcomes') return true;
    if (selectedFilter === 'Lower Back & Disc') return item.condition?.toLowerCase().includes('back') || item.condition?.toLowerCase().includes('sciatica') || item.condition?.toLowerCase().includes('disc');
    if (selectedFilter === 'Desk & Neck Posture') return item.condition?.toLowerCase().includes('neck') || item.condition?.toLowerCase().includes('posture') || item.condition?.toLowerCase().includes('desk') || item.condition?.toLowerCase().includes('headache');
    if (selectedFilter === 'Sports & Running') return item.condition?.toLowerCase().includes('sport') || item.condition?.toLowerCase().includes('tennis') || item.condition?.toLowerCase().includes('athlet') || item.condition?.toLowerCase().includes('run');
    return true;
  });

  return (
    <section id="results" className="py-16 md:py-24 bg-stone-900 text-stone-100 overflow-hidden relative">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-950/40 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800/80 px-3 py-1 rounded-md inline-block mb-3">
              {clinic?.patientsSectionSubtitle || "Verified Outcomes"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
              {clinic?.patientsSectionTitle || "Real Patient Case Studies"}
            </h2>
          </div>
          
          {/* Filter Bar */}
          <div className="flex gap-1.5 p-1 bg-stone-800/90 rounded-xl border border-stone-700/80 overflow-x-auto no-scrollbar max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured In-Depth Case Study (Michael / Athlete) */}
        <div className="bg-stone-850 rounded-3xl border border-stone-800 p-6 sm:p-10 mb-12 shadow-xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square border border-stone-700 bg-stone-800">
                <img
                  src={clinic?.patientImage || featuredStory.image}
                  alt={`${clinic?.patientStoryName || featuredStory.patientName} recovery story`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-900/90 text-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border border-emerald-500/30">
                  Featured Case Study
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="font-bold text-white text-sm">
                  {clinic?.patientStoryName || featuredStory.patientName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{clinic?.patientStoryRole || "Tennis Player & Architect"}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Full Recovery in 4 Weeks</span>
              </div>

              <blockquote className="text-xl sm:text-2xl font-serif italic text-stone-100 leading-snug">
                "{clinic?.patientStoryQuote ||
                  "I was told I might need spinal injections. Within three weeks of Dr. Vance’s protocol, the sharp nerve radiating down my leg was gone. I'm back on court twice a week."}"
              </blockquote>

              <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800 text-xs">
                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Presenting Issue:</div>
                  <div className="font-bold text-stone-200 mt-0.5">Acute L5-S1 Sciatica</div>
                </div>
                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Treatment Protocol:</div>
                  <div className="font-bold text-stone-200 mt-0.5">Decompression + Rehab</div>
                </div>
                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
                  <div className="text-stone-400 text-[11px]">Final Status:</div>
                  <div className="font-bold text-emerald-400 mt-0.5">100% Pain-Free & Discharged</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredList.slice(0, 3).map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 sm:p-7 rounded-2xl bg-stone-850 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-200 text-sm font-serif italic leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{item.author}</span>
                {item.condition && (
                  <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
