import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Stethoscope, Compass, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processSteps } from '../data/clinicData';
import { ClinicInfo } from '../types';

interface TheProcessProps {
  clinic?: ClinicInfo;
}

export const TheProcess: React.FC<TheProcessProps> = ({ clinic }) => {
  const steps = clinic?.customProcessSteps || processSteps;
  const [selectedPhase, setSelectedPhase] = useState(0);

  const phaseDetails = [
    {
      timing: "Visit 01 · 45 Minutes",
      highlight: "Comprehensive Biomechanical Mapping",
      whatHappens: [
        "In-depth consultation covering your pain history and lifestyle triggers",
        "Orthopedic, neurological, and postural movement assessments",
        "Palpation and spinal joint motion analysis (no generic cracking)",
        "Clear explanation of findings before any hands-on care",
      ],
      doctorNote: "We never guess with your spine. If we need imaging or an outside referral, we tell you immediately.",
    },
    {
      timing: "Visit 01–03 · Gentle Care",
      highlight: "Precision Realignment & Decompression",
      whatHappens: [
        "Gentle, low-force joint mobilizations tailored to your comfort",
        "Targeted myofascial release to calm protective muscular guarding",
        "Immediate post-adjustment re-testing to verify range-of-motion gains",
        "First-night home ice/heat and posture guidance",
      ],
      doctorNote: "Most patients experience significant tension release and lighter movement within the first 48 hours.",
    },
    {
      timing: "Visits 03–06 · Stabilization",
      highlight: "Kinetic Strengthening & Discharge Arc",
      whatHappens: [
        "Progression from passive relief to active core & postural stabilization",
        "Simple 3-minute daily home movement routines",
        "Ergonomic workstation and sleep posture optimization",
        "Official graduation and discharge from active treatment",
      ],
      doctorNote: "Our mission is to make you self-sufficient, not reliant on weekly appointments.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-stone-100/40 border-b border-stone-200/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block mb-3">
              {clinic?.processSectionSubtitle || "Your Care Arc"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight [text-wrap:balance]">
              {clinic?.processSectionTitle || "From First Exam to Long-Term Freedom"}
            </h2>
          </div>
          <p className="text-sm text-stone-600 max-w-md leading-relaxed">
            No endless therapy loops. Here is the step-by-step roadmap of how we diagnose, treat, and graduate your condition.
          </p>
        </div>

        {/* 3 Step Connected Stepper */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {steps.slice(0, 3).map((step, idx) => {
            const isSelected = selectedPhase === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhase(idx)}
                className={`text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg ring-1 ring-black/5'
                    : 'bg-white text-stone-800 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-2xl font-serif font-bold ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`}>
                    0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {idx === 0 ? 'Discovery' : idx === 1 ? 'Relief' : 'Graduation'}
                  </span>
                </div>
                <h3 className={`font-serif text-lg font-bold mb-1.5 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Phase Deep-Dive Drawer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded font-bold">
                  {phaseDetails[selectedPhase]?.timing}
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-2">
                  {phaseDetails[selectedPhase]?.highlight}
                </h4>
              </div>
              <div className="text-xs text-stone-400">
                Phase {selectedPhase + 1} of 3
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  What Occurs in Clinic:
                </div>
                <div className="space-y-2.5">
                  {phaseDetails[selectedPhase]?.whatHappens.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-700" /> Clinical Reassurance
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic font-serif">
                  "{phaseDetails[selectedPhase]?.doctorNote}"
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
