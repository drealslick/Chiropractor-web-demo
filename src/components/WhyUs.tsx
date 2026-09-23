import React from 'react';
import { UserCheck, Stethoscope, Target, Check, X, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface WhyUsProps {
  clinic?: ClinicInfo;
}

export const WhyUs: React.FC<WhyUsProps> = ({ clinic }) => {
  const sectionTitle = clinic?.whyUsTitle || "A Deliberate Departure from Assembly-Line Healthcare.";
  const sectionSubtitle = clinic?.whyUsSubtitle || "The Vance Philosophy";

  const comparisonRows = [
    {
      metric: "Initial Evaluation",
      standard: "5–10 minutes rushed intake, immediate generic cracking",
      vance: "45 minutes thorough orthopedic, neurological & posture mapping",
    },
    {
      metric: "Treatment Strategy",
      standard: "Same repetitive routine for every patient regardless of diagnosis",
      vance: "Customized blend of gentle adjusting, myofascial release & active rehab",
    },
    {
      metric: "Contracts & Pricing",
      standard: "High-pressure upfront 36-visit packages & locked plans",
      vance: "Zero contracts. Transparent per-visit pricing with discharge as soon as you heal",
    },
    {
      metric: "Long-term Outcome",
      standard: "Dependent on clinic visits forever with recurring flare-ups",
      vance: "Empowered with home biomechanics & movement resilience for life",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-white border-b border-stone-200/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block mb-3">
            {sectionSubtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] [text-wrap:balance]">
            {sectionTitle}
          </h2>
          <p className="text-stone-600 text-base sm:text-lg mt-4 leading-relaxed">
            Most patients arrive after months of temporary fixes. We built our practice on a simple standard: listen deeply, diagnose accurately, and treat you like family.
          </p>
        </div>

        {/* Editorial Comparison Table */}
        <div className="rounded-3xl border border-stone-200 overflow-hidden bg-stone-50 shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-stone-200 bg-stone-100/90 font-bold text-xs uppercase tracking-wider text-stone-700">
            <div className="p-4 md:col-span-4 text-stone-500">Care Dimension</div>
            <div className="p-4 md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 text-stone-500 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-500" /> Typical High-Volume Clinic
            </div>
            <div className="p-4 md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 text-emerald-900 bg-emerald-100/60 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-700" /> {clinic?.name || 'Our Practice Protocol'}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-stone-200">
            {comparisonRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 text-xs sm:text-sm transition-colors hover:bg-white">
                <div className="p-4 sm:p-5 md:col-span-4 font-semibold text-stone-900 flex items-center bg-stone-50/50">
                  {row.metric}
                </div>
                <div className="p-4 sm:p-5 md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 text-stone-500 flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span>{row.standard}</span>
                </div>
                <div className="p-4 sm:p-5 md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 text-stone-900 font-medium bg-emerald-50/30 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{row.vance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Proof Badges Below Table */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <Clock className="w-5 h-5 text-emerald-700 mb-2" />
            <div className="font-bold text-sm text-stone-900">45-Minute Initial Exams</div>
            <div className="text-xs text-stone-500">Every millimeter of movement evaluated before any adjustment.</div>
          </div>
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
            <div className="font-bold text-sm text-stone-900">Discharge-Focused Care</div>
            <div className="text-xs text-stone-500">Our goal is to fix the cause and graduate you from ongoing care.</div>
          </div>
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <Sparkles className="w-5 h-5 text-emerald-700 mb-2" />
            <div className="font-bold text-sm text-stone-900">Gentle & Precision Techniques</div>
            <div className="text-xs text-stone-500">Drop table, activator, and gentle manual mobilizations tailored to comfort.</div>
          </div>
        </div>

      </div>
    </section>
  );
};
