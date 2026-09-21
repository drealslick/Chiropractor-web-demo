import React from 'react';

const conditionList = [
  {
    id: 'back-lower-back-pain',
    title: 'Lower Back & Lumbar Pain',
    desc: 'Targeted spinal adjustments and core stabilization to treat sciatica, herniated discs, and lower back tension.',
  },
  {
    id: 'neck-shoulder-pain',
    title: 'Neck & Shoulder Stiffness',
    desc: 'Relieve posture strain from desk work, pinched nerves, upper back tightness, and reduced range of motion.',
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury & Rehabilitation',
    desc: 'Accelerate recovery for joint sprains, muscle strains, and repetitive movement stress in athletes.',
  },
  {
    id: 'headaches-tension',
    title: 'Headaches & Tension Relief',
    desc: 'Alleviate cervical spine pressure linked to chronic tension headaches and migraines.',
  },
  {
    id: 'mobility-stiffness',
    title: 'Joint Mobility & Posture Correction',
    desc: 'Restore full body flexibility, spinal alignment, and long-term joint health.',
  },
];

export default function Conditions() {
  return (
    <div className="space-y-10 py-8 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Specialized Care</span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">Conditions We Treat</h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          Explore our non-invasive chiropractic care and targeted physical therapy routines for long-term relief.
        </p>
      </section>

      {/* Conditions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conditionList.map((item) => (
          <a
            key={item.id}
            href={`/conditions/${item.id}`}
            className="block p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition group"
          >
            <h3 className="text-xl font-semibold text-stone-900 group-hover:text-emerald-600 transition mb-2">
              {item.title} →
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
