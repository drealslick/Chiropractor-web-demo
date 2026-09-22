import React from 'react';
import { useClinic } from '../data/ClinicContext';

export default function Privacy() {
  const { clinicData: clinic } = useClinic();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 text-sm text-stone-600">
      <h1 className="text-3xl font-bold text-stone-900">Privacy policy</h1>
      <p>
        {clinic.name} uses this site for marketing only. We do not collect health details through the
        contact form. Name and how to reach you are used to reply, then deleted if you ask.
      </p>
      <p>Booking and intake, if used, run on the clinic’s own system (Jane, Calendly, or similar).</p>
      <p>Questions: {clinic.phone}{clinic.email ? ` · ${clinic.email}` : ''}.</p>
    </div>
  );
}