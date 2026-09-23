import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Building2,
  User,
  Phone,
  MapPin,
  Tag,
  Palette,
  Briefcase,
  TrendingUp,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  FolderOpen,
  DollarSign,
  Star,
  Layers,
  ChevronRight,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo } from '../types';
import { defaultClinic, alternativeOffers, conditionsData, processSteps, testimonials, faqs } from '../data/clinicData';
import { colorPalettes, ColorPaletteId, resolvePalette } from '../data/colorPalettes';

interface ClientManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
  onEnterPresentationMode?: () => void;
}

export interface ClientProject {
  id: string;
  name: string;
  doctorName: string;
  city: string;
  state: string;
  colorPalette: ColorPaletteId;
  status: 'active' | 'prospect' | 'proposal_sent' | 'live';
  lastEdited: string;
  data: ClinicInfo;
}

const STORAGE_PROJECTS_KEY = 'agency_client_projects_v2';

// Starter presets ready to load as client projects
const defaultProjects: ClientProject[] = [
  {
    id: 'columbus-vance',
    name: 'Columbus Chiropractic Care',
    doctorName: 'Dr. Marcus Vance',
    city: 'Columbus',
    state: 'OH',
    colorPalette: 'ivory-forest',
    status: 'active',
    lastEdited: 'Current Active',
    data: { ...defaultClinic },
  },
  {
    id: 'austin-jenkins',
    name: 'Apex Spine & Sports Injury',
    doctorName: 'Dr. Sarah Jenkins',
    city: 'Austin',
    state: 'TX',
    colorPalette: 'bone-charcoal',
    status: 'proposal_sent',
    lastEdited: 'Proposal Ready',
    data: {
      ...defaultClinic,
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
      offerHeadline: "New Patients: $39 Spinal Exam & Movement Assessment",
      offerSubtext: "Includes orthopedic exam & personalized treatment plan.",
      offerCtaText: "CLAIM $39 SPECIAL →",
      colorPalette: "bone-charcoal",
      googleRating: 5.0,
      googleReviewsCount: 184,
    },
  },
  {
    id: 'denver-rostova',
    name: 'Denver Family Chiropractic',
    doctorName: 'Dr. Elena Rostova',
    city: 'Denver',
    state: 'CO',
    colorPalette: 'stone-clay',
    status: 'prospect',
    lastEdited: 'Demo Draft',
    data: {
      ...defaultClinic,
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
      offerHeadline: "Complimentary 15-Minute Doctor Consultation",
      offerSubtext: "Speak directly with Dr. Rostova before your first appointment.",
      offerCtaText: "BOOK FREE CONSULT →",
      colorPalette: "stone-clay",
      googleRating: 4.9,
      googleReviewsCount: 96,
    },
  },
  {
    id: 'sandiego-hayes',
    name: 'Pacific Coast Health & Spine',
    doctorName: 'Dr. Tyler Hayes',
    city: 'San Diego',
    state: 'CA',
    colorPalette: 'sage-slate',
    status: 'live',
    lastEdited: 'Client Live',
    data: {
      ...defaultClinic,
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
      offerHeadline: "New Patient Special: $49 Exam & Soft Tissue Release",
      offerSubtext: "First 20 new patients this month only.",
      offerCtaText: "CLAIM YOUR SPOT →",
      colorPalette: "sage-slate",
      googleRating: 4.9,
      googleReviewsCount: 215,
    },
  },
];

export const ClientManagerDrawer: React.FC<ClientManagerDrawerProps> = ({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
  onEnterPresentationMode
}) => {
  // Navigation Tabs: 'clients' | 'palettes' | 'form' | 'sections' | 'roi' | 'seo' | 'json'
  const [activeTab, setActiveTab] = useState<'clients' | 'palettes' | 'form' | 'sections' | 'roi' | 'seo' | 'json'>('clients');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-Client Project Store
  const [clientProjects, setClientProjects] = useState<ClientProject[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return defaultProjects;
  });

  // Save projects to localStorage whenever changed
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(clientProjects));
      }
    } catch {}
  }, [clientProjects]);

  // Active Palette resolution
  const activePaletteConfig = resolvePalette(clinic.colorPalette);
  const currentPaletteId = activePaletteConfig.id;

  // ROI Calculator State
  const [patientValue, setPatientValue] = useState<number>(1800); // LTV per new patient
  const [monthlyNewPatients, setMonthlyNewPatients] = useState<number>(8); // Extra patients per month
  const [agencyWebsiteFee, setAgencyWebsiteFee] = useState<number>(3500); // Your agency fee

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  const handleSelectPalette = (paletteId: ColorPaletteId) => {
    onUpdateClinic({ ...clinic, colorPalette: paletteId });
    showNotification(`Switched palette to ${colorPalettes[paletteId].name}`);
  };

  const handleFieldChange = (field: keyof ClinicInfo, value: any) => {
    const updated = { ...clinic, [field]: value };
    if (field === 'city' || field === 'state') {
      const c = field === 'city' ? value : clinic.city;
      const s = field === 'state' ? value : clinic.state;
      updated.cityState = `${c}, ${s}`.trim();
    }
    if (field === 'phone') {
      updated.phoneRaw = String(value).replace(/\D/g, '');
    }
    onUpdateClinic(updated);
  };

  const handleUpdateCondition = (index: number, field: string, value: any) => {
    const list = [...(clinic.customConditions || conditionsData)];
    list[index] = { ...list[index], [field]: value };
    onUpdateClinic({ ...clinic, customConditions: list });
  };

  const handleUpdateProcessStep = (index: number, field: string, value: any) => {
    const list = [...(clinic.customProcessSteps || processSteps)];
    list[index] = { ...list[index], [field]: value };
    onUpdateClinic({ ...clinic, customProcessSteps: list });
  };

  const handleUpdateTestimonial = (index: number, field: string, value: any) => {
    const list = [...(clinic.customTestimonials || testimonials)];
    list[index] = { ...list[index], [field]: value };
    onUpdateClinic({ ...clinic, customTestimonials: list });
  };

  const handleUpdateFaq = (index: number, field: string, value: any) => {
    const list = [...(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer })))];
    list[index] = { ...list[index], [field]: value };
    onUpdateClinic({ ...clinic, customFaqs: list });
  };

  // 1-Tap Client Switcher: Activate selected client project
  const handleActivateProject = (project: ClientProject) => {
    onUpdateClinic({ ...defaultClinic, ...project.data });
    showNotification(`Activated project: ${project.name}`);
  };

  // Duplicate current clinic as a new client project slot
  const handleDuplicateCurrentAsClient = () => {
    const newId = 'client-' + Date.now();
    const newProject: ClientProject = {
      id: newId,
      name: `${clinic.name} (Copy)`,
      doctorName: clinic.doctorName,
      city: clinic.city,
      state: clinic.state,
      colorPalette: currentPaletteId,
      status: 'prospect',
      lastEdited: 'Just now',
      data: { ...clinic, name: `${clinic.name} (Copy)` },
    };
    setClientProjects([newProject, ...clientProjects]);
    onUpdateClinic(newProject.data);
    showNotification(`Duplicated "${clinic.name}" into new client slot!`);
  };

  // Create clean blank client project
  const handleCreateNewBlankClient = () => {
    const newId = 'client-' + Date.now();
    const newClinic: ClinicInfo = {
      ...defaultClinic,
      name: 'New Chiropractic Clinic',
      city: 'City',
      state: 'ST',
      cityState: 'City, ST',
      doctorName: 'Dr. New Doctor',
      colorPalette: 'ivory-forest',
    };
    const newProject: ClientProject = {
      id: newId,
      name: 'New Chiropractic Clinic',
      doctorName: 'Dr. New Doctor',
      city: 'City',
      state: 'ST',
      colorPalette: 'ivory-forest',
      status: 'prospect',
      lastEdited: 'Just now',
      data: newClinic,
    };
    setClientProjects([newProject, ...clientProjects]);
    onUpdateClinic(newClinic);
    setActiveTab('form');
    showNotification('Created new client draft! Edit details below.');
  };

  // Delete client project
  const handleDeleteProject = (id: string, name: string) => {
    if (clientProjects.length <= 1) {
      alert("You must have at least one client project in your pipeline.");
      return;
    }
    if (window.confirm(`Delete client project "${name}"?`)) {
      setClientProjects(clientProjects.filter((p) => p.id !== id));
      showNotification(`Deleted ${name}`);
    }
  };

  // Export JSON file
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

  // Copy ROI Pitch Summary to clipboard
  const handleCopyRoiPitch = () => {
    const addedMonthlyRev = monthlyNewPatients * patientValue;
    const addedAnnualRev = addedMonthlyRev * 12;
    const daysToPayback = Math.round((agencyWebsiteFee / (addedAnnualRev / 365)));

    const pitch = `Dr. ${clinic.doctorName || 'Doctor'} — Here is the patient acquisition breakdown for ${clinic.name}:

• Target New Patient Inquiries: +${monthlyNewPatients} patients/month
• Average New Patient Care Plan Value: $${patientValue.toLocaleString()}
• Projected Extra Monthly Practice Revenue: +$${addedMonthlyRev.toLocaleString()}/mo
• Projected Extra Annual Practice Revenue: +$${addedAnnualRev.toLocaleString()}/year
• Website Investment Payback Period: ~${daysToPayback} days (under 2 patients pays for the entire site)

Live interactive preview prepared for you:
${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/`;

    navigator.clipboard.writeText(pitch);
    showNotification("ROI Pitch Summary copied! Paste into WhatsApp or Email.");
  };

  // Copy JSON-LD Schema
  const handleCopySchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Chiropractor",
      "name": clinic.name,
      "description": clinic.tagline,
      "telephone": clinic.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinic.address,
        "addressLocality": clinic.city,
        "addressRegion": clinic.state,
        "postalCode": clinic.zip,
        "addressCountry": "US"
      },
      "openingHours": [clinic.hoursWeekday, clinic.hoursSaturday].filter(Boolean),
      "priceRange": "$$",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": clinic.googleRating || 4.9,
        "reviewCount": clinic.googleReviewsCount || 127
      }
    };
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    showNotification("LocalBusiness Schema copied to clipboard!");
  };

  // Calculated ROI Metrics
  const extraMonthlyRevenue = monthlyNewPatients * patientValue;
  const extraAnnualRevenue = extraMonthlyRevenue * 12;
  const roiMultiplier = Math.round(extraAnnualRevenue / (agencyWebsiteFee || 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-50 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden text-stone-900 border-l border-stone-200"
          >
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 bg-stone-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base tracking-tight text-white flex items-center gap-2">
                    <span>Agency Command Suite</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-semibold border border-emerald-700">
                      Mobile HQ
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Active Client: <strong className="text-stone-200">{clinic.name}</strong> ({clinic.cityState})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Manager"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {copiedNotification && (
              <div className="bg-emerald-900 text-emerald-100 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b border-emerald-800 shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{copiedNotification}</span>
              </div>
            )}

            {/* Quick Pitch & Demo Link Bar */}
            <div className="bg-stone-900 text-stone-200 px-5 py-2.5 flex items-center justify-between border-b border-stone-800 text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold text-stone-300 hidden sm:inline">Prospect URL:</span>
                <span className="text-emerald-300 font-mono text-[11px] truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://your-domain.com/'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.origin);
                      showNotification("Prospect preview link copied!");
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold transition-colors cursor-pointer border border-stone-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Link</span>
                </button>
                {onEnterPresentationMode && (
                  <button
                    onClick={() => {
                      onClose();
                      onEnterPresentationMode();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Hides agency controls for presenting live to the doctor"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Pitch Mode</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumb-Friendly Navigation Tabs */}
            <div className="px-4 py-2.5 border-b border-stone-200 bg-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold text-stone-600">
              <button
                onClick={() => setActiveTab('clients')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'clients' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Clients ({clientProjects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('palettes')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'palettes' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Palettes (6)</span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'form' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Clinic & Toggles</span>
              </button>

              <button
                onClick={() => setActiveTab('sections')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'sections' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Site Content</span>
              </button>

              <button
                onClick={() => setActiveTab('roi')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'roi' ? 'bg-emerald-800 text-white shadow-xs' : 'hover:bg-stone-200 text-emerald-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>ROI Pitch Deck</span>
              </button>

              <button
                onClick={() => setActiveTab('seo')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'seo' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Google Local SEO</span>
              </button>

              <button
                onClick={() => {
                  setJsonInput(JSON.stringify(clinic, null, 2));
                  setActiveTab('json');
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'json' ? 'bg-stone-900 text-white shadow-xs' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Backup</span>
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-stone-50/50">

              {/* TAB 1: MULTI-CLIENT PIPELINE / WORKSPACE */}
              {activeTab === 'clients' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-emerald-800" />
                        <span>Client Projects & Pipeline</span>
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Switch between paying clients and prospects with 1 tap. Duplicate any client into a new template.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDuplicateCurrentAsClient}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        title="Duplicate currently loaded clinic into a new client project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate Current</span>
                      </button>
                      <button
                        onClick={handleCreateNewBlankClient}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ New Client</span>
                      </button>
                    </div>
                  </div>

                  {/* Client Cards List */}
                  <div className="space-y-3">
                    {clientProjects.map((proj) => {
                      const isActive = clinic.name === proj.data.name;
                      const projPalette = resolvePalette(proj.data.colorPalette);

                      return (
                        <div
                          key={proj.id}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isActive
                              ? 'border-emerald-700 bg-white shadow-sm ring-2 ring-emerald-700/10'
                              : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-serif font-bold shrink-0 shadow-xs"
                              style={{ backgroundColor: projPalette.previewColors.primary }}
                            >
                              <span>{proj.data.name.charAt(0)}</span>
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-serif font-bold text-stone-900 text-sm">
                                  {proj.data.name}
                                </h5>
                                {isActive && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    ● Currently Live
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500">
                                {proj.data.doctorName} · {proj.data.cityState} · {projPalette.name}
                              </p>
                              <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-600">
                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                  <Phone className="w-3 h-3" />
                                  {proj.data.phone}
                                </span>
                                <span>·</span>
                                <span className="text-stone-500">
                                  {proj.data.offerHeadline}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {isActive ? (
                              <button
                                onClick={() => setActiveTab('form')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                Edit Details →
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateProject(proj)}
                                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                              >
                                Activate Client
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.data.name)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Client Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Agency Quick Tip */}
                  <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1.5">
                    <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      Agency Mobile Workflow Tip
                    </p>
                    <p className="leading-relaxed">
                      Whenever you sign a new doctor, tap <strong>Duplicate Current</strong>, type their clinic name, address, and phone, then choose their brand palette. You can pitch, preview, and deliver complete sites from your phone.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND COLOR PALETTES */}
              {activeTab === 'palettes' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-emerald-800" />
                      <span>The 6 Premium Palette Directions</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Selecting any palette immediately updates the entire site's primary brand colors, buttons, badges, navigation accents, and the background canvas.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(Object.keys(colorPalettes) as ColorPaletteId[]).map((paletteKey) => {
                      const pal = colorPalettes[paletteKey];
                      const isSelected = currentPaletteId === paletteKey;

                      return (
                        <div
                          key={paletteKey}
                          onClick={() => handleSelectPalette(paletteKey)}
                          className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'border-stone-900 bg-white shadow-md ring-2 ring-stone-900/10'
                              : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            {/* Palette Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                                  {pal.category} · {pal.tagline}
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
                                <span className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 px-2 py-0.5 rounded bg-stone-100 shrink-0">
                                  Select
                                </span>
                              )}
                            </div>

                            {/* Background & Accent pill indicators */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200/80">
                                <span className="w-2 h-2 rounded-full border border-stone-300" style={{ backgroundColor: pal.previewColors.background }}></span>
                                <span>{pal.backgroundLabel}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200/80">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.previewColors.accent }}></span>
                                <span>{pal.accentLabel}</span>
                              </span>
                            </div>

                            {/* Color Swatches */}
                            <div className="flex items-center gap-2 mb-3.5 p-2 rounded-xl bg-stone-50 border border-stone-200/90 shadow-2xs">
                              <div
                                className="flex-1 h-8 rounded-lg shadow-inner flex items-end justify-center pb-1 text-[9px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.primary }}
                                title="Primary Brand Color"
                              >
                                Primary
                              </div>
                              <div
                                className="flex-1 h-8 rounded-lg shadow-inner flex items-end justify-center pb-1 text-[9px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.secondary }}
                                title="Deep Secondary Tone"
                              >
                                Deep
                              </div>
                              <div
                                className="flex-1 h-8 rounded-lg border border-stone-200 flex items-end justify-center pb-1 text-[9px] font-bold text-stone-800 uppercase tracking-wider"
                                style={{ backgroundColor: pal.previewColors.background }}
                                title="Canvas Background Tone"
                              >
                                Canvas
                              </div>
                              <div
                                className="w-8 h-8 rounded-lg shadow-xs flex items-center justify-center text-[10px] font-bold text-stone-900 shrink-0"
                                style={{ backgroundColor: pal.previewColors.accent }}
                                title="Accent Highlight"
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
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold"
                                style={{
                                  backgroundColor: pal.previewColors.light,
                                  color: pal.previewColors.primary
                                }}
                              >
                                $49 Special
                              </span>
                              <div
                                className="px-3 py-1 rounded-md text-[11px] font-bold text-white shadow-xs"
                                style={{ backgroundColor: pal.previewColors.primary }}
                              >
                                BOOK VISIT →
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: CLINIC CONTENT & FEATURE TOGGLES */}
              {activeTab === 'form' && (
                <div className="space-y-6">
                  
                  {/* Group 1: Core Clinic Info */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-emerald-800" />
                      <span>1. Clinic Identity & Location</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Clinic Name</label>
                        <input
                          type="text"
                          value={clinic.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Tagline / Subtitle</label>
                        <input
                          type="text"
                          value={clinic.tagline}
                          onChange={(e) => handleFieldChange('tagline', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">City</label>
                        <input
                          type="text"
                          value={clinic.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">State</label>
                        <input
                          type="text"
                          value={clinic.state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={clinic.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={clinic.zip}
                          onChange={(e) => handleFieldChange('zip', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number (Call & SMS)</label>
                        <input
                          type="text"
                          value={clinic.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Doctor Bio */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4 text-emerald-800" />
                      <span>2. Treating Chiropractor & Credentials</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          value={clinic.doctorName}
                          onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Credentials</label>
                        <input
                          type="text"
                          value={clinic.doctorCredentials}
                          onChange={(e) => handleFieldChange('doctorCredentials', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          placeholder="e.g. D.C., CCSP"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Quote / Philosophy</label>
                        <textarea
                          rows={2}
                          value={clinic.doctorQuote}
                          onChange={(e) => handleFieldChange('doctorQuote', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Offer & Sticky Banner Toggles */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
                      <Tag className="w-4 h-4 text-emerald-800" />
                      <span>3. Offer & Feature Toggles</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Special Offer Headline</label>
                        <input
                          type="text"
                          value={clinic.offerHeadline}
                          onChange={(e) => handleFieldChange('offerHeadline', e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">Top Sticky Offer Banner</span>
                          <span className="text-[11px] text-stone-500">Shows floating promotion bar across top of screen</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFieldChange('showStickyBanner', clinic.showStickyBanner === false ? true : false)}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                            clinic.showStickyBanner !== false ? 'bg-emerald-700' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                              clinic.showStickyBanner !== false ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">Booking Flow Type</span>
                          <span className="text-[11px] text-stone-500">Choose in-app calendar or external EHR booking link</span>
                        </div>
                        <select
                          value={clinic.bookingType || 'modal'}
                          onChange={(e) => handleFieldChange('bookingType', e.target.value)}
                          className="text-xs font-semibold px-3 py-1.5 bg-white border border-stone-300 rounded-lg cursor-pointer"
                        >
                          <option value="modal">In-App Booking Modal</option>
                          <option value="external">External EHR (Jane App / Calendly)</option>
                        </select>
                      </div>

                      {clinic.bookingType === 'external' && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-stone-600 mb-1">External EHR / Booking URL</label>
                          <input
                            type="url"
                            value={clinic.externalBookingUrl || ''}
                            onChange={(e) => handleFieldChange('externalBookingUrl', e.target.value)}
                            placeholder="https://clinic.janeapp.com/ or Calendly link"
                            className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SITE CONTENT SECTIONS */}
              {activeTab === 'sections' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-800" />
                      <span>Site Content & Copy Editor</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Customize every condition, treatment step, patient review, and FAQ without touching code.
                    </p>
                  </div>

                  {/* Conditions Section */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h5 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                      1. Targeted Conditions & Symptoms
                    </h5>
                    {(clinic.customConditions || conditionsData).map((cond, idx) => (
                      <div key={cond.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">Condition Title</label>
                            <input
                              type="text"
                              value={cond.title}
                              onChange={(e) => handleUpdateCondition(idx, 'title', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">Short Description</label>
                            <input
                              type="text"
                              value={cond.description}
                              onChange={(e) => handleUpdateCondition(idx, 'description', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Clinical Approach / Care Plan</label>
                          <textarea
                            rows={2}
                            value={cond.approach}
                            onChange={(e) => handleUpdateCondition(idx, 'approach', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Process Steps Section */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h5 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                      2. Treatment Process Steps
                    </h5>
                    {(clinic.customProcessSteps || processSteps).map((step, idx) => (
                      <div key={step.number} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            {step.number}
                          </span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleUpdateProcessStep(idx, 'title', e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-semibold"
                          />
                        </div>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => handleUpdateProcessStep(idx, 'description', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-600"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Testimonials Section */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h5 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                      3. Patient Testimonials & Quotes
                    </h5>
                    {(clinic.customTestimonials || testimonials).map((item, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Quote</label>
                          <textarea
                            rows={2}
                            value={item.quote}
                            onChange={(e) => handleUpdateTestimonial(idx, 'quote', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg italic"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">Patient Name</label>
                            <input
                              type="text"
                              value={item.author}
                              onChange={(e) => handleUpdateTestimonial(idx, 'author', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">Condition Tag</label>
                            <input
                              type="text"
                              value={item.condition || ''}
                              onChange={(e) => handleUpdateTestimonial(idx, 'condition', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FAQs Section */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h5 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                      4. Frequently Asked Questions (FAQs)
                    </h5>
                    {(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer }))).map((faq, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Question</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Answer</label>
                          <textarea
                            rows={2}
                            value={faq.a}
                            onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 4: CHIRO ROI PITCH DECK & CALCULATOR */}
              {activeTab === 'roi' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-800" />
                      <span>Chiropractic Patient ROI Pitch Deck</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Use this live calculator on sales calls with the doctor to demonstrate that this website pays for itself in under two weeks.
                    </p>
                  </div>

                  {/* Big Revenue Impact Stat Card */}
                  <div className="p-6 rounded-2xl bg-stone-950 text-white shadow-lg space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Projected Practice Financial Impact
                    </span>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-xs text-stone-400 block">Extra Monthly Revenue</span>
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
                          +${extraMonthlyRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block">Extra Annual Revenue</span>
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                          +${extraAnnualRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
                      <span>Agency Fee: ${agencyWebsiteFee.toLocaleString()}</span>
                      <span className="font-bold text-emerald-400">
                        {roiMultiplier}x Annual Return on Investment
                      </span>
                    </div>
                  </div>

                  {/* Interactive Sliders */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-stone-800">New Patient Lifetime Value (LTV):</span>
                        <span className="text-emerald-800 font-bold">${patientValue.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="800"
                        max="3500"
                        step="100"
                        value={patientValue}
                        onChange={(e) => setPatientValue(Number(e.target.value))}
                        className="w-full accent-emerald-700 cursor-pointer"
                      />
                      <span className="text-[11px] text-stone-500">Average chiropractic care plan (12–18 visits + exams).</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-stone-800">Extra Monthly Patients from Website:</span>
                        <span className="text-emerald-800 font-bold">+{monthlyNewPatients} patients/mo</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="25"
                        step="1"
                        value={monthlyNewPatients}
                        onChange={(e) => setMonthlyNewPatients(Number(e.target.value))}
                        className="w-full accent-emerald-700 cursor-pointer"
                      />
                      <span className="text-[11px] text-stone-500">Driven by mobile-first booking, verified reviews & local SEO.</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-stone-800">Your Agency Project Fee:</span>
                        <span className="text-stone-900 font-bold">${agencyWebsiteFee.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="1500"
                        max="8000"
                        step="250"
                        value={agencyWebsiteFee}
                        onChange={(e) => setAgencyWebsiteFee(Number(e.target.value))}
                        className="w-full accent-stone-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 1-Tap Copy Pitch Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleCopyRoiPitch}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Doctor Sales Pitch Summary</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: GOOGLE LOCAL SEO & SERP SIMULATOR */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Search className="w-5 h-5 text-emerald-800" />
                      <span>Google Local Pack & SERP Preview</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      See exactly how this clinic appears when a patient searches "best chiropractor near me" on mobile.
                    </p>
                  </div>

                  {/* Simulated Mobile Google Result Card */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <div className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-[10px] font-bold">
                        G
                      </div>
                      <span className="truncate">https://www.{clinic.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                    </div>

                    <div>
                      <h5 className="text-base font-semibold text-blue-800 hover:underline cursor-pointer">
                        {clinic.name} | Top Chiropractor in {clinic.city}, {clinic.state}
                      </h5>
                      <div className="flex items-center gap-2 pt-1 text-xs text-stone-600">
                        <div className="flex items-center text-amber-500">
                          {'★'.repeat(5)}
                        </div>
                        <span className="font-semibold text-stone-800">{clinic.googleRating || 4.9}</span>
                        <span className="text-stone-500">({clinic.googleReviewsCount || 127} reviews)</span>
                        <span>·</span>
                        <span className="text-stone-600">Chiropractor</span>
                      </div>
                      <p className="text-xs text-stone-600 pt-1.5 leading-relaxed">
                        {clinic.doctorName} provides gentle, non-invasive chiropractic care in {clinic.cityState}. Back pain, neck pain & sciatica relief. {clinic.offerHeadline}.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center gap-3 text-xs text-emerald-800 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {clinic.address}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {clinic.phone}
                      </span>
                    </div>
                  </div>

                  {/* SEO Health Check Checklist */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                      Local SEO Signals Included in this Template
                    </span>
                    <ul className="space-y-2 text-xs text-stone-600">
                      <li className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Exact NAP (Name, Address, Phone) consistency in Header, Footer & Location</span>
                      </li>
                      <li className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>One-tap Click-to-Call tel: links optimized for iOS and Android</span>
                      </li>
                      <li className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>High-intent condition landing sections (Back, Neck, Sciatica, Sports Injury)</span>
                      </li>
                      <li className="flex items-center gap-2 text-emerald-800 font-medium">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Fast Core Web Vitals with minimal layout shift and lightweight assets</span>
                      </li>
                    </ul>

                    <div className="pt-3">
                      <button
                        onClick={handleCopySchema}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy LocalBusiness JSON-LD Schema</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BACKUP & RAW JSON */}
              {activeTab === 'json' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-serif font-bold text-stone-900">
                        Export, Import & Raw JSON
                      </h4>
                      <p className="text-xs text-stone-600">
                        Download a client profile file or paste custom JSON data directly.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportJson}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON</span>
                      </button>

                      <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
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

                  <div className="space-y-2">
                    <textarea
                      rows={14}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="w-full font-mono text-xs p-3 bg-stone-900 text-emerald-400 rounded-xl border border-stone-800 focus:outline-none"
                    />

                    {jsonError && (
                      <div className="text-xs text-red-600 font-semibold p-2 bg-red-50 rounded-lg">
                        {jsonError}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={onResetDefault}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Defaults</span>
                    </button>

                    <button
                      onClick={() => {
                        try {
                          setJsonError(null);
                          const parsed = JSON.parse(jsonInput);
                          if (parsed.name) {
                            onUpdateClinic({ ...defaultClinic, ...parsed });
                            showNotification(`Applied JSON for ${parsed.name}`);
                            setActiveTab('form');
                          }
                        } catch {
                          setJsonError("Invalid JSON syntax.");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Apply JSON to Site
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-3 text-xs">
              <span className="text-stone-500 font-medium truncate">
                Palette: <strong>{activePaletteConfig.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Done Editing
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
