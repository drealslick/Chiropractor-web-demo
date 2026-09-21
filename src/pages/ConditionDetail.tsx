import React from 'react';
import { useParams, Link } from 'react-router-dom';

const conditionData: Record<string, { title: string; description: string; symptoms: string[]; treatment: string }> = {
  'back-lower-back-pain': {
    title: 'Lower Back & Lumbar Pain Relief',
    description: 'Targeted chiropractic adjustments and core stabilization to treat sciatica, herniated discs, and acute lumbar tension.',
    symptoms: ['Sciatica & shooting nerve pain', 'Stiffness after sitting or sleeping', 'Muscle spasms in lower spine'],
    treatment: 'Gentle spinal decompression paired with gentle adjustments to realign lumbar vertebrae and reduce nerve compression.'
  },
  'neck-shoulder-pain': {
    title: 'Neck & Shoulder Stiffness Care',
    description: 'Relieve tech-neck posture strain, pinched cervical nerves, and chronic upper back tightness.',
    symptoms: ['Radiating arm pain or numbness', 'Reduced head mobility', 'Persistent upper neck soreness'],
    treatment: 'Cervical spinal alignment, soft tissue release, and ergonomic posture guidance.'
  },
  'sports-injury': {
    title: 'Sports Injury & Rehabilitation',
    description: 'Accelerate recovery for joint sprains, muscle strains, and repetitive movement stress.',
    symptoms: ['Joint inflammation & swelling', 'Reduced athletic mobility', 'Re-aggravated old injuries'],
    treatment: 'Targeted joint mobilization, physical therapy routines, and athletic performance recovery.'
  },
  'headaches-tension': {
    title: 'Headaches & Tension Relief',
    description: 'Alleviate cervical spine pressure linked to chronic tension headaches and stress-induced migraines.',
    symptoms: ['Throbbing base-of-skull pain', 'Tension behind the eyes', 'Tight neck muscles'],
    treatment: 'Gentle neck adjustments aimed at restoring proper blood flow and relieving upper nerve pressure.'
  },
  'mobility-stiffness': {
    title: 'Joint Mobility & Posture Correction',
    description: 'Restore full-body flexibility, spinal balance, and long-term joint longevity.',
    symptoms: ['Morning stiffness', 'Decreased joint flexibility', 'Poor standing/sitting posture'],
    treatment: 'Full-body chiropractic assessment, spinal alignment, and custom stretching routines.'
  }
};

export default function ConditionDetail() {
  const { conditionId } = useParams<{ conditionId: string }>();
  const condition = conditionId ? conditionData[conditionId] : null;

  if (!condition) {
    return (
      <div className="py-16 text-center space-y-4 max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-stone-900">Condition Not Found</h1>
        <p className="text-stone-600">The specific treatment page you requested could not be located.</p>
        <Link to="/conditions" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
          ← Back to All Conditions
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto space-y-8">
      <Link to="/conditions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
        ← Back to All Conditions
      </Link>

      <section className="space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Specialized Treatment
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">{condition.title}</h1>
        <p className="text-lg text-stone-600 leading-relaxed">{condition.description}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">Common Symptoms</h2>
          <ul className="space-y-2">
            {condition.symptoms.map((symptom, idx) => (
              <li key={idx} className="text-sm text-stone-600 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                {symptom}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">Our Clinical Approach</h2>
          <p className="text-sm text-stone-700 leading-relaxed">{condition.treatment}</p>
        </div>
      </div>

      <div className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to Start Feeling Better?</h3>
        <p className="text-stone-300 text-sm max-w-md mx-auto">
          Book your initial consultation and claim our $49 new patient evaluation special today.
        </p>
        <Link to="/" className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition">
          Claim $49 Special & Book
        </Link>
      </div>
    </div>
  );
}
