import React from 'react';
import {
  Activity,
  Zap,
  Sparkles,
  Shield,
  Layers,
  Heart,
  ChevronRight,
  Flame,
  UserCheck,
} from 'lucide-react';

export type ConditionIconType =
  | 'spine'
  | 'lumbar'
  | 'neck'
  | 'cervical'
  | 'sports'
  | 'mobility'
  | 'headache'
  | 'nerve'
  | 'general';

interface ConditionIconBadgeProps {
  type?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ConditionIconBadge: React.FC<ConditionIconBadgeProps> = ({
  type = 'spine',
  size = 'md',
  className = '',
}) => {
  const norm = (type || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg p-1.5',
    md: 'w-11 h-11 rounded-xl p-2.5',
    lg: 'w-14 h-14 rounded-2xl p-3',
    xl: 'w-16 h-16 rounded-2xl p-3.5',
  }[size];

  // Specific Anatomical Vectors
  if (norm.includes('neck') || norm.includes('cervical') || norm === 'cervical') {
    return (
      <div
        className={`bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
        title="Cervical Spine & Neck Anatomy"
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          {/* Stylized Cervical Column C1-C7 */}
          <ellipse cx="16" cy="7" rx="5" ry="3" />
          <path d="M12 10c0 1.5 1.8 2.5 4 2.5s4-1 4-2.5" />
          <path d="M11 14c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5" />
          <path d="M10 18c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5" />
          <path d="M9 22c0 1.5 3.1 2.5 7 2.5s7-1 7-2.5" />
          <path d="M6 26c2-1.5 6-2 10-2s8 .5 10 2" strokeDasharray="1.5 1.5" />
          <circle cx="16" cy="7" r="1.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (norm.includes('back') || norm.includes('lumbar') || norm.includes('sciatica') || norm === 'spine') {
    return (
      <div
        className={`bg-stone-900 border border-stone-800 text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
        title="Lumbar Spine & Sacrum Anatomy"
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          {/* Vertebrae Blocks L1-L5 with Discs */}
          <rect x="11" y="4" width="10" height="3.5" rx="1.5" fill="currentColor" fillOpacity="0.2" />
          <line x1="16" y1="7.5" x2="16" y2="9" />
          <rect x="10.5" y="9" width="11" height="4" rx="1.5" fill="currentColor" fillOpacity="0.25" />
          <line x1="16" y1="13" x2="16" y2="14.5" />
          <rect x="10" y="14.5" width="12" height="4.5" rx="1.5" fill="currentColor" fillOpacity="0.3" />
          <line x1="16" y1="19" x2="16" y2="20.5" />
          <rect x="9.5" y="20.5" width="13" height="4.5" rx="1.5" fill="currentColor" fillOpacity="0.35" />
          {/* Sacral base */}
          <path d="M11 26l5 4 5-4" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  if (norm.includes('sport') || norm.includes('athletic') || norm.includes('knee')) {
    return (
      <div
        className={`bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
        title="Sports Biomechanics & Kinetic Joint"
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.2" />
          <path d="M8 8l5 5" />
          <path d="M24 24l-5-5" />
          <path d="M24 8l-5 5" />
          <path d="M8 24l5-5" />
          <circle cx="16" cy="16" r="8" strokeDasharray="2 2" />
        </svg>
      </div>
    );
  }

  if (norm.includes('mobility') || norm.includes('stiff') || norm.includes('posture')) {
    return (
      <div
        className={`bg-teal-50 border border-teal-200/80 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
        title="Spinal Mobility & Articulation"
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          <path d="M16 4v24" strokeDasharray="1.5 2" />
          <path d="M10 8c4-2 8 2 12 0" />
          <path d="M9 14c5-3 9 3 14 0" />
          <path d="M8 20c6-3 10 3 16 0" />
          <path d="M11 26c3-1.5 7 1.5 10 0" />
          <circle cx="16" cy="14" r="2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (norm.includes('head') || norm.includes('tension') || norm.includes('migraine')) {
    return (
      <div
        className={`bg-indigo-50 border border-indigo-200/80 text-indigo-800 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
        title="Cranio-Cervical & Tension Referral"
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          <circle cx="16" cy="14" r="8" />
          <path d="M14 22v4m4-4v4" />
          {/* Tension radiation lines */}
          <path d="M6 10l-2-2m22 2l2-2" />
          <path d="M16 3V1" />
          <path d="M12 12h8" strokeWidth="1.5" />
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  // Fallback Clean Spine Icon
  return (
    <div
      className={`bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs ${sizeClasses} ${className}`}
    >
      <Activity className="w-5 h-5 text-emerald-700" />
    </div>
  );
};

interface ConditionAnatomyDiagramProps {
  conditionTitle: string;
  conditionIcon?: string;
  className?: string;
}

export const ConditionAnatomyDiagram: React.FC<ConditionAnatomyDiagramProps> = ({
  conditionTitle,
  conditionIcon = 'spine',
  className = '',
}) => {
  const norm = (conditionTitle + ' ' + conditionIcon).toLowerCase();

  let region = 'Lumbar & Sacral Spine';
  let targetArea = 'L1 - L5 Vertebrae & Sciatic Nerve Origin';
  let clinicalMechanics = 'Intervertebral disc decompression & lumbar facet mobility';

  if (norm.includes('neck') || norm.includes('cervical') || norm.includes('shoulder')) {
    region = 'Cervical Spine & Suboccipital Complex';
    targetArea = 'C1 - C7 Vertebral Segments & Trapezius Kinetic Chain';
    clinicalMechanics = 'Restoring cervical curvature, facet joint gliding & neural foramen clearance';
  } else if (norm.includes('sport') || norm.includes('knee') || norm.includes('athletic')) {
    region = 'Lower Kinetic Chain & Biomechanical Axis';
    targetArea = 'Pelvic Girdle, Sacroiliac Joint & Articular Tendons';
    clinicalMechanics = 'Dynamic loading balance, myofascial release & joint stabilization';
  } else if (norm.includes('mobility') || norm.includes('stiff')) {
    region = 'Full Spinal Articulation & Pelvic Alignment';
    targetArea = 'Thoracolumbar Junction & Bilateral SI Joints';
    clinicalMechanics = 'Multi-segmental decompression, spinal rotational release & postural realignment';
  } else if (norm.includes('head') || norm.includes('tension') || norm.includes('migraine')) {
    region = 'Upper Cervical & Cranio-Vertebral Junction';
    targetArea = 'C1 Atlas, C2 Axis & Suboccipital Nerve Triad';
    clinicalMechanics = 'Atlas-axis alignment, relieving trigeminocervical irritation & occipital tension';
  }

  return (
    <div className={`p-6 sm:p-7 bg-stone-900 text-white rounded-3xl border border-stone-800 shadow-lg relative overflow-hidden ${className}`}>
      {/* Background Subtle Medical Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Clinical Specifications */}
        <div className="space-y-3.5 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CLINICAL ANATOMY TARGET</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {region}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider mb-1">
                Primary Anatomical Site
              </span>
              <span className="text-stone-200 font-semibold">{targetArea}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-850 border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider mb-1">
                Biomechanical Goal
              </span>
              <span className="text-emerald-300 font-semibold">{clinicalMechanics}</span>
            </div>
          </div>
        </div>

        {/* Right High-Fidelity Anatomical Spine Vector */}
        <div className="w-full md:w-56 h-48 bg-stone-950/80 border border-stone-800/80 rounded-2xl flex items-center justify-center p-4 relative shrink-0">
          <svg viewBox="0 0 100 160" className="w-full h-full text-emerald-400" fill="none">
            {/* Spinal Column Silhouette */}
            <path
              d="M50 15 C50 30, 48 45, 52 65 C55 85, 46 110, 50 145"
              stroke="#34d399"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 3"
              className="opacity-70"
            />

            {/* Cervical Section C1-C7 */}
            <g className={norm.includes('neck') || norm.includes('head') ? 'opacity-100' : 'opacity-40'}>
              <ellipse cx="50" cy="20" rx="9" ry="3.5" stroke="#10b981" strokeWidth="1.5" fill="#064e3b" />
              <ellipse cx="50" cy="28" rx="10" ry="3.5" stroke="#10b981" strokeWidth="1.5" fill="#064e3b" />
              <ellipse cx="50" cy="36" rx="11" ry="4" stroke="#10b981" strokeWidth="1.5" fill="#064e3b" />
              {(norm.includes('neck') || norm.includes('head')) && (
                <circle cx="50" cy="28" r="14" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
              )}
            </g>

            {/* Thoracic Section T1-T12 */}
            <g className={norm.includes('mobility') ? 'opacity-100' : 'opacity-35'}>
              <ellipse cx="50" cy="50" rx="13" ry="4" stroke="#6ee7b7" strokeWidth="1.5" />
              <ellipse cx="51" cy="60" rx="14" ry="4.5" stroke="#6ee7b7" strokeWidth="1.5" />
              <ellipse cx="51" cy="71" rx="15" ry="4.5" stroke="#6ee7b7" strokeWidth="1.5" />
              <ellipse cx="50" cy="82" rx="15" ry="4.5" stroke="#6ee7b7" strokeWidth="1.5" />
            </g>

            {/* Lumbar Section L1-L5 */}
            <g className={norm.includes('back') || norm.includes('lumbar') || norm.includes('sciatica') || norm.includes('sport') ? 'opacity-100' : 'opacity-40'}>
              <rect x="33" y="94" width="34" height="9" rx="3" stroke="#10b981" strokeWidth="2" fill="#064e3b" />
              <rect x="32" y="106" width="36" height="9.5" rx="3" stroke="#10b981" strokeWidth="2" fill="#064e3b" />
              <rect x="31" y="118" width="38" height="10" rx="3.5" stroke="#34d399" strokeWidth="2.5" fill="#047857" />
              {/* Highlight Ring for L4/L5 & Sciatic Nerve */}
              <circle cx="50" cy="115" r="18" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* Sacrum & Pelvic Base */}
            <path
              d="M34 133 L50 152 L66 133 Z"
              stroke="#10b981"
              strokeWidth="2"
              fill="#064e3b"
              fillOpacity="0.7"
            />
          </svg>

          {/* Interactive target ping indicator */}
          <div className="absolute bottom-3 right-3 text-[10px] text-emerald-400 font-mono bg-stone-900/90 px-2 py-0.5 rounded border border-emerald-500/30">
            Target Focus Active
          </div>
        </div>
      </div>
    </div>
  );
};
