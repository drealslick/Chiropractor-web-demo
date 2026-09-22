import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';

export default function NotFound() {
  const { clinicData: clinic } = useClinic();
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">404</p>
      <h1 className="text-3xl font-bold text-stone-900">Page not found</h1>
      <p className="text-stone-600 text-sm">
        That link doesn’t exist on {clinic.name}.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link to="/" className="bg-stone-900 text-white font-semibold px-5 py-2.5 rounded-lg">
          Home
        </Link>
        <Link to="/contact" className="bg-stone-100 text-stone-900 font-semibold px-5 py-2.5 rounded-lg">
          Contact
        </Link>
      </div>
    </div>
  );
}