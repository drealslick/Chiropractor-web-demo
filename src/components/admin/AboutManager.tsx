import React, { useState } from 'react';
import {
  User,
  Heart,
  Image as ImageIcon,
  BookOpen,
  Award,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Eye,
  Sparkles,
  Search,
  Shield,
  Activity,
  Compass,
  CheckCircle2,
  Quote,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { ClinicInfo, AboutPhilosophyPillar, AboutGalleryImage, AboutAssociation } from '../../types';
import {
  defaultPhilosophyPillars,
  defaultAboutGallery,
  defaultAboutAssociations,
  defaultAboutJourney,
} from '../../data/defaultAboutData';
import { doctorImg } from '../../data/clinicData';

interface AboutManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const AboutManager: React.FC<AboutManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Safe Fallback Lists
  const pillars: AboutPhilosophyPillar[] =
    clinic.aboutPhilosophyPillars && clinic.aboutPhilosophyPillars.length > 0
      ? clinic.aboutPhilosophyPillars
      : defaultPhilosophyPillars;

  const gallery: AboutGalleryImage[] =
    clinic.aboutGallery && clinic.aboutGallery.length > 0
      ? clinic.aboutGallery
      : defaultAboutGallery;

  const associations: AboutAssociation[] =
    clinic.aboutAssociations && clinic.aboutAssociations.length > 0
      ? clinic.aboutAssociations
      : defaultAboutAssociations;

  // 1. Philosophy Handlers
  const handleAddPillar = () => {
    if (pillars.length >= 6) {
      showNotification('Maximum 6 philosophy pillars recommended.');
      return;
    }
    const newPillar: AboutPhilosophyPillar = {
      id: `phil_${Date.now()}`,
      icon: 'sparkles',
      title: 'Evidence-Based Biomechanics',
      description: 'Transparent clinical care grounded in peer-reviewed orthopedic and neurological research.',
    };
    const next = [...pillars, newPillar];
    onUpdateClinic({ ...clinic, aboutPhilosophyPillars: next });
    showNotification('New philosophy pillar added.');
  };

  const handleUpdatePillar = (index: number, partial: Partial<AboutPhilosophyPillar>) => {
    const next = [...pillars];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, aboutPhilosophyPillars: next });
  };

  const handleMovePillar = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pillars.length) return;
    const copy = [...pillars];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, aboutPhilosophyPillars: copy });
  };

  const handleDeletePillar = (index: number) => {
    if (window.confirm('Delete this philosophy pillar?')) {
      const next = pillars.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, aboutPhilosophyPillars: next });
      showNotification('Philosophy pillar removed.');
    }
  };

  // 2. Gallery Handlers
  const handleAddGalleryImage = () => {
    const newImg: AboutGalleryImage = {
      id: `gal_${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200',
      caption: 'Diagnostic Motion Suite: State-of-the-art postural analysis and digital kinematics.',
      alt: 'Chiropractic diagnostic equipment',
      tag: 'Facilities',
    };
    const next = [...gallery, newImg];
    onUpdateClinic({ ...clinic, aboutGallery: next });
    showNotification('Gallery image added.');
  };

  const handleUpdateGalleryImage = (index: number, partial: Partial<AboutGalleryImage>) => {
    const next = [...gallery];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, aboutGallery: next });
  };

  const handleMoveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= gallery.length) return;
    const copy = [...gallery];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, aboutGallery: copy });
  };

  const handleDeleteGalleryImage = (index: number) => {
    if (window.confirm('Remove this photo from the clinic gallery?')) {
      const next = gallery.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, aboutGallery: next });
      showNotification('Image removed.');
    }
  };

  // 3. Associations Handlers
  const handleAddAssociation = () => {
    const newAssoc: AboutAssociation = {
      id: `assoc_${Date.now()}`,
      name: 'Professional Chiropractic Association',
      abbreviation: 'PCA Member',
      role: 'Clinical Practice Accreditation',
      verified: true,
    };
    const next = [...associations, newAssoc];
    onUpdateClinic({ ...clinic, aboutAssociations: next });
    showNotification('Association added.');
  };

  const handleUpdateAssociation = (index: number, partial: Partial<AboutAssociation>) => {
    const next = [...associations];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, aboutAssociations: next });
  };

  const handleDeleteAssociation = (index: number) => {
    const next = associations.filter((_, i) => i !== index);
    onUpdateClinic({ ...clinic, aboutAssociations: next });
    showNotification('Association removed.');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all About Page content back to default clinical curriculum?')) {
      onUpdateClinic({
        ...clinic,
        aboutPhilosophyPillars: defaultPhilosophyPillars,
        aboutGallery: defaultAboutGallery,
        aboutAssociations: defaultAboutAssociations,
        aboutJourneyParagraph1: defaultAboutJourney.paragraph1,
        aboutJourneyParagraph2: defaultAboutJourney.paragraph2,
        aboutJourneyParagraph3: defaultAboutJourney.paragraph3,
        aboutDoctorQuote: defaultAboutJourney.quote,
      });
      showNotification('About page reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Page Architecture</span>
          </div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>About Page Editor (/about)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure the lead doctor profile, personal pull quote, 4 philosophy pillars, founding journey story, and clinic sanctuary gallery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Live Page</span>
          </a>
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DOCTOR PROFILE BUILDER (SPLIT HERO) */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Doctor Profile & Split-Screen Hero
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Controls the top split-screen layout: doctor portrait on the left, clinical bio & personal pull quote on the right.
            </p>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Dynamic Doctor Swap</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Lead Practitioner Name
            </label>
            <input
              type="text"
              value={clinic.doctorName || ''}
              placeholder="Dr. Alistair Vance"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Credentials & Post-Nominals
            </label>
            <input
              type="text"
              value={clinic.doctorCredentials || ''}
              placeholder="D.C., CCSP, MSc (Sports Biomechanics)"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorCredentials: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Clinical Title / Subtitle Badge
            </label>
            <input
              type="text"
              value={clinic.doctorTitle || ''}
              placeholder="Lead Practitioner & Biomechanist"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Professional Headshot Photo URL
            </label>
            <input
              type="text"
              value={clinic.doctorImage || ''}
              placeholder="Leave blank to use default portrait"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorImage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Doctor Personal Pull Quote */}
        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-emerald-400" />
            <span>Doctor's Personal Pull Quote (Builds Instant Trust)</span>
          </label>
          <textarea
            rows={2}
            value={clinic.aboutDoctorQuote || clinic.doctorQuote || ''}
            placeholder='e.g. "I built this practice because I was tired of seeing injured people treated like numbers on an assembly line."'
            onChange={(e) => {
              const val = e.target.value;
              onUpdateClinic({ ...clinic, aboutDoctorQuote: val, doctorQuote: val });
            }}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Displayed prominently in an editorial pull-quote block directly beside the doctor's bio.
          </p>
        </div>

        {/* Biography Paragraph */}
        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1">
            Doctor Clinical Bio & Philosophy Overview
          </label>
          <textarea
            rows={3}
            value={
              clinic.aboutDoctorBio ||
              clinic.aboutApproach ||
              `Specializing in complex spine kinematics, disc decompression, and athletic rehabilitation. With over ${clinic.doctorYears || '12'} years of clinical practice in ${clinic.cityState || clinic.city || 'central London'}, Dr. Vance works with patients seeking root-cause answers rather than temporary symptom management.`
            }
            placeholder="Detailed clinical biography..."
            onChange={(e) => onUpdateClinic({ ...clinic, aboutDoctorBio: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Education & Clinical Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Education & Degrees
            </label>
            <input
              type="text"
              value={clinic.aboutDoctorEducation || clinic.aboutEducation || ''}
              placeholder="Doctor of Chiropractic (D.C.), MSc Sports Medicine"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutDoctorEducation: e.target.value, aboutEducation: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Primary Clinical Specialty
            </label>
            <input
              type="text"
              value={clinic.aboutDoctorSpecialty || 'Spinal Biomechanics & Disc Decompression'}
              placeholder="Spinal Biomechanics & Disc Decompression"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutDoctorSpecialty: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CREDENTIALS & ASSOCIATIONS SECTION */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> 2. Credentials & Professional Associations ({associations.length})
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Displays clinical trust badges (e.g. GCC, British Chiropractic Association, Royal College) beneath the doctor bio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAssociation}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Association</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {associations.map((assoc, idx) => (
            <div
              key={assoc.id || idx}
              className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                  #{idx + 1} {assoc.abbreviation || 'Badge'}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteAssociation(idx)}
                  className="p-1 text-stone-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                value={assoc.name}
                placeholder="Association Name (e.g. General Chiropractic Council)"
                onChange={(e) => handleUpdateAssociation(idx, { name: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={assoc.abbreviation}
                  placeholder="Badge Tag (e.g. GCC Registered)"
                  onChange={(e) => handleUpdateAssociation(idx, { abbreviation: e.target.value })}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-[11px] font-mono focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={assoc.role || ''}
                  placeholder="Role / Reg Details"
                  onChange={(e) => handleUpdateAssociation(idx, { role: e.target.value })}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: THE PHILOSOPHY BUILDER (DYNAMIC 4-PILLAR GRID) */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> 3. Practice Philosophy ({pillars.length} Pillars)
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Replaces empty boxes with a responsive visual grid with icons, headings, and clinical standards.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddPillar}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pillar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Philosophy Section Subtitle
            </label>
            <input
              type="text"
              value={clinic.aboutPhilosophySubtitle || 'Our Clinical Standard'}
              placeholder="Our Clinical Standard"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutPhilosophySubtitle: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">
              Philosophy Section Title
            </label>
            <input
              type="text"
              value={clinic.aboutPhilosophyTitle || 'The Four Tenets of Our Care'}
              placeholder="The Four Tenets of Our Care"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutPhilosophyTitle: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {pillars.map((pillar, idx) => (
            <div
              key={pillar.id || idx}
              className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2 hover:border-stone-750 transition"
            >
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-200">
                    {pillar.title || 'Untitled Pillar'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMovePillar(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePillar(idx, 'down')}
                    disabled={idx === pillars.length - 1}
                    title="Move Down"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePillar(idx)}
                    title="Delete Pillar"
                    className="p-1 rounded bg-stone-850 hover:bg-red-950 text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Icon Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                    Pillar Title
                  </label>
                  <input
                    type="text"
                    value={pillar.title}
                    placeholder="e.g. Diagnostic Rigor First"
                    onChange={(e) => handleUpdatePillar(idx, { title: e.target.value })}
                    className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                    Icon Preset
                  </label>
                  <select
                    value={pillar.icon || 'search'}
                    onChange={(e) => handleUpdatePillar(idx, { icon: e.target.value })}
                    className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="search">🔍 Magnifying Glass (Diagnosis)</option>
                    <option value="heart">❤️ Heart (Unhurried Care)</option>
                    <option value="shield">🛡️ Shield (Zero Pressure)</option>
                    <option value="activity">⚡ Activity (Active Rehab)</option>
                    <option value="compass">🧭 Compass (Direction)</option>
                    <option value="sparkles">✨ Sparkles (Excellence)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-0.5">
                  Explanation Paragraph
                </label>
                <textarea
                  rows={2}
                  value={pillar.description}
                  placeholder="Explain this practice standard to prospective patients..."
                  onChange={(e) => handleUpdatePillar(idx, { description: e.target.value })}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: "THE JOURNEY" STORY BUILDER (EDITORIAL DROP CAP) */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> 4. "The Journey" Editorial Narrative (With Drop-Cap)
          </h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Tells the clinic's authentic founding story: who you are, why you started this, and why it's different.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Journey Subtitle Eyebrow
            </label>
            <input
              type="text"
              value={clinic.aboutJourneySubtitle || defaultAboutJourney.subtitle}
              placeholder="Our Founding Story"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutJourneySubtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Journey Section Headline
            </label>
            <input
              type="text"
              value={clinic.aboutJourneyTitle || defaultAboutJourney.title}
              placeholder="The Journey Behind Vance Health"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutJourneyTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center justify-between">
              <span>Paragraph 1: The Disconnect (Styled with Large Editorial Drop-Cap)</span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal">
                Features classic drop-cap styling
              </span>
            </label>
            <textarea
              rows={3}
              value={clinic.aboutJourneyParagraph1 || defaultAboutJourney.paragraph1}
              placeholder="Describe the state of the industry when you started..."
              onChange={(e) => onUpdateClinic({ ...clinic, aboutJourneyParagraph1: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Paragraph 2: The Founding Decision & Vision
            </label>
            <textarea
              rows={3}
              value={clinic.aboutJourneyParagraph2 || defaultAboutJourney.paragraph2}
              placeholder="Describe what prompted you to start this private clinic..."
              onChange={(e) => onUpdateClinic({ ...clinic, aboutJourneyParagraph2: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Paragraph 3: Where the Practice Stands Today
            </label>
            <textarea
              rows={3}
              value={clinic.aboutJourneyParagraph3 || defaultAboutJourney.paragraph3}
              placeholder="Describe how your clinic operates today..."
              onChange={(e) => onUpdateClinic({ ...clinic, aboutJourneyParagraph3: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: "THE CLINIC" SANCTUARY GALLERY BUILDER */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> 5. "The Clinic Sanctuary" Gallery ({gallery.length} Images)
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Pairs a dark contrast architectural headline with a 3-image narrative grid: Reception, Treatment Suite, and Movement Lab.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddGalleryImage}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Sanctuary Headline
            </label>
            <input
              type="text"
              value={clinic.aboutSanctuaryTitle || 'A Sanctuary Designed for Healing'}
              placeholder="A Sanctuary Designed for Healing"
              onChange={(e) => onUpdateClinic({ ...clinic, aboutSanctuaryTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Sanctuary Narrative Subtext
            </label>
            <input
              type="text"
              value={
                clinic.aboutSanctuaryDescription ||
                'Every detail of our practice—from acoustic privacy to natural daylight—was engineered to reduce neurological stress and promote tissue recovery.'
              }
              placeholder="Sanctuary narrative subtext..."
              onChange={(e) => onUpdateClinic({ ...clinic, aboutSanctuaryDescription: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {gallery.map((img, idx) => (
            <div
              key={img.id || idx}
              className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row gap-3 items-start"
            >
              {/* Thumbnail */}
              <div className="w-24 h-20 rounded-lg overflow-hidden border border-stone-750 shrink-0 bg-stone-950">
                <img
                  src={img.url}
                  alt={img.alt || 'Clinic gallery'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={img.tag || ''}
                      placeholder="Tag (e.g. Treatment Suite)"
                      onChange={(e) => handleUpdateGalleryImage(idx, { tag: e.target.value })}
                      className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveGalleryImage(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveGalleryImage(idx, 'down')}
                      disabled={idx === gallery.length - 1}
                      title="Move Down"
                      className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(idx)}
                      title="Delete Photo"
                      className="p-1 rounded bg-stone-850 hover:bg-red-950 text-stone-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={img.url}
                  placeholder="Image URL"
                  onChange={(e) => handleUpdateGalleryImage(idx, { url: e.target.value })}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="text"
                  value={img.caption}
                  placeholder="Photo caption..."
                  onChange={(e) => handleUpdateGalleryImage(idx, { caption: e.target.value })}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
