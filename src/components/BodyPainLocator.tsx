import React, { useState } from 'react';
import { RotateCw, Check, Sparkles, Activity } from 'lucide-react';

export interface BodyRegion {
  id: string;
  name: string;
  view: 'posterior' | 'anterior';
  cx: number;
  cy: number;
  r: number;
  description: string;
}

const BODY_REGIONS: BodyRegion[] = [
  // Posterior (Back) View Regions - Chiropractic Core Focus
  { id: 'cervical', name: 'Cervical Spine (Neck)', view: 'posterior', cx: 100, cy: 58, r: 12, description: 'C1–C7 vertebrae, suboccipital tension, whiplash' },
  { id: 'left_shoulder', name: 'Left Shoulder / Trap', view: 'posterior', cx: 64, cy: 75, r: 11, description: 'Trapezius muscle knot, scapular pain' },
  { id: 'right_shoulder', name: 'Right Shoulder / Trap', view: 'posterior', cx: 136, cy: 75, r: 11, description: 'Trapezius muscle knot, scapular pain' },
  { id: 'thoracic', name: 'Thoracic Spine (Mid-Back)', view: 'posterior', cx: 100, cy: 105, r: 14, description: 'T1–T12 vertebrae, postural hunching, rib tension' },
  { id: 'lumbar', name: 'Lumbar Spine (Lower Back)', view: 'posterior', cx: 100, cy: 152, r: 15, description: 'L1–L5 vertebrae, disc compression, sciatica' },
  { id: 'sacroiliac', name: 'Sacroiliac (SI Joint & Pelvis)', view: 'posterior', cx: 100, cy: 185, r: 14, description: 'SI joint dysfunction, pelvic misalignment' },
  { id: 'left_glute', name: 'Left Glute & Hip', view: 'posterior', cx: 78, cy: 205, r: 12, description: 'Piriformis syndrome, sciatica radiation' },
  { id: 'right_glute', name: 'Right Glute & Hip', view: 'posterior', cx: 122, cy: 205, r: 12, description: 'Piriformis syndrome, sciatica radiation' },
  { id: 'left_hamstring', name: 'Left Hamstring', view: 'posterior', cx: 80, cy: 255, r: 10, description: 'Posterior leg tension, kinetic chain tightness' },
  { id: 'right_hamstring', name: 'Right Hamstring', view: 'posterior', cx: 120, cy: 255, r: 10, description: 'Posterior leg tension, kinetic chain tightness' },

  // Anterior (Front) View Regions
  { id: 'jaw_tmj', name: 'Jaw / TMJ & Facial', view: 'anterior', cx: 100, cy: 45, r: 10, description: 'Temporomandibular joint, clenching, headaches' },
  { id: 'anterior_neck', name: 'Front Neck & Throat', view: 'anterior', cx: 100, cy: 60, r: 10, description: 'Sternocleidomastoid tightness, forward head posture' },
  { id: 'chest_pectoral', name: 'Chest / Sternum', view: 'anterior', cx: 100, cy: 95, r: 13, description: 'Costochondritis, thoracic outlet, rounded shoulders' },
  { id: 'left_hip_anterior', name: 'Left Hip Flexor', view: 'anterior', cx: 78, cy: 185, r: 12, description: 'Psoas muscle tension from prolonged sitting' },
  { id: 'right_hip_anterior', name: 'Right Hip Flexor', view: 'anterior', cx: 122, cy: 185, r: 12, description: 'Psoas muscle tension from prolonged sitting' },
  { id: 'left_knee', name: 'Left Knee', view: 'anterior', cx: 80, cy: 280, r: 11, description: 'Patellar tracking, IT band syndrome' },
  { id: 'right_knee', name: 'Right Knee', view: 'anterior', cx: 120, cy: 280, r: 11, description: 'Patellar tracking, IT band syndrome' },
  { id: 'ankles_feet', name: 'Ankles & Feet', view: 'anterior', cx: 100, cy: 360, r: 12, description: 'Plantar fasciitis, gait asymmetry, pronation' },
];

interface BodyPainLocatorProps {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
  readOnly?: boolean;
}

export const BodyPainLocator: React.FC<BodyPainLocatorProps> = ({
  selectedRegions,
  onChange,
  readOnly = false,
}) => {
  const [activeView, setActiveView] = useState<'posterior' | 'anterior'>('posterior');

  const currentRegions = BODY_REGIONS.filter((r) => r.view === activeView);

  const toggleRegion = (id: string) => {
    if (readOnly) return;
    if (selectedRegions.includes(id)) {
      onChange(selectedRegions.filter((r) => r !== id));
    } else {
      onChange([...selectedRegions, id]);
    }
  };

  const getRegionName = (id: string) => {
    const found = BODY_REGIONS.find((r) => r.id === id);
    return found ? found.name : id;
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 text-white">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Interactive 2D Pain Locator
            </h4>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Click anatomical zones to map your specific pain or stiffness.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveView('posterior')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs ${
              activeView === 'posterior'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Spine & Back
          </button>
          <button
            type="button"
            onClick={() => setActiveView('anterior')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer text-xs ${
              activeView === 'anterior'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Front Body
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Anatomical Mannequin SVG */}
        <div className="md:col-span-6 flex justify-center py-2 relative">
          <div className="relative w-56 sm:w-64 aspect-[200/390]">
            <svg
              viewBox="0 0 200 390"
              className="w-full h-full drop-shadow-md select-none"
              style={{ maxHeight: '380px' }}
            >
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#292524" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>
                <radialGradient id="painGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#059669" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Stylized Human Silhouette */}
              <g fill="url(#bodyGradient)" stroke="#44403c" strokeWidth="1.5">
                {/* Head */}
                <ellipse cx="100" cy="30" rx="18" ry="22" />
                {/* Neck */}
                <path d="M 92 50 L 92 65 L 108 65 L 108 50 Z" />
                {/* Torso & Shoulders */}
                <path d="M 60 70 Q 100 62 140 70 L 148 115 L 132 175 L 126 210 L 74 210 L 68 175 L 52 115 Z" />
                {/* Arms */}
                <path d="M 52 75 L 38 140 L 32 195 L 39 198 L 48 145 L 58 85 Z" />
                <path d="M 148 75 L 162 140 L 168 195 L 161 198 L 152 145 L 142 85 Z" />
                {/* Legs */}
                <path d="M 74 210 L 70 290 L 74 370 L 88 370 L 92 290 L 96 220 Z" />
                <path d="M 126 210 L 130 290 L 126 370 L 112 370 L 108 290 L 104 220 Z" />
              </g>

              {/* Spinal Column Indication (on posterior view) */}
              {activeView === 'posterior' && (
                <g stroke="#57534e" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
                  <line x1="100" y1="52" x2="100" y2="195" />
                  {/* Vertebrae ribs */}
                  <circle cx="100" cy="65" r="2" fill="#78716c" stroke="none" />
                  <circle cx="100" cy="90" r="2.5" fill="#78716c" stroke="none" />
                  <circle cx="100" cy="115" r="2.5" fill="#78716c" stroke="none" />
                  <circle cx="100" cy="140" r="3" fill="#78716c" stroke="none" />
                  <circle cx="100" cy="165" r="3" fill="#78716c" stroke="none" />
                  <circle cx="100" cy="188" r="3.5" fill="#78716c" stroke="none" />
                </g>
              )}

              {/* Interactive Target Zones for Current View */}
              {currentRegions.map((region) => {
                const isSelected = selectedRegions.includes(region.id);
                return (
                  <g
                    key={region.id}
                    onClick={() => toggleRegion(region.id)}
                    className={readOnly ? 'cursor-default' : 'cursor-pointer group'}
                  >
                    {/* Glowing highlight ring if selected */}
                    {isSelected && (
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r={region.r + 7}
                        fill="url(#painGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Base Target Node */}
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={region.r}
                      fill={isSelected ? '#10b981' : '#292524'}
                      stroke={isSelected ? '#34d399' : '#78716c'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                      className="transition-all duration-200 group-hover:scale-110 origin-center"
                      style={{ transformOrigin: `${region.cx}px ${region.cy}px` }}
                    />

                    {/* Central Icon / Dot */}
                    {isSelected ? (
                      <circle cx={region.cx} cy={region.cy} r={3.5} fill="#ffffff" />
                    ) : (
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r={2.5}
                        fill="#a8a29e"
                        className="group-hover:fill-emerald-400 transition"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Region List & Selected Summary */}
        <div className="md:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {activeView === 'posterior' ? 'Spinal & Posterior Zones' : 'Anterior & Extremity Zones'}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {selectedRegions.length} selected
            </span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {currentRegions.map((region) => {
              const isSelected = selectedRegions.includes(region.id);
              return (
                <button
                  key={region.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleRegion(region.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs'
                      : 'bg-stone-950/40 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="pr-2">
                    <p className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-stone-200'}`}>
                      {region.name}
                    </p>
                    <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                      {region.description}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-700 bg-stone-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Clear or Presets */}
          {!readOnly && selectedRegions.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <span className="text-[11px] text-stone-400">
                Mapped: {selectedRegions.map(getRegionName).join(', ')}
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer shrink-0 ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
