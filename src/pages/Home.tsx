import React from 'react';

export default function Home() {
  return (
    <div className="space-y-12 py-8 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-3">
          $49 New Patient Special
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-4">
          Columbus Chiropractic Care
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-6">
          Personalized adjustments and physical therapy for long-term pain relief.
        </p>
        <a 
          href="#booking" 
          className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-emerald-700 transition"
        >
          Claim $49 Special
        </a>
      </section>

      {/* Targeted Relief Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Targeted Relief</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Entire card is clickable (Phase 2 UX Improvement) */}
          <a 
            href="/conditions/back-lower-back-pain" 
            className="block p-6 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-emerald-500 transition group"
          >
            <h3 className="font-semibold text-lg text-stone-800 group-hover:text-emerald-600">
              Lower Back Pain →
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Targeted adjustments to realign spine and relieve severe lumbar discomfort.
            </p>
          </a>

          <a 
            href="/conditions/neck-shoulder-pain" 
            className="block p-6 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-emerald-500 transition group"
          >
            <h3 className="font-semibold text-lg text-stone-800 group-hover:text-emerald-600">
              Neck & Shoulder Pain →
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Relieve posture tension, pinched nerves, and chronic stiffness.
            </p>
          </a>

          <a 
            href="/conditions/sports-injury" 
            className="block p-6 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-emerald-500 transition group"
          >
            <h3 className="font-semibold text-lg text-stone-800 group-hover:text-emerald-600">
              Sports Injury →
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              Accelerate joint recovery and restore peak physical performance.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
