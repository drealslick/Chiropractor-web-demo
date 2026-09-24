import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';
import { ConditionIconBadge } from '../components/ConditionVisual';
import {
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { usePageMeta } from '../data/usePageMeta';

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Conditions() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  usePageMeta(
    clinic.conditionsTitle || 'Conditions We Treat',
    clinic.conditionsSubtitle || 'Evidence-based chiropractic protocols for mechanical and musculoskeletal pain.'
  );

  const extra = clinic as typeof clinic & { conditionsIntro?: string };
  const list = clinic.customConditions?.length ? clinic.customConditions : conditionsData;

  return (
    <div className="min-h-screen bg-stone-50/60 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-14">
        {/* Header Section with Editorial Typography */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{clinic.conditionsSubtitle || 'Targeted Clinical Care'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {clinic.conditionsTitle || 'Conditions We Treat'}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-2xl mx-auto">
            {extra.conditionsIntro ||
              `${clinic.name} focuses on isolating the true mechanical restrictions, postural compensations, and nerve entrapments behind your symptoms.`}
          </p>
        </section>

        {/* 2-Column Responsive Grid on Desktop */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {list.map((item, i) => {
            const rawSlug = item.slug || slugify(item.title || item.id || `condition-${i}`);
            const symptoms = item.symptoms || [];

            return (
              <Link
                key={item.id || rawSlug}
                to={`/conditions/${rawSlug}`}
                className="group relative flex flex-col justify-between p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500/20"
              >
                <div className="space-y-4">
                  {/* Top Row: Anatomical Icon Badge + Condition Title */}
                  <div className="flex items-start gap-4">
                    <ConditionIconBadge
                      type={item.icon || item.title}
                      size="md"
                      className="group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition-colors tracking-tight">
                          {item.title}
                        </h2>
                        <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 tracking-wide uppercase">
                        Evidence-Based Protocol
                      </span>
                    </div>
                  </div>

                  {/* Condition Short Description */}
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>

                  {/* Common Symptoms / Signs List Highlights */}
                  {symptoms.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                        Common Presentation Signs
                      </span>
                      <ul className="space-y-1.5">
                        {symptoms.slice(0, 3).map((sym, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-start gap-2 text-xs sm:text-sm text-stone-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
                    <span>View Treatment Protocol</span>
                    <span className="text-emerald-500 font-normal">→</span>
                  </span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    45-min Clinical Exam
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Enhanced "Not Sure?" CTA Section with Pop & Medical Graphic */}
        <section className="relative overflow-hidden p-8 sm:p-10 bg-stone-900 text-white rounded-3xl border border-stone-800 shadow-xl">
          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #34d399 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Diagnostic Discovery</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  Not sure which condition applies?
                </h3>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  You don't need to self-diagnose before arriving. We evaluate your entire kinetic chain and spinal biomechanics during your comprehensive consultation before recommending any care.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openBookingModal('Diagnostic Consultation')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-center"
              >
                Schedule Diagnostic Exam
              </button>
              <Link
                to="/first-visit"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-sm transition text-center"
              >
                First Visit Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
