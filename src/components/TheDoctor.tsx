import React from 'react';
import { Quote, Award, Sparkles, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface TheDoctorProps {
  clinic: ClinicInfo;
}

export const TheDoctor: React.FC<TheDoctorProps> = ({ clinic }) => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-stone-200/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Portrait Carrier with Credential Ribbons */}
          <div className="md:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-stone-100 aspect-[3/4]">
              <img
                src={clinic.doctorImage}
                alt={`${clinic.doctorName}, Lead Chiropractor`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="p-3 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-white/10 text-left space-y-1">
                  <div className="font-bold text-sm text-emerald-400">
                    {clinic.doctorName || 'Dr. Alistair Vance'}
                  </div>
                  <div className="text-[11px] text-stone-300">
                    {clinic.doctorCredentials || 'D.C., CCSP, MSc'} · {clinic.doctorYears || '15'} Years Experience
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Trust Seal */}
            <div className="hidden sm:flex absolute -top-4 -right-4 bg-white border border-stone-200 rounded-2xl p-3 shadow-lg items-center gap-2 text-xs font-bold text-stone-900">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>Board Certified DC</span>
            </div>
          </div>

          {/* Right Column: Editorial Dialogue & Letter */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block mb-3">
                {clinic.doctorSectionSubtitle || "Clinical Leadership"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                "We treat people, not just x-rays."
              </h2>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-700 space-y-3">
              <blockquote className="text-lg sm:text-xl font-serif italic text-stone-800 leading-relaxed">
                "{clinic.doctorQuote || "Our mission is simple: get people out of acute pain and restore total movement freedom without surgery or lifetime dependency."}"
              </blockquote>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {clinic.doctorBio ||
                "After years working alongside orthopedic surgeons and physical therapists, Dr. Vance established our private practice to deliver what traditional volume clinics couldn't: unhurried, evidence-based manual care where the patient always comes first."}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Palmer & Post-Graduate Trained</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Sports Injury & Spine Specialist</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                <div className="font-serif font-bold text-base text-stone-900">{clinic.doctorName}</div>
                <div className="text-xs text-stone-500 font-mono mt-0.5">{clinic.doctorCredentials} · {clinic.cityState}</div>
              </div>
              <div className="font-serif italic text-xl text-stone-400 select-none">
                {clinic.doctorName?.split(' ')[1] || 'Vance'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
