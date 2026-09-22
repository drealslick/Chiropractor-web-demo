import React from 'react';
import { useClinic } from '../data/ClinicContext';

export default function Terms() {
  const { clinicData: clinic } = useClinic();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 text-sm text-stone-600">
      <h1 className="text-3xl font-bold text-stone-900">Terms</h1>
      <p>
        This website is information only. It is not a diagnosis or a treatment plan. Care starts after
        an exam at {clinic.name}.
      </p>
      <p>Booking slots and fees are confirmed by the clinic, not by this page.</p>
    </div>
  );
}