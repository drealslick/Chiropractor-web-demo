import React from 'react';
import { useClinic } from '../data/ClinicContext';

export default function Contact() {
  const { clinicData: clinic } = useClinic();
  const mapQuery = encodeURIComponent(clinic.address || clinic.cityState || clinic.city || '');

  return (
    <div className="space-y-10 py-8 px-4 max-w-5xl mx-auto">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">Contact & Location</h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          {clinic.tagline || 'Visit the clinic or get in touch directly.'}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white p-6 border border-stone-200 rounded-2xl">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Clinic Logistics</h2>
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
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">Parking & access</span>
              {clinic.parkingNote || 'Confirm parking when you book.'}
            </div>
          </div>
        </div>

        <div className="bg-stone-100 border border-stone-200 rounded-2xl overflow-hidden h-80 md:h-auto min-h-[300px]">
          <iframe
            title="Clinic Location Map"
            src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}