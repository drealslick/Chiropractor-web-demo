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
      addressCountry:
        clinic.country ||
        (clinic.state === 'UK' || clinic.state === 'England' || clinic.cityState?.includes('UK')
          ? 'GB'
          : 'US'),
    },
    openingHours: [clinic.hoursWeekday, clinic.hoursSaturday].filter(Boolean),
    sameAs: [
      clinic.googleBusiness,
      clinic.instagram,
      clinic.facebook,
      clinic.youtube,
      clinic.linkedin,
      clinic.twitter,
      clinic.tiktok,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}