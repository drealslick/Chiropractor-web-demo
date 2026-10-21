import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultBlogPosts } from '../data/defaultPosts';
import { isExplicitDemo } from '../lib/mode';
import type { ClinicPost } from '../types';

export default function Blog() {
  const { clinicData: clinic } = useClinic();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const isDemo = isExplicitDemo();
  const posts: ClinicPost[] = ((clinic.customPosts !== undefined ? clinic.customPosts : isDemo ? defaultBlogPosts : []) as ClinicPost[])
    .filter((post) => post.status !== 'draft');
  const categories = ['all', ...Array.from(new Set(posts.map(post => post.category).filter((entry): entry is string => Boolean(entry))))];
  const filtered = posts.filter(post =>
    (category === 'all' || post.category === category) &&
    (post.title + ' ' + (post.excerpt || '') + ' ' + (post.category || '')).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-v2 pv2-interior pv2-blog">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <span className="pv2-kicker">Notes from the practice / Journal</span>
          <div className="pv2-page-header-grid">
            <h1>{clinic.blogTitle || 'Notes worth sharing.'}</h1>
            <p>{clinic.blogSubtitle || 'Occasional writing on movement, health, and life around the practice.'}</p>
          </div>
        </header>
        <section className="pv2-content-section" aria-labelledby="pv2-journal-articles">
          <div className="pv2-content-heading pv2-content-heading-wide">
            <span className="pv2-kicker">01 / Reading room</span>
            <h2 id="pv2-journal-articles">Explore the journal.</h2>
            {isDemo && clinic.customPosts === undefined && <p>Illustrative articles for this demonstration website.</p>}
          </div>
          <div className="pv2-journal-toolbar">
            <label className="pv2-search-label">Search articles
              <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Try movement or back care…" />
            </label>
            <div className="pv2-journal-filter" aria-label="Filter article topics">
              {categories.map(cat => <button key={cat} type="button"
                className={category === cat ? 'is-active' : ''} aria-pressed={category === cat}
                onClick={() => setCategory(cat)}>{cat === 'all' ? 'All' : cat}</button>)}
            </div>
          </div>
          <div className="pv2-journal-list">
            {filtered.length ? filtered.map((post, i) =>
              <article key={post.slug}>
                <Link to={'/blog/' + post.slug} className="pv2-journal-entry">
                  <span className="pv2-index-number">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <span className="pv2-entry-meta">{[post.category, post.date, post.readTime].filter(Boolean).join(' / ')}</span>
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    {post.author && <small>Written by {post.author}</small>}
                  </div>
                  <span aria-hidden="true" className="pv2-index-arrow">↗</span>
                </Link>
              </article>
            ) : <p className="pv2-empty-state">No matching articles. Try a different search, or check back soon.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
