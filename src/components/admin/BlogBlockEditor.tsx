import React, { useState } from 'react';
import {
  Type,
  Heading,
  List,
  ListOrdered,
  Image as ImageIcon,
  AlertTriangle,
  Lightbulb,
  Quote,
  Target,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  UploadCloud,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  Sliders,
} from 'lucide-react';
import { BlogBlock, BlogBlockType } from '../../types';
import { compressImage } from '../../utils/imageCompressor';

interface BlogBlockEditorProps {
  blocks: BlogBlock[];
  onChange: (updatedBlocks: BlogBlock[]) => void;
}

export const BlogBlockEditor: React.FC<BlogBlockEditorProps> = ({ blocks, onChange }) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const createDefaultBlock = (type: BlogBlockType): BlogBlock => {
    const id = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    switch (type) {
      case 'paragraph':
        return {
          id,
          type: 'paragraph',
          content: '',
        };
      case 'heading':
        return {
          id,
          type: 'heading',
          level: 'h2',
          headingText: '',
        };
      case 'list':
        return {
          id,
          type: 'list',
          listType: 'bullet',
          items: [''],
        };
      case 'image':
        return {
          id,
          type: 'image',
          imageUrl: '',
          imageAlt: '',
          caption: '',
        };
      case 'callout':
        return {
          id,
          type: 'callout',
          calloutVariant: 'takeaway',
          calloutTitle: 'Key Clinical Takeaway',
          calloutText: '',
        };
      case 'quote':
        return {
          id,
          type: 'quote',
          quoteText: '',
          quoteAuthor: '',
        };
      case 'cta':
        return {
          id,
          type: 'cta',
          ctaHeadline: 'Schedule Your Comprehensive Spinal Examination',
          ctaSubtitle: 'Early morning and evening appointments available this week.',
          ctaButtonText: 'Book Your First Visit',
        };
    }
  };

  const handleAddBlock = (type: BlogBlockType, targetIndex?: number) => {
    const newBlock = createDefaultBlock(type);
    if (typeof targetIndex === 'number') {
      const updated = [...blocks];
      updated.splice(targetIndex + 1, 0, newBlock);
      onChange(updated);
    } else {
      onChange([...blocks, newBlock]);
    }
    setActiveMenuIndex(null);
  };

  const handleUpdateBlock = (id: string, partial: Partial<BlogBlock>) => {
    onChange(
      blocks.map((b) => (b.id === id ? { ...b, ...partial } : b))
    );
  };

  const handleDeleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const copy = [...blocks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  const handleDuplicateBlock = (index: number) => {
    const source = blocks[index];
    const copyBlock: BlogBlock = {
      ...source,
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      items: source.items ? [...source.items] : undefined,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, copyBlock);
    onChange(updated);
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    setUploadingBlockId(blockId);
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      handleUpdateBlock(blockId, {
        imageUrl: compressed,
      });
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Failed to process image file.');
    } finally {
      setUploadingBlockId(null);
    }
  };

  const blockOptions: { type: BlogBlockType; label: string; icon: React.ElementType; description: string }[] = [
    {
      type: 'paragraph',
      label: 'Paragraph',
      icon: Type,
      description: 'Standard editorial text and clinical explanation.',
    },
    {
      type: 'heading',
      label: 'Subheading (H2 / H3)',
      icon: Heading,
      description: 'Section break to organize content and improve SEO scanability.',
    },
    {
      type: 'list',
      label: 'Bullet / Numbered List',
      icon: List,
      description: 'Symptoms, diagnostic steps, or rehabilitation habits.',
    },
    {
      type: 'image',
      label: 'Image with Alt Text',
      icon: ImageIcon,
      description: 'Anatomy diagrams, clinic photos, or exercise demos.',
    },
    {
      type: 'callout',
      label: 'Callout Box',
      icon: Lightbulb,
      description: 'Highlight key takeaways, pro tips, or clinical warnings.',
    },
    {
      type: 'quote',
      label: 'Pull Quote',
      icon: Quote,
      description: 'Standout sentence or clinician commentary.',
    },
    {
      type: 'cta',
      label: 'Booking CTA Card',
      icon: Target,
      description: 'High-converting consultation card inserted mid-article.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Block List Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Structured Article Content ({blocks.length} Blocks)</span>
        </label>
        <span className="text-[11px] text-stone-400">
          Drag/reorder sections to keep patient readers engaged
        </span>
      </div>

      {/* Render All Blocks */}
      {blocks.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-stone-800 rounded-2xl text-center bg-stone-900/40 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-stone-850 border border-stone-750 text-stone-400 flex items-center justify-center mx-auto">
            <Plus className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-200">Start Building Your Article</h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Add paragraphs, section subheadings, symptom lists, images, callout boxes, and CTAs.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {blockOptions.slice(0, 4).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleAddBlock(opt.type)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ {opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => {
            return (
              <div
                key={block.id}
                className="p-3.5 sm:p-4 rounded-xl bg-stone-900 border border-stone-750 hover:border-stone-700 transition shadow-xs space-y-3 group"
              >
                {/* Block Header Toolbar */}
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-stone-800 text-[10px] font-mono text-stone-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5 capitalize">
                      {block.type === 'paragraph' && <Type className="w-3.5 h-3.5 text-emerald-400" />}
                      {block.type === 'heading' && <Heading className="w-3.5 h-3.5 text-blue-400" />}
                      {block.type === 'list' && <List className="w-3.5 h-3.5 text-amber-400" />}
                      {block.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-purple-400" />}
                      {block.type === 'callout' && <Lightbulb className="w-3.5 h-3.5 text-amber-300" />}
                      {block.type === 'quote' && <Quote className="w-3.5 h-3.5 text-teal-400" />}
                      {block.type === 'cta' && <Target className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{block.type}</span>
                    </span>
                  </div>

                  {/* Actions (Move, Duplicate, Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBlock(index, 'up')}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => handleMoveBlock(index, 'down')}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateBlock(index)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                      title="Duplicate Block"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 cursor-pointer"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* BLOCK SPECIFIC EDITORS */}

                {/* 1. PARAGRAPH */}
                {block.type === 'paragraph' && (
                  <div className="space-y-1">
                    <textarea
                      rows={3}
                      placeholder="Write your clinical advice or paragraph text here..."
                      value={block.content || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                    />
                    <div className="flex justify-end text-[10px] text-stone-500 font-mono">
                      {(block.content || '').trim().split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>
                )}

                {/* 2. SUBHEADING */}
                {block.type === 'heading' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg bg-stone-950 border border-stone-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateBlock(block.id, { level: 'h2' })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            block.level === 'h2' || !block.level
                              ? 'bg-emerald-500 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          H2 (Major Section)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBlock(block.id, { level: 'h3' })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            block.level === 'h3'
                              ? 'bg-emerald-500 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          H3 (Sub-Topic)
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Why Lumbar Facet Joints Become Inflamed"
                      value={block.headingText || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { headingText: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs font-serif font-bold text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* 3. BULLET / NUMBERED LIST */}
                {block.type === 'list' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg bg-stone-950 border border-stone-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateBlock(block.id, { listType: 'bullet' })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            block.listType === 'bullet' || !block.listType
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          <List className="w-3 h-3" />
                          <span>Bullet List</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBlock(block.id, { listType: 'numbered' })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            block.listType === 'numbered'
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          <ListOrdered className="w-3 h-3" />
                          <span>Numbered List</span>
                        </button>
                      </div>
                    </div>

                    {/* List items */}
                    <div className="space-y-1.5">
                      {(block.items || ['']).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-stone-500 w-5 text-right shrink-0">
                            {block.listType === 'numbered' ? `${itemIdx + 1}.` : '•'}
                          </span>
                          <input
                            type="text"
                            placeholder={`List item ${itemIdx + 1}...`}
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(block.items || [])];
                              newItems[itemIdx] = e.target.value;
                              handleUpdateBlock(block.id, { items: newItems });
                            }}
                            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                          {(block.items || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = (block.items || []).filter((_, idx) => idx !== itemIdx);
                                handleUpdateBlock(block.id, { items: newItems });
                              }}
                              className="p-1 text-stone-500 hover:text-rose-400 transition cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...(block.items || []), ''];
                          handleUpdateBlock(block.id, { items: newItems });
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 mt-1 pl-7 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. IMAGE UPLOAD & ALT TEXT */}
                {block.type === 'image' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Image Preview / Dropzone */}
                      <div className="sm:col-span-4">
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-stone-950 border border-stone-800 relative flex items-center justify-center group">
                          {block.imageUrl ? (
                            <>
                              <img
                                src={block.imageUrl}
                                alt={block.imageAlt || 'Article illustration'}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateBlock(block.id, { imageUrl: '' })}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-stone-950/80 text-white hover:bg-rose-600 transition cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-stone-900 transition text-center">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(block.id, file);
                                }}
                              />
                              <UploadCloud className="w-5 h-5 text-stone-500 mb-1" />
                              <span className="text-[10px] text-stone-400 font-medium">
                                {uploadingBlockId === block.id ? 'Optimizing...' : 'Upload Image'}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Image Metadata Inputs */}
                      <div className="sm:col-span-8 space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-0.5">
                            Image Alt Text (SEO & Accessibility) <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Spinal alignment diagram showing lumbar decompression"
                            value={block.imageAlt || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { imageAlt: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-stone-400 mb-0.5">
                            Caption or Clinical Citation (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Fig 1.2: Normal disc curvature vs biomechanical restriction"
                            value={block.caption || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CALLOUT BOX */}
                {block.type === 'callout' && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-stone-400 mr-1">Variant:</span>
                      {[
                        { id: 'takeaway', label: '💡 Key Takeaway', color: 'emerald' },
                        { id: 'warning', label: '⚠️ Clinical Warning', color: 'amber' },
                        { id: 'tip', label: '⚡ Ergonomic Tip', color: 'indigo' },
                        { id: 'research', label: '🔬 Research Note', color: 'stone' },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleUpdateBlock(block.id, { calloutVariant: v.id as any })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                            block.calloutVariant === v.id || (!block.calloutVariant && v.id === 'takeaway')
                              ? 'bg-emerald-500 text-stone-950 shadow-xs'
                              : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Callout Headline (e.g. When to Seek Immediate Clinical Triage)"
                      value={block.calloutTitle || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { calloutTitle: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs font-bold text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                    />

                    <textarea
                      rows={2}
                      placeholder="Enter callout explanation text..."
                      value={block.calloutText || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { calloutText: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                )}

                {/* 6. PULL QUOTE */}
                {block.type === 'quote' && (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Quote text (e.g. Restoring spinal joint mobility eliminates root cause strain rather than merely masking pain symptoms.)..."
                      value={block.quoteText || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { quoteText: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs font-serif italic text-teal-200 placeholder-stone-600 focus:outline-none focus:border-teal-500 leading-relaxed"
                    />
                    <input
                      type="text"
                      placeholder="Author / Attribution (e.g. Dr. Vance, Clinical Director)"
                      value={block.quoteAuthor || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { quoteAuthor: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}

                {/* 7. CTA CARD */}
                {block.type === 'cta' && (
                  <div className="space-y-2 p-3 rounded-lg bg-stone-950 border border-rose-900/40">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                      <Target className="w-3.5 h-3.5" />
                      <span>Mid-Article Consultation Call-To-Action</span>
                    </div>

                    <input
                      type="text"
                      placeholder="CTA Headline (e.g. Struggling with Chronic Lumbar Pain?)"
                      value={block.ctaHeadline || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { ctaHeadline: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-xs font-bold text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500"
                    />

                    <input
                      type="text"
                      placeholder="CTA Subtitle / Urgency line"
                      value={block.ctaSubtitle || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { ctaSubtitle: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-rose-500"
                    />

                    <input
                      type="text"
                      placeholder="Button Text (e.g. Book Your Initial Consultation)"
                      value={block.ctaButtonText || ''}
                      onChange={(e) => handleUpdateBlock(block.id, { ctaButtonText: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-xs text-rose-300 placeholder-stone-600 focus:outline-none focus:border-rose-500 font-semibold"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* "+ ADD BLOCK" PICKER BUTTON & MENU */}
      <div className="pt-2">
        {activeMenuIndex === null ? (
          <button
            type="button"
            onClick={() => setActiveMenuIndex(blocks.length)}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-emerald-500 bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm group"
          >
            <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform" />
            <span>+ Add Article Block</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-900 border-2 border-emerald-500/70 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Choose a block type to insert:</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveMenuIndex(null)}
                className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {blockOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleAddBlock(opt.type)}
                    className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-emerald-500 text-left transition cursor-pointer group flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-700 group-hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100 group-hover:text-emerald-300">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-stone-400 leading-snug mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
