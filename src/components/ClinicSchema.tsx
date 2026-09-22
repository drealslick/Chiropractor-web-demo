import React from 'react';
import { useClinic } from '../data/ClinicContext';

export function ClinicSchema() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & { email?: string };

  const json = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    description: clinic.tagline,
    telephone: clinic.phone,
    email: extra.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
      addressLocality: clinic.city,
      addressRegion: clinic.state,
      postalCode: clinic.zip,
      addressCountry: clinic.country || 'GB',
    },
    openingHours: [clinic.hoursWeekday, clinic.hoursSaturday].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}