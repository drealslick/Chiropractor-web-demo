import React, { useState, useRef } from 'react';
import { X, Download, Upload, Copy, Check, RotateCcw, Sparkles, Building2, User, Phone, MapPin, Tag, Image as ImageIcon, FileCode, CheckCircle2, ChevronRight, Eye, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo } from '../types';
import { defaultClinic, alternativeOffers } from '../data/clinicData';
import { colorPalettes, ColorPaletteId } from '../data/colorPalettes';

interface ClientManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
}

// Sample presets for quick agency demoing / testing
const agencyPresets: { name: string; city: string; data: Partial<ClinicInfo> }[] = [
  {
    name: "Apex Spine & Sports Injury",
    city: "Austin, TX",
    data: {
      name: "Apex Spine & Sports Injury",
      city: "Austin",
      state: "TX",
      cityState: "Austin, TX",
      address: "1040 S Lamar Blvd, Suite 200",
      zip: "78704",
      phone: "(512) 555-0199",
      phoneRaw: "5125550199",
      hoursWeekday: "Mon–Thu: 8:00 AM – 6:00 PM, Fri: 8:00 AM – 2:00 PM",
      hoursSaturday: "Sat: By appointment only",
      parkingNote: "Dedicated patient parking spots in the rear lot.",
      doctorName: "Dr. Sarah Jenkins",
      doctorCredentials: "D.C., DACBSP",
      doctorYears: "12",
      doctorQuote: "Our mission is simple: get athletes and active professionals out of acute pain and back to peak performance without surgery.",
      offerHeadline: "New Patients: $39 Spinal Exam & Adjustment",
      offerSubtext: "Includes orthopedic exam & personalized treatment plan.",
      offerCtaText: "CLAIM $39 SPECIAL →",
      colorPalette: "modern-minimal",
    }
  },
  {
    name: "Denver Family Chiropractic",
    city: "Denver, CO",
    data: {
      name: "Denver Family Chiropractic",
      city: "Denver",
      state: "CO",
      cityState: "Denver, CO",
      address: "1850 Logan St",
      zip: "80203",
      phone: "(303) 555-0144",
      phoneRaw: "3035550144",
      hoursWeekday: "Mon–Fri: 8:30 AM – 5:30 PM",
      hoursSaturday: "Closed on weekends",
      parkingNote: "Metered street parking and validation for 18th Ave garage.",
      doctorName: "Dr. Elena Rostova",
      doctorCredentials: "D.C., CACCP (Prenatal & Pediatric)",
      doctorYears: "18",
      doctorQuote: "Gentle, non-invasive chiropractic care allows your nervous system to self-heal and stay resilient through every phase of life.",
      offerHeadline: "Complimentary 15-Minute Consultation",
      offerSubtext: "Speak directly with Dr. Rostova before your first appointment.",
      offerCtaText: "BOOK FREE CONSULT →",
      colorPalette: "warm-earth",
    }
  },
  {
    name: "Pacific Coast Health & Spine",
    city: "San Diego, CA",
    data: {
      name: "Pacific Coast Health & Spine",
      city: "San Diego",
      state: "CA",
      cityState: "San Diego, CA",
      address: "4250 Pacific Hwy, Suite 108",
      zip: "92110",
      phone: "(619) 555-0182",
      phoneRaw: "6195550182",
      hoursWeekday: "Mon–Fri: 9:00 AM – 6:30 PM",
      hoursSaturday: "Sat: 9:00 AM – 1:00 PM",
      parkingNote: "Free garage parking on premises with building security.",
      doctorName: "Dr. Tyler Hayes",
      doctorCredentials: "D.C., CCSP, CSCS",
      doctorYears: "10",
      doctorQuote: "We blend modern spinal adjustments with functional movement rehab so your pain relief actually lasts.",
      offerHeadline: "New Patient Special: $49 Exam & Deep Tissue Release",
      offerSubtext: "First 20 patients this month only.",
      offerCtaText: "CLAIM YOUR SPOT →",
      colorPalette: "professional-blue",
    }
  }
];

export const ClientManagerDrawer: React.FC<ClientManagerDrawerProps> = ({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault
}) => {
  const [activeTab, setActiveTab] = useState<'palettes' | 'form' | 'json' | 'presets'>('palettes');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPaletteId = (clinic.colorPalette as ColorPaletteId) || 'emerald-healing';

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleSelectPalette = (paletteId: ColorPaletteId) => {
    onUpdateClinic({ ...clinic, colorPalette: paletteId });
    showNotification(`Switched palette to ${colorPalettes[paletteId].name}`);
  };

  const handleFieldChange = (field: keyof ClinicInfo, value: string) => {
    const updated = { ...clinic, [field]: value };
    // Auto sync cityState if city or state changed
    if (field === 'city' || field === 'state') {
      const c = field === 'city' ? value : clinic.city;
      const s = field === 'state' ? value : clinic.state;
      updated.cityState = `${c}, ${s}`.trim();
    }
    // Auto clean phoneRaw if phone changed
    if (field === 'phone') {
      updated.phoneRaw = value.replace(/\D/g, '');
    }
    onUpdateClinic(updated);
  };

  // Export JSON file download
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinic, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeFilename = clinic.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${safeFilename || 'clinic'}-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Client JSON file exported successfully!");
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(clinic, null, 2));
    showNotification("JSON copied to clipboard!");
  };

  // Import JSON from file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.name && parsed.city) {
          onUpdateClinic({ ...defaultClinic, ...parsed });
          showNotification(`Loaded client config for: ${parsed.name}`);
        } else {
          alert("Invalid client JSON: Missing clinic 'name' or 'city'.");
        }
      } catch (err) {
        alert("Failed to parse JSON file. Please check file formatting.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Import JSON from raw text box
  const handleApplyJsonText = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      if (parsed.name) {
        onUpdateClinic({ ...defaultClinic, ...parsed });
        showNotification(`Applied config for: ${parsed.name}`);
        setActiveTab('form');
      } else {
        setJsonError("Invalid JSON: 'name' field is required.");
      }
    } catch (err) {
      setJsonError("Malformed JSON. Please check commas, quotes, and braces.");
    }
  };

  // Load preset
  const handleLoadPreset = (preset: typeof agencyPresets[0]) => {
    onUpdateClinic({ ...clinic, ...preset.data });
    showNotification(`Applied preset: ${preset.name}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs"
        >
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-stone-200"
            role="dialog"
            aria-label="Client Manager"
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-emerald-100 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white leading-tight">
                    Client Template Manager
                  </h3>
                  <p className="text-xs text-stone-400">
                    Fill out info once · Live preview updates instantly · Export or load anytime
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close client manager"
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Toast */}
            {copiedNotification && (
              <div className="bg-emerald-800 text-emerald-100 px-4 py-2 text-xs font-semibold flex items-center gap-2 justify-center shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{copiedNotification}</span>
              </div>
            )}

            {/* Tab navigation & Quick Action Bar */}
            <div className="px-6 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1 bg-stone-200/80 p-1 rounded-lg text-xs font-semibold text-stone-600">
                <button
                  onClick={() => setActiveTab('palettes')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === 'palettes' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Color Palettes</span>
                </button>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === 'form' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                  }`}
                >
                  Edit Info
                </button>
                <button
                  onClick={() => {
                    setJsonInput(JSON.stringify(clinic, null, 2));
                    setActiveTab('json');
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === 'json' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                  }`}
                >
                  Raw JSON / Paste
                </button>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === 'presets' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                  }`}
                >
                  Sample Presets
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  title="Export this client's config as a JSON file"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save JSON</span>
                </button>

                <label
                  title="Import a previously saved client JSON file"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-colors cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Load JSON</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Shareable Prospect Demo Link Banner */}
            <div className="bg-emerald-950/90 text-emerald-100 px-6 py-2.5 flex items-center justify-between border-b border-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-emerald-200">
                  Prospect Demo Link:
                </span>
                <span className="text-stone-300 font-mono text-[11px] truncate max-w-xs sm:max-w-sm hidden sm:inline">
                  {typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://your-domain.com/'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    // Generate clean URL without admin params for the prospect
                    const url = `${window.location.origin}/`;
                    navigator.clipboard.writeText(url);
                    showNotification("Clean demo URL copied to clipboard!");
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Demo Link</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* TAB 0: COLOR PALETTES */}
              {activeTab === 'palettes' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Palette className="w-5 h-5 text-emerald-700" />
                      <h4 className="text-base font-serif font-bold text-stone-900">
                        Brand Color Palettes
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Instantly restyle the entire site's primary Tailwind brand colors, buttons, badges, navigation accents, and hero gradients with one click.
                    </p>
                  </div>

                  {/* Palette Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(Object.keys(colorPalettes) as ColorPaletteId[]).map((paletteKey) => {
                      const pal = colorPalettes[paletteKey];
                      const isSelected = currentPaletteId === paletteKey;

                      return (
                        <div
                          key={paletteKey}
                          onClick={() => handleSelectPalette(paletteKey)}
                          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'border-stone-900 bg-white shadow-md ring-2 ring-stone-900/10'
                              : 'border-stone-200 bg-stone-50/80 hover:bg-white hover:border-stone-400 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            {/* Palette Header */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                                  {pal.category}
                                </span>
                                <h5 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 mt-0.5">
                                  {pal.name}
                                </h5>
                              </div>

                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white shrink-0">
                                  <Check className="w-3 h-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 px-2 py-0.5 rounded bg-stone-200/80 shrink-0">
                                  Select
                                </span>
                              )}
                            </div>

                            {/* Color Swatches */}
                            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-2xs">
                              <div
                                className="flex-1 h-8 rounded-lg shadow-inner flex items-end justify-center pb-1 text-[9px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.primary }}
                                title="Primary Main"
                              >
                                Pri
                              </div>
                              <div
                                className="flex-1 h-8 rounded-lg shadow-inner flex items-end justify-center pb-1 text-[9px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.secondary }}
                                title="Primary Dark"
                              >
                                Dark
                              </div>
                              <div
                                className="flex-1 h-8 rounded-lg border border-stone-200 flex items-end justify-center pb-1 text-[9px] font-bold text-stone-800 uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.light }}
                                title="Surface Light Tint"
                              >
                                Tint
                              </div>
                              <div
                                className="w-8 h-8 rounded-lg shadow-xs flex items-center justify-center text-[10px] font-bold text-stone-900"
                                style={{ backgroundColor: pal.previewColors.accent }}
                                title="Highlight Accent"
                              >
                                ★
                              </div>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed mb-4">
                              {pal.description}
                            </p>
                          </div>

                          {/* Live Preview Button snippet */}
                          <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between">
                            <span className="text-[11px] text-stone-500 font-medium">
                              Sample UI:
                            </span>
                            <div
                              className="px-3 py-1 rounded-md text-[11px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: pal.previewColors.primary }}
                            >
                              BOOK VISIT →
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Helpful Quick Tip Box */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Automatic Brand Propagation
                    </p>
                    <p className="text-amber-800/90 leading-relaxed">
                      Selecting any palette immediately updates the entire site: navigation highlights, hero badges, sticky banners, CTA buttons, condition tags, doctor review stars, and mobile tap targets. When you click <strong>Save JSON</strong>, the chosen palette is saved into the client profile.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: FORM FIELDS */}
              {activeTab === 'form' && (
                <div className="space-y-6">
                  
                  {/* Group 1: Core Clinic Info */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>1. Clinic Identity & Location</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Clinic Name</label>
                        <input
                          type="text"
                          value={clinic.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. Apex Chiropractic Care"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Tagline / Hero Subtitle</label>
                        <input
                          type="text"
                          value={clinic.tagline}
                          onChange={(e) => handleFieldChange('tagline', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. Personalized chiropractic care for people who refuse to slow down."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">City</label>
                        <input
                          type="text"
                          value={clinic.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. Columbus"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">State (Abbreviation)</label>
                        <input
                          type="text"
                          value={clinic.state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. OH"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={clinic.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. 742 S High St"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={clinic.zip}
                          onChange={(e) => handleFieldChange('zip', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. 43206"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-stone-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-emerald-700" />
                            Brand Color Theme
                          </label>
                          <button
                            type="button"
                            onClick={() => setActiveTab('palettes')}
                            className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
                          >
                            Explore Visual Palettes →
                          </button>
                        </div>
                        <select
                          value={currentPaletteId}
                          onChange={(e) => handleSelectPalette(e.target.value as ColorPaletteId)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none font-medium text-stone-800 cursor-pointer"
                        >
                          <option value="emerald-healing">Restorative Green (Holistic & Clinical)</option>
                          <option value="modern-minimal">Modern Minimal (Charcoal & Zinc Slate)</option>
                          <option value="warm-earth">Warm Earth (Terracotta & Amber Cinnamon)</option>
                          <option value="professional-blue">Professional Blue (Navy & Clinical Sky)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Doctor Profile */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>2. Lead Chiropractor</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          value={clinic.doctorName}
                          onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. Dr. Marcus Vance"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Credentials</label>
                        <input
                          type="text"
                          value={clinic.doctorCredentials}
                          onChange={(e) => handleFieldChange('doctorCredentials', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. D.C., CCSP"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Years in Practice</label>
                        <input
                          type="text"
                          value={clinic.doctorYears}
                          onChange={(e) => handleFieldChange('doctorYears', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. 15"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Image URL (Optional)</label>
                        <input
                          type="text"
                          value={clinic.doctorImage}
                          onChange={(e) => handleFieldChange('doctorImage', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none truncate"
                          placeholder="Local asset or https://..."
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Quote / Philosophy</label>
                        <textarea
                          rows={2}
                          value={clinic.doctorQuote}
                          onChange={(e) => handleFieldChange('doctorQuote', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none resize-none"
                          placeholder="Doctor quote shown on website..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Contact & Hours */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      <span>3. Contact & Hours</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Display Phone</label>
                        <input
                          type="text"
                          value={clinic.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="(614) 555-0194"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Dialable Phone (Numbers only)</label>
                        <input
                          type="text"
                          value={clinic.phoneRaw}
                          onChange={(e) => handleFieldChange('phoneRaw', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="6145550194"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Weekday Hours</label>
                        <input
                          type="text"
                          value={clinic.hoursWeekday}
                          onChange={(e) => handleFieldChange('hoursWeekday', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="Mon–Thu: 8am–6pm, Fri: 8am–2pm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Saturday Hours</label>
                        <input
                          type="text"
                          value={clinic.hoursSaturday}
                          onChange={(e) => handleFieldChange('hoursSaturday', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="Sat: 9am–1pm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Parking Instructions</label>
                        <input
                          type="text"
                          value={clinic.parkingNote}
                          onChange={(e) => handleFieldChange('parkingNote', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="Free parking in rear lot."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 4: Offer & Conversion */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      <span>4. Lead Generation Offer</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Top Banner Offer Headline</label>
                        <input
                          type="text"
                          value={clinic.offerHeadline}
                          onChange={(e) => handleFieldChange('offerHeadline', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="New Patients: $49 Initial Exam + Consultation"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">Offer Subtext</label>
                          <input
                            type="text"
                            value={clinic.offerSubtext}
                            onChange={(e) => handleFieldChange('offerSubtext', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                            placeholder="Limited slots each week."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">Offer CTA Button Text</label>
                          <input
                            type="text"
                            value={clinic.offerCtaText}
                            onChange={(e) => handleFieldChange('offerCtaText', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                            placeholder="CLAIM YOURS →"
                          />
                        </div>
                      </div>

                      {/* Quick Offer Presets */}
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                          Quick Pre-Tested Offers:
                        </span>
                        <div className="grid gap-1.5">
                          {alternativeOffers.map((alt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                onUpdateClinic({
                                  ...clinic,
                                  offerHeadline: alt.headline,
                                  offerSubtext: alt.subtext,
                                  offerCtaText: alt.cta
                                });
                                showNotification("Applied offer: " + alt.headline);
                              }}
                              className="text-left text-xs p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 text-stone-700 flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="font-medium text-stone-900">{alt.headline}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold shrink-0 ml-2">Apply</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 5: Photography URLs */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>5. Images (URLs or Local Paths)</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Hero Clinic Image</label>
                        <input
                          type="text"
                          value={clinic.heroImage}
                          onChange={(e) => handleFieldChange('heroImage', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Clinic Interior Room Image</label>
                        <input
                          type="text"
                          value={clinic.clinicImage}
                          onChange={(e) => handleFieldChange('clinicImage', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: RAW JSON / PASTE */}
              {activeTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">Direct JSON Editor</h4>
                      <p className="text-xs text-stone-500">
                        Paste a client's JSON configuration here to populate the site immediately.
                      </p>
                    </div>
                    <button
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Current</span>
                    </button>
                  </div>

                  {jsonError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {jsonError}
                    </div>
                  )}

                  <textarea
                    rows={16}
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setJsonError(null);
                    }}
                    className="w-full text-xs font-mono p-3 bg-stone-900 text-emerald-300 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Paste valid client JSON..."
                  />

                  <button
                    onClick={handleApplyJsonText}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
                  >
                    Apply JSON to Website
                  </button>
                </div>
              )}

              {/* TAB 3: SAMPLE PRESETS */}
              {activeTab === 'presets' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">1-Click Client Demos</h4>
                    <p className="text-xs text-stone-500">
                      Instantly test the landing page with different clinic specialties and cities.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {agencyPresets.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-emerald-600 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-900 text-sm">{p.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                              {p.city}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            {p.data.doctorName} ({p.data.doctorCredentials}) · {p.data.offerHeadline}
                          </p>
                        </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              onClick={() => {
                                const key = p.city.includes('Austin') ? 'austin' : p.city.includes('Denver') ? 'denver' : 'sandiego';
                                if (typeof window !== 'undefined') {
                                  const url = `${window.location.origin}/?demo=${key}`;
                                  navigator.clipboard.writeText(url);
                                  showNotification(`Copied prospective demo link for ${p.name}!`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                              title="Copy a shareable link that loads this preset automatically"
                            >
                              Share Link
                            </button>
                            <button
                              onClick={() => handleLoadPreset(p)}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Load
                            </button>
                          </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-stone-200">
                    <button
                      onClick={() => {
                        onResetDefault();
                        showNotification("Reset to original Columbus Chiropractic default");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Default (Columbus Chiropractic Care)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Live Preview Active
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close & View Page
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
