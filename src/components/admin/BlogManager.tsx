import React, { useState } from 'react';
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
} from 'lucide-react';
import { ClinicInfo, ClinicPost } from '../../types';
import { defaultBlogPosts } from '../../data/defaultPosts';

interface BlogManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const BlogManager: React.FC<BlogManagerProps> = ({ clinic, onUpdateClinic }) => {
  const posts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ClinicPost>({
    slug: '',
    title: '',
    category: 'Spinal Health',
    readTime: '4 min read',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    author: clinic.doctorName || 'Lead Clinician',
    excerpt: '',
    body: '',
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleStartCreate = () => {
    setFormData({
      slug: '',
      title: '',
      category: 'Spinal Health',
      readTime: '3 min read',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: clinic.doctorName || 'Lead Clinician',
      excerpt: '',
      body: '',
    });
    setEditingIndex(null);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (index: number) => {
    setFormData({ ...posts[index] });
    setEditingIndex(index);
    setIsCreatingNew(false);
  };

  const handleTitleChange = (val: string) => {
    const autoSlug = isCreatingNew || !formData.slug ? slugify(val) : formData.slug;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: isCreatingNew ? autoSlug : prev.slug,
    }));
  };

  const handleBodyChange = (val: string) => {
    const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 180));
    setFormData((prev) => ({
      ...prev,
      body: val,
      readTime: `${minutes} min read`,
    }));
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an article title.');
      return;
    }

    const finalSlug = (formData.slug.trim() || slugify(formData.title)).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const cleanPost: ClinicPost = {
      ...formData,
      slug: finalSlug,
      title: formData.title.trim(),
      category: formData.category?.trim() || 'Health Guide',
      author: formData.author?.trim() || clinic.doctorName || 'Clinical Team',
      date: formData.date?.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      excerpt: formData.excerpt?.trim() || formData.body?.slice(0, 150) + '...',
      body: formData.body?.trim() || '',
    };

    let updatedList: ClinicPost[] = [];
    if (isCreatingNew) {
      // Check for duplicate slug
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

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  SEO Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Manage clinical guides, patient recovery FAQs, and biomechanics educational notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Blog Global Page Title & Subtitle Settings */}
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

        {/* Quick Add Button & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-800">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search published articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* CREATE / EDIT ARTICLE MODAL FORM */}
      {(isCreatingNew || editingIndex !== null) && (
        <form
          onSubmit={handleSavePost}
          className="p-4 sm:p-5 bg-stone-850 border-2 border-emerald-500/60 rounded-2xl space-y-4 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-bold text-stone-100 text-sm">
                {isCreatingNew ? 'Create New Clinical Guide' : `Editing: ${formData.title || 'Untitled Post'}`}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingIndex(null);
              }}
              className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 rounded bg-stone-800 hover:bg-stone-750 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                Article Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5 Evidence-Based Decompression Habits for Desk Workers"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  URL Slug (Auto-generated)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-500 font-mono">/blog/</span>
                  <input
                    type="text"
                    required
                    placeholder="post-url-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="flex-1 bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Category / Clinical Pillar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomics & Spine, Sciatica, Patient Care"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Author Name</label>
                <input
                  type="text"
                  placeholder="Dr. Name"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Publication Date</label>
                <input
                  type="text"
                  placeholder="Sep 24, 2026"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Read Time</label>
                <input
                  type="text"
                  placeholder="4 min read"
                  value={formData.readTime || ''}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                Short Excerpt / Meta Description (1–2 sentences)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary appearing on blog index cards and Google snippets..."
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-300">
                  Full Article Body (Markdown / Paragraphs)
                </label>
                <span className="text-[10px] text-stone-500">
                  {formData.body ? formData.body.trim().split(/\s+/).filter(Boolean).length : 0} words
                </span>
              </div>
              <textarea
                rows={9}
                placeholder="Write the full clinical advice or patient education text here. Separate paragraphs with blank lines..."
                value={formData.body || ''}
                onChange={(e) => handleBodyChange(e.target.value)}
                className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setEditingIndex(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{isCreatingNew ? 'Publish Article' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ARTICLES LIST */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-stone-850 border border-dashed border-stone-800 rounded-xl space-y-3">
            <BookOpen className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-sm font-medium text-stone-300">No articles match your search.</p>
            <p className="text-xs text-stone-500">
              Create a new patient guide or restore the pre-written chiropractic presets.
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
            const isPreviewOpen = previewSlug === post.slug;

            return (
              <div
                key={post.slug || actualIndex}
                className={`p-4 rounded-xl border transition ${
                  isEditingThis
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md'
                    : 'bg-stone-850 hover:bg-stone-800/80 border-stone-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-800 text-emerald-400 border border-stone-700">
                        {post.category || 'Clinical Guide'}
                      </span>
                      {post.readTime && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      )}
                      {post.date && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      )}
                      {post.author && (
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-stone-100 leading-snug">{post.title}</h4>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {post.excerpt || post.body?.slice(0, 140)}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500 font-mono">
                      <span>/blog/{post.slug}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(post.slug)}
                        className="hover:text-stone-300 transition flex items-center gap-1 cursor-pointer"
                        title="Copy article link"
                      >
                        {copiedSlug === post.slug ? (
                          <span className="text-emerald-400 font-sans font-semibold">Copied!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="font-sans">Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 border-t sm:border-t-0 border-stone-800 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={actualIndex === 0}
                        onClick={() => handleMovePost(actualIndex, 'up')}
                        className="p-1.5 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400 rounded hover:bg-stone-750 transition cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={actualIndex === posts.length - 1}
                        onClick={() => handleMovePost(actualIndex, 'down')}
                        className="p-1.5 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400 rounded hover:bg-stone-750 transition cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewSlug(isPreviewOpen ? null : post.slug)}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium rounded flex items-center gap-1 transition cursor-pointer"
                        title="Quick Preview"
                      >
                        <Eye className="w-3 h-3 text-stone-400" />
                        <span>{isPreviewOpen ? 'Hide' : 'Preview'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(actualIndex)}
                        className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 text-xs font-semibold rounded flex items-center gap-1 transition cursor-pointer border border-emerald-700/60"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(actualIndex)}
                        className="p-1 text-stone-400 hover:text-rose-400 rounded hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Preview Accordion */}
                {isPreviewOpen && (
                  <div className="mt-3 pt-3 border-t border-stone-800 bg-stone-900/80 rounded-lg p-3 text-xs space-y-2">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Article Full Text Preview:</span>
                    </div>
                    <div className="text-stone-300 text-xs leading-relaxed space-y-2 max-h-48 overflow-y-auto pr-2">
                      {(post.body || '').split('\n').filter(Boolean).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
