import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  ExternalLink,
  Search,
  Check,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Award,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  X,
  Target,
  FileText,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Info,
  Layers,
  Save,
} from 'lucide-react';
import {
  ClinicInfo,
  PublicTeamMember,
  SupportStaffMember,
  BlogBlock,
  ProblemCondition,
} from '../../types';
import { defaultPublicTeamMembers, defaultSupportStaff } from '../../data/defaultTeamData';
import { conditionsData } from '../../data/clinicData';
import { BlogBlockEditor } from './BlogBlockEditor';
import { compressImage } from '../../utils/imageCompressor';

interface OurTeamManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const OurTeamManager: React.FC<OurTeamManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [activeSubTab, setActiveSubTab] = useState<'practitioners' | 'support' | 'settings'>('practitioners');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Focus Area builder temporary input
  const [newFocusInput, setNewFocusInput] = useState('');

  // Practitioners list from clinic or defaults
  const teamMembers: PublicTeamMember[] =
    clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers
      : defaultPublicTeamMembers;

  // Support staff list from clinic or defaults
  const supportStaff: SupportStaffMember[] =
    clinic.supportStaff && clinic.supportStaff.length > 0
      ? clinic.supportStaff
      : defaultSupportStaff;

  // Available conditions for assigned multi-select
  const availableConditions: ProblemCondition[] =
    clinic.customConditions && clinic.customConditions.length > 0
      ? clinic.customConditions
      : conditionsData;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Practitioner Form State
  const [formData, setFormData] = useState<PublicTeamMember>({
    id: '',
    slug: '',
    name: '',
    credentials: '',
    role: '',
    photoUrl: '',
    photoAlt: '',
    shortSummary: '',
    quote: '',
    education: '',
    registrationNumber: '',
    email: '',
    phone: '',
    areasOfFocus: [],
    assignedConditionSlugs: [],
    showOnWebsite: true,
    bioBlocks: [],
  });

  const handleStartCreate = () => {
    const id = `team_${Date.now()}`;
    const initialBlocks: BlogBlock[] = [
      {
        id: `block_${Date.now()}_1`,
        type: 'paragraph',
        content: '',
      },
    ];

    setFormData({
      id,
      slug: '',
      name: '',
      credentials: 'D.C., MSc',
      role: 'Associate Chiropractic Physician',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      photoAlt: '',
      shortSummary: '',
      quote: '',
      education: '',
      registrationNumber: '',
      email: '',
      phone: '',
      areasOfFocus: ['Spinal Biomechanics', 'Rehabilitation'],
      assignedConditionSlugs: [],
      showOnWebsite: true,
      bioBlocks: initialBlocks,
    });

    setEditingIndex(null);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (index: number) => {
    const member = teamMembers[index];
    setFormData({
      ...member,
      areasOfFocus: member.areasOfFocus ? [...member.areasOfFocus] : [],
      assignedConditionSlugs: member.assignedConditionSlugs ? [...member.assignedConditionSlugs] : [],
      bioBlocks:
        member.bioBlocks && member.bioBlocks.length > 0
          ? member.bioBlocks
          : [
              {
                id: `block_${Date.now()}_1`,
                type: 'paragraph',
                content: member.shortSummary || '',
              },
            ],
    });
    setEditingIndex(index);
    setIsCreatingNew(false);
  };

  const handleSavePractitioner = () => {
    if (!formData.name.trim()) {
      showNotification('Please enter the practitioner\'s name.');
      return;
    }

    const finalSlug = formData.slug.trim() || slugify(formData.name);
    const updatedMember: PublicTeamMember = {
      ...formData,
      slug: finalSlug,
      photoAlt: formData.photoAlt?.trim() || `${formData.name} portrait`,
    };

    let nextMembers = [...teamMembers];
    if (editingIndex !== null) {
      nextMembers[editingIndex] = updatedMember;
    } else {
      nextMembers.push(updatedMember);
    }

    onUpdateClinic({ ...clinic, publicTeamMembers: nextMembers });
    setEditingIndex(null);
    setIsCreatingNew(false);
    showNotification(`Practitioner "${formData.name}" saved successfully.`);
  };

  const handleDeletePractitioner = (index: number) => {
    const name = teamMembers[index].name;
    if (window.confirm(`Are you sure you want to remove "${name}" from the clinical team?`)) {
      const next = teamMembers.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, publicTeamMembers: next });
      showNotification(`"${name}" removed from clinical team.`);
      if (editingIndex === index) {
        setEditingIndex(null);
        setIsCreatingNew(false);
      }
    }
  };

  const handleMovePractitioner = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= teamMembers.length) return;
    const copy = [...teamMembers];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, publicTeamMembers: copy });
  };

  const handleToggleVisibility = (index: number) => {
    const next = [...teamMembers];
    next[index] = {
      ...next[index],
      showOnWebsite: next[index].showOnWebsite === false ? true : false,
    };
    onUpdateClinic({ ...clinic, publicTeamMembers: next });
    showNotification(
      `"${next[index].name}" is now ${next[index].showOnWebsite ? 'visible on' : 'hidden from'} website.`
    );
  };

  // Image Upload with Compressor
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const compressedDataUrl = await compressImage(file, 1000, 1200, 0.85);
      setFormData((prev) => ({ ...prev, photoUrl: compressedDataUrl }));
      showNotification('Portrait photo uploaded and optimized.');
    } catch {
      showNotification('Failed to process photo upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Focus Areas Helpers
  const handleAddFocusArea = () => {
    if (!newFocusInput.trim()) return;
    if (formData.areasOfFocus.includes(newFocusInput.trim())) {
      showNotification('This area of focus already exists.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      areasOfFocus: [...prev.areasOfFocus, newFocusInput.trim()],
    }));
    setNewFocusInput('');
  };

  const handleRemoveFocusArea = (focusIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      areasOfFocus: prev.areasOfFocus.filter((_, i) => i !== focusIndex),
    }));
  };

  // Assigned Conditions Toggle
  const handleToggleAssignedCondition = (condIdOrSlug: string) => {
    const current = formData.assignedConditionSlugs || [];
    const exists = current.includes(condIdOrSlug);
    const updated = exists
      ? current.filter((s) => s !== condIdOrSlug)
      : [...current, condIdOrSlug];

    setFormData((prev) => ({ ...prev, assignedConditionSlugs: updated }));
  };

  // Support Staff Helpers
  const handleAddSupportStaff = () => {
    const newStaff: SupportStaffMember = {
      id: `staff_${Date.now()}`,
      name: 'New Support Member',
      role: 'Front Desk Coordinator',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'Welcomes patients and manages front-of-house intake.',
    };
    const next = [...supportStaff, newStaff];
    onUpdateClinic({ ...clinic, supportStaff: next });
    showNotification('New support staff member added.');
  };

  const handleUpdateSupportStaff = (index: number, partial: Partial<SupportStaffMember>) => {
    const next = [...supportStaff];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, supportStaff: next });
  };

  const handleDeleteSupportStaff = (index: number) => {
    if (window.confirm('Delete this support staff member?')) {
      const next = supportStaff.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, supportStaff: next });
      showNotification('Support staff member removed.');
    }
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Reset all clinical team profiles and support staff back to initial defaults?'
      )
    ) {
      onUpdateClinic({
        ...clinic,
        publicTeamMembers: defaultPublicTeamMembers,
        supportStaff: defaultSupportStaff,
      });
      showNotification('Team profiles reset to default clinical curriculum.');
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.credentials && m.credentials.toLowerCase().includes(q))
    );
  });

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
            <span>Public Website Architecture</span>
          </div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Our Team & Clinicians (/team)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage your practitioners' editorial profiles, headshots, areas of focus, assigned conditions for cross-linking, and support staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/team"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Live /team</span>
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

      {/* Scope Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('practitioners');
            setEditingIndex(null);
            setIsCreatingNew(false);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'practitioners'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Doctors & Specialists ({teamMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('support');
            setEditingIndex(null);
            setIsCreatingNew(false);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'support'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Clinic Support Team ({supportStaff.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('settings');
            setEditingIndex(null);
            setIsCreatingNew(false);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Page Headlines & SEO</span>
        </button>
      </div>

      {/* SUB-TAB 1: PRACTITIONERS */}
      {activeSubTab === 'practitioners' && (
        <div className="space-y-6">
          {/* If NOT editing or creating: Show List View */}
          {editingIndex === null && !isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search practitioners by name or role..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team Member</span>
                </button>
              </div>

              {/* Practitioners Table / Card List */}
              <div className="space-y-2">
                {filteredMembers.map((member, index) => (
                  <div
                    key={member.id || index}
                    className="p-3.5 sm:p-4 bg-stone-850 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-700 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Photo Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                        <img
                          src={member.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-100 truncate">
                            {member.name}
                          </h4>
                          {member.credentials && (
                            <span className="text-[10px] text-emerald-400 font-mono">
                              {member.credentials}
                            </span>
                          )}
                          {member.showOnWebsite === false ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-800 text-stone-400 border border-stone-700">
                              Hidden
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                              Live
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-400 truncate">
                          {member.role}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-stone-400 pt-0.5">
                          <span>Focus: {member.areasOfFocus?.length || 0} areas</span>
                          <span>•</span>
                          <span>Treated Conditions: {member.assignedConditionSlugs?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(index)}
                        title={member.showOnWebsite === false ? 'Make visible' : 'Hide from website'}
                        className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs transition"
                      >
                        {member.showOnWebsite === false ? (
                          <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMovePractitioner(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMovePractitioner(index, 'down')}
                        disabled={index === teamMembers.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`/team/${member.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview Public Profile"
                        className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-emerald-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(index)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePractitioner(index)}
                        title="Delete Practitioner"
                        className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 3. THE PRACTITIONER EDITOR */
            <div className="space-y-6 bg-stone-850 border border-stone-800 rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-stone-100">
                    {isCreatingNew ? 'Add New Clinical Practitioner' : `Editing: ${formData.name}`}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(null);
                      setIsCreatingNew(false);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePractitioner}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Practitioner</span>
                  </button>
                </div>
              </div>

              {/* Visibility & Direct Link Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.showOnWebsite}
                    onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-stone-800 border-stone-700 focus:ring-0 cursor-pointer"
                  />
                  <span>Show profile on live website (/team)</span>
                </label>

                <div className="flex items-center gap-2 text-stone-400">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-[11px]">
                    /team/{formData.slug || slugify(formData.name || 'doctor-name')}
                  </span>
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="e.g. Dr. Alistair Vance"
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        slug: prev.slug ? prev.slug : slugify(name),
                      }));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Credentials & Post-Nominals
                  </label>
                  <input
                    type="text"
                    value={formData.credentials || ''}
                    placeholder="e.g. D.C., CCSP, MSc (Sports Biomechanics)"
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Clinical Title / Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    placeholder="e.g. Lead Chiropractic Physician & Director"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    placeholder="e.g. dr-alistair-vance"
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Headshot Photo & Uploader */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-300">
                    Professional Headshot Photo
                  </label>
                  <span className="text-[10px] text-stone-400">Portrait ratio (4:5) recommended</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-950 border border-stone-700 shrink-0">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Headshot Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px]">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={formData.photoUrl || ''}
                      placeholder="Paste image URL (e.g. https://... or /src/assets/images/...)"
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{uploadingImage ? 'Optimizing...' : 'Upload & Compress Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-400">Or paste any high-res image URL above</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-0.5">
                    Photo Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={formData.photoAlt || ''}
                    placeholder={`e.g. ${formData.name || 'Doctor'} professional clinical portrait`}
                    onChange={(e) => setFormData({ ...formData, photoAlt: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Short Summary (For the Card) */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Card Summary (One-Sentence "What I Do")
                </label>
                <textarea
                  rows={2}
                  value={formData.shortSummary}
                  placeholder="e.g. Specializing in complex spine kinematics, disc decompression, and athletic performance recovery."
                  onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Personal Doctor Quote */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Personal Practitioner Quote (Trust Anchor)
                </label>
                <input
                  type="text"
                  value={formData.quote || ''}
                  placeholder='e.g. "I built this practice because I was tired of seeing patients treated like numbers."'
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Registration & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Statutory Registration Number (Trust Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    placeholder="e.g. GCC Statutory Reg #04821"
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Education & Postgraduate Degrees
                  </label>
                  <input
                    type="text"
                    value={formData.education || ''}
                    placeholder="e.g. Doctor of Chiropractic (AECC), MSc Sports Biomechanics"
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Areas of Focus (Dynamic List Builder) */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-300">
                      Areas of Clinical Focus
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Displayed on their card and individual profile (e.g. "Sports Injury", "Disc Decompression", "Prenatal Care")
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {formData.areasOfFocus.length} Focus Areas
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFocusInput}
                    onChange={(e) => setNewFocusInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFocusArea();
                      }
                    }}
                    placeholder="Type focus area (e.g. Sciatica & Disc Decompression) and press Add..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFocusArea}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    + Add Focus Area
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.areasOfFocus.map((focus, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs"
                    >
                      <span>{focus}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFocusArea(fIdx)}
                        className="text-stone-400 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.areasOfFocus.length === 0 && (
                    <span className="text-xs text-stone-500 italic">
                      No focus areas added yet. Add at least 2–3 for patients to see.
                    </span>
                  )}
                </div>
              </div>

              {/* 🔗 ASSIGNED CONDITIONS (SEO CROSS-LINKING) */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <label className="text-xs font-bold text-stone-300">
                      Assigned Conditions (SEO Cross-Linking)
                    </label>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    When a patient reads about any checked condition, this doctor will appear under <strong className="text-emerald-400">"Meet the Specialists Who Treat This Condition"</strong> with a direct consultation booking button.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {availableConditions.map((cond) => {
                    const cSlug = cond.slug || cond.id;
                    const isChecked =
                      formData.assignedConditionSlugs?.includes(cSlug) ||
                      formData.assignedConditionSlugs?.includes(cond.id);

                    return (
                      <label
                        key={cond.id}
                        onClick={() => handleToggleAssignedCondition(cSlug)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                            : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by container onClick
                          className="mt-0.5 rounded text-emerald-600 bg-stone-800 border-stone-700 focus:ring-0 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block truncate text-stone-200">
                            {cond.title}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono block">
                            /{cSlug}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Full Biography (Block Editor) */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Full Biography (Editorial Block Editor)
                    </h5>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Rich editorial layout for their dedicated page: add paragraphs, subheadings, pull quotes, callouts, and images.
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {formData.bioBlocks?.length || 0} Blocks
                  </span>
                </div>

                <BlogBlockEditor
                  blocks={formData.bioBlocks || []}
                  onChange={(updatedBlocks) => setFormData({ ...formData, bioBlocks: updatedBlocks })}
                />
              </div>

              {/* Bottom Save Bar */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-semibold transition cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={handleSavePractitioner}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Practitioner Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CLINIC SUPPORT TEAM */}
      {activeSubTab === 'support' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Clinic Support Staff & Front-of-House Team</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Displayed as friendly circular headshots at the bottom of the /team page (receptionists, patient coordinators, clinic managers).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSupportStaff}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Support Staff</span>
            </button>
          </div>

          <div className="space-y-3">
            {supportStaff.map((staff, sIdx) => (
              <div
                key={staff.id || sIdx}
                className="p-4 bg-stone-850 border border-stone-800 rounded-2xl space-y-3 hover:border-stone-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Staff Member #{sIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSupportStaff(sIdx)}
                    className="p-1 rounded text-stone-500 hover:text-rose-400 transition"
                    title="Remove Support Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={staff.name}
                      onChange={(e) => handleUpdateSupportStaff(sIdx, { name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={staff.role}
                      onChange={(e) => handleUpdateSupportStaff(sIdx, { role: e.target.value })}
                      placeholder="e.g. Practice Director & Patient Care"
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Circular Photo URL</label>
                    <input
                      type="text"
                      value={staff.photoUrl || ''}
                      onChange={(e) => handleUpdateSupportStaff(sIdx, { photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Friendly Note / One-liner</label>
                  <input
                    type="text"
                    value={staff.bio || ''}
                    onChange={(e) => handleUpdateSupportStaff(sIdx, { bio: e.target.value })}
                    placeholder="e.g. Welcomes patients and assists with intake and exercise protocols."
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PAGE HEADLINES & SEO */}
      {activeSubTab === 'settings' && (
        <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Team Page Hero Headlines & SEO Copy
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Customize the headline and introduction that patients see when visiting /team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Eyebrow Subtitle Badge
              </label>
              <input
                type="text"
                value={clinic.teamPageSubtitle || ''}
                placeholder="Clinical Team & Care Architecture"
                onChange={(e) => onUpdateClinic({ ...clinic, teamPageSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Main H1 Headline
              </label>
              <input
                type="text"
                value={clinic.teamPageTitle || ''}
                placeholder="Meet Your Practitioners"
                onChange={(e) => onUpdateClinic({ ...clinic, teamPageTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Hero Introduction Paragraph
            </label>
            <textarea
              rows={3}
              value={clinic.teamPageHeroText || ''}
              placeholder="Every practitioner at our practice is statutory registered, evidence-informed, and committed to unhurried, root-cause spinal healthcare. No high-pressure sales—just clear clinical answers."
              onChange={(e) => onUpdateClinic({ ...clinic, teamPageHeroText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
