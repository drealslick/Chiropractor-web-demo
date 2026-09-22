import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';

type Post = { slug: string; title: string; date?: string; excerpt?: string; body?: string };

export default function Blog() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & { customPosts?: Post[]; blogTitle?: string };
  const posts = extra.customPosts || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">{extra.blogTitle || 'Guides & notes'}</h1>
        <p className="text-stone-600 text-sm">From {clinic.name}</p>
      </section>
      {posts.length === 0 ? (
        <p className="text-center text-stone-500 text-sm">No posts yet. Add them in admin → FAQs & Conditions.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="block p-5 bg-white border border-stone-200 rounded-xl"
            >
              <h2 className="font-semibold text-lg text-stone-900">{p.title} →</h2>
              {p.date ? <p className="text-xs text-stone-400 mt-1">{p.date}</p> : null}
              <p className="text-sm text-stone-600 mt-2">{p.excerpt || p.body?.slice(0, 140)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}