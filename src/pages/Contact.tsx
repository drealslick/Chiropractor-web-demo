import React, { useState } from 'react';
import { useClinic } from '../data/ClinicContext';

export default function Contact() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & { email?: string };
  const mapQuery = encodeURIComponent(
    [clinic.address, clinic.cityState || clinic.city, clinic.zip].filter(Boolean).join(', ')
  );
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-10 py-8 px-4 max-w-5xl mx-auto">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">Contact & Location</h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          {clinic.tagline || `Visit ${clinic.name} or get in touch directly.`}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white p-6 border border-stone-200 rounded-2xl">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Clinic logistics</h2>
          <div className="space-y-4 text-sm text-stone-600">
            <div>
              <span className="font-bold text-stone-900 block">Address</span>
              {clinic.address}
              {clinic.cityState ? `, ${clinic.cityState}` : ''}
              {clinic.zip ? ` ${clinic.zip}` : ''}
            </div>
            <div>
              <span className="font-bold text-stone-900 block">Hours</span>
              {clinic.hoursWeekday}
              <br />
              {clinic.hoursSaturday}
            </div>
            <div>
              <span className="font-bold text-stone-900 block">Phone</span>
              <a href={`tel:${clinic.phoneRaw || clinic.phone}`} className="text-emerald-800">
                {clinic.phone}
              </a>
            </div>
            {extra.email && (
              <div>
                <span className="font-bold text-stone-900 block">Email</span>
                <a href={`mailto:${extra.email}`} className="text-emerald-800">
                  {extra.email}
                </a>
              </div>
            )}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-900 block">Parking & access</span>
              {clinic.parkingNote || 'Confirm parking when you book.'}
            </div>
          </div>
        </div>

        <div className="bg-stone-100 border border-stone-200 rounded-2xl overflow-hidden h-80 md:h-auto min-h-[300px]">
          <iframe
            title={`${clinic.name} location`}
            src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>

      <form
        className="bg-white p-6 border border-stone-200 rounded-2xl space-y-4 max-w-xl mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const subject = encodeURIComponent(`Website enquiry — ${clinic.name}`);
          const body = encodeURIComponent(
            `${data.get('name')}\n${data.get('phone')}\n${data.get('email')}\n\n${data.get('message')}`
          );
          const to = extra.email || '';
          if (to) window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
          setSent(true);
        }}
      >
        <h2 className="text-xl font-bold text-stone-900">Send a message</h2>
        <p className="text-xs text-stone-500">No health details. Name and how to reach you is enough.</p>
        <input name="name" required placeholder="Name" className="w-full border border-stone-300 rounded-lg p-2 text-sm" />
        <input name="phone" placeholder="Phone" className="w-full border border-stone-300 rounded-lg p-2 text-sm" />
        <input name="email" type="email" placeholder="Email" className="w-full border border-stone-300 rounded-lg p-2 text-sm" />
        <textarea name="message" rows={4} placeholder="How can we help?" className="w-full border border-stone-300 rounded-lg p-2 text-sm" />
        <button type="submit" className="bg-stone-900 text-white font-semibold px-5 py-2.5 rounded-lg">
          {sent ? 'Opening email…' : 'Send'}
        </button>
      </form>
    </div>
  );
}