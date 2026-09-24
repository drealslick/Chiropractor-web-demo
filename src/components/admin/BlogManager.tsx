import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  ExternalLink,
  Search,
  Check,
  Calendar,
  User,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Copy,
  AlertCircle,
  Eye,
  Bookmark,
  CheckCircle2,
  Send,
  Save,
  Filter,
} from 'lucide-react';
import { ClinicInfo, ClinicPost, BlogBlock } from '../../types';
import { defaultBlogPosts } from '../../data/defaultPosts';
import { BlogBlockEditor } from './BlogBlockEditor';
import {
  parseBodyToBlocks,
  serializeBlocksToBody,
  calculateBlocksWordCount,
} from '../../utils/blogBlockConverter';

interface BlogManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

const CATEGORY_PRESETS = [
  'Spinal Health & Alignment',
  'Posture & Ergonomics',
  'Sciatica & Disc Decompression',
  'Sports Rehab & Athletics',
  'Headaches & Neck Strain',
  'Patient Recovery Stories',
  'Wellness & Prevention',
  'Clinical Guidelines',
];

export const BlogManager: React.FC<BlogManagerProps> = ({ clinic, onUpdateClinic }) => {
  const posts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ClinicPost>({
    slug: '',
    title: '',
    category: 'Spinal Health & Alignment',
    readTime: '3 min read',
    date: new Date().toISOString().split('T')[0],
    author: clinic.doctorName || 'Lead Clinician',
    excerpt: '',
    body: '',
    status: 'published',
    blocks: [],
  });

  const [customCategoryInput, setCustomCategoryInput] = useState(false);
  const [customCategoryValue, setCustomCategoryValue] = useState('');
  const [manualReadTime, setManualReadTime] = useState(false);
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleStartCreate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialBlocks: BlogBlock[] = [
      {
        id: `block_${Date.now()}_1`,
        type: 'paragraph',
        content: '',
      },
    ];

    setFormData({
      slug: '',
      title: '',
      category: 'Spinal Health & Alignment',
      readTime: '2 min read',
      date: todayStr,
      author: clinic.doctorName || 'Lead Clinician',
      excerpt: '',
      body: '',
      status: 'published',
      blocks: initialBlocks,
    });
    setCustomCategoryInput(false);
    setManualReadTime(false);
    setIsCustomSlug(false);
    setEditingIndex(null);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (index: number) => {
    const post = posts[index];
    const initialBlocks = post.blocks && post.blocks.length > 0
      ? post.blocks
      : parseBodyToBlocks(post.body || '');

    // Convert date string if needed
    let dateVal = post.date || new Date().toISOString().split('T')[0];
    if (dateVal.includes(',') || dateVal.includes(' ')) {
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) {
        dateVal = parsed.toISOString().split('T')[0];
      }
    }

    const isPresetCategory = CATEGORY_PRESETS.includes(post.category || '');

    setFormData({
      ...post,
      date: dateVal,
      status: post.status || 'published',
      blocks: initialBlocks,
    });

    if (!isPresetCategory && post.category) {
      setCustomCategoryInput(true);
      setCustomCategoryValue(post.category);
    } else {
      setCustomCategoryInput(false);
    }

    setIsCustomSlug(true);
    setEditingIndex(index);
    setIsCreatingNew(false);
  };

  // Live Auto-updating Title and URL Slug
  const handleTitleChange = (val: string) => {
    const autoSlug = slugify(val);
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isCustomSlug ? autoSlug : prev.slug,
    }));
  };

  // Handle Blocks Change and auto calculate word count & read time
  const handleBlocksChange = (updatedBlocks: BlogBlock[]) => {
    const wordCount = calculateBlocksWordCount(updatedBlocks);
    const calculatedMinutes = Math.max(1, Math.ceil(wordCount / 180));
    const serializedBody = serializeBlocksToBody(updatedBlocks);

    setFormData((prev) => ({
      ...prev,
      blocks: updatedBlocks,
      body: serializedBody,
      readTime: !manualReadTime ? `${calculatedMinutes} min read` : prev.readTime,
      excerpt: !prev.excerpt && updatedBlocks[0]?.content
        ? updatedBlocks[0].content.slice(0, 140) + '...'
        : prev.excerpt,
    }));
  };

  // Save as Draft vs. Publish
  const handleSaveWithStatus = (statusToSave: 'published' | 'draft') => {
    if (!formData.title.trim()) {
      alert('Please provide an article title before saving.');
      return;
    }

    const finalSlug = (formData.slug.trim() || slugify(formData.title)).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const finalCategory = customCategoryInput
      ? customCategoryValue.trim() || 'Spinal Health & Alignment'
      : formData.category || 'Spinal Health & Alignment';

    // Format date for readable display e.g. "Sep 24, 2026"
    let displayDate = formData.date;
    try {
      if (formData.date) {
        const d = new Date(formData.date + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
    } catch {
      displayDate = formData.date;
    }

    const cleanPost: ClinicPost = {
      ...formData,
      slug: finalSlug,
      title: formData.title.trim(),
      category: finalCategory,
      author: formData.author?.trim() || clinic.doctorName || 'Clinical Team',
      date: displayDate,
      status: statusToSave,
      excerpt: formData.excerpt?.trim() || formData.body?.slice(0, 150) + '...',
      body: formData.body || serializeBlocksToBody(formData.blocks || []),
      blocks: formData.blocks || [],
    };

    let updatedList: ClinicPost[] = [];
    if (isCreatingNew) {
      if (posts.some((p) => p.slug === finalSlug)) {
        cleanPost.slug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
      updatedList = [cleanPost, ...posts];
    } else if (editingIndex !== null) {
      updatedList = posts.map((p, i) => (i === editingIndex ? cleanPost : p));
    }

    onUpdateClinic({
      ...clinic,
      customPosts: updatedList,
    });

    setNotification(
      statusToSave === 'published'
        ? `Successfully published "${cleanPost.title}"!`
        : `Saved draft for "${cleanPost.title}".`
    );
    setTimeout(() => setNotification(null), 3000);

    setIsCreatingNew(false);
    setEditingIndex(null);
  };

  const handleDeletePost = (index: number) => {
    const post = posts[index];
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      const updated = posts.filter((_, i) => i !== index);
      onUpdateClinic({
        ...clinic,
        customPosts: updated,
      });
      if (editingIndex === index) {
        setEditingIndex(null);
        setIsCreatingNew(false);
      }
    }
  };

  const handleMovePost = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const copy = [...posts];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    onUpdateClinic({
      ...clinic,
      customPosts: copy,
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all blog articles to the verified clinical library presets?')) {
      onUpdateClinic({
        ...clinic,
        customPosts: defaultBlogPosts,
      });
      setIsCreatingNew(false);
      setEditingIndex(null);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredPosts = posts
    .filter((p) => {
      if (filterStatus === 'published') return p.status !== 'draft';
      if (filterStatus === 'draft') return p.status === 'draft';
      return true;
    })
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const publishedCount = posts.filter((p) => p.status !== 'draft').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalWords = calculateBlocksWordCount(formData.blocks || []);

  return (
    <div className="space-y-6">
      {/* Blog Command Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                  Patient Health Articles & Blog ({posts.length})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  Block Editor
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Structured clinical editor for biomechanics guides, patient recovery FAQs, and SEO articles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notification && (
              <div className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{notification}</span>
              </div>
            )}

            <a
              href="/blog"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition border border-stone-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>View /blog</span>
            </a>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 text-stone-400 hover:text-amber-400 transition hover:bg-stone-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Reset to default clinical articles"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Global Blog Page Headline Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Blog Page Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Clinical Guides & Health Notes"
              value={clinic.blogTitle || 'Guides & Clinical Notes'}
              onChange={(e) => onUpdateClinic({ ...clinic, blogTitle: e.target.value })}
              className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Blog Page Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Evidence-based chiropractic, ergonomic advice, and recovery insights."
              value={clinic.blogSubtitle || `Evidence-based musculoskeletal guidance from ${clinic.name || 'the practice'}.`}
              onChange={(e) => onUpdateClinic({ ...clinic, blogSubtitle: e.target.value })}
              className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Filter Pills, Search & Quick Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-800">
          <div className="flex items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="flex rounded-lg bg-stone-900 border border-stone-750 p-0.5">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-emerald-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                All ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('published')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filterStatus === 'published'
                    ? 'bg-emerald-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('draft')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  filterStatus === 'draft'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Write Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT ARTICLE STRUCTURED BLOCK FORM */}
      {(isCreatingNew || editingIndex !== null) && (
        <div className="p-4 sm:p-6 bg-stone-850 border-2 border-emerald-500/60 rounded-2xl space-y-5 shadow-2xl animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${formData.status === 'draft' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <h4 className="font-bold text-stone-100 text-sm sm:text-base">
                {isCreatingNew ? 'Create New Clinical Guide' : `Editing: ${formData.title || 'Untitled Post'}`}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                formData.status === 'draft' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {formData.status === 'draft' ? 'Draft Mode' : 'Live Article'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingIndex(null);
              }}
              className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            {/* Article Title (Live updates Slug) */}
            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-1">
                Article Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5 Evidence-Based Decompression Habits for Desk Workers"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-emerald-500 font-serif font-bold shadow-inner"
              />
            </div>

            {/* URL Slug & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* URL Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-300">
                    URL Slug (Live Synced)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSlug(!isCustomSlug)}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isCustomSlug ? 'Auto-generate from title' : 'Customize slug'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-750 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-500 font-mono">/blog/</span>
                  <input
                    type="text"
                    required
                    placeholder="post-url-slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    className="flex-1 bg-transparent border-none text-xs font-mono text-emerald-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Category / Clinical Pillar
                </label>
                {!customCategoryInput ? (
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomCategoryInput(true);
                        setCustomCategoryValue('');
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Type new category..."
                      value={customCategoryValue}
                      onChange={(e) => {
                        setCustomCategoryValue(e.target.value);
                        setFormData({ ...formData, category: e.target.value });
                      }}
                      className="flex-1 bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCategoryInput(false);
                        setFormData({ ...formData, category: 'Spinal Health & Alignment' });
                      }}
                      className="px-2.5 py-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white text-xs cursor-pointer"
                    >
                      Presets
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Author, Date Picker, and Read Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Author */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Author Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Vance, DC"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Publication Date</span>
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>

              {/* Read Time (Auto-calculated with override) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Read Time</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setManualReadTime(!manualReadTime)}
                    className="text-[10px] text-stone-400 hover:text-emerald-400 cursor-pointer"
                  >
                    {manualReadTime ? 'Auto calculate' : 'Manual'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="3 min read"
                  disabled={!manualReadTime}
                  value={formData.readTime || ''}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className={`w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 ${
                    !manualReadTime ? 'opacity-80 cursor-default' : ''
                  }`}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                Short Excerpt / Meta Description (1–2 sentences for Google snippets)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary appearing on blog index cards and search results..."
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-stone-900 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* STRUCTURED BLOCK EDITOR */}
            <div className="pt-2">
              <BlogBlockEditor
                blocks={formData.blocks || []}
                onChange={handleBlocksChange}
              />
            </div>
          </div>

          {/* ACTION BUTTONS: DRAFT VS PUBLISH */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800">
            <div className="text-[11px] text-stone-400 font-mono">
              Total Article Words: <span className="text-emerald-400 font-bold">{totalWords} words</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingIndex(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={() => handleSaveWithStatus('draft')}
                className="px-4 py-2 rounded-xl bg-stone-750 hover:bg-stone-700 border border-stone-650 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              {/* Publish Article */}
              <button
                type="button"
                onClick={() => handleSaveWithStatus('published')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{isCreatingNew ? 'Publish Article' : 'Update & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLES LIST */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-stone-850 border border-dashed border-stone-800 rounded-xl space-y-3">
            <BookOpen className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-sm font-medium text-stone-300">No articles match your criteria.</p>
            <p className="text-xs text-stone-500">
              Create a new patient guide with structured blocks or restore presets.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Write First Article
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Load Default Presets
              </button>
            </div>
          </div>
        ) : (
          filteredPosts.map((post, originalIndex) => {
            const actualIndex = posts.findIndex((p) => p.slug === post.slug);
            const isEditingThis = editingIndex === actualIndex;
            const isDraft = post.status === 'draft';
            const blockCount = post.blocks?.length || 1;

            return (
              <div
                key={post.slug || actualIndex}
                className={`p-4 rounded-xl border transition ${
                  isEditingThis
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md'
                    : 'bg-stone-850 hover:bg-stone-800/80 border-stone-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isDraft ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Live
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                        {post.category || 'Health Guide'}
                      </span>

                      <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-stone-500" />
                        {post.readTime || '3 min'}
                      </span>

                      {post.date && (
                        <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          {post.date}
                        </span>
                      )}

                      <span className="text-[10px] text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                        {blockCount} blocks
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-100 text-sm sm:text-base leading-snug">
                      {post.title}
                    </h4>

                    {post.excerpt && (
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="text-[11px] text-stone-500 font-mono">
                      By {post.author || clinic.doctorName || 'Practice Clinician'} • <span className="text-emerald-400/80">/blog/{post.slug}</span>
                    </div>
                  </div>

                  {/* Row Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post.slug)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedSlug === post.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-400 hover:text-emerald-400 transition text-xs cursor-pointer"
                      title="Preview Article on Site"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center bg-stone-900 border border-stone-750 rounded-lg p-0.5">
                      <button
                        type="button"
                        disabled={actualIndex === 0}
                        onClick={() => handleMovePost(actualIndex, 'up')}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={actualIndex === posts.length - 1}
                        onClick={() => handleMovePost(actualIndex, 'down')}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(actualIndex)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(actualIndex)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/40 border border-stone-750 hover:border-rose-800 text-stone-400 hover:text-rose-400 transition text-xs cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
