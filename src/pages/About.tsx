import React from 'react';

export default function About() {
  return (
    <div className="space-y-12 py-8 px-4 max-w-5xl mx-auto">
      {/* Practitioner Bio */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-8 border border-stone-200 rounded-2xl shadow-sm">
        <div className="md:col-span-1">
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600" 
            alt="Dr. Marcus Vance" 
            className="w-full h-72 object-cover rounded-xl border border-stone-100"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lead Practitioner</span>
          <h1 className="text-3xl font-bold text-stone-900">Dr. Marcus Vance, DC</h1>
          <p className="text-stone-600 leading-relaxed text-sm">
            With over 12 years of clinical experience, Dr. Vance specializes in non-invasive spinal adjustments, sports injury rehabilitation, and functional movement recovery.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-stone-500 border-t border-stone-100">
            <div>
              <span className="font-bold text-stone-800 block">Education:</span>
              Palmer College of Chiropractic
            </div>
            <div>
              <span className="font-bold text-stone-800 block">Board Certification:</span>
              National Board of Chiropractic Examiners
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Gallery */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Inside Our Practice</h2>
        <p className="text-stone-600 text-sm">Designed for patient comfort, safety, and modern rehabilitative care.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" 
            alt="Treatment Room" 
            className="w-full h-48 object-cover rounded-xl border border-stone-200"
          />
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600" 
            alt="Consultation Space" 
            className="w-full h-48 object-cover rounded-xl border border-stone-200"
          />
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600" 
            alt="Rehab Area" 
            className="w-full h-48 object-cover rounded-xl border border-stone-200"
          />
        </div>
      </section>
    </div>
  );
}
