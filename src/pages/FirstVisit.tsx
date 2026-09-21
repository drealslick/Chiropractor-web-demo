import React from 'react';

export default function FirstVisit() {
  return (
    <div className="space-y-12 py-8 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">Your First Visit Guide</h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          Here is exactly what to expect when you walk into our clinic for your initial consultation.
        </p>
      </section>

      {/* Process Sequence (Restored Step 03) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 bg-white border border-stone-200 rounded-xl relative">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 01</span>
          <h3 className="font-semibold text-lg text-stone-900 mt-1">Assessment</h3>
          <p className="text-sm text-stone-500 mt-2">Comprehensive health review and digital posture screening.</p>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl relative">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 02</span>
          <h3 className="font-semibold text-lg text-stone-900 mt-1">Hands-on Relief</h3>
          <p className="text-sm text-stone-500 mt-2">Targeted chiropractic adjustment tailored to your primary discomfort.</p>
        </div>

        {/* RESTORED STEP 03 */}
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl relative">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Step 03</span>
          <h3 className="font-semibold text-lg text-stone-900 mt-1">Active Recovery Plan</h3>
          <p className="text-sm text-stone-600 mt-2">Personalized home exercises and habit tweaks to maintain spinal alignment.</p>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl relative">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step 04</span>
          <h3 className="font-semibold text-lg text-stone-900 mt-1">Long-term Progress</h3>
          <p className="text-sm text-stone-500 mt-2">Scheduled check-ins to lock in permanent postural improvements.</p>
        </div>
      </section>

      {/* Intake Form Module (Secure Link / No Unencrypted PHI) */}
      <section className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Save Time Before You Arrive</h2>
        <p className="text-stone-300 max-w-lg mx-auto text-sm">
          Fill out your initial health history securely online so our clinical team can review it prior to your appointment.
        </p>
        <div>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); alert("Redirects to client's secure EHR intake portal (Jane, Acuity, or PDF download)"); }}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold px-6 py-3 rounded-lg transition"
          >
            Complete Patient Intake Form Online →
          </a>
        </div>
      </section>
    </div>
  );
}
