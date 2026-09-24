import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultBlogPosts } from '../data/defaultPosts';
import { ClinicPost } from '../types';
import { BookOpen, Calendar, Clock, User, ArrowRight, Sparkles, Search, ChevronRight } from 'lucide-react';

export default function Blog() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allPosts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  // Filter out drafts on public blog index
  const posts = allPosts.filter((p) => p.status !== 'draft');

  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[]];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Banner */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clinical Knowledge & Recovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic.blogTitle || 'Guides & Clinical Notes'}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {clinic.blogSubtitle ||
              `Evidence-based insights, spinal biomechanics advice, and ergonomic protocols from ${clinic.name || 'our clinical team'}.`}
          </p>
        </section>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat === 'all' ? 'All Articles' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-base font-semibold text-stone-800">No articles found.</p>
            <p className="text-xs text-stone-500">Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col justify-between p-6 sm:p-7 bg-white hover:bg-stone-50/80 border border-stone-200/90 hover:border-emerald-700/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px]">
                      {post.category || 'Clinical Guide'}
                    </span>
                    {post.readTime && (
                      <span className="text-stone-400 text-xs flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                    {post.excerpt || post.body?.slice(0, 160)}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    {post.author && (
                      <span className="font-medium text-stone-700">{post.author}</span>
                    )}
                    {post.date && (
                      <>
                        <span>•</span>
                        <span>{post.date}</span>
                      </>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Consultation Callout Box */}
        <section className="mt-16 p-8 sm:p-10 rounded-2xl bg-stone-900 text-stone-50 text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Experiencing Persistent Pain or Musculoskeletal Symptoms?
          </h3>
          <p className="text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Stop guessing with generic advice. Book a comprehensive 45-minute biomechanical evaluation and get a personalized recovery plan.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={openBookingModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold tracking-wide transition shadow-lg cursor-pointer"
            >
              <span>{clinic.offerCtaText || 'BOOK A CONSULTATION →'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
