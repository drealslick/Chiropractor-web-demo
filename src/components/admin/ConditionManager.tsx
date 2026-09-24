import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Search,
  RotateCcw,
  CheckCircle2,
  Layers,
  BookOpen,
  CreditCard,
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Sliders,
  Stethoscope,
  Quote,
} from 'lucide-react';
import { ClinicInfo, ProblemCondition, BlogBlock, ClinicPost } from '../../types';
import { conditionsData } from '../../data/clinicData';
import { defaultBlogPosts } from '../../data/defaultPosts';
import { BlogBlockEditor } from './BlogBlockEditor';
import { ConditionIconBadge } from '../ConditionVisual';

interface ConditionManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ConditionManager: React.FC<ConditionManagerProps> = ({
  clinic,
  onUpdateClinic,
}) => {
  const condList: ProblemCondition[] =
    clinic.customConditions && clinic.customConditions.length > 0
      ? clinic.customConditions
      : conditionsData;

  const allPosts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeBuilderTab, setActiveBuilderTab] = useState<
    'essentials' | 'symptoms' | 'protocols' | 'blocks' | 'crosslink'
  >('essentials');
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Mini-Page Builder
  const [formData, setFormData] = useState<ProblemCondition>({
    id: '',
    title: '',
    slug: '',
    description: '',
    icon: 'lumbar',
    heroImage: '',
    heroImageAlt: '',
    symptoms: [],
    ourApproach: '',
    carePlan: [],
    homeCareAdvice: '',
    homeCareQuoteAuthor: '',
    blocks: [],
    relatedBlogSlugs: [],
    showPricingLink: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartCreate = () => {
    const newId = `cond_${Date.now()}`;
    setFormData({
      id: newId,
      title: 'New Condition',
      slug: 'new-condition',
      description: 'Comprehensive evidence-based diagnosis and rehabilitation protocol.',
      icon: 'lumbar',
      heroImage: '',
      heroImageAlt: '',
      symptoms: [
        'Persistent dull or sharp localized discomfort',
        'Stiffness upon waking or after sustained posture',
        'Restricted joint mobility during routine movements',
      ],
      ourApproach:
        'We isolate the exact joint subluxation, facet strain, or nerve impingement causing your symptoms, utilizing gentle manual adjustments and decompression before rebuilding stabilizing strength.',
      carePlan: [
        'Phase 1: Precision joint mobilization to relieve acute mechanical restriction',
        'Phase 2: Targeted soft tissue therapy and disc decompression',
        'Phase 3: Progressive kinetic chain stabilization to prevent recurrence',
      ],
      homeCareAdvice:
        'Avoid prolonged static postures. Implement gentle micro-extensions every 30 minutes and apply cold therapy to acute flare-ups for 15 minutes twice daily.',
      homeCareQuoteAuthor: 'Clinical Rehabilitation Advisory',
      blocks: [
        {
          id: `block_${Date.now()}_1`,
          type: 'callout',
          calloutVariant: 'takeaway',
          calloutTitle: 'Key Clinical Takeaway',
          calloutText: 'Restoring proper joint kinematics relieves mechanical stress from surrounding musculature and allows tissue recovery.',
        },
      ],
      relatedBlogSlugs: allPosts.slice(0, 2).map((p) => p.slug),
      showPricingLink: true,
    });
    setActiveBuilderTab('essentials');
    setEditingIndex(null);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (index: number) => {
    const item = condList[index];
    const initialSlug = item.slug || slugify(item.title || item.id || `condition-${index}`);
    setFormData({
      id: item.id || `cond_${Date.now()}_${index}`,
      title: item.title || '',
      slug: initialSlug,
      description: item.description || '',
      icon: item.icon || 'lumbar',
      heroImage: item.heroImage || '',
      heroImageAlt: item.heroImageAlt || item.title || '',
      symptoms: item.symptoms ? [...item.symptoms] : [],
      ourApproach: item.ourApproach || item.approach || item.howWeHelp || '',
      carePlan: item.carePlan ? [...item.carePlan] : (item.approach ? [item.approach] : []),
      homeCareAdvice: item.homeCareAdvice || '',
      homeCareQuoteAuthor: item.homeCareQuoteAuthor || 'Clinical Rehabilitation Advisory',
      blocks: item.blocks ? [...item.blocks] : [],
      relatedBlogSlugs: item.relatedBlogSlugs ? [...item.relatedBlogSlugs] : [],
      showPricingLink: item.showPricingLink !== false,
      approach: item.approach,
      howWeHelp: item.howWeHelp,
    });
    setActiveBuilderTab('essentials');
    setIsCreatingNew(false);
    setEditingIndex(index);
  };

  const handleSaveCondition = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title for the condition.');
      return;
    }

    const currentSlug = formData.slug || slugify(formData.title);
    const updatedItem: ProblemCondition = {
      ...formData,
      slug: currentSlug,
      // sync legacy fields for backward compatibility
      approach: formData.ourApproach || (formData.carePlan?.[0] ?? ''),
      howWeHelp: formData.ourApproach || '',
    };

    let updatedList: ProblemCondition[];
    if (isCreatingNew) {
      updatedList = [updatedItem, ...condList];
      showNotification(`Condition "${formData.title}" created successfully!`);
    } else if (editingIndex !== null) {
      updatedList = [...condList];
      updatedList[editingIndex] = updatedItem;
      showNotification(`Condition "${formData.title}" updated successfully!`);
    } else {
      return;
    }

    onUpdateClinic({
      ...clinic,
      customConditions: updatedList,
    });

    setIsCreatingNew(false);
    setEditingIndex(null);
  };

  const handleDeleteCondition = (index: number) => {
    const item = condList[index];
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      const next = condList.filter((_, i) => i !== index);
      onUpdateClinic({
        ...clinic,
        customConditions: next,
      });
      showNotification(`Condition "${item.title}" removed.`);
    }
  };

  const handleDuplicateCondition = (index: number) => {
    const source = condList[index];
    const copy: ProblemCondition = {
      ...source,
      id: `cond_${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${slugify(source.title || 'condition')}-copy`,
      symptoms: source.symptoms ? [...source.symptoms] : [],
      carePlan: source.carePlan ? [...source.carePlan] : [],
      blocks: source.blocks
        ? source.blocks.map((b) => ({
            ...b,
            id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          }))
        : [],
    };
    const next = [...condList];
    next.splice(index + 1, 0, copy);
    onUpdateClinic({ ...clinic, customConditions: next });
    showNotification(`Duplicated "${source.title}".`);
  };

  const handleMoveCondition = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= condList.length) return;
    const copy = [...condList];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, customConditions: copy });
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Reset all conditions & protocols to the default evidence-based clinical curriculum? Any custom edits will be replaced.'
      )
    ) {
      onUpdateClinic({
        ...clinic,
        customConditions: conditionsData,
      });
      showNotification('Conditions reset to default clinical curriculum.');
    }
  };

  // Symptoms helper
  const handleAddSymptom = (text = 'New presentation symptom') => {
    setFormData((prev) => ({
      ...prev,
      symptoms: [...(prev.symptoms || []), text],
    }));
  };

  const handleUpdateSymptom = (idx: number, val: string) => {
    setFormData((prev) => {
      const copy = [...(prev.symptoms || [])];
      copy[idx] = val;
      return { ...prev, symptoms: copy };
    });
  };

  const handleRemoveSymptom = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: (prev.symptoms || []).filter((_, i) => i !== idx),
    }));
  };

  // Care plan helper
  const handleAddCareStep = (text = 'Phase: New clinical treatment protocol') => {
    setFormData((prev) => ({
      ...prev,
      carePlan: [...(prev.carePlan || []), text],
    }));
  };

  const handleUpdateCareStep = (idx: number, val: string) => {
    setFormData((prev) => {
      const copy = [...(prev.carePlan || [])];
      copy[idx] = val;
      return { ...prev, carePlan: copy };
    });
  };

  const handleRemoveCareStep = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      carePlan: (prev.carePlan || []).filter((_, i) => i !== idx),
    }));
  };

  // Blog link toggle
  const handleToggleBlogSlug = (slug: string) => {
    setFormData((prev) => {
      const current = prev.relatedBlogSlugs || [];
      if (current.includes(slug)) {
        return {
          ...prev,
          relatedBlogSlugs: current.filter((s) => s !== slug),
        };
      } else {
        return {
          ...prev,
          relatedBlogSlugs: [...current, slug],
        };
      }
    });
  };

  const isEditing = isCreatingNew || editingIndex !== null;

  const filteredConditions = condList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.icon || '').toLowerCase().includes(q)
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

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Conditions & Protocols Mini-Page Builder</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Full mini-page builder for /conditions. Create dedicated landing pages with custom rich blocks, anatomy vectors, care plans, and blog links.
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Curriculum</span>
            </button>
            <button
              type="button"
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Condition</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CONDITION MINI-PAGE BUILDER MODAL / WORKSPACE */}
      {isEditing ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl space-y-6 p-4 sm:p-6">
          {/* Top Bar of Builder */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingIndex(null);
                }}
                className="px-3 py-1 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-750 text-xs font-semibold cursor-pointer"
              >
                ← Back to Condition List
              </button>
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                  {isCreatingNew ? 'Creating Condition Page' : 'Editing Condition Mini-Page'}
                </span>
                <h4 className="text-base font-bold text-white">
                  {formData.title || 'Untitled Condition'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {formData.slug && (
                <a
                  href={`/conditions/${formData.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-stone-750 bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview Page</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleSaveCondition}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Condition Page</span>
              </button>
            </div>
          </div>

          {/* Builder Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-stone-800 pb-2">
            {[
              { id: 'essentials', label: '1. Essentials & Anatomy', icon: Sliders },
              { id: 'symptoms', label: '2. Common Signs', icon: CheckCircle2 },
              { id: 'protocols', label: '3. Treatment Protocol', icon: Stethoscope },
              { id: 'blocks', label: '4. Mini-Page Blocks (Blog Engine)', icon: Layers },
              { id: 'crosslink', label: '5. Cross-Linking & Pricing', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBuilderTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveBuilderTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ESSENTIALS & ANATOMY */}
          {activeBuilderTab === 'essentials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Condition Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    placeholder="e.g. Back & Lower Back Pain"
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug === '' || prev.slug === slugify(prev.title) ? slugify(title) : prev.slug,
                      }));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Shown as H1 on the dedicated condition landing page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-mono">/conditions/</span>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      placeholder="back-lower-back-pain"
                      onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Direct permalink for patients and Google search indexing.
                  </p>
                </div>
              </div>

              {/* Anatomical Icon & Visual Selector */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <label className="block text-xs font-bold text-stone-300">
                  Anatomical Vector / Hero Icon Badge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'lumbar', label: 'Lumbar & Sciatic Spine' },
                    { id: 'cervical', label: 'Cervical & Neck' },
                    { id: 'sports', label: 'Sports & Kinetic Joint' },
                    { id: 'mobility', label: 'Mobility & Pelvis' },
                    { id: 'headache', label: 'Cranio-Cervical Tension' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: preset.id })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 text-center transition cursor-pointer ${
                        formData.icon === preset.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/50'
                          : 'border-stone-850 bg-stone-900 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <ConditionIconBadge type={preset.id} size="sm" />
                      <span className="text-[11px] font-semibold">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Short Description / Editorial Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  placeholder="Personalized care designed around your symptoms, movement, and goals."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Displayed under H1 on the condition page and as card summary on the /conditions index.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Custom Hero Clinical Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.heroImage || ''}
                  placeholder="https://... or select clinic image"
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  If left empty, a crisp vector anatomical diagram is automatically rendered.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COMMON SIGNS (DEDICATED LIST BUILDER) */}
          {activeBuilderTab === 'symptoms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div>
                  <h5 className="font-bold text-xs text-stone-200 uppercase tracking-wider">
                    Common Signs & Symptom Indicators
                  </h5>
                  <p className="text-[11px] text-stone-400">
                    Rendered in a high-trust checklist card on the condition page with checkmarks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSymptom()}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Symptom</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(formData.symptoms || []).map((symptom, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) => handleUpdateSymptom(sIdx, e.target.value)}
                      placeholder="e.g. Sharp shooting pain traveling past the knee"
                      className="flex-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(sIdx)}
                      className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      title="Remove symptom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TREATMENT PROTOCOL */}
          {activeBuilderTab === 'protocols' && (
            <div className="space-y-5">
              {/* Section 1: Our Approach */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                    1
                  </span>
                  <label className="font-bold text-xs text-stone-200 uppercase tracking-wider">
                    Section 1: Our Clinical Approach (Paragraph)
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={formData.ourApproach || ''}
                  placeholder="Detail the biomechanical theory, why standard medicine fails, and how your gentle protocol resolves the mechanical root cause..."
                  onChange={(e) => setFormData({ ...formData, ourApproach: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Section 2: Care Plan Steps */}
              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                      2
                    </span>
                    <label className="font-bold text-xs text-stone-200 uppercase tracking-wider">
                      Section 2: Your Care Plan (Treatment Phases)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCareStep()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Care Step</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.carePlan || []).map((step, stepIdx) => (
                    <div
                      key={stepIdx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-950 border border-stone-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {stepIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleUpdateCareStep(stepIdx, e.target.value)}
                        placeholder="Phase 1: Precision joint mobilization to relieve facet restrictions..."
                        className="flex-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCareStep(stepIdx)}
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                        title="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Home Care & Ergonomics */}
              <div className="space-y-2 pt-3 border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                    3
                  </span>
                  <label className="font-bold text-xs text-stone-200 uppercase tracking-wider">
                    Section 3: Prescribed Home Care & Ergonomics (Callout Box)
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={formData.homeCareAdvice || ''}
                  placeholder="Avoid sitting longer than 30 continuous minutes. Perform standing lumbar micro-extensions 5 times every hour..."
                  onChange={(e) => setFormData({ ...formData, homeCareAdvice: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={formData.homeCareQuoteAuthor || ''}
                  placeholder="Attribution (e.g. Clinical Ergonomics Advisory)"
                  onChange={(e) => setFormData({ ...formData, homeCareQuoteAuthor: e.target.value })}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: REUSABLE BLOG BLOCK EDITOR (THE SECRET WEAPON!) */}
          {activeBuilderTab === 'blocks' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Full Mini-Page Builder:</strong> Add paragraphs, subheadings, bullet lists, images with captions, clinical callouts, pull quotes, and custom booking CTAs directly onto this condition landing page.
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-850">
                <BlogBlockEditor
                  blocks={formData.blocks || []}
                  onChange={(updated) => setFormData({ ...formData, blocks: updated })}
                />
              </div>
            </div>
          )}

          {/* TAB 5: CROSS-LINKING & PRICING */}
          {activeBuilderTab === 'crosslink' && (
            <div className="space-y-6">
              {/* Related Blog Posts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h5 className="font-bold text-xs text-stone-200 uppercase tracking-wider">
                    Link Related Blog Posts to this Condition
                  </h5>
                </div>
                <p className="text-xs text-stone-400">
                  Select which articles appear in the "Related Clinical Articles" section at the bottom of the condition page to keep patients reading and maximize search engine authority.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allPosts.map((post) => {
                    const isSelected = (formData.relatedBlogSlugs || []).includes(post.slug);
                    return (
                      <button
                        key={post.slug}
                        type="button"
                        onClick={() => handleToggleBlogSlug(post.slug)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 text-stone-950 font-bold'
                              : 'border border-stone-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-100 line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                            {post.category || 'Clinical Guide'} • {post.readTime || '3 min'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transparent Pricing Card Toggle */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-stone-200">
                      Display Transparent Pricing Card
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showPricingLink !== false}
                    onChange={(e) => setFormData({ ...formData, showPricingLink: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Embeds your active initial exam fee (£49) and follow-up fee (£50) on this condition page with a direct link to /pricing.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingIndex(null);
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-750 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCondition}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save Condition Page</span>
            </button>
          </div>
        </div>
      ) : (
        /* VIEW 2: CONDITION MASTER LIST */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conditions by title or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3">
            {filteredConditions.map((cond, idx) => {
              const condSlug = cond.slug || slugify(cond.title || cond.id || `condition-${idx}`);
              const symptomCount = cond.symptoms?.length || 0;
              const blockCount = cond.blocks?.length || 0;
              const blogCount = cond.relatedBlogSlugs?.length || 0;

              return (
                <div
                  key={cond.id || idx}
                  className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-700 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <ConditionIconBadge
                      type={cond.icon || cond.title}
                      size="md"
                      className="shrink-0 mt-0.5"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-100 truncate">
                          {cond.title}
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          /conditions/{condSlug}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1">
                        {cond.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                        <span>✓ {symptomCount} Signs</span>
                        <span>•</span>
                        <span>📑 {blockCount} Mini-Page Blocks</span>
                        <span>•</span>
                        <span>🔗 {blogCount} Linked Articles</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleMoveCondition(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCondition(idx, 'down')}
                      disabled={idx === condList.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCondition(idx)}
                      title="Duplicate Condition"
                      className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`/conditions/${condSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View Live Condition Page"
                      className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-emerald-400 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCondition(idx)}
                      title="Delete Condition"
                      className="p-1.5 rounded-lg bg-stone-850 hover:bg-red-950 text-stone-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
