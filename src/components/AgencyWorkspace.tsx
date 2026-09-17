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
  Share2,
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Rocket,
  Settings as SettingsIcon,
  Monitor,
  Smartphone,
  Eye,
  ArrowUp,
  ArrowDown,
  Lock,
  Globe,
  Sliders,
  HelpCircle,
  Sun,
  Moon,
  Undo,
  Cloud,
  FileUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo } from '../types';
import { defaultClinic, alternativeOffers, conditionsData, processSteps, testimonials, faqs } from '../data/clinicData';
import { colorPalettes, ColorPaletteId, resolvePalette } from '../data/colorPalettes';
import { ImageUpload } from './ImageUpload';

interface AgencyWorkspaceProps {
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

const defaultProjects: ClientProject[] = [
  {
    id: 'columbus-vance',
    name: 'Columbus Chiropractic Care',
    doctorName: 'Dr. Marcus Vance',
    city: 'Columbus',
    state: 'OH',
    colorPalette: 'soft-ivory-forest',
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
    colorPalette: 'warm-bone-charcoal',
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
      doctorName: "Dr. Sarah Jenkins",
      doctorCredentials: "D.C., DACBSP",
      offerHeadline: "New Patients: $39 Spinal Exam & Movement Assessment",
      colorPalette: "warm-bone-charcoal",
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
    colorPalette: 'warm-sand-terracotta',
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
      doctorName: "Dr. Elena Rostova",
      doctorCredentials: "D.C., CACCP",
      offerHeadline: "Complimentary 15-Minute Doctor Consultation",
      colorPalette: "warm-sand-terracotta",
      googleRating: 4.9,
      googleReviewsCount: 96,
    },
  },
];

export type WorkspaceTab = 'dashboard' | 'brand' | 'business' | 'content' | 'media' | 'launch' | 'settings';

export const AgencyWorkspace: React.FC<AgencyWorkspaceProps> = ({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
  onEnterPresentationMode
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeContentSection, setActiveContentSection] = useState<'hero' | 'about' | 'conditions' | 'testimonials' | 'process' | 'faqs' | 'cta'>('hero');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo History State & Handlers
  const [undoStack, setUndoStack] = useState<ClinicInfo[]>([]);

  const handleUndo = () => {
    if (undoStack.length === 0) {
      showNotification("Nothing to undo!");
      return;
    }
    const previous = undoStack[0];
    setUndoStack((prev) => prev.slice(1));
    onUpdateClinic(previous);
    showNotification("Undone last change!");
  };

  // Create Client Wizard State & Handlers
  const [showCreateWizard, setShowCreateWizard] = useState<boolean>(false);
  const [wizardName, setWizardName] = useState<string>('');
  const [wizardDoctor, setWizardDoctor] = useState<string>('');
  const [wizardCity, setWizardCity] = useState<string>('');
  const [wizardState, setWizardState] = useState<string>('');
  const [wizardTemplate, setWizardTemplate] = useState<'columbus' | 'austin' | 'denver' | 'blank'>('columbus');

  const handleCreateWizardProfile = () => {
    if (!wizardName.trim()) {
      showNotification("Please enter a Practice Name!");
      return;
    }
    const newId = 'client-' + Date.now();
    let baseData = { ...defaultClinic };

    if (wizardTemplate === 'austin') {
      baseData = {
        ...defaultClinic,
        name: wizardName,
        city: wizardCity || "Austin",
        state: wizardState || "TX",
        cityState: `${wizardCity || "Austin"}, ${wizardState || "TX"}`,
        doctorName: wizardDoctor || "Dr. Sarah Jenkins",
        colorPalette: 'warm-bone-charcoal'
      };
    } else if (wizardTemplate === 'denver') {
      baseData = {
        ...defaultClinic,
        name: wizardName,
        city: wizardCity || "Denver",
        state: wizardState || "CO",
        cityState: `${wizardCity || "Denver"}, ${wizardState || "CO"}`,
        doctorName: wizardDoctor || "Dr. Elena Rostova",
        colorPalette: 'warm-sand-terracotta'
      };
    } else if (wizardTemplate === 'blank') {
      baseData = {
        ...defaultClinic,
        name: wizardName,
        tagline: "Custom targeted pain relief and high-performance chiropractic care.",
        city: wizardCity || "City",
        state: wizardState || "ST",
        cityState: `${wizardCity || "City"}, ${wizardState || "ST"}`,
        doctorName: wizardDoctor || "Lead Doctor",
        doctorCredentials: "D.C.",
        doctorYears: "10",
        doctorQuote: "Your spinal health determines your mobility, longevity, and quality of life.",
        offerHeadline: "New Patient Special: Initial Consultation & Exam",
        offerSubtext: "Book your path to complete recovery today.",
        colorPalette: "soft-ivory-forest"
      };
    } else {
      // columbus
      baseData = {
        ...defaultClinic,
        name: wizardName,
        city: wizardCity || "Columbus",
        state: wizardState || "OH",
        cityState: `${wizardCity || "Columbus"}, ${wizardState || "OH"}`,
        doctorName: wizardDoctor || "Dr. Marcus Vance",
        colorPalette: "soft-ivory-forest"
      };
    }

    const newProj: ClientProject = {
      id: newId,
      name: wizardName,
      doctorName: wizardDoctor || "Lead Chiropractor",
      city: wizardCity || "City",
      state: wizardState || "ST",
      colorPalette: baseData.colorPalette as any || 'soft-ivory-forest',
      status: 'active',
      lastEdited: 'Just now',
      data: baseData,
    };

    setClientProjects([newProj, ...clientProjects]);
    onUpdateClinic(baseData);
    setShowCreateWizard(false);
    setWizardName('');
    setWizardDoctor('');
    setWizardCity('');
    setWizardState('');
    showNotification(`Built & loaded workspace for "${wizardName}"!`);
  };

  // Image upload base64 processor
  const handleImageUpload = (field: keyof ClinicInfo, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleFieldChange(field, base64);
        showNotification("Custom image uploaded and applied successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // JSON Import processor
  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.name || typeof parsed.name !== 'string') {
        alert("Invalid config file: 'name' field is missing or invalid.");
        return;
      }
      const updatedClinic = { ...defaultClinic, ...parsed };
      onUpdateClinic(updatedClinic);

      const existingIdx = clientProjects.findIndex(p => p.name.toLowerCase() === parsed.name.toLowerCase());
      if (existingIdx >= 0) {
        const updatedList = [...clientProjects];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          name: parsed.name,
          data: updatedClinic,
          lastEdited: 'Imported just now'
        };
        setClientProjects(updatedList);
      } else {
        const newProj: ClientProject = {
          id: 'imported-' + Date.now(),
          name: parsed.name,
          doctorName: parsed.doctorName || "Lead Chiropractor",
          city: parsed.city || "City",
          state: parsed.state || "ST",
          colorPalette: parsed.colorPalette || 'soft-ivory-forest',
          status: 'active',
          lastEdited: 'Imported just now',
          data: updatedClinic
        };
        setClientProjects([newProj, ...clientProjects]);
      }
      showNotification("Imported and activated JSON configuration successfully!");
    } catch (err) {
      alert("Failed to parse JSON. Please ensure it is a valid backup file.");
    }
  };

  // Conditions list handlers
  const handleUpdateCondition = (index: number, updatedField: string, value: any) => {
    const list = [...(clinic.customConditions || conditionsData)];
    list[index] = { ...list[index], [updatedField]: value };
    handleFieldChange('customConditions', list);
  };

  const handleAddCondition = () => {
    const list = [...(clinic.customConditions || conditionsData)];
    list.push({
      id: `condition-${Date.now()}`,
      title: 'New Pain / Injury Condition',
      description: 'Brief patient-friendly overview of how we assess and handle this.',
      symptoms: ['Symptom 1', 'Symptom 2', 'Symptom 3'],
      approach: 'Spinal adjustments and specialized physical therapy protocols.'
    });
    handleFieldChange('customConditions', list);
    showNotification('Added new condition item!');
  };

  const handleDeleteCondition = (index: number) => {
    const list = [...(clinic.customConditions || conditionsData)];
    list.splice(index, 1);
    handleFieldChange('customConditions', list);
    showNotification('Removed condition item!');
  };

  const handleReorderCondition = (index: number, direction: 'up' | 'down') => {
    const list = [...(clinic.customConditions || conditionsData)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    handleFieldChange('customConditions', list);
  };

  // Testimonials list handlers
  const handleUpdateTestimonial = (index: number, updatedField: string, value: any) => {
    const list = [...(clinic.customTestimonials || testimonials)];
    list[index] = { ...list[index], [updatedField]: value };
    handleFieldChange('customTestimonials', list);
  };

  const handleAddTestimonial = () => {
    const list = [...(clinic.customTestimonials || testimonials)];
    list.push({
      quote: 'New testimonial quote here describing success.',
      author: 'John D.',
      rating: 5,
      condition: 'Lower Back Pain'
    });
    handleFieldChange('customTestimonials', list);
    showNotification('Added new testimonial!');
  };

  const handleDeleteTestimonial = (index: number) => {
    const list = [...(clinic.customTestimonials || testimonials)];
    list.splice(index, 1);
    handleFieldChange('customTestimonials', list);
    showNotification('Removed testimonial!');
  };

  const handleReorderTestimonial = (index: number, direction: 'up' | 'down') => {
    const list = [...(clinic.customTestimonials || testimonials)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    handleFieldChange('customTestimonials', list);
  };

  // Process Steps list handlers
  const handleUpdateProcessStep = (index: number, updatedField: string, value: any) => {
    const list = [...(clinic.customProcessSteps || processSteps)];
    list[index] = { ...list[index], [updatedField]: value };
    handleFieldChange('customProcessSteps', list);
  };

  const handleAddProcessStep = () => {
    const list = [...(clinic.customProcessSteps || processSteps)];
    const nextNum = String(list.length + 1).padStart(2, '0');
    list.push({
      number: nextNum,
      title: 'New Process Step',
      description: 'What happens in this step of the care journey.'
    });
    handleFieldChange('customProcessSteps', list);
    showNotification('Added process step!');
  };

  const handleDeleteProcessStep = (index: number) => {
    const list = [...(clinic.customProcessSteps || processSteps)];
    list.splice(index, 1);
    handleFieldChange('customProcessSteps', list);
    showNotification('Removed process step!');
  };

  // FAQs list handlers
  const handleUpdateFAQ = (index: number, updatedField: string, value: any) => {
    const list = [...(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer })))];
    list[index] = { ...list[index], [updatedField]: value };
    handleFieldChange('customFaqs', list);
  };

  const handleAddFAQ = () => {
    const list = [...(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer })))];
    list.push({
      q: 'New Question?',
      a: 'Detailed, reassuring answer about chiropractic techniques.'
    });
    handleFieldChange('customFaqs', list);
    showNotification('Added new FAQ item!');
  };

  const handleDeleteFAQ = (index: number) => {
    const list = [...(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer })))];
    list.splice(index, 1);
    handleFieldChange('customFaqs', list);
    showNotification('Removed FAQ item!');
  };

  // Client Projects Store
  const [clientProjects, setClientProjects] = useState<ClientProject[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return defaultProjects;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(clientProjects));
      }
    } catch {}
  }, [clientProjects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        showNotification('All changes saved automatically!');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleFieldChange = (field: keyof ClinicInfo, value: any) => {
    // Save to undo stack before updating
    setUndoStack((prev) => [clinic, ...prev].slice(0, 15));

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

  const handleSelectPalette = (paletteId: ColorPaletteId) => {
    // Save to undo stack
    setUndoStack((prev) => [clinic, ...prev].slice(0, 15));

    onUpdateClinic({ ...clinic, colorPalette: paletteId });
    showNotification(`Palette switched to ${colorPalettes[paletteId].name}`);
  };

  const handleDuplicateProject = (proj: ClientProject) => {
    const newId = 'client-' + Date.now();
    const newProj: ClientProject = {
      ...proj,
      id: newId,
      name: `${proj.name} (Copy)`,
      lastEdited: 'Just now',
      data: { ...proj.data, name: `${proj.name} (Copy)` }
    };
    setClientProjects([newProj, ...clientProjects]);
    onUpdateClinic(newProj.data);
    showNotification(`Duplicated "${proj.name}" successfully!`);
  };

  const handleCreateNewClient = () => {
    const newId = 'client-' + Date.now();
    const newClinic: ClinicInfo = {
      ...defaultClinic,
      name: 'New Chiropractic Practice',
      city: 'Chicago',
      state: 'IL',
      cityState: 'Chicago, IL',
      doctorName: 'Dr. Alex Morgan',
      colorPalette: 'soft-ivory-forest',
    };
    const newProj: ClientProject = {
      id: newId,
      name: 'New Chiropractic Practice',
      doctorName: 'Dr. Alex Morgan',
      city: 'Chicago',
      state: 'IL',
      colorPalette: 'soft-ivory-forest',
      status: 'prospect',
      lastEdited: 'Just now',
      data: newClinic,
    };
    setClientProjects([newProj, ...clientProjects]);
    onUpdateClinic(newClinic);
    setActiveTab('business');
    showNotification('Created new client project workspace!');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col md:flex-row bg-stone-900 overflow-hidden ${highContrast ? 'contrast-125' : ''}`}>
      
      {/* 1. LEFT SIDEBAR (Fixed, Narrow Navigation) */}
      <aside className="w-full md:w-64 bg-stone-950 text-stone-300 flex md:flex-col justify-between border-b md:border-b-0 md:border-r border-stone-800 shrink-0">
        <div className="p-4 md:p-6 flex items-center md:flex-col md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm text-white tracking-tight">Agency Command</h1>
              <p className="text-[10px] text-emerald-400 font-mono">v3.5 Pro Studio</p>
            </div>
          </div>

          <div className="hidden md:block w-full pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2 px-2">Workspace</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex md:flex-col px-2 md:px-4 py-2 gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'brand', label: 'Brand & Palettes', icon: Palette },
            { id: 'business', label: 'Business Info', icon: Building2 },
            { id: 'content', label: 'Site Content', icon: FileText },
            { id: 'media', label: 'Media Library', icon: ImageIcon },
            { id: 'launch', label: 'Launch & Publish', icon: Rocket },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as WorkspaceTab)}
                title={item.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                    : 'hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="hidden md:p-4 md:border-t md:border-stone-800 md:space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>High Contrast</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${highContrast ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-stone-300'}`}
            >
              {highContrast ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
          >
            <X className="w-4 h-4" />
            <span>Close Workspace</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN AREA (Content Editor for Selected Section) */}
      <main className="flex-1 flex flex-col bg-stone-50 overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="px-6 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search any setting, client, or copy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-Saved Status Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-100">
              <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
              <span>Auto-Saved</span>
            </span>

            {/* Undo Last Action button */}
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                undoStack.length > 0
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  : 'opacity-40 bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
              title={undoStack.length > 0 ? `Undo last change (${undoStack.length} left)` : 'Nothing to undo'}
            >
              <Undo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
              {undoStack.length > 0 && (
                <span className="ml-0.5 px-1 bg-stone-300 text-[9px] rounded-full text-stone-800 font-mono">
                  {undoStack.length}
                </span>
              )}
            </button>

            {copiedNotification && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {copiedNotification}
              </span>
            )}

            <button
              onClick={() => {
                onResetDefault();
                showNotification("Reset all fields to default template");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
              title="Reset current client to default state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            {onEnterPresentationMode && (
              <button
                onClick={() => {
                  onClose();
                  onEnterPresentationMode();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Pitch Mode</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-xl bg-stone-200 text-stone-700 hover:bg-stone-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Editor Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: DASHBOARD (HOME) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Agency Dashboard</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Manage active chiropractic client sites, deploy new proposals, and monitor conversion metrics.
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Active Clients</p>
                  <p className="text-3xl font-serif font-bold text-stone-900">{clientProjects.length}</p>
                  <p className="text-xs text-emerald-700 font-medium pt-1">↑ 2 pending review</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Currently Loaded</p>
                  <p className="text-xl font-serif font-bold text-stone-900 truncate">{clinic.name}</p>
                  <p className="text-xs text-stone-500 pt-1">{clinic.cityState} · {clinic.phone}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Platform Status</p>
                  <p className="text-xl font-serif font-bold text-emerald-800 flex items-center gap-1.5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live & Synced
                  </p>
                  <p className="text-xs text-stone-500">Auto-saves to browser storage</p>
                </div>
              </div>

              {/* Prominent Booking / Conversion Configurator */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">Primary Booking Conversion Strategy</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Define how patients schedule appointments from CTA buttons across the landing page.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('bookingMode', 'modal')}
                    className={`p-4 text-left rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      clinic.bookingMode !== 'external'
                        ? 'border-emerald-700 bg-emerald-50/40 ring-2 ring-emerald-700/10'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                    }`}
                  >
                    <span className="font-semibold text-xs sm:text-sm text-stone-900">In-App High-Converting Lead Form (Default)</span>
                    <span className="text-xs text-stone-500">Collects patient details, symptoms, and preferred slots natively to maximize lead capture rate.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('bookingMode', 'external')}
                    className={`p-4 text-left rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      clinic.bookingMode === 'external'
                        ? 'border-emerald-700 bg-emerald-50/40 ring-2 ring-emerald-700/10'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                    }`}
                  >
                    <span className="font-semibold text-xs sm:text-sm text-stone-900">External Booking Link (JaneApp, Calendly, etc)</span>
                    <span className="text-xs text-stone-500">Directly routes patients to external software. Essential for active practices.</span>
                  </button>
                </div>

                {clinic.bookingMode === 'external' && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 animate-fade-in space-y-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">External Scheduling URL</label>
                    <input
                      type="url"
                      value={clinic.externalBookingUrl || ''}
                      onChange={(e) => handleFieldChange('externalBookingUrl', e.target.value)}
                      placeholder="https://your-practice.janeapp.com/embed/book"
                      className="w-full text-xs px-3 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all font-mono"
                    />
                    <p className="text-[10px] text-stone-500">Every CTA, booking request, and offer button across the landing page will automatically link to this URL.</p>
                  </div>
                )}
              </div>

              {/* Action Banner or New Practice Creator Wizard */}
              {!showCreateWizard ? (
                <div className="p-6 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div>
                    <h3 className="text-lg font-serif font-bold">Ready to pitch a new chiropractor?</h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Instantly generate a beautifully pre-configured, custom-branded landing page for a prospect.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateWizard(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Client</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-emerald-700/30 ring-2 ring-emerald-700/5 shadow-md space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-base font-serif font-bold text-stone-900">New Chiropractic Practice Workspace</h3>
                      <p className="text-xs text-stone-500 mt-0.5">Let's create an isolated custom landing page structure for a new practitioner.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateWizard(false)}
                      className="text-stone-400 hover:text-stone-600 text-xs font-semibold px-2 py-1 rounded hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Clinic / Practice Name</label>
                      <input
                        type="text"
                        value={wizardName}
                        onChange={(e) => setWizardName(e.target.value)}
                        placeholder="e.g. Wellness Chiropractic Center"
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all font-serif"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Lead Chiropractor Name</label>
                      <input
                        type="text"
                        value={wizardDoctor}
                        onChange={(e) => setWizardDoctor(e.target.value)}
                        placeholder="e.g. Dr. Arthur Pendelton, D.C."
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Practice City</label>
                      <input
                        type="text"
                        value={wizardCity}
                        onChange={(e) => setWizardCity(e.target.value)}
                        placeholder="e.g. Portland"
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Practice State (Abbr.)</label>
                      <input
                        type="text"
                        value={wizardState}
                        onChange={(e) => setWizardState(e.target.value)}
                        placeholder="e.g. OR"
                        maxLength={2}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Select Custom Content Presets Template</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'columbus', label: 'Columbus Preset', desc: 'Modern & traditional' },
                        { id: 'austin', label: 'Austin Preset', desc: 'Sports injury & wellness' },
                        { id: 'denver', label: 'Denver Preset', desc: 'Family care & mobility' },
                        { id: 'blank', label: 'Custom Blank Slate', desc: 'Raw templates & outlines' },
                      ].map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setWizardTemplate(tpl.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            wizardTemplate === tpl.id
                              ? 'border-emerald-700 bg-emerald-50 text-stone-900 ring-2 ring-emerald-700/5'
                              : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50/50'
                          }`}
                        >
                          <span className="block font-semibold text-xs">{tpl.label}</span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">{tpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateWizard(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateWizardProfile}
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
                    >
                      Generate Custom Practice Site
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Clients List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">Recent Client Projects</h3>
                <div className="space-y-3">
                  {clientProjects.map((proj) => {
                    const isActive = clinic.name === proj.data.name;
                    return (
                      <div
                        key={proj.id}
                        className={`p-4 bg-white rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isActive ? 'border-emerald-700 shadow-sm ring-2 ring-emerald-700/10' : 'border-stone-200 hover:border-stone-300 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-base">{proj.data.name}</h4>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {proj.data.doctorName} · {proj.data.cityState} · Last edited: {proj.lastEdited}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isActive && (
                            <button
                              onClick={() => {
                                onUpdateClinic({ ...defaultClinic, ...proj.data });
                                showNotification(`Loaded ${proj.data.name}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              Open Practice
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicateProject(proj)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRAND & PALETTES */}
          {activeTab === 'brand' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Brand & Color Palettes</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Choose from our 6 premium chiropractic color palettes or customize individual color swatches.
                </p>
              </div>

              {/* Palette Selector Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(Object.keys(colorPalettes) as ColorPaletteId[]).map((key) => {
                  const pal = colorPalettes[key];
                  const isCurrent = clinic.colorPalette === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPalette(key)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent ? 'border-emerald-700 bg-white shadow-md ring-4 ring-emerald-700/10' : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-serif font-bold text-stone-900 text-base">{pal.name}</h3>
                        {isCurrent && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mb-4">{pal.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border border-stone-300 shadow-2xs" style={{ backgroundColor: pal.previewColors.primary }} />
                        <span className="w-6 h-6 rounded-full border border-stone-300 shadow-2xs" style={{ backgroundColor: pal.previewColors.accent }} />
                        <span className="w-6 h-6 rounded-full border border-stone-300 shadow-2xs" style={{ backgroundColor: pal.previewColors.background }} />
                        <span className="w-6 h-6 rounded-full border border-stone-300 shadow-2xs" style={{ backgroundColor: pal.previewColors.secondary }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Color Overrides */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Dynamic Color Overrides</h3>
                  {(clinic.customPrimaryColor || clinic.customAccentColor || clinic.customBgColor || clinic.customTextColor) && (
                    <button
                      onClick={() => {
                        onUpdateClinic({
                          ...clinic,
                          customPrimaryColor: undefined,
                          customAccentColor: undefined,
                          customBgColor: undefined,
                          customTextColor: undefined
                        });
                        showNotification("Reset all color overrides!");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Overrides</span>
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clinic.customPrimaryColor || "#1b4d3e"}
                        onChange={(e) => handleFieldChange('customPrimaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input
                        type="text"
                        value={clinic.customPrimaryColor || ""}
                        placeholder="Default palette"
                        onChange={(e) => handleFieldChange('customPrimaryColor', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clinic.customAccentColor || "#d97706"}
                        onChange={(e) => handleFieldChange('customAccentColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input
                        type="text"
                        value={clinic.customAccentColor || ""}
                        placeholder="Default palette"
                        onChange={(e) => handleFieldChange('customAccentColor', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Page Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clinic.customBgColor || "#fcfbf7"}
                        onChange={(e) => handleFieldChange('customBgColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input
                        type="text"
                        value={clinic.customBgColor || ""}
                        placeholder="Default palette"
                        onChange={(e) => handleFieldChange('customBgColor', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Primary Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clinic.customTextColor || "#1c1917"}
                        onChange={(e) => handleFieldChange('customTextColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input
                        type="text"
                        value={clinic.customTextColor || ""}
                        placeholder="Default palette"
                        onChange={(e) => handleFieldChange('customTextColor', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Customizer */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Logo & Brand Identity</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Logo Text Brand (Fallback)</label>
                    <input
                      type="text"
                      value={clinic.logoText || clinic.name}
                      onChange={(e) => handleFieldChange('logoText', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                    />
                    <p className="text-[11px] text-stone-500 mt-1 font-normal">Controls header navigation logo text and footer copyright.</p>
                  </div>
                  <div>
                    <ImageUpload
                      label="Logo Icon / Image"
                      description="Upload a custom logo file or provide a URL. Stored as local Base64 string."
                      currentValue={clinic.logoImage || ""}
                      onChange={(val) => handleFieldChange('logoImage', val)}
                      onReset={() => {
                        handleFieldChange('logoImage', '');
                        showNotification("Reset logo to pure typographic branding!");
                      }}
                      aspectRatioClassName="aspect-[3/1]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Logo Maximum Width (px)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="40"
                        max="300"
                        value={clinic.logoWidth || 140}
                        onChange={(e) => handleFieldChange('logoWidth', parseInt(e.target.value))}
                        className="w-full accent-emerald-800"
                      />
                      <span className="text-xs font-mono font-bold text-stone-700 shrink-0">{clinic.logoWidth || 140}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Logo Position</label>
                    <div className="flex bg-stone-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleFieldChange('logoPosition', 'left')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                          (clinic.logoPosition || 'left') === 'left' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => handleFieldChange('logoPosition', 'center')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                          clinic.logoPosition === 'center' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        Center
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Logo Presets</label>
                    <select
                      className="w-full text-xs px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                      onChange={(e) => {
                        handleFieldChange('logoImage', e.target.value);
                        if(e.target.value) {
                          showNotification("Applied preset logo icon!");
                        } else {
                          showNotification("Switched to pure typographic branding!");
                        }
                      }}
                      value={clinic.logoImage || ""}
                    >
                      <option value="">None (Pure Text Branding)</option>
                      <option value="https://img.icons8.com/color/96/chiropractic.png">Modern Spine Shield Icon</option>
                      <option value="https://img.icons8.com/color/96/caduceus.png">Medical Caduceus Symbol</option>
                      <option value="https://img.icons8.com/color/96/back-pain.png">Therapeutic Spinal Icon</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Font Pairing Selector (High Priority Feature) */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Typography & Font Pairings</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Select a premium typographic pairing to shape the clinic's visual tone and aura.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'classic-editorial', name: 'Classic Editorial', heading: 'Playfair Display', body: 'Plus Jakarta Sans', desc: 'Elegant, comforting and deeply clinical', hClass: 'font-serif' },
                    { id: 'modern-avant-garde', name: 'Modern Avant-Garde', heading: 'Syne Display', body: 'Space Grotesk', desc: 'Sleek, forward-thinking and sports-focused', hClass: 'font-sans font-extrabold tracking-tight' },
                    { id: 'serene-academic', name: 'Serene Academic', heading: 'Lora Serif', body: 'Inter Sans', desc: 'Trustworthy, balanced, clinical, and intellectual', hClass: 'font-serif' },
                    { id: 'timeless-luxury', name: 'Timeless Luxury', heading: 'Cinzel Serif', body: 'Montserrat Sans', desc: 'High-end, premium spa, or cash-only practice', hClass: 'font-serif tracking-widest' },
                  ].map((pairing) => {
                    const isCurrent = (clinic.fontPairing || 'classic-editorial') === pairing.id;
                    return (
                      <button
                        key={pairing.id}
                        type="button"
                        onClick={() => {
                          handleFieldChange('fontPairing', pairing.id);
                          showNotification(`Applied font pairing: ${pairing.name}`);
                        }}
                        className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'border-emerald-700 bg-white shadow-md ring-4 ring-emerald-700/10'
                            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-400 font-mono uppercase tracking-widest">Preset Stack</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            )}
                          </div>
                          <span className={`block text-xl text-stone-900 ${pairing.hClass}`}>{pairing.heading}</span>
                          <span className="block text-xs text-stone-500 font-medium font-sans mt-0.5">Body text: {pairing.body}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-3 border-t border-stone-100 pt-2.5 leading-relaxed">
                          {pairing.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Visibility Toggles (Medium Priority Feature) */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Section Visibility & Page Architecture</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Toggle sections on or off to match the practitioner's specific practice scale and goals.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { field: 'showTrustBar', label: 'Trust Bar (Google Review Stats)' },
                    { field: 'showWhyUs', label: 'Why Us (Pillars & Standard)' },
                    { field: 'showConditions', label: 'Problem & Conditions Accordion' },
                    { field: 'showTheClinic', label: 'The Clinic Showcase (Space Gallery)' },
                    { field: 'showTheDoctor', label: 'Lead Doctor (Biography & Quote)' },
                    { field: 'showTheProcess', label: 'The Process (Step Journey)' },
                    { field: 'showPatients', label: 'Patient Testimonials' },
                    { field: 'showInsurancePayment', label: 'Insurance & Payment Policies' },
                    { field: 'showFAQ', label: 'Frequently Asked Questions' },
                  ].map((sec) => {
                    const isVisible = clinic[sec.field as keyof ClinicInfo] !== false;
                    return (
                      <label
                        key={sec.field}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                          isVisible
                            ? 'border-emerald-700/30 bg-emerald-50/10 hover:bg-emerald-50/20'
                            : 'border-stone-200/80 bg-stone-50/40 text-stone-400 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold text-stone-900">{sec.label}</span>
                          <span className="block text-[9px] text-stone-500">
                            {isVisible ? 'Displayed on page' : 'Hidden from page'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => {
                            handleFieldChange(sec.field as keyof ClinicInfo, e.target.checked);
                            showNotification(`${e.target.checked ? 'Enabled' : 'Disabled'} ${sec.label}`);
                          }}
                          className="w-4 h-4 rounded text-emerald-800 border-stone-300 focus:ring-emerald-700/20 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESS INFO */}
          {activeTab === 'business' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Business Information</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Update practice location, doctor credentials, phone numbers, and hours.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Practice & Doctor Details</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Clinic Name</label>
                    <input
                      type="text"
                      value={clinic.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={clinic.tagline}
                      onChange={(e) => handleFieldChange('tagline', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={clinic.doctorName}
                      onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Credentials</label>
                    <input
                      type="text"
                      value={clinic.doctorCredentials}
                      onChange={(e) => handleFieldChange('doctorCredentials', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={clinic.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={clinic.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={clinic.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">State & Zip</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={clinic.state}
                        onChange={(e) => handleFieldChange('state', e.target.value)}
                        className="w-1/2 text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      />
                      <input
                        type="text"
                        value={clinic.zip}
                        onChange={(e) => handleFieldChange('zip', e.target.value)}
                        className="w-1/2 text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Weekday Hours</label>
                    <input
                      type="text"
                      value={clinic.hoursWeekday}
                      onChange={(e) => handleFieldChange('hoursWeekday', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Saturday Hours</label>
                    <input
                      type="text"
                      value={clinic.hoursSaturday}
                      onChange={(e) => handleFieldChange('hoursSaturday', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Years in Practice</label>
                    <input
                      type="number"
                      value={clinic.doctorYears || "15"}
                      onChange={(e) => handleFieldChange('doctorYears', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parking Notes & Building Guide</label>
                  <input
                    type="text"
                    value={clinic.parkingNote || ""}
                    onChange={(e) => handleFieldChange('parkingNote', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Email & Social Channels Card */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Email & Social Media Profiles</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Configure digital contact options and social proofs visible in the footer and contact sections.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Practice Email Address</label>
                    <input
                      type="email"
                      value={clinic.email || ""}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="e.g. contact@wellnesscolumbus.com"
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={clinic.instagram || ""}
                      onChange={(e) => handleFieldChange('instagram', e.target.value)}
                      placeholder="e.g. https://instagram.com/wellnesschiro"
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Facebook Page URL</label>
                    <input
                      type="url"
                      value={clinic.facebook || ""}
                      onChange={(e) => handleFieldChange('facebook', e.target.value)}
                      placeholder="e.g. https://facebook.com/wellnesschirocolumbus"
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Google Business Profile / Maps URL</label>
                    <input
                      type="url"
                      value={clinic.googleBusiness || ""}
                      onChange={(e) => handleFieldChange('googleBusiness', e.target.value)}
                      placeholder="e.g. https://maps.google.com/?cid=..."
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SITE CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Full Site Content Manager</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Click on any section to customize all copy, lists, testimonials, FAQs, and structures instantly.
                </p>
              </div>

              {/* Subnavigation Accordion Headers */}
              <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
                {[
                  { id: 'hero', label: 'Hero & Offer' },
                  { id: 'about', label: 'Doctor & Bio' },
                  { id: 'conditions', label: 'Conditions Treated' },
                  { id: 'testimonials', label: 'Testimonials' },
                  { id: 'process', label: 'Our Process' },
                  { id: 'faqs', label: 'FAQs List' },
                  { id: 'cta', label: 'Final CTA Banner' }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveContentSection(sec.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      activeContentSection === sec.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-950'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* SECTION: HERO & OFFER */}
              {activeContentSection === 'hero' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Primary Hero Section Copy</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Customize the main landing page headline, subheadline and direct booking button text.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Main Hero Headline</label>
                      <input
                        type="text"
                        value={clinic.heroHeadline || ""}
                        onChange={(e) => handleFieldChange('heroHeadline', e.target.value)}
                        placeholder="Get Back to What Pain Took Away."
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-serif font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Main Hero Subheadline</label>
                      <textarea
                        rows={2}
                        value={clinic.heroSubheadline || ""}
                        onChange={(e) => handleFieldChange('heroSubheadline', e.target.value)}
                        placeholder={`Personalized chiropractic care in ${clinic.city} for people who refuse to slow down.`}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Primary Hero CTA Button Text</label>
                      <input
                        type="text"
                        value={clinic.heroCtaText || ""}
                        onChange={(e) => handleFieldChange('heroCtaText', e.target.value)}
                        placeholder="BOOK YOUR FIRST VISIT"
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold uppercase"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">New Patient Sticky Special & Banner</h4>
                      <p className="text-xs text-stone-500 mt-0.5">Configure the promotional banner that floats on the screen or sits in headers.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">New Patient Special Offer Title</label>
                      <input
                        type="text"
                        value={clinic.offerHeadline}
                        onChange={(e) => handleFieldChange('offerHeadline', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">New Patient Special Offer Subtext</label>
                      <input
                        type="text"
                        value={clinic.offerSubtext}
                        onChange={(e) => handleFieldChange('offerSubtext', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Offer CTA Button Label</label>
                        <input
                          type="text"
                          value={clinic.offerCtaText}
                          onChange={(e) => handleFieldChange('offerCtaText', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Booking Form Type</label>
                        <select
                          value={clinic.bookingType || 'modal'}
                          onChange={(e) => handleFieldChange('bookingType', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                        >
                          <option value="modal">In-App High Converting Multi-Step Form Modal</option>
                          <option value="external">Redirect to External Booking Link (JaneApp, Calendly, etc)</option>
                        </select>
                      </div>
                    </div>
                    {(clinic.bookingType === 'external' || clinic.bookingMode === 'external') && (
                      <div className="p-4 bg-emerald-50/20 border border-emerald-600/20 rounded-xl space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-stone-700">JaneApp / Calendly External Scheduling URL</label>
                        <input
                          type="url"
                          value={clinic.externalBookingUrl || ""}
                          placeholder="e.g. https://columbus-chiro.janeapp.com/embed/book"
                          onChange={(e) => handleFieldChange('externalBookingUrl', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono text-emerald-950"
                        />
                        <span className="block text-[10px] text-stone-500">Every CTA click on the landing page will directly open this scheduling link in a new secure window.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: DOCTOR & BIO & WHY US */}
              {activeContentSection === 'about' && (
                <div className="space-y-6">
                  {/* Doctor Info card */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Lead Doctor Bio & Quote Philosophy</h3>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Doctor Philosophy Statement / Signature Quote</label>
                      <textarea
                        rows={3}
                        value={clinic.doctorQuote}
                        onChange={(e) => handleFieldChange('doctorQuote', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-serif italic text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Why Us section headings */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Why Us Section Typography & Copy</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Why Us Header Title</label>
                        <input
                          type="text"
                          value={clinic.whyUsTitle || "Healthcare should feel personal again."}
                          onChange={(e) => handleFieldChange('whyUsTitle', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-serif text-stone-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Why Us Eyebrow / Subtitle</label>
                        <input
                          type="text"
                          value={clinic.whyUsSubtitle || "Our Standard"}
                          onChange={(e) => handleFieldChange('whyUsSubtitle', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why Us Pillars (The 3 standard pillars) */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Why Us 3 Core Pillars</h3>
                      <p className="text-xs text-stone-500 mt-0.5">Customize the core messaging of each marketing value pillar shown on-page.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Pillar 1 */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Pillar #1 (Communication)</span>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Title</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar1Title || "A real conversation."}
                              onChange={(e) => handleFieldChange('whyUsPillar1Title', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Description</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar1Desc || "No rush. We listen first."}
                              onChange={(e) => handleFieldChange('whyUsPillar1Desc', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pillar 2 */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Pillar #2 (Methodology)</span>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Title</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar2Title || "An actual plan."}
                              onChange={(e) => handleFieldChange('whyUsPillar2Title', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Description</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar2Desc || "Targeted physical rehab and modern adjustments."}
                              onChange={(e) => handleFieldChange('whyUsPillar2Desc', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pillar 3 */}
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Pillar #3 (Pricing/Contracts)</span>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Title</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar3Title || "Respect for your goals."}
                              onChange={(e) => handleFieldChange('whyUsPillar3Title', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Pillar Description</label>
                            <input
                              type="text"
                              value={clinic.whyUsPillar3Desc || "No high-pressure sales. No lifetime contracts."}
                              onChange={(e) => handleFieldChange('whyUsPillar3Desc', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CONDITIONS TREATED */}
              {activeContentSection === 'conditions' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Conditions Treated & Clinical Approach</h3>
                    <button
                      onClick={handleAddCondition}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Condition</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(clinic.customConditions || conditionsData).map((cond, idx) => (
                      <div key={cond.id || idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative group">
                        
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleReorderCondition(idx, 'up')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === (clinic.customConditions || conditionsData).length - 1}
                            onClick={() => handleReorderCondition(idx, 'down')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCondition(idx)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Condition Name</label>
                            <input
                              type="text"
                              value={cond.title}
                              onChange={(e) => handleUpdateCondition(idx, 'title', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Patient-friendly Subtitle</label>
                            <input
                              type="text"
                              value={cond.description}
                              onChange={(e) => handleUpdateCondition(idx, 'description', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Clinical Recovery Approach</label>
                          <textarea
                            rows={2}
                            value={cond.approach}
                            onChange={(e) => handleUpdateCondition(idx, 'approach', e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: TESTIMONIALS */}
              {activeContentSection === 'testimonials' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Patient Testimonials & Reviews</h3>
                    <button
                      onClick={handleAddTestimonial}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Testimonial</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(clinic.customTestimonials || testimonials).map((test, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative group">
                        
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleReorderTestimonial(idx, 'up')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === (clinic.customTestimonials || testimonials).length - 1}
                            onClick={() => handleReorderTestimonial(idx, 'down')}
                            className="p-1 rounded bg-white hover:bg-stone-100 text-stone-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(idx)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Testimonial Quote</label>
                          <textarea
                            rows={2}
                            value={test.quote}
                            onChange={(e) => handleUpdateTestimonial(idx, 'quote', e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg italic text-stone-800"
                          />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Author Name</label>
                            <input
                              type="text"
                              value={test.author}
                              onChange={(e) => handleUpdateTestimonial(idx, 'author', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Condition / Tags</label>
                            <input
                              type="text"
                              value={test.condition || ""}
                              onChange={(e) => handleUpdateTestimonial(idx, 'condition', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Rating (Stars)</label>
                            <select
                              value={test.rating || 5}
                              onChange={(e) => handleUpdateTestimonial(idx, 'rating', parseInt(e.target.value))}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-semibold"
                            >
                              <option value="5">5 Stars</option>
                              <option value="4">4 Stars</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Featured Success Story Card */}
                  <div className="pt-6 border-t border-stone-200 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Featured Athlete/Patient Success Story</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Edit the highlighted case study displayed beneath the patient review cards.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Patient Name</label>
                        <input
                          type="text"
                          value={clinic.patientStoryName || ""}
                          placeholder="e.g. Sarah Jenkins"
                          onChange={(e) => handleFieldChange('patientStoryName', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Patient Role / Identifier</label>
                        <input
                          type="text"
                          value={clinic.patientStoryRole || ""}
                          placeholder="e.g. Competitive Tennis Player & Mother of Two"
                          onChange={(e) => handleFieldChange('patientStoryRole', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Case Study Summary / Problem Statement</label>
                      <textarea
                        rows={2}
                        value={clinic.patientStorySummary || ""}
                        placeholder="e.g. After years of chronic lumbar spasms during matches, Sarah was told she needed surgery. She had to quit tournaments and couldn't lift her kids."
                        onChange={(e) => handleFieldChange('patientStorySummary', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Recovery Timeline & Care Plan</label>
                        <input
                          type="text"
                          value={clinic.patientStoryTimeline || ""}
                          placeholder="e.g. Within 6 weeks of active stabilization & customized dry needling."
                          onChange={(e) => handleFieldChange('patientStoryTimeline', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Ultimate Recovery Outcome / Achievement</label>
                        <input
                          type="text"
                          value={clinic.patientStoryOutcome || ""}
                          placeholder="e.g. Sarah finished her first full season completely pain-free."
                          onChange={(e) => handleFieldChange('patientStoryOutcome', e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PROCESS STEPS */}
              {activeContentSection === 'process' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Our Treatment Journey Process</h3>
                    <button
                      onClick={handleAddProcessStep}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(clinic.customProcessSteps || processSteps).map((step, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 relative group">
                        
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleDeleteProcessStep(idx)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Step Number</label>
                            <input
                              type="text"
                              value={step.number}
                              onChange={(e) => handleUpdateProcessStep(idx, 'number', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg text-center font-mono font-bold text-emerald-800"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Step Title</label>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleUpdateProcessStep(idx, 'title', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold text-stone-900"
                            />
                          </div>
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Short Action Explanation</label>
                            <input
                              type="text"
                              value={step.description}
                              onChange={(e) => handleUpdateProcessStep(idx, 'description', e.target.value)}
                              className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: FAQS */}
              {activeContentSection === 'faqs' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Frequently Asked Questions (FAQ)</h3>
                    <button
                      onClick={handleAddFAQ}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(clinic.customFaqs || faqs.map(f => ({ q: f.question, a: f.answer }))).map((faq, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative group">
                        
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleDeleteFAQ(idx)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Question Text</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => handleUpdateFAQ(idx, 'q', e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg font-bold text-stone-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Answer Explanation</label>
                          <textarea
                            rows={2}
                            value={faq.a}
                            onChange={(e) => handleUpdateFAQ(idx, 'a', e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-white border border-stone-300 rounded-lg text-stone-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: FINAL CTA */}
              {activeContentSection === 'cta' && (
                <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Final Footer CTA Conversion Banner</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Final Headline Text</label>
                      <input
                        type="text"
                        value={clinic.finalCtaHeadline || "Ready to Live Pain-Free?"}
                        onChange={(e) => handleFieldChange('finalCtaHeadline', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Button CTA Text</label>
                      <input
                        type="text"
                        value={clinic.finalCtaButtonText || "BOOK FIRST VISIT"}
                        onChange={(e) => handleFieldChange('finalCtaButtonText', e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Media Library & Photo Swapper</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Swapping images changes the site in real time. Simply paste a custom image URL or click to use our high-resolution chiropractic presets.
                </p>
              </div>

              {/* Main Image Managers */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* 1. HERO MAIN PHOTO */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <ImageUpload
                    label="1. Hero Banner Image"
                    description="Upload a custom hero image file or provide a URL."
                    currentValue={clinic.heroImage || ""}
                    onChange={(val) => handleFieldChange('heroImage', val)}
                    onReset={() => {
                      handleFieldChange('heroImage', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800');
                      showNotification("Reset hero back to modern medical suite!");
                    }}
                    aspectRatioClassName="aspect-video"
                  />
                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-bold text-stone-500">Unsplash Presets (Click to Swap)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800", label: "Medical Suite" },
                        { url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=800", label: "Treatment Table" },
                        { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800", label: "Lobby Reception" },
                        { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800", label: "Consulting Room" }
                      ].map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            handleFieldChange('heroImage', img.url);
                            showNotification(`Applied ${img.label} hero image!`);
                          }}
                          className={`text-[10px] py-1 px-1.5 rounded-md border text-left truncate cursor-pointer transition-colors ${
                            clinic.heroImage === img.url ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. DOCTOR PORTRAIT PHOTO */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <ImageUpload
                    label="2. Doctor Biography Portrait"
                    description="Upload a professional doctor headshot file or provide a URL."
                    currentValue={clinic.doctorImage || ""}
                    onChange={(val) => handleFieldChange('doctorImage', val)}
                    onReset={() => {
                      handleFieldChange('doctorImage', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600');
                      showNotification("Reset doctor portrait!");
                    }}
                    aspectRatioClassName="aspect-[4/3]"
                  />
                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-bold text-stone-500">Unsplash Doctor Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600", label: "Female Doctor (Warm)" },
                        { url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600", label: "Male Doctor (Glasses)" },
                        { url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=600", label: "Female Doctor (Direct)" },
                        { url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600", label: "Male Doctor (Smile)" }
                      ].map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            handleFieldChange('doctorImage', img.url);
                            showNotification(`Applied ${img.label} portrait!`);
                          }}
                          className={`text-[10px] py-1 px-1.5 rounded-md border text-left truncate cursor-pointer transition-colors ${
                            clinic.doctorImage === img.url ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. CLINIC INTERIOR ROOM */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <ImageUpload
                    label="3. Clinic Room / Studio Photo"
                    description="Upload an interior room or equipment photo file or provide a URL."
                    currentValue={clinic.clinicImage || ""}
                    onChange={(val) => handleFieldChange('clinicImage', val)}
                    onReset={() => {
                      handleFieldChange('clinicImage', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800');
                      showNotification("Reset clinic interior photo!");
                    }}
                    aspectRatioClassName="aspect-video"
                  />
                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-bold text-stone-500">Unsplash Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800", label: "Clinic Room Bed" },
                        { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800", label: "Spacious Lobby Waiting" }
                      ].map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            handleFieldChange('clinicImage', img.url);
                            showNotification(`Applied ${img.label} interior photo!`);
                          }}
                          className={`text-[10px] py-1 px-1.5 rounded-md border text-left truncate cursor-pointer transition-colors ${
                            clinic.clinicImage === img.url ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. PATIENT SUCCESS STORY PHOTO */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <ImageUpload
                    label="4. Patient Success Story Image"
                    description="Upload an image showing athletic recovery/active patient or provide a URL."
                    currentValue={clinic.patientImage || ""}
                    onChange={(val) => handleFieldChange('patientImage', val)}
                    onReset={() => {
                      handleFieldChange('patientImage', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600');
                      showNotification("Reset success story photo!");
                    }}
                    aspectRatioClassName="aspect-[4/3]"
                  />
                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-bold text-stone-500">Unsplash Athlete Presets</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600", label: "Yoga Pose Spine Alignment" },
                        { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600", label: "Active Stretching Gym" },
                        { url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=600", label: "Tennis Player Runner" }
                      ].map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            handleFieldChange('patientImage', img.url);
                            showNotification(`Applied ${img.label} patient photo!`);
                          }}
                          className={`text-[10px] py-1 px-1.5 rounded-md border text-left truncate cursor-pointer transition-colors ${
                            clinic.patientImage === img.url ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: LAUNCH & PUBLISH */}
          {activeTab === 'launch' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Launch & Deployment</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Configure custom domains, analytics tracking codes, and publish patient landing pages.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Live Deployment Status</h3>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-emerald-900">Landing Page is Published & Live</p>
                    <p className="text-xs text-emerald-700 font-mono">
                      {typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://your-practice.com/'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.origin);
                        showNotification("Live preview link copied to clipboard!");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Custom Subdomain</label>
                    <input
                      type="text"
                      placeholder="e.g. vance-chiropractic"
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Google Analytics ID</label>
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Agency Settings & Backups</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Manage SEO metadata, JSON backups, restore previous versions, and agency account preferences.
                </p>
              </div>

              {/* SEO Configurer Card */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-100 rounded text-stone-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Search Engine Optimization (SEO)</h3>
                </div>
                <p className="text-xs text-stone-500">Inject high-ranking, client-specific title tags and description tags to maximize local map-pack search visibility.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">SEO Page Title Tag</label>
                    <input
                      type="text"
                      value={clinic.seoTitle || ""}
                      onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                      placeholder={`${clinic.name} | Chiropractor in ${clinic.cityState}`}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={clinic.seoDescription || ""}
                      onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                      placeholder={`Looking for relief? ${clinic.name} in ${clinic.cityState} provides modern chiropractic adjustments, spinal care, and physical therapies for back pain and sports injuries.`}
                      className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* JSON Config Backup Card with Export & Import */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-100 rounded text-stone-700">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Config Import & Export Engine</h3>
                </div>
                <p className="text-xs text-stone-600">Export your configured layout as a single portable JSON file, or drag & drop to import a previously generated practice design instantly.</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between gap-3">
                    <div>
                      <span className="block font-bold text-xs text-stone-800">Export Current Client</span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">Download a secure copy of the currently loaded profile configuration.</span>
                    </div>
                    <button
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinic, null, 2));
                        const dl = document.createElement('a');
                        dl.setAttribute("href", dataStr);
                        dl.setAttribute("download", `${clinic.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backup.json`);
                        dl.click();
                        showNotification("Exported client config JSON successfully!");
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-stone-950 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON Backup</span>
                    </button>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between gap-3">
                    <div>
                      <span className="block font-bold text-xs text-stone-800">Import Client Configuration</span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">Upload a client .json backup to restore, clone, or migrate designs instantly.</span>
                    </div>
                    <label className="w-full px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                      <Upload className="w-4 h-4 text-stone-500" />
                      <span>Upload JSON Backup</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3. RIGHT SIDE (Live Preview with Device Switcher) */}
      <aside className="hidden lg:flex w-[450px] xl:w-[540px] bg-stone-950 border-l border-stone-800 flex-col shrink-0">
        
        {/* Preview Top Bar */}
        <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Real-Time Live Preview</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                deviceMode === 'desktop' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                deviceMode === 'mobile' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 bg-stone-900 p-4 flex items-center justify-center overflow-hidden">
          <div className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-700 ${
            deviceMode === 'mobile' ? 'w-[375px] h-[720px] rounded-[36px] border-8 border-stone-800' : 'w-full h-full'
          }`}>
            <iframe
              src={typeof window !== 'undefined' ? window.location.origin : '/'}
              title="Live Website Preview"
              className="w-full h-full border-0 pointer-events-auto"
            />
          </div>
        </div>
      </aside>

    </div>
  );
};
