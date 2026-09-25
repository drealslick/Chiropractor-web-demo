import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Palette,
  Layout,
  Globe,
  Sliders,
  ShieldCheck,
  Paintbrush,
  FileText,
  Inbox,
  Sparkles,
  Download,
  Copy,
  Check,
  Bell,
  CloudCheck,
  AlertCircle,
  Calendar,
  Zap,
  BookOpen,
  Activity,
  Heart,
  Clock,
  MessageSquare,
  HelpCircle,
  Building2,
  DollarSign,
  Star,
  Type,
  Eye,
  Info,
  ChevronRight,
  Menu,
  Shield,
  Layers,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  UploadCloud,
  FileCheck,
  Users,
  CreditCard,
  Plus,
  Stethoscope,
  User,
  ChevronDown,
  Home,
  Share2,
  Smartphone,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { ClinicInfo, AnnouncementBannerConfig } from '../types';
import { colorPalettes, resolvePalette } from '../data/colorPalettes';
import { ListsEditor } from './ListsEditor';
import { LeadsInbox } from './admin/LeadsInbox';
import { PracticeAudit } from './admin/PracticeAudit';
import { BookingSettings } from './admin/BookingSettings';
import { ExecutiveDashboard } from './admin/ExecutiveDashboard';
import { BlogManager } from './admin/BlogManager';
import { MediaManager } from './admin/MediaManager';
import { TeamManager, UserRole } from './admin/TeamManager';
import { LegalPolicyManager } from './admin/LegalPolicyManager';
import { ConditionManager } from './admin/ConditionManager';
import { HomepageConditionsEditor } from './admin/HomepageConditionsEditor';
import { FirstVisitManager } from './admin/FirstVisitManager';
import { AboutManager } from './admin/AboutManager';
import { OurTeamManager } from './admin/OurTeamManager';
import { PresetBackupManager } from './admin/PresetBackupManager';
import { NotificationHub } from './admin/NotificationHub';
import { getStoredLeads, PatientLead } from '../data/leadsStore';

interface AgencyWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
  syncStatus?: string;
  lastSaved?: string | null;
  hasSupabase?: boolean;
}

// Single Sidebar Navigation IDs
export type AdminTabId =
  // Dashboard
  | 'overview'
  | 'checklist'
  | 'leads'
  | 'booking'
  // Homepage Sections
  | 'copy'
  | 'discomforts'
  | 'homepage_conditions'
  | 'trust_badges'
  | 'why_us'
  | 'roadmap'
  | 'reviews'
  | 'environment'
  | 'faqs'
  // Core Pages
  | 'about'
  | 'our_team'
  | 'conditions'
  | 'first_visit'
  | 'pricing'
  | 'insurance'
  | 'financing'
  | 'legal'
  // Blog & Content
  | 'blog'
  | 'photos'
  // Design & Style
  | 'themes'
  | 'typography'
  | 'sections'
  // Settings & Tools
  | 'clinic_info'
  | 'seo'
  | 'announcement'
  | 'users'
  | 'presets';

export function AgencyWorkspace({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
  syncStatus = 'idle',
  lastSaved = null,
  hasSupabase = false,
}: AgencyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRolePreview, setActiveRolePreview] = useState<UserRole>('admin');
  const [selectedLeadToSchedule, setSelectedLeadToSchedule] = useState<PatientLead | null>(null);

  const [leadsCount, setLeadsCount] = useState<number>(() => getStoredLeads().length);
  const [socialPlatformPreview, setSocialPlatformPreview] = useState<'imessage' | 'twitter' | 'facebook'>('imessage');
  const [copiedSocialLink, setCopiedSocialLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setLeadsCount(getStoredLeads().length);
    };
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPalette = resolvePalette(clinic.colorPalette);
  const hasCustomColors = Boolean(
    clinic.customPrimaryColor ||
    clinic.customAccentColor ||
    clinic.customBgColor ||
    clinic.customTextColor
  );
  const primaryVal = clinic.customPrimaryColor || currentPalette.preview.primary;
  const accentVal = clinic.customAccentColor || currentPalette.preview.accent;
  const bgVal = clinic.customBgColor || currentPalette.preview.bg;
  const textVal = clinic.customTextColor || currentPalette.variables['--theme-text'] || '#1C1917';

  // Navigation Groups Definition with Page-First Architecture & Role-Based Access Control Filtering
  const allNavGroups = [
    {
      group: 'DASHBOARD',
      icon: Layout,
      minRole: 'staff' as UserRole,
      collapsible: false,
      items: [
        { id: 'overview' as AdminTabId, label: 'Overview', icon: Layout, badge: clinic.isProductionMode ? 'Live' : 'Demo' },
        { id: 'checklist' as AdminTabId, label: 'Setup Checklist', icon: Sparkles, minRole: 'admin' as UserRole },
        { id: 'leads' as AdminTabId, label: 'Patient Inquiries', icon: Inbox, badge: leadsCount > 0 ? leadsCount : undefined },
        { id: 'booking' as AdminTabId, label: 'Booking & EHR', icon: Calendar },
      ],
    },
    {
      group: 'HOMEPAGE SECTIONS',
      icon: Home,
      minRole: 'editor' as UserRole,
      collapsible: true,
      items: [
        { id: 'copy' as AdminTabId, label: 'Homepage Hero & Copy', icon: FileText, highlight: true },
        { id: 'discomforts' as AdminTabId, label: 'Discomfort Selector', icon: Activity },
        { id: 'homepage_conditions' as AdminTabId, label: 'Homepage Conditions', icon: Stethoscope, badge: 'Home' },
        { id: 'trust_badges' as AdminTabId, label: 'Trust & Badges', icon: ShieldCheck },
        { id: 'why_us' as AdminTabId, label: 'Why Choose Us (Homepage)', icon: Heart },
        { id: 'roadmap' as AdminTabId, label: '3-Phase Roadmap', icon: Clock },
        { id: 'reviews' as AdminTabId, label: 'Patient Reviews & Case Studies', icon: MessageSquare },
        { id: 'environment' as AdminTabId, label: 'Clinic Gallery & Environment', icon: Sparkles },
        { id: 'faqs' as AdminTabId, label: 'FAQs & First Visit', icon: HelpCircle },
      ],
    },
    {
      group: 'CORE PAGES',
      icon: Layers,
      minRole: 'editor' as UserRole,
      collapsible: true,
      items: [
        { id: 'about' as AdminTabId, label: 'About & Clinician', icon: User, badge: 'Page' },
        { id: 'our_team' as AdminTabId, label: 'Our Team & Clinicians', icon: Users, badge: (clinic.publicTeamMembers?.length || 3).toString() },
        { id: 'conditions' as AdminTabId, label: 'Conditions & Protocols', icon: Layers, badge: 'Pages' },
        { id: 'first_visit' as AdminTabId, label: 'First Visit Guide', icon: FileText, badge: 'Guide' },
        { id: 'pricing' as AdminTabId, label: 'Pricing & Fees', icon: DollarSign, badge: (clinic.customFeeItems?.length || 2).toString() },
        { id: 'insurance' as AdminTabId, label: 'Insurance Partners', icon: Shield, badge: (clinic.customInsurances?.length || 6).toString() },
        { id: 'financing' as AdminTabId, label: 'Financing Plans', icon: CreditCard },
        { id: 'legal' as AdminTabId, label: 'Legal Pages & Policies', icon: FileCheck },
      ],
    },
    {
      group: 'BLOG & CONTENT',
      icon: BookOpen,
      minRole: 'editor' as UserRole,
      collapsible: true,
      items: [
        { id: 'blog' as AdminTabId, label: 'Blog & Articles', icon: BookOpen, badge: clinic.customPosts !== undefined ? clinic.customPosts.length : 4 },
        { id: 'photos' as AdminTabId, label: 'Media Library', icon: UploadCloud, badge: 'New' },
      ],
    },
    {
      group: 'DESIGN & STYLE',
      icon: Palette,
      minRole: 'admin' as UserRole,
      collapsible: true,
      items: [
        { id: 'themes' as AdminTabId, label: 'Themes & Colors', icon: Palette },
        { id: 'typography' as AdminTabId, label: 'Typography & Fonts', icon: Type },
        { id: 'sections' as AdminTabId, label: 'Section Visibility', icon: Eye },
      ],
    },
    {
      group: 'SETTINGS & TOOLS',
      icon: Sliders,
      minRole: 'admin' as UserRole,
      collapsible: true,
      items: [
        { id: 'clinic_info' as AdminTabId, label: 'Clinic Information', icon: Building2 },
        { id: 'seo' as AdminTabId, label: 'SEO & Meta Tags', icon: Globe },
        { id: 'announcement' as AdminTabId, label: 'Announcement Alert', icon: Bell },
        { id: 'users' as AdminTabId, label: 'Users & Team Roles', icon: Users, badge: (clinic.customTeamMembers?.length || 3).toString() },
        { id: 'presets' as AdminTabId, label: 'Presets & Backups', icon: Download },
      ],
    },
  ];

  // Helper to locate which category accordion group holds a given tab
  const findGroupForTab = (tabId: AdminTabId): string => {
    for (const g of allNavGroups) {
      if (g.items.some((i) => i.id === tabId)) {
        return g.group;
      }
    }
    return 'HOMEPAGE SECTIONS';
  };

  const [openAccordion, setOpenAccordion] = useState<string>(() => findGroupForTab(activeTab));

  // Automatically expand parent accordion when activeTab changes (e.g. from internal page links)
  useEffect(() => {
    const parentGroup = findGroupForTab(activeTab);
    if (parentGroup && parentGroup !== 'DASHBOARD') {
      setOpenAccordion(parentGroup);
    }
  }, [activeTab]);

  const toggleGroup = (groupName: string) => {
    setOpenAccordion((prev) => (prev === groupName ? '' : groupName));
  };

  // Filter navigation groups and individual items based on active role preview
  const roleRank: Record<UserRole, number> = { staff: 1, editor: 2, admin: 3 };
  const userRank = roleRank[activeRolePreview] || 3;

  const navGroups = allNavGroups
    .filter((g) => {
      const groupMinRank = roleRank[g.minRole || 'staff'] || 1;
      return userRank >= groupMinRank;
    })
    .map((g) => ({
      ...g,
      items: g.items.filter((item: any) => {
        const itemMinRank = item.minRole ? roleRank[item.minRole as UserRole] : 1;
        return userRank >= itemMinRank;
      }),
    }))
    .filter((g) => g.items.length > 0);

  // Flat array of accessible tab IDs for quick lookup
  const accessibleTabIds = navGroups.flatMap((g) => g.items.map((i) => i.id));

  // If current active tab is inaccessible in the selected role preview, default to overview
  useEffect(() => {
    if (!accessibleTabIds.includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [activeRolePreview, accessibleTabIds, activeTab]);

  const banner = clinic.announcementBanner || { enabled: false, message: '', variant: 'amber' };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full md:w-[860px] lg:w-[980px] xl:w-[1080px] max-w-full bg-stone-900 text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Persistent Top Header with Save Status */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-stone-900 text-stone-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  {clinic.name || 'Private Practice'} Admin
                </h2>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                  Site Editor
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                <span className="text-emerald-400 font-medium">
                  {hasSupabase ? (syncStatus === 'synced' ? '🟢 Cloud Synced' : '🔄 Syncing...') : '💾 Local Storage'}
                </span>
                {lastSaved && (
                  <>
                    <span>•</span>
                    <span className="text-stone-400 font-mono">Saved {lastSaved}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reception Notification Hub (Top Bar Bell & Alerts Dropdown) */}
            <NotificationHub
              onNavigateTab={(tab) => {
                if (tab === 'leads') setActiveTab('leads');
                else if (tab === 'booking') setActiveTab('booking');
                else if (tab === 'setup') setActiveTab('checklist');
              }}
            />

            {/* Quick Role Preview Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400">Role:</span>
              <select
                value={activeRolePreview}
                onChange={(e) => setActiveRolePreview(e.target.value as UserRole)}
                className="bg-transparent text-emerald-400 font-bold text-xs cursor-pointer outline-none capitalize"
                title="Preview admin interface from perspective of staff, editor, or owner"
              >
                <option value="admin" className="bg-stone-900 text-stone-200">Admin (Full)</option>
                <option value="editor" className="bg-stone-900 text-stone-200">Editor (Content)</option>
                <option value="staff" className="bg-stone-900 text-stone-200">Staff (Front Desk)</option>
              </select>
            </div>

            <button
              onClick={onResetDefault}
              className="px-2.5 py-1 text-stone-400 hover:text-amber-400 transition hover:bg-stone-850 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-amber-900/50"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-medium">Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white transition hover:bg-stone-800 rounded-lg cursor-pointer"
              aria-label="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Clean Left Sidebar + Right Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar Navigation */}
          <aside
            className={`
              absolute md:relative z-30 md:z-auto inset-y-0 left-0
              w-64 md:w-56 lg:w-60 shrink-0 bg-stone-950 border-r border-stone-800/90
              flex flex-col justify-between overflow-y-auto no-scrollbar
              transition-transform duration-200 ease-in-out
              ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
            `}
          >
            <div className="p-3 space-y-3">
              {navGroups.map((group) => {
                const isCollapsible = group.collapsible !== false;
                const isGroupOpen = !isCollapsible || openAccordion === group.group;
                const GroupIcon = group.icon || Layout;
                const hasActiveItem = group.items.some((item) => item.id === activeTab);

                return (
                  <div key={group.group} className="space-y-1">
                    {/* Collapsible Accordion Header */}
                    {isCollapsible ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.group)}
                        className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-bold tracking-wider uppercase transition cursor-pointer text-left select-none ${
                          isGroupOpen || hasActiveItem
                            ? 'text-stone-200 bg-stone-900/80 hover:bg-stone-900'
                            : 'text-stone-400 hover:text-stone-300 hover:bg-stone-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <GroupIcon className={`w-3.5 h-3.5 shrink-0 ${hasActiveItem ? 'text-emerald-400' : 'text-stone-400'}`} />
                          <span className="truncate">{group.group}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasActiveItem && !isGroupOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Active item inside" />
                          )}
                          <span className="text-[10px] text-stone-400 font-mono">
                            {group.items.length}
                          </span>
                          {isGroupOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                      </button>
                    ) : (
                      /* Non-collapsible Dashboard Header */
                      <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase flex items-center justify-between">
                        <span>{group.group}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{group.items.length}</span>
                      </div>
                    )}

                    {/* Accordion Items List */}
                    {isGroupOpen && (
                      <div className="space-y-0.5 pl-1 transition-all duration-150">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer text-left ${
                                isActive
                                  ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-200' : 'text-stone-400'}`} />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge !== undefined && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                    isActive
                                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-700'
                                      : 'bg-stone-850 text-stone-400 border border-stone-750'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Quick Help Card */}
            <div className="p-3 border-t border-stone-850 bg-stone-950/60">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Live Preview</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Every change auto-saves and updates the live website instantly.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6 bg-stone-900">
            {/* Mobile Tab Dropdown Selector */}
            <div className="md:hidden pb-3 border-b border-stone-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Navigation Section:
                </label>
                <span className="text-[10px] text-emerald-400 font-bold capitalize">
                  Role: {activeRolePreview}
                </span>
              </div>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminTabId)}
                className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 font-bold cursor-pointer"
              >
                {navGroups.map((group) => (
                  <optgroup key={group.group} label={group.group} className="bg-stone-900 text-stone-400 font-bold">
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id} className="bg-stone-850 text-stone-200">
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <ExecutiveDashboard
                clinic={clinic}
                onUpdateClinic={onUpdateClinic}
                onNavigateTab={(tab, subTab) => {
                  if (tab === 'leads') setActiveTab('leads');
                  else if (tab === 'booking') setActiveTab('booking');
                  else if (tab === 'setup') setActiveTab('checklist');
                  else if (tab === 'site') {
                    if (subTab === 'copy') setActiveTab('copy');
                    else if (subTab === 'blog') setActiveTab('blog');
                    else if (subTab === 'branding') setActiveTab('themes');
                    else if (subTab === 'lists') setActiveTab('discomforts');
                    else setActiveTab('clinic_info');
                  }
                }}
                hasSupabase={hasSupabase}
                syncStatus={syncStatus}
                role={activeRolePreview}
              />
            )}

            {/* 2. SETUP CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Practice Setup & Launch Checklist</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Verify key clinical details, contact channels, and conversion settings before launching.
                    </p>
                  </div>
                </div>
                <PracticeAudit clinic={clinic} hasSupabase={hasSupabase} syncStatus={syncStatus} />
              </div>
            )}

            {/* 3. PATIENT LEADS */}
            {activeTab === 'leads' && (
              <LeadsInbox
                clinicName={clinic.name || 'Clinic'}
                role={activeRolePreview}
                onAssignToCalendar={(lead) => {
                  setSelectedLeadToSchedule(lead);
                  setActiveTab('booking');
                }}
              />
            )}

            {/* 4. BOOKING & EHR */}
            {activeTab === 'booking' && (
              <BookingSettings
                role={activeRolePreview}
                assignedLead={selectedLeadToSchedule}
                onClearAssignedLead={() => setSelectedLeadToSchedule(null)}
              />
            )}

            {/* 5. HEADLINES & COPY (Plain English, Helper Texts, Live Preview) */}
            {activeTab === 'copy' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Homepage Hero & Copy</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Customize your homepage hero headlines, doctor biography, and value propositions. All fields have plain-English helper descriptions.
                  </p>
                </div>

                {/* Live Real-Time Mini Preview Card */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                        Live Homepage Hero Preview
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">Updates dynamically</span>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {clinic.heroBadge || 'Private Chiropractic Practice'}
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100 leading-tight">
                      {clinic.heroHook || 'Get Out of Chronic Pain Without Surgery'}
                    </h4>
                    {clinic.heroUrgentPain && (
                      <p className="text-xs font-medium text-amber-300/90 leading-snug">
                        {clinic.heroUrgentPain}
                      </p>
                    )}
                    <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                      {clinic.heroSubhead ||
                        'Gentle, evidence-based adjustments combined with targeted movement rehabilitation so your relief lasts.'}
                    </p>

                    {/* Mini Offer Box */}
                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-stone-200 block text-xs">
                          {clinic.offerTitle || 'New Patient: $49 Complete Spinal Exam & Assessment'}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {clinic.offerSubtext || 'Includes digital posture scan & customized relief plan.'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                        {clinic.offerCtaText || 'CLAIM $49 SPECIAL →'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Hero Section Copy */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Hero Section (Top of Homepage)
                    </h4>
                  </div>

                  <Field
                    label="Top Eyebrow Badge"
                    value={clinic.heroBadge || ''}
                    placeholder="Private Chiropractic Practice • Accepting New Patients"
                    helperText="Small badge displayed above the main headline at the very top of your homepage."
                    locationBadge="Top of Hero"
                    onChange={(v) => onUpdateClinic({ ...clinic, heroBadge: v })}
                  />

                  <Field
                    label="Main Headline"
                    textarea
                    value={clinic.heroHook || ''}
                    placeholder="Get Out of Chronic Pain Without Surgery"
                    helperText="The big headline at the very top of the page. Speaks directly to the patient's primary complaint or goal."
                    locationBadge="Hero Main Headline"
                    onChange={(v) => onUpdateClinic({ ...clinic, heroHook: v })}
                  />

                  <Field
                    label="Sub-headline & Urgency Hook"
                    value={clinic.heroUrgentPain || ''}
                    placeholder="Same-day appointments available for acute back, neck, and nerve pain."
                    helperText="Supporting line directly beneath the main headline to acknowledge their symptoms and provide immediate reassurance."
                    locationBadge="Hero Sub-hook"
                    onChange={(v) => onUpdateClinic({ ...clinic, heroUrgentPain: v })}
                  />

                  <Field
                    label="Supporting Value Description"
                    textarea
                    value={clinic.heroSubhead || ''}
                    placeholder="Gentle, evidence-based adjustments combined with targeted movement rehabilitation so your relief lasts."
                    helperText="2-3 sentences explaining your gentle diagnostic approach, 1-on-1 care, and why your clinic gets lasting results."
                    locationBadge="Hero Description"
                    onChange={(v) => onUpdateClinic({ ...clinic, heroSubhead: v })}
                  />
                </div>

                {/* Section 2: Special New Patient Offer */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Special New Patient Offer
                    </h4>
                  </div>

                  <Field
                    label="Special Offer Headline"
                    value={clinic.offerTitle || ''}
                    placeholder="New Patient Special: $49 Complete Spinal Exam & Assessment"
                    helperText="The headline of your introductory patient offer card to remove financial friction for first-time visitors."
                    locationBadge="Offer Card"
                    onChange={(v) => onUpdateClinic({ ...clinic, offerTitle: v })}
                  />

                  <Field
                    label="Special Offer Terms & Urgency"
                    value={clinic.offerSubtext || ''}
                    placeholder="Includes digital posture scan & customized relief plan. First 20 patients this month."
                    helperText="Supporting details for the offer explaining what's included and creating gentle urgency."
                    locationBadge="Offer Card Subtext"
                    onChange={(v) => onUpdateClinic({ ...clinic, offerSubtext: v })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Primary Action Button Text"
                      value={clinic.offerCtaText || ''}
                      placeholder="CLAIM $49 SPECIAL →"
                      helperText="The call-to-action text on your primary booking buttons."
                      locationBadge="All CTA Buttons"
                      onChange={(v) => onUpdateClinic({ ...clinic, offerCtaText: v })}
                    />
                    <Field
                      label="Trust Line & Guarantee Subtext"
                      value={clinic.heroTrustLine || ''}
                      placeholder="No long-term contracts • HSA/FSA accepted"
                      helperText="Reassurance text displayed under the main button."
                      locationBadge="Under CTA Button"
                      onChange={(v) => onUpdateClinic({ ...clinic, heroTrustLine: v })}
                    />
                  </div>
                </div>

                {/* Section 3: Doctor Biography & Care Philosophy */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Doctor Profile & Philosophy
                    </h4>
                  </div>

                  <Field
                    label="Doctor Biography & Clinical Background"
                    textarea
                    value={clinic.doctorBio || ''}
                    placeholder="Dr. Marcus Vance brings over 14 years of clinical experience specializing in non-invasive spine care..."
                    helperText="Your personal clinical background, education, and years in practice displayed in the Doctor Profile section."
                    locationBadge="Doctor Section"
                    onChange={(v) => onUpdateClinic({ ...clinic, doctorBio: v })}
                  />

                  <Field
                    label="Clinical Care Philosophy"
                    textarea
                    value={clinic.doctorPhilosophy || ''}
                    placeholder="We focus on rapid discharge and patient independence, not endless visit packages."
                    helperText="Your core treatment methodology and ethical stance on patient care."
                    locationBadge="Doctor Philosophy"
                    onChange={(v) => onUpdateClinic({ ...clinic, doctorPhilosophy: v })}
                  />
                </div>

                {/* Section 4: Satisfaction Guarantee */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Peace of Mind Guarantee
                    </h4>
                  </div>

                  <Field
                    label="Satisfaction Guarantee Headline"
                    value={clinic.guaranteeTitle || ''}
                    placeholder="The 100% Patient Peace of Mind Guarantee"
                    helperText="Headline for your patient peace-of-mind guarantee card."
                    locationBadge="Guarantee Box"
                    onChange={(v) => onUpdateClinic({ ...clinic, guaranteeTitle: v })}
                  />

                  <Field
                    label="Satisfaction Guarantee Details"
                    textarea
                    value={clinic.guaranteeDesc || ''}
                    placeholder="If you don't feel complete confidence in our diagnostic findings and care plan after your first visit, your exam fee is cheerfully refunded."
                    helperText="Specific terms explaining your satisfaction guarantee."
                    locationBadge="Guarantee Box"
                    onChange={(v) => onUpdateClinic({ ...clinic, guaranteeDesc: v })}
                  />
                </div>
              </div>
            )}

            {/* 5b. ABOUT PAGE & CLINICIAN PROFILE */}
            {activeTab === 'about' && (
              <AboutManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 5c. OUR TEAM & DOCTORS */}
            {activeTab === 'our_team' && (
              <OurTeamManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 6. PHOTOS & VISUAL ASSETS */}
            {activeTab === 'photos' && (
              <MediaManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 7. BLOG & ARTICLES */}
            {activeTab === 'blog' && (
              <BlogManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 8. DISCOMFORTS */}
            {activeTab === 'discomforts' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="triage" />
            )}

            {/* 8b. HOMEPAGE CONDITIONS SECTION */}
            {activeTab === 'homepage_conditions' && (
              <HomepageConditionsEditor
                clinic={clinic}
                onUpdateClinic={onUpdateClinic}
                onNavigateToMiniPageBuilder={() => setActiveTab('conditions')}
              />
            )}

            {/* HOMEPAGE: TRUST & ACCREDITATION BADGES */}
            {activeTab === 'trust_badges' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="trust" />
            )}

            {/* 9. CONDITIONS & PROTOCOLS (MINI-PAGE BUILDER) */}
            {activeTab === 'conditions' && (
              <ConditionManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 10. WHY CHOOSE US */}
            {activeTab === 'why_us' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="why-us" />
            )}

            {/* 11. 3-PHASE ROADMAP */}
            {activeTab === 'roadmap' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="process" />
            )}

            {/* 12. PATIENT REVIEWS */}
            {activeTab === 'reviews' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="reviews" />
            )}

            {/* HOMEPAGE: CLINIC GALLERY & ENVIRONMENT */}
            {activeTab === 'environment' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="sanctuary" />
            )}

            {/* 13. PATIENT FAQS */}
            {activeTab === 'faqs' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="faqs" />
            )}

            {/* 13b. FIRST VISIT GUIDE */}
            {activeTab === 'first_visit' && (
              <FirstVisitManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 14. LEGAL PAGES & POLICIES */}
            {activeTab === 'legal' && (
              <LegalPolicyManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}

            {/* 15. PRICING & FEES */}
            {activeTab === 'pricing' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="pricing" />
            )}

            {/* 16. INSURANCE PARTNERS */}
            {activeTab === 'insurance' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="insurance" />
            )}

            {/* 17. FINANCING PLANS */}
            {activeTab === 'financing' && (
              <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} initialCategory="financing" />
            )}

            {/* 13. CLINIC INFO & LOGISTICS (4 Distinct Subsections) */}
            {activeTab === 'clinic_info' && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Clinic Information</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Organized into official practice contact details, operating hours, parking instructions, and EHR booking integrations.
                  </p>
                </div>

                {/* Sub-Section 1: Contact Details */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      1. Contact Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Clinic Name"
                      value={clinic.name || ''}
                      placeholder="e.g. Columbus Chiropractic Care"
                      helperText="Official practice trade name."
                      onChange={(v) => onUpdateClinic({ ...clinic, name: v })}
                    />
                    <Field
                      label="Practice Tagline"
                      value={clinic.tagline || ''}
                      placeholder="e.g. Modern Spine & Sports Recovery"
                      helperText="Short practice motto shown in header."
                      onChange={(v) => onUpdateClinic({ ...clinic, tagline: v })}
                    />
                  </div>

                  <Field
                    label="Lead Doctor Name & Credentials"
                    value={clinic.doctorName || ''}
                    placeholder="e.g. Dr. Marcus Vance, D.C., DACBSP"
                    helperText="Doctor full name and post-graduate clinical board designations."
                    onChange={(v) => onUpdateClinic({ ...clinic, doctorName: v })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Phone Number (Display Format)"
                      value={clinic.phone || ''}
                      placeholder="(614) 555-0192"
                      helperText="Formatted telephone for human eyes."
                      onChange={(v) => onUpdateClinic({ ...clinic, phone: v })}
                    />
                    <Field
                      label="Phone (Tap-to-Call Digits)"
                      value={clinic.phoneRaw || ''}
                      placeholder="6145550192"
                      helperText="Numeric only for smartphone 1-tap dialing."
                      onChange={(v) => onUpdateClinic({ ...clinic, phoneRaw: v })}
                    />
                  </div>

                  <Field
                    label="Email Address"
                    value={clinic.email || ''}
                    placeholder="care@columbuschiropractic.com"
                    helperText="Patient inquiries and appointment confirmation contact."
                    onChange={(e) => onUpdateClinic({ ...clinic, email: e })}
                  />

                  <Field
                    label="Physical Street Address"
                    value={clinic.address || ''}
                    placeholder="1280 N High St, Suite 200"
                    helperText="Clinic physical street location."
                    onChange={(v) => onUpdateClinic({ ...clinic, address: v })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="City, State"
                      value={clinic.cityState || clinic.city || ''}
                      placeholder="Columbus, OH"
                      helperText="City and state abbreviation."
                      onChange={(v) =>
                        onUpdateClinic({ ...clinic, cityState: v, city: v })
                      }
                    />
                    <Field
                      label="Postal / Zip Code"
                      value={clinic.zip || ''}
                      placeholder="43201"
                      helperText="Postal zip code for Local SEO Schema."
                      onChange={(v) => onUpdateClinic({ ...clinic, zip: v })}
                    />
                  </div>
                </div>

                {/* Sub-Section 2: Hours & Availability */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      2. Hours & Availability
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Weekday Operating Hours"
                      value={clinic.hoursWeekday || ''}
                      placeholder="Mon–Thu: 8:00 AM – 6:00 PM, Fri: 8:00 AM – 2:00 PM"
                      helperText="Standard Monday through Friday schedule."
                      onChange={(v) => onUpdateClinic({ ...clinic, hoursWeekday: v })}
                    />
                    <Field
                      label="Saturday / Weekend Hours"
                      value={clinic.hoursSaturday || ''}
                      placeholder="Sat: 9:00 AM – 1:00 PM (By appointment only)"
                      helperText="Weekend availability note."
                      onChange={(v) => onUpdateClinic({ ...clinic, hoursSaturday: v })}
                    />
                  </div>

                  <Field
                    label="Parking & Directions Note"
                    value={clinic.parkingNote || ''}
                    placeholder="Free dedicated patient parking in rear lot. Elevator access on 2nd floor."
                    helperText="Helpful arrival directions for first-time visitors."
                    onChange={(v) => onUpdateClinic({ ...clinic, parkingNote: v })}
                  />
                </div>

                {/* Sub-Section 3: Pricing & Fee Settings */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        3. Pricing & Payment Settings
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pricing')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Dynamic Fee Schedule & Pricing Page →</span>
                    </button>
                  </div>

                  {/* Dedicated Pricing Page Callout Banner */}
                  <div className="p-3.5 bg-stone-900 border border-emerald-900/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-stone-200">
                          Dedicated Pricing & Fees Page Editor
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pricing')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 cursor-pointer transition"
                      >
                        Open Pricing Editor →
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Custom tiered fee plans, itemized services, badges (*e.g. Recommended First Step*), and visit inclusions are centrally managed under <strong className="text-stone-300">Core Pages → Pricing & Fees</strong>.
                    </p>
                  </div>

                  {/* Quick Price Reference Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Initial Exam Fee (Quick Reference)"
                      value={clinic.examFee || ''}
                      placeholder="£49 initial exam"
                      helperText="Published price for first-time comprehensive examination."
                      onChange={(v) => {
                        const nextItems = clinic.customFeeItems ? [...clinic.customFeeItems] : [];
                        if (nextItems[0]) nextItems[0] = { ...nextItems[0], price: v };
                        onUpdateClinic({ ...clinic, examFee: v, customFeeItems: nextItems.length ? nextItems : undefined });
                      }}
                    />
                    <Field
                      label="Standard Follow-up Visit Fee (Quick Reference)"
                      value={clinic.followUpFee || ''}
                      placeholder="£50 follow-up"
                      helperText="Routine follow-up treatment price."
                      onChange={(v) => {
                        const nextItems = clinic.customFeeItems ? [...clinic.customFeeItems] : [];
                        if (nextItems[1]) nextItems[1] = { ...nextItems[1], price: v };
                        onUpdateClinic({ ...clinic, followUpFee: v, customFeeItems: nextItems.length ? nextItems : undefined });
                      }}
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                    <button
                      type="button"
                      onClick={() => setActiveTab('insurance')}
                      className="text-stone-400 hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Configure Insurance Partners ({clinic.customInsurances?.length || 6}) →</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('financing')}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Configure Financing & Payment Plans →</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Section 4: Integrations & Reputation */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      4. Integrations & Online Reputation
                    </h4>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-stone-200 block">External EHR / Booking Link</span>
                      <span className="text-[11px] text-stone-400">
                        {clinic.externalBookingUrl
                          ? `Connected to EHR (${clinic.bookingEmbedMode || 'iframe'} mode)`
                          : 'Currently using built-in 3-step triage booking form'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('booking')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                    >
                      Configure Booking Link →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Google Star Rating"
                      value={clinic.googleRating?.toString() || ''}
                      placeholder="4.9"
                      helperText="Average Google Business rating (e.g. 4.9 or 5.0)."
                      onChange={(v) => onUpdateClinic({ ...clinic, googleRating: parseFloat(v) || v })}
                    />
                    <Field
                      label="Verified Review Count"
                      value={clinic.googleReviewCount?.toString() || clinic.googleReviewsCount?.toString() || ''}
                      placeholder="140+"
                      helperText="Total number of 5-star reviews on Google Maps."
                      onChange={(v) => onUpdateClinic({ ...clinic, googleReviewCount: v, googleReviewsCount: v })}
                    />
                  </div>
                </div>

                {/* Sub-Section 5: Clinic Social Media Profiles */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        5. Clinic Social Media Profiles & Channels
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateClinic({
                            ...clinic,
                            instagram: 'https://instagram.com/vancehealth',
                            facebook: 'https://facebook.com/vancehealth',
                            googleBusiness: 'https://maps.google.com/?q=Vance+Health+Central+Practice+London',
                            youtube: 'https://youtube.com/@vancehealth',
                            linkedin: 'https://linkedin.com/company/vancehealth',
                            twitter: 'https://x.com/vancehealth',
                          })
                        }
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      >
                        + Fill Demo Socials
                      </button>
                      <span className="text-stone-700">|</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateClinic({
                            ...clinic,
                            instagram: '',
                            facebook: '',
                            googleBusiness: '',
                            youtube: '',
                            linkedin: '',
                            twitter: '',
                            tiktok: '',
                          })
                        }
                        className="text-[11px] font-semibold text-stone-500 hover:text-stone-300 transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400">
                    Add links to your practice’s active social channels. These appear in the website footer, the Contact & Location page, and are automatically connected into your Google Schema.org entity graph (<code className="text-emerald-300 font-mono">sameAs</code>) for search authority.
                  </p>

                  {/* Active Preview Badges */}
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                      Active Website Badges Preview:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {clinic.googleBusiness && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>Google Business</span>
                        </span>
                      )}
                      {clinic.instagram && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Instagram className="w-3 h-3 text-pink-400" />
                          <span>Instagram</span>
                        </span>
                      )}
                      {clinic.facebook && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Facebook className="w-3 h-3 text-blue-400" />
                          <span>Facebook</span>
                        </span>
                      )}
                      {clinic.youtube && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Youtube className="w-3 h-3 text-red-400" />
                          <span>YouTube</span>
                        </span>
                      )}
                      {clinic.linkedin && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Linkedin className="w-3 h-3 text-sky-400" />
                          <span>LinkedIn</span>
                        </span>
                      )}
                      {clinic.twitter && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <Twitter className="w-3 h-3 text-stone-300" />
                          <span>X / Twitter</span>
                        </span>
                      )}
                      {clinic.tiktok && (
                        <span className="px-2 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-medium flex items-center gap-1.5 border border-stone-700">
                          <span className="text-teal-300 font-bold text-xs">♪</span>
                          <span>TikTok</span>
                        </span>
                      )}
                      {!clinic.googleBusiness && !clinic.instagram && !clinic.facebook && !clinic.youtube && !clinic.linkedin && !clinic.twitter && !clinic.tiktok && (
                        <span className="text-xs text-stone-500 italic">No social accounts configured yet. Fill in the fields below to display them on the site.</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Field
                      label="Instagram Profile URL"
                      value={clinic.instagram || ''}
                      placeholder="https://instagram.com/yourclinic"
                      helperText="Official Instagram account URL."
                      onChange={(v) => onUpdateClinic({ ...clinic, instagram: v })}
                    />
                    <Field
                      label="Facebook Page URL"
                      value={clinic.facebook || ''}
                      placeholder="https://facebook.com/yourclinic"
                      helperText="Clinic Facebook business page."
                      onChange={(v) => onUpdateClinic({ ...clinic, facebook: v })}
                    />
                    <Field
                      label="Google Business Profile / Maps URL"
                      value={clinic.googleBusiness || ''}
                      placeholder="https://maps.google.com/?q=Your+Practice+Name"
                      helperText="Google Maps listing or review link."
                      onChange={(v) => onUpdateClinic({ ...clinic, googleBusiness: v })}
                    />
                    <Field
                      label="YouTube Channel URL"
                      value={clinic.youtube || ''}
                      placeholder="https://youtube.com/@yourclinic"
                      helperText="Exercise tutorials and patient stories."
                      onChange={(v) => onUpdateClinic({ ...clinic, youtube: v })}
                    />
                    <Field
                      label="LinkedIn Company / Doctor URL"
                      value={clinic.linkedin || ''}
                      placeholder="https://linkedin.com/company/yourclinic"
                      helperText="Professional healthcare network profile."
                      onChange={(v) => onUpdateClinic({ ...clinic, linkedin: v })}
                    />
                    <Field
                      label="X / Twitter Profile URL"
                      value={clinic.twitter || ''}
                      placeholder="https://x.com/yourclinic"
                      helperText="Clinic Twitter / X profile."
                      onChange={(v) => onUpdateClinic({ ...clinic, twitter: v })}
                    />
                    <Field
                      label="TikTok Profile URL"
                      value={clinic.tiktok || ''}
                      placeholder="https://tiktok.com/@yourclinic"
                      helperText="Short-form posture & mobility videos."
                      onChange={(v) => onUpdateClinic({ ...clinic, tiktok: v })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 14. THEMES & COLORS */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Themes & Color Palettes</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Select a designer-crafted color system or fine-tune specific brand hex codes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(colorPalettes).map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        onUpdateClinic({
                          ...clinic,
                          colorPalette: p.id,
                          customPrimaryColor: undefined,
                          customAccentColor: undefined,
                          customBgColor: undefined,
                          customTextColor: undefined,
                        })
                      }
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        clinic.colorPalette === p.id && !hasCustomColors
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/50'
                          : 'border-stone-800 bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex -space-x-1.5 shrink-0">
                        <span
                          className="w-5 h-5 rounded-full border border-stone-800 shadow-xs"
                          style={{ backgroundColor: p.preview.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-stone-800 shadow-xs"
                          style={{ backgroundColor: p.preview.accent }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xs text-stone-100">{p.name}</div>
                        <div className="text-[10px] text-stone-400 capitalize">{p.category || 'Clinical Theme'}</div>
                      </div>
                      {clinic.colorPalette === p.id && !hasCustomColors && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Hex Overrides */}
                <div className="border-t border-stone-800 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-stone-200 flex items-center gap-1.5">
                        <Paintbrush className="w-3.5 h-3.5 text-emerald-400" /> Custom Hex Overrides
                      </h4>
                      <p className="text-[11px] text-stone-400">Match your exact clinic brand guidelines.</p>
                    </div>
                    {hasCustomColors && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateClinic({
                            ...clinic,
                            customPrimaryColor: undefined,
                            customAccentColor: undefined,
                            customBgColor: undefined,
                            customTextColor: undefined,
                          })
                        }
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        Reset to preset
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customPrimaryColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customPrimaryColor: e.target.value })}
                          className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Accent / CTA</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customAccentColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={accentVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customAccentColor: e.target.value })}
                          className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Page Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customBgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bgVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customBgColor: e.target.value })}
                          className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customTextColor: e.target.value })}
                          className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textVal}
                          onChange={(e) => onUpdateClinic({ ...clinic, customTextColor: e.target.value })}
                          className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 15. TYPOGRAPHY */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-400" />
                    <span>Typography & Font Pairings</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Select a typographic pairing to define the tone of your clinical website.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'classic-editorial', name: 'Playfair Display + Plus Jakarta Sans', style: 'Classic Editorial • High-end clinic feel' },
                    { id: 'modern-sans', name: 'Inter + Montserrat', style: 'Clean Modern Sans • Sports & active rehab focus' },
                    { id: 'warm-editorial', name: 'Lora + Inter', style: 'Warm Editorial • Gentle family practice vibe' },
                    { id: 'bold-contemporary', name: 'Syne + Space Grotesk', style: 'Contemporary • High-tech spinal clinic' },
                    { id: 'refined-elegance', name: 'Cinzel + Plus Jakarta Sans', style: 'Refined Elegance • Boutique private studio' },
                  ].map((fp) => (
                    <button
                      key={fp.id}
                      onClick={() => onUpdateClinic({ ...clinic, fontPairing: fp.id })}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        (clinic.fontPairing || 'classic-editorial') === fp.id
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500/40'
                          : 'border-stone-800 bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-100">{fp.name}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{fp.style}</div>
                      </div>
                      {(clinic.fontPairing || 'classic-editorial') === fp.id && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Global Editorial Drop Cap Toggle */}
                <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enable Editorial Drop Caps on Blog Posts</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Default setting for new clinical articles. Renders an oversized, primary-brand-colored serif initial letter on opening paragraphs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateClinic({ ...clinic, globalDropCap: clinic.globalDropCap === false })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        clinic.globalDropCap !== false ? 'bg-emerald-600' : 'bg-stone-700'
                      }`}
                      title="Toggle Global Drop Cap"
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          clinic.globalDropCap !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 16. SECTION VISIBILITY */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Section & Page Visibility</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Toggle individual sections and navigation pages on/off with 1 click.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { key: 'showHeroTriage', label: 'Hero Discomfort Selector (Interactive Triage)' },
                    { key: 'showTrustBar', label: 'Ratings & Trust Bar' },
                    { key: 'showConditions', label: 'Conditions Treated Grid' },
                    { key: 'showWhyUs', label: 'Why Choose Us (Care Contrast Matrix)' },
                    { key: 'showTheProcess', label: '3-Step Healing Process' },
                    { key: 'showTheDoctor', label: 'Doctor Profile & Credentials' },
                    { key: 'showPatients', label: 'Patient Reviews & Testimonials' },
                    { key: 'showTheClinic', label: 'Clinic Photo Gallery & Sanctuary' },
                    { key: 'showInsurancePayment', label: 'Insurance & Pricing Section' },
                    { key: 'showFAQ', label: 'Frequently Asked Questions (FAQs)' },
                    { key: 'showNavConditions', label: 'Navigation Link: Conditions (/conditions)' },
                    { key: 'showNavFirstVisit', label: 'Navigation Link: First Visit (/first-visit)' },
                    { key: 'showNavAbout', label: 'Navigation Link: About Doctor (/about)' },
                    { key: 'showNavPricing', label: 'Navigation Link: Pricing (/pricing)' },
                    { key: 'showNavBlog', label: 'Navigation Link: Blog (/blog)' },
                  ].map(({ key, label }) => {
                    const isVisible = clinic[key as keyof ClinicInfo] !== false;
                    return (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 bg-stone-850 border border-stone-800 rounded-xl cursor-pointer hover:border-stone-700 transition"
                      >
                        <span className="text-xs font-medium text-stone-200">{label}</span>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => onUpdateClinic({ ...clinic, [key]: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 17. SEO & SOCIAL SHARE CARDS */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Search Engine Optimization & Social Cards</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Configure Google search meta tags and preview how your practice link looks when shared on iMessage, WhatsApp, Twitter/X, and Facebook.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.origin);
                        setCopiedSocialLink(true);
                        setTimeout(() => setCopiedSocialLink(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
                  >
                    {copiedSocialLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copy Link for Social Sharing</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1. GOOGLE SEARCH SNIPPET */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. Google Search Metadata</span>
                    </h4>
                    <span className="text-[10px] text-stone-500 font-mono">SERP Indexing</span>
                  </div>

                  <Field
                    label="SEO Page Title"
                    value={clinic.seoTitle || ''}
                    placeholder={`${clinic.name || 'Practice Name'} | Pain Recovery & Chiropractic in ${clinic.city || 'Your City'}, ${clinic.state || 'State'}`}
                    helperText="Displayed on Google search results tabs and browser title (30–60 chars recommended)."
                    locationBadge="<title> & og:title"
                    onChange={(v) => onUpdateClinic({ ...clinic, seoTitle: v })}
                  />

                  <Field
                    label="SEO Meta Description"
                    textarea
                    value={clinic.seoDescription || ''}
                    placeholder={`${clinic.name || 'Our clinic'} provides evidence-informed chiropractic care, back and neck pain recovery, and sports rehabilitation in ${clinic.cityState || 'our local community'}. Book your first visit today.`}
                    helperText="150–160 character snippet shown in Google search result snippets."
                    locationBadge="<meta description>"
                    onChange={(v) => onUpdateClinic({ ...clinic, seoDescription: v })}
                  />
                </div>

                {/* 2. SOCIAL SHARE CARDS (OPENGRAPH & TWITTER) */}
                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>2. Social Share Cards (OpenGraph & Twitter / X)</span>
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        These tags generate the preview card when someone shares your URL in text messages or social feeds.
                      </p>
                    </div>

                    {/* Platform Selector Buttons */}
                    <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-750 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSocialPlatformPreview('imessage')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          socialPlatformPreview === 'imessage'
                            ? 'bg-emerald-500 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>iMessage / WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialPlatformPreview('twitter')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          socialPlatformPreview === 'twitter'
                            ? 'bg-emerald-500 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span>X / Twitter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialPlatformPreview('facebook')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          socialPlatformPreview === 'facebook'
                            ? 'bg-emerald-500 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span>Facebook / LinkedIn</span>
                      </button>
                    </div>
                  </div>

                  {/* LIVE SOCIAL CARD PREVIEW SIMULATOR */}
                  <div className="bg-stone-950 p-4 sm:p-6 rounded-xl border border-stone-800 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-3 self-start flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>Live Share Preview: {socialPlatformPreview === 'imessage' ? 'iMessage & WhatsApp' : socialPlatformPreview === 'twitter' ? 'Twitter / X (Summary Large Image)' : 'Facebook & LinkedIn Link Post'}</span>
                    </span>

                    {/* Preview 1: iMessage & WhatsApp Message Bubble */}
                    {socialPlatformPreview === 'imessage' && (
                      <div className="w-full max-w-sm bg-stone-900 border border-stone-750 rounded-2xl overflow-hidden shadow-xl text-left animate-fade-in">
                        <div className="h-44 w-full bg-stone-950 relative overflow-hidden flex items-center justify-center">
                          <img
                            src={clinic.ogImage || clinic.heroImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80'}
                            alt="Social Share Thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                            Preview
                          </div>
                        </div>
                        <div className="p-3.5 space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                            {(clinic.name ? clinic.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'clinic')}.com
                          </span>
                          <h5 className="text-xs font-bold text-stone-100 leading-snug line-clamp-2">
                            {clinic.ogTitle || clinic.seoTitle || clinic.name || 'Private Chiropractic Clinic'}
                          </h5>
                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {clinic.ogDescription || clinic.seoDescription || clinic.tagline || 'Evidence-informed private chiropractic care and pain relief.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Preview 2: Twitter / X Large Summary Card */}
                    {socialPlatformPreview === 'twitter' && (
                      <div className="w-full max-w-md bg-stone-900 border border-stone-750 rounded-2xl overflow-hidden shadow-xl text-left animate-fade-in">
                        <div className="aspect-[1.91/1] w-full bg-stone-950 relative overflow-hidden flex items-center justify-center">
                          <img
                            src={clinic.ogImage || clinic.heroImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80'}
                            alt="Twitter Card Banner"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] text-stone-200 font-mono">
                            {(clinic.name ? clinic.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'clinic')}.com
                          </div>
                        </div>
                        <div className="p-4 space-y-1 bg-stone-850">
                          <h5 className="text-xs font-bold text-stone-100 leading-snug">
                            {clinic.ogTitle || clinic.seoTitle || clinic.name || 'Private Chiropractic Clinic'}
                          </h5>
                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {clinic.ogDescription || clinic.seoDescription || clinic.tagline || 'Evidence-informed private chiropractic care and pain relief.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Preview 3: Facebook & LinkedIn Post Card */}
                    {socialPlatformPreview === 'facebook' && (
                      <div className="w-full max-w-md bg-stone-900 border border-stone-750 rounded-xl overflow-hidden shadow-xl text-left animate-fade-in">
                        <div className="aspect-[1.91/1] w-full bg-stone-950 relative overflow-hidden">
                          <img
                            src={clinic.ogImage || clinic.heroImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80'}
                            alt="Facebook Share Card"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 bg-stone-800/80 border-t border-stone-700/60 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                            {(clinic.name ? clinic.name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '') : 'CLINIC')}.COM
                          </span>
                          <h5 className="text-xs font-bold text-white leading-snug line-clamp-1">
                            {clinic.ogTitle || clinic.seoTitle || clinic.name || 'Private Chiropractic Clinic'}
                          </h5>
                          <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                            {clinic.ogDescription || clinic.seoDescription || clinic.tagline || 'Evidence-informed private chiropractic care and pain relief.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CUSTOMIZE SOCIAL CARD TAGS */}
                  <div className="space-y-4 pt-2">
                    <Field
                      label="Social Share Title"
                      value={clinic.ogTitle || ''}
                      placeholder={clinic.seoTitle || clinic.name || 'Practice Title on Social'}
                      helperText="Title rendered on social cards (defaults to SEO title if blank)."
                      locationBadge="og:title & twitter:title"
                      onChange={(v) => onUpdateClinic({ ...clinic, ogTitle: v })}
                    />

                    <Field
                      label="Social Share Description"
                      textarea
                      value={clinic.ogDescription || ''}
                      placeholder={clinic.seoDescription || clinic.tagline || 'Brief description for social feeds...'}
                      helperText="Summary line displayed in link cards (defaults to SEO description if blank)."
                      locationBadge="og:description & twitter:description"
                      onChange={(v) => onUpdateClinic({ ...clinic, ogDescription: v })}
                    />

                    <Field
                      label="Social Share Card Image (og:image)"
                      value={clinic.ogImage || ''}
                      placeholder={clinic.heroImage || 'https://... image URL (1200 × 630px recommended)'}
                      helperText="1200 × 630px image displayed when your link is shared. If blank, automatically uses your custom Hero Photo."
                      locationBadge="og:image & twitter:image"
                      onChange={(v) => onUpdateClinic({ ...clinic, ogImage: v })}
                    />
                  </div>

                  {/* Informational Callout */}
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-750 text-xs text-stone-300 space-y-1">
                    <strong className="text-stone-100 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>How Social Share Cards Work:</span>
                    </strong>
                    <p className="text-stone-400 text-[11px] leading-relaxed">
                      Whenever someone pastes your website URL into WhatsApp, iMessage, Twitter/X, LinkedIn, Slack, or Facebook, the app provides these exact <code className="text-emerald-300 bg-stone-950 px-1 py-0.5 rounded font-mono">og:</code> and <code className="text-emerald-300 bg-stone-950 px-1 py-0.5 rounded font-mono">twitter:</code> meta tags so the recipient sees a branded thumbnail card instead of an unformatted plain link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 18. ANNOUNCEMENT ALERT */}
            {activeTab === 'announcement' && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-3">
                  <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Top Announcement Alert Banner</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Broadcast urgent notices, holiday hours, or new patient announcements at the very top of all pages.
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-stone-200">Enable Alert Banner</h4>
                      <p className="text-[11px] text-stone-400">Renders as a prominent bar above the main navigation.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.enabled}
                        onChange={(e) =>
                          onUpdateClinic({
                            ...clinic,
                            announcementBanner: { ...banner, enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  {banner.enabled && (
                    <div className="space-y-3 pt-3 border-t border-stone-800">
                      <Field
                        label="Banner Message"
                        value={banner.message}
                        placeholder="e.g. Notice: Clinic open regular hours this week. Early morning & evening slots available."
                        helperText="The text displayed to all site visitors."
                        onChange={(v) =>
                          onUpdateClinic({
                            ...clinic,
                            announcementBanner: { ...banner, message: v },
                          })
                        }
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field
                          label="Badge Label (Optional)"
                          value={banner.badge || ''}
                          placeholder="Notice"
                          helperText="Small pill tag displayed before the message."
                          onChange={(v) =>
                            onUpdateClinic({
                              ...clinic,
                              announcementBanner: { ...banner, badge: v },
                            })
                          }
                        />

                        <div>
                          <label className="block text-xs font-medium text-stone-300 mb-1">Color Theme</label>
                          <select
                            value={banner.variant || 'amber'}
                            onChange={(e) =>
                              onUpdateClinic({
                                ...clinic,
                                announcementBanner: {
                                  ...banner,
                                  variant: e.target.value as AnnouncementBannerConfig['variant'],
                                },
                              })
                            }
                            className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2.5 text-xs text-stone-200 cursor-pointer"
                          >
                            <option value="amber">Amber (Warning / Alert)</option>
                            <option value="emerald">Emerald (Special Offer / Welcome)</option>
                            <option value="rose">Rose (Urgent Notice / Holiday Closure)</option>
                            <option value="indigo">Indigo (Informational)</option>
                          </select>
                          <span className="block text-[11px] text-stone-400 mt-1">Select visual accent color.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 19. USERS & TEAM ROLES */}
            {activeTab === 'users' && (
              <TeamManager
                clinic={clinic}
                onUpdateClinic={onUpdateClinic}
                activeRolePreview={activeRolePreview}
                onSelectRolePreview={setActiveRolePreview}
              />
            )}

            {/* 20. PRESETS & BACKUPS */}
            {activeTab === 'presets' && (
              <PresetBackupManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-stone-950 border-t border-stone-850 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            {hasSupabase ? (
              syncStatus === 'synced' ? (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-stone-300">
                    <strong className="text-emerald-400 font-semibold">Cloud Synced</strong> • PostgreSQL / Supabase connected
                  </span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  <span className="text-[11px] text-amber-300">Syncing to cloud database...</span>
                </>
              )
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-stone-400">
                  <strong className="text-stone-300 font-semibold">Local Storage</strong> • Active in this browser
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white font-medium px-4 py-1.5 rounded-lg border border-stone-750 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
  helperText,
  locationBadge,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  helperText?: string;
  locationBadge?: string;
}) {
  return (
    <label className="block mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="block text-xs font-semibold text-stone-300">{label}</span>
        {locationBadge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-900 text-emerald-300 border border-emerald-900/60">
            {locationBadge}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          rows={2}
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {helperText && (
        <span className="block text-[11px] text-stone-400 mt-1 leading-normal flex items-center gap-1">
          <Info className="w-3 h-3 text-stone-500 shrink-0 inline" />
          <span>{helperText}</span>
        </span>
      )}
    </label>
  );
}
