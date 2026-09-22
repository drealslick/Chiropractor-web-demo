import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';

type Post = { slug: string; title: string; date?: string; excerpt?: string; body?: string };

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { clinicData: clinic } = useClinic();
  const posts = ((clinic as typeof clinic & { customPosts?: Post[] }).customPosts) || [];
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-600">Post not found.</p>
        <Link to="/blog" className="text-emerald-700 font-semibold">← All posts</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link to="/blog" className="text-sm font-semibold text-emerald-700">← All posts</Link>
      <h1 className="text-3xl font-bold text-stone-900">{post.title}</h1>
      {post.date ? <p className="text-xs text-stone-400">{post.date}</p> : null}
      <div className="text-stone-700 text-sm leading-relaxed space-y-3">
        {(post.body || '').split('\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}