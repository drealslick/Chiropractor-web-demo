import React from 'react';
import { PublicTeamMember, ClinicInfo } from '../types';

interface PhysicianSchemaProps {
  member: PublicTeamMember;
  clinic: ClinicInfo;
}

export function PhysicianSchema({ member, clinic }: PhysicianSchemaProps) {
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/team/${member.slug}` : '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Physician'],
    '@id': pageUrl ? `${pageUrl}#physician` : undefined,
    url: pageUrl || undefined,
    name: member.name,
    jobTitle: member.role,
    honorificPrefix: member.name.startsWith('Dr.') ? 'Dr.' : undefined,
    honorificSuffix: member.credentials || undefined,
    description: member.shortSummary,
    image: member.photoUrl
      ? member.photoUrl.startsWith('http')
        ? member.photoUrl
        : typeof window !== 'undefined'
        ? `${window.location.origin}${member.photoUrl}`
        : member.photoUrl
      : undefined,
    telephone: member.phone || clinic.phone,
    email: member.email || clinic.email,
    knowsAbout: member.areasOfFocus || [],
    medicalSpecialty: 'Chiropractic',
    alumniOf: member.education || undefined,
    identifier: member.registrationNumber || undefined,
    worksFor: {
      '@type': 'MedicalClinic',
      name: clinic.name,
      telephone: clinic.phone,
      url: typeof window !== 'undefined' ? window.location.origin : undefined,
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
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
