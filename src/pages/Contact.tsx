import React from 'react';

export default function Contact() {
  return (
    <div className="space-y-10 py-8 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">Contact & Location</h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          Visit our clinic or get in touch directly. We respond to all inquiries within one business day.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logistics Module */}
        <div className="space-y-6 bg-white p-6 border border-stone-200 rounded-2xl">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Clinic Logistics</h2>
          
          <div className="space-y-4 text-sm text-stone-600">
            <div>
              <span className="font-bold text-stone-900 block">Address:</span>
              123 Healing Way, Suite 400, Columbus, OH 43215
            </div>

            <div>
              <span className="font-bold text-stone-900 block">Hours of Operation:</span>
              Mon - Thu: 8:00 AM – 6:00 PM<br />
              Friday: 8:00 AM – 4:00 PM<br />
              Sat - Sun: Closed
            </div>

            <div>
              <span className="font-bold text-stone-900 block">Phone & SMS Line:</span>
              (614) 555-0199
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">Parking & Accessibility:</span>
              Free dedicated patient parking in the rear lot. Fully wheelchair accessible with ramp entry.
            </div>
          </div>
        </div>

        {/* Map Embed Container */}
        <div className="bg-stone-100 border border-stone-200 rounded-2xl overflow-hidden h-80 md:h-auto min-h-[300px]">
          <iframe
            title="Clinic Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d195884.30043015483!2d-83.11408304999999!3d39.982868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883889c1b93804d9%3A0x2a006325be54bf52!2sColumbus%2C%20OH!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
