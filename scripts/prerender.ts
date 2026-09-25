import fs from 'fs';
import path from 'path';

/**
 * Static Multi-Route Prerenderer & SEO Authority Pipeline
 * Vance Health Practice Architecture (London, UK)
 *
 * Implements:
 * 1. Real prerendered DOM markup in #root (instant LCP & hydrateRoot DOM reuse)
 * 2. Unified Schema.org Graph (Single primary MedicalClinic entity + Physicians + Procedures + Breadcrumbs + FAQs)
 * 3. E-E-A-T Medical Review metadata (reviewedBy, lastReviewed, NICE/Cochrane citations)
 * 4. Single-source-of-truth server rewrite configs (vercel.json with trailingSlash: true, .htaccess, _redirects)
 * 5. Clean sitemap.xml with lastmod dates & private route exclusion
 */

interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  noIndex?: boolean;
  pageType: 'home' | 'conditions' | 'condition-detail' | 'first-visit' | 'pricing' | 'team' | 'about' | 'blog' | 'contact' | 'portal' | 'legal';
  conditionKey?: string;
  h1: string;
  h2Subtitle: string;
  bodyContent: string[];
  faqs?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; path: string }>;
  reviewer?: {
    name: string;
    role: string;
    regNumber: string;
    regBody: string;
  };
  lastReviewedDate?: string;
  citations?: string[];
}

const BASE_URL = 'https://vancehealth.co.uk';
const CLINIC_NAME = 'Vance Health Practice Architecture';
const CLINIC_PHONE = '+44 20 7946 0192';
const CLINIC_EMAIL = 'reception@vancehealth.co.uk';
const CLINIC_ADDRESS_STREET = '742 Central Practice Ave, Suite 300';
const CLINIC_LOCALITY = 'London';
const CLINIC_POSTAL = 'W1W 7LT';
const CLINIC_COUNTRY = 'GB';

const PRIMARY_CLINIC_ID = `${BASE_URL}/#clinic`;
const DR_VANCE_ID = `${BASE_URL}/#dr-alistair-vance`;
const DR_ROSTOVA_ID = `${BASE_URL}/#dr-elena-rostova`;
const DR_STERLING_ID = `${BASE_URL}/#dr-marcus-sterling`;

const DEFAULT_REVIEWER = {
  name: 'Dr. Alistair Vance, MChiro, DC',
  role: 'Clinical Director & Doctor of Chiropractic',
  regNumber: 'GCC 04182',
  regBody: 'General Chiropractic Council (UK)',
};

const ROUTES: RouteMetadata[] = [
  {
    path: '',
    title: `${CLINIC_NAME} | Evidence-Based Chiropractic & Spinal Care London`,
    description: 'Specialized chiropractic care, lumbar disc decompression, and cervical rehabilitation in London W1. GCC-registered practitioners with transparent, no-show protected booking.',
    ogImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'home',
    h1: 'Get Back to What Pain Took Away.',
    h2Subtitle: 'Evidence-Based Chiropractic Care in Central London (W1W)',
    bodyContent: [
      'Vance Health delivers specialized, root-cause chiropractic care designed around your symptoms, mechanical restrictions, and spinal health.',
      'Our clinical practice specializes in computer-assisted spinal decompression, cervical realignment, athletic sports rehabilitation, and ergonomic postural correction.',
      'Consultation & comprehensive physical assessment from £49. Online booking with transparent fees and instant digital health insurance receipts.'
    ],
    faqs: [
      {
        question: 'Is chiropractic treatment safe and regulated in the UK?',
        answer: 'Yes. Chiropractic in the UK is a statutory regulated healthcare profession under the Chiropractors Act 1994. All chiropractors at Vance Health are registered with the General Chiropractic Council (GCC).'
      },
      {
        question: 'Do you accept private health insurance (Bupa, AXA, Aviva, Vitality)?',
        answer: 'Yes. We provide official itemized invoices with our GCC registration and provider numbers for reimbursement through major private medical insurers.'
      }
    ]
  },
  {
    path: 'conditions',
    title: `Conditions We Treat | Evidence-Based Protocols | ${CLINIC_NAME}`,
    description: 'Explore targeted chiropractic pathways for acute lower back pain, sciatica, herniated discs, cervical posture strain, and sports injuries in London.',
    ogImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'conditions',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Conditions We Treat', path: 'conditions' }
    ],
    h1: 'Targeted Clinical Care for Lasting Relief',
    h2Subtitle: 'Evidence-Based Pathways for Spine, Nerve & Joint Health',
    bodyContent: [
      'We isolate mechanical joint restrictions, disc impingements, and neuromuscular compensations behind persistent symptoms.',
      'Specialized care protocols for Lumbar Disc Herniation, Sciatica, Upper Cervical Tension, Postural Ergonomics, and Athletic Joint Injuries.',
      'Every plan begins with a complete orthopedic examination, neurological testing, and motion palpation.'
    ]
  },
  {
    path: 'conditions/lower-back-pain',
    title: `Lower Back Pain & Lumbar Disc Care London | ${CLINIC_NAME}`,
    description: 'Evidence-based chiropractic adjustments, spinal mobilization, and lumbar stabilization exercises for lower back pain in Central London.',
    ogImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'condition-detail',
    conditionKey: 'lower-back-pain',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Conditions', path: 'conditions' },
      { name: 'Lower Back Pain', path: 'conditions/lower-back-pain' }
    ],
    reviewer: DEFAULT_REVIEWER,
    lastReviewedDate: '2026-09-25',
    citations: [
      'National Institute for Health and Care Excellence (NICE) Guideline [NG59]: Low back pain and sciatica in over 16s: assessment and management.',
      'Cochrane Database of Systematic Reviews: Spinal manipulative therapy for chronic low-back pain.'
    ],
    h1: 'Lower Back Pain & Lumbar Spine Care',
    h2Subtitle: 'Targeted Restoration of Lumbar Mobility and Disc Health',
    bodyContent: [
      'Lower back pain is frequently driven by lumbar facet joint restriction, discogenic irritation, or deep muscular spasm.',
      'Our clinical protocol combines precise lumbar adjustments, pelvic stabilization, and gentle mechanical decompression to relieve nerve pressure.',
      'Patients typically experience substantial functional restoration and pain reduction within 3 to 5 clinical sessions.'
    ]
  },
  {
    path: 'conditions/sciatica-decompression',
    title: `Sciatica & Disc Decompression Protocol London | ${CLINIC_NAME}`,
    description: 'Non-surgical spinal decompression and nerve root pressure relief for radiating leg pain and lumbar disc bulges in Central London.',
    ogImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'condition-detail',
    conditionKey: 'sciatica-decompression',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Conditions', path: 'conditions' },
      { name: 'Sciatica & Disc Decompression', path: 'conditions/sciatica-decompression' }
    ],
    reviewer: DEFAULT_REVIEWER,
    lastReviewedDate: '2026-09-25',
    citations: [
      'NICE Guideline [NG59]: Non-invasive treatments for low back pain and sciatica.',
      'Journal of Orthopaedic & Sports Physical Therapy: Clinical practice guidelines for lumbar spine disorders.'
    ],
    h1: 'Sciatica & Disc Decompression Care',
    h2Subtitle: 'Relieving Radiating Leg Pain and Lumbar Nerve Root Irritation',
    bodyContent: [
      'Sciatica presents as sharp, radiating, or burning pain traveling through the gluteal region, hamstring, or calf from L4-S1 nerve root irritation.',
      'Our clinic applies precise, motorized axial decompression therapy to create negative intradiscal pressure and promote disc retraction.',
      'Complemented by gentle nerve flossing techniques and progressive core stability rehabilitation.'
    ]
  },
  {
    path: 'conditions/neck-posture-headaches',
    title: `Neck Pain, Posture & Tension Headaches London | ${CLINIC_NAME}`,
    description: 'Upper cervical adjustments and desk-worker postural ergonomics for chronic neck stiffness, tech neck, and cervicogenic headaches in London.',
    ogImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'condition-detail',
    conditionKey: 'neck-posture-headaches',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Conditions', path: 'conditions' },
      { name: 'Neck Pain & Headaches', path: 'conditions/neck-posture-headaches' }
    ],
    reviewer: DEFAULT_REVIEWER,
    lastReviewedDate: '2026-09-25',
    citations: [
      'Cephalalgia: International Classification of Headache Disorders (ICHD-3) - Cervicogenic Headache diagnostic criteria.',
      'The Spine Journal: Efficacy of spinal manipulation for cervicogenic headaches and chronic neck pain.'
    ],
    h1: 'Cervical Spine Care & Headache Relief',
    h2Subtitle: 'Restoring Cervical Curvature & Relieving Tension at the Occiput',
    bodyContent: [
      'Prolonged screen work and forward head translation create severe mechanical leverage on upper cervical vertebrae (C1-C3).',
      'We utilize gentle, high-velocity low-amplitude cervical adjustments and trigger point myofascial therapy to release suboccipital nerve tension.',
      'Includes ergonomic workstation recommendations and home cervical traction exercises.'
    ]
  },
  {
    path: 'conditions/sports-rehab-performance',
    title: `Sports Chiropractic & Athletic Injury Recovery London | ${CLINIC_NAME}`,
    description: 'Sports medicine chiropractic, joint mechanics optimization, and kinetic chain rehab for runners, athletes, and fitness enthusiasts in London.',
    ogImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'condition-detail',
    conditionKey: 'sports-rehab-performance',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Conditions', path: 'conditions' },
      { name: 'Sports Rehabilitation', path: 'conditions/sports-rehab-performance' }
    ],
    reviewer: DEFAULT_REVIEWER,
    lastReviewedDate: '2026-09-25',
    citations: [
      'British Journal of Sports Medicine (BJSM): Rehabilitation protocols for hamstring and lumbar spine athletic injuries.'
    ],
    h1: 'Athletic Performance & Injury Recovery',
    h2Subtitle: 'Biomechanical Optimization for High-Performance Movement',
    bodyContent: [
      'From running gait imbalances to lifting strains, we evaluate functional movement patterns across the entire kinetic chain.',
      'Combines joint manipulation, active release soft-tissue therapy, and progressive loading exercises to accelerate return-to-sport.',
      'Custom pre-habilitation protocols to prevent recurrent joint microtrauma.'
    ]
  },
  {
    path: 'first-visit',
    title: `Your First Visit Guide | What to Expect | ${CLINIC_NAME}`,
    description: 'Step-by-step walkthrough of your initial chiropractic consultation, orthopedic physical exam, diagnostic review, and first adjustment in London.',
    ogImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'first-visit',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'First Visit Guide', path: 'first-visit' }
    ],
    h1: 'What to Expect on Your First Visit',
    h2Subtitle: 'A Transparent, Thorough 45-Minute Diagnostic Consultation',
    bodyContent: [
      'Step 1: Clinical History & Lifestyle Intake — We review your symptoms, onset, and daily physical demands.',
      'Step 2: Orthopedic & Neurological Testing — Reflex testing, dermatome sensation, muscle strength, and range of motion.',
      'Step 3: Diagnosis & First Treatment — If clinically indicated, your first gentle adjustment is provided on day one.'
    ],
    faqs: [
      {
        question: 'What should I wear for my first consultation?',
        answer: 'Wear comfortable, loose-fitting clothing such as gym wear, leggings, or a t-shirt so our clinicians can evaluate your spinal range of motion without restriction.'
      },
      {
        question: 'Will I get an adjustment on my very first visit?',
        answer: 'Yes, in the majority of cases where there are no clinical red flags or contraindications requiring external imaging (MRI/X-ray).'
      },
      {
        question: 'How long does the initial consultation take?',
        answer: 'Your first appointment lasts approximately 45 minutes to ensure an unhurried, exhaustive examination.'
      }
    ]
  },
  {
    path: 'pricing',
    title: `Transparent Fees & Insurance Plans | ${CLINIC_NAME}`,
    description: 'Clear, transparent chiropractic pricing in London. Initial consultation from £49, follow-up adjustments from £65. Private insurance receipts provided.',
    ogImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'pricing',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Pricing & Fees', path: 'pricing' }
    ],
    h1: 'Clear, Honest Chiropractic Fees',
    h2Subtitle: 'No Hidden Charges, No High-Pressure Long-Term Packages',
    bodyContent: [
      'Initial Diagnostic Consultation & Treatment: £49 (Reduced from £95 for new patients).',
      'Standard Follow-up Adjustment & Rehab Session: £65.',
      'Non-Surgical Spinal Decompression Session: £85.',
      'Itemized insurance receipts with GCC registration details provided immediately after each appointment.'
    ],
    faqs: [
      {
        question: 'How much does a chiropractor cost in Central London?',
        answer: 'At Vance Health, an initial 45-minute diagnostic consultation and exam is £49. Subsequent follow-up adjustment sessions are £65.'
      },
      {
        question: 'What is your cancellation and deposit policy?',
        answer: 'We require a 24-hour notice window for free rescheduling or cancellation. Deposits are 100% credited toward your consultation on arrival.'
      }
    ]
  },
  {
    path: 'team',
    title: `Our GCC-Registered Chiropractors & Clinicians | ${CLINIC_NAME}`,
    description: 'Meet Dr. Alistair Vance, Dr. Elena Rostova, and Dr. Marcus Sterling. Master of Chiropractic graduates registered with the General Chiropractic Council (UK).',
    ogImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'team',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Our Team', path: 'team' }
    ],
    h1: 'Our Registered Clinical Team',
    h2Subtitle: 'General Chiropractic Council (GCC) Registered Doctors',
    bodyContent: [
      'Dr. Alistair Vance, MChiro, DC (GCC 04182) — Clinical Director specializing in lumbar disc decompression and complex spinal rehabilitation.',
      'Dr. Elena Rostova, MChiro, DC (GCC 05831) — Specialist in cervical spine biomechanics, postural ergonomics, and cervicogenic headache relief.',
      'Dr. Marcus Sterling, MChiro, DC (GCC 06119) — Sports injury rehabilitation specialist and kinetic chain optimization.'
    ]
  },
  {
    path: 'about',
    title: `About Vance Health | Clinical Philosophy & Standards | London`,
    description: 'Founded on evidence-based musculoskeletal care, patient autonomy, and modern spinal rehabilitation standards in Central London.',
    ogImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'about',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'About the Practice', path: 'about' }
    ],
    h1: 'Evidence-Based Musculoskeletal Care',
    h2Subtitle: 'Root-Cause Spinal Rehabilitation in Central London',
    bodyContent: [
      'We believe in objective testing, personalized treatment pathways, and measurable outcomes.',
      'Our practice is equipped with modern motorized decompression tables, digital posture mapping, and myofascial release modalities.',
      'Located on Central Practice Avenue in London, serving the West End, Fitzrovia, and City professionals.'
    ]
  },
  {
    path: 'contact',
    title: `Contact & Clinic Location London W1 | ${CLINIC_NAME}`,
    description: 'Find Vance Health Practice Architecture at 742 Central Practice Ave, London W1W 7LT. Phone: +44 20 7946 0192. Near Oxford Circus & Goodge Street stations.',
    ogImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'contact',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Contact & Location', path: 'contact' }
    ],
    h1: 'Visit Our Central London Practice',
    h2Subtitle: 'Convenient Transit Access Near Oxford Circus & Tottenham Court Road',
    bodyContent: [
      'Address: 742 Central Practice Ave, Suite 300, London W1W 7LT, United Kingdom.',
      'Telephone: +44 20 7946 0192 | Email: reception@vancehealth.co.uk.',
      'Opening Hours: Monday–Friday 08:00–19:30, Saturday 09:00–16:00.'
    ]
  },
  {
    path: 'portal',
    title: `Patient Portal & Appointment Management | ${CLINIC_NAME}`,
    description: 'Secure patient self-service portal for appointment rescheduling, digital receipt downloads, and treatment itinerary review.',
    ogImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80',
    noIndex: true,
    pageType: 'portal',
    h1: 'Patient Self-Service Portal',
    h2Subtitle: 'Manage Your Appointments, Receipts & Recovery Itinerary',
    bodyContent: [
      'Enter your unique Booking Reference Key provided during scheduling to access your private itinerary.',
      'View upcoming appointments, reschedule within policy windows, or download itemized insurance receipts.'
    ]
  },
  {
    path: 'privacy',
    title: `Privacy Notice & UK GDPR Compliance | ${CLINIC_NAME}`,
    description: 'Comprehensive Privacy Policy under the UK General Data Protection Regulation (UK GDPR), Data Protection Act 2018, and Information Commissioner’s Office (ICO) guidelines.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'legal',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Privacy Notice', path: 'privacy' }
    ],
    h1: 'Privacy Notice & Data Protection Policy',
    h2Subtitle: 'Compliance with UK GDPR, Data Protection Act 2018 & PECR',
    bodyContent: [
      'We process patient health data under UK GDPR Article 6(1)(b) (Contract) and Article 9(2)(h) (Provision of Healthcare).',
      'Clinical records are securely maintained in compliance with the General Chiropractic Council (GCC) retention guidelines (minimum 8 years for adults).',
      'Registered with the Information Commissioner’s Office (ICO). Data Protection Officer: dpo@vancehealth.co.uk.'
    ]
  },
  {
    path: 'terms',
    title: `Terms of Service & Cancellation Policy | ${CLINIC_NAME}`,
    description: 'Clinical consultation agreements, payment terms, and 24-hour appointment cancellation policies for Vance Health.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    pageType: 'legal',
    breadcrumbs: [
      { name: 'Home', path: '' },
      { name: 'Terms of Service', path: 'terms' }
    ],
    h1: 'Terms of Service & Practice Policies',
    h2Subtitle: 'Clear, Fair Guidelines for Consultations and Care Plans',
    bodyContent: [
      'Appointments may be cancelled or rescheduled without charge up to 24 hours prior to the scheduled time.',
      'Consultation deposits are fully credited toward your first visit on arrival.',
      'All care is delivered in accordance with General Chiropractic Council professional code of practice.'
    ]
  }
];

/**
 * Builds the comprehensive Schema.org JSON-LD Graph for a specific route.
 * Emits ONE single primary MedicalClinic entity and references it everywhere via @id.
 */
function buildSchemaGraph(route: RouteMetadata): string {
  const fullCanonicalUrl = route.path ? `${BASE_URL}/${route.path}/` : `${BASE_URL}/`;

  // 1. Primary Clinic Entity
  const clinicEntity: any = {
    '@type': 'MedicalClinic',
    '@id': PRIMARY_CLINIC_ID,
    name: CLINIC_NAME,
    url: `${BASE_URL}/`,
    logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&h=400&q=80',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=80',
    description: 'Evidence-based chiropractic clinic specializing in lumbar decompression, cervical posture rehabilitation, and sports medicine.',
    telephone: CLINIC_PHONE,
    email: CLINIC_EMAIL,
    priceRange: '££',
    medicalSpecialty: ['Chiropractic', 'MusculoskeletalMedicine', 'SportsMedicine'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC_ADDRESS_STREET,
      addressLocality: CLINIC_LOCALITY,
      postalCode: CLINIC_POSTAL,
      addressCountry: CLINIC_COUNTRY,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.5173,
      longitude: -0.1415,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '16:00',
      },
    ],
  };

  // 2. Physicians Entities
  const physicians: any[] = [
    {
      '@type': 'Physician',
      '@id': DR_VANCE_ID,
      name: 'Dr. Alistair Vance, MChiro, DC',
      jobTitle: 'Clinical Director & Doctor of Chiropractic',
      description: 'Master of Chiropractic specialist in non-surgical lumbar disc decompression and spinal rehabilitation.',
      medicalSpecialty: 'Chiropractic',
      alumniOf: 'Anglo-European College of Chiropractic (AECC)',
      identifier: 'GCC 04182',
      worksFor: { '@id': PRIMARY_CLINIC_ID },
    },
    {
      '@type': 'Physician',
      '@id': DR_ROSTOVA_ID,
      name: 'Dr. Elena Rostova, MChiro, DC',
      jobTitle: 'Senior Chiropractic Physician',
      description: 'Cervical spine biomechanics, postural ergonomics, and cervicogenic headache specialist.',
      medicalSpecialty: 'Chiropractic',
      identifier: 'GCC 05831',
      worksFor: { '@id': PRIMARY_CLINIC_ID },
    },
    {
      '@type': 'Physician',
      '@id': DR_STERLING_ID,
      name: 'Dr. Marcus Sterling, MChiro, DC',
      jobTitle: 'Sports Chiropractic & Kinetic Rehab Specialist',
      description: 'Athletic injury rehabilitation and sports joint mechanics optimization.',
      medicalSpecialty: 'SportsMedicine',
      identifier: 'GCC 06119',
      worksFor: { '@id': PRIMARY_CLINIC_ID },
    },
  ];

  // 3. Medical Procedures
  const procedures: any[] = [
    {
      '@type': 'MedicalProcedure',
      '@id': `${BASE_URL}/#procedure-decompression`,
      name: 'Non-Surgical Spinal Decompression Therapy',
      procedureType: 'NonSurgicalProcedure',
      bodyLocation: 'Lumbar Spine',
      description: 'Computer-directed axial spinal distraction for lumbar disc herniation and sciatic nerve decompression.',
    },
    {
      '@type': 'MedicalProcedure',
      '@id': `${BASE_URL}/#procedure-manipulation`,
      name: 'Chiropractic Spinal Manipulation & Mobilization',
      procedureType: 'NonSurgicalProcedure',
      bodyLocation: 'Spine & Peripheral Joints',
      description: 'High-velocity low-amplitude manual joint mobilization to restore facet articulation.',
    },
  ];

  const graph: any[] = [clinicEntity, ...physicians, ...procedures];

  // 4. Route-Specific WebPage or MedicalCondition
  if (route.pageType === 'condition-detail') {
    graph.push({
      '@type': 'MedicalCondition',
      '@id': `${fullCanonicalUrl}#condition`,
      name: route.h1,
      description: route.description,
      associatedAnatomy: {
        '@type': 'AnatomicalStructure',
        name: 'Spine & Vertebral Column',
      },
      reviewedBy: { '@id': DR_VANCE_ID },
      lastReviewed: route.lastReviewedDate || '2026-09-25',
      citation: route.citations || [
        'NICE Guideline [NG59]: Low back pain and sciatica in over 16s: assessment and management.',
      ],
      mainEntityOfPage: fullCanonicalUrl,
    });
  }

  // 5. BreadcrumbList Schema
  if (route.breadcrumbs && route.breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${fullCanonicalUrl}#breadcrumbs`,
      itemListElement: route.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.path ? `${BASE_URL}/${b.path}/` : `${BASE_URL}/`,
      })),
    });
  }

  // 6. FAQPage Schema
  if (route.faqs && route.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${fullCanonicalUrl}#faqs`,
      mainEntity: route.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/**
 * Builds the real semantic HTML markup to be placed directly inside <div id="root">
 * This satisfies Wave-1 search indexing AND paints immediately for human users before JS parses.
 * React 19 hydrates this via hydrateRoot without clearing the container.
 */
function buildPreRenderedDOM(route: RouteMetadata): string {
  const fullCanonicalUrl = route.path ? `${BASE_URL}/${route.path}/` : `${BASE_URL}/`;

  return `
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      <!-- Prerendered Semantic Navigation Header -->
      <header class="border-b border-stone-200 bg-stone-50/95 sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center font-serif text-xl font-bold">V</div>
            <div>
              <span class="font-serif font-bold text-base sm:text-lg block leading-tight text-stone-900">${CLINIC_NAME}</span>
              <span class="text-xs text-stone-500 uppercase tracking-wider font-medium">London, UK • GCC Registered</span>
            </div>
          </a>
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a href="/" class="hover:text-stone-900">Home</a>
            <a href="/conditions/" class="hover:text-stone-900">Conditions</a>
            <a href="/first-visit/" class="hover:text-stone-900">First Visit</a>
            <a href="/pricing/" class="hover:text-stone-900">Pricing</a>
            <a href="/team/" class="hover:text-stone-900">Team</a>
            <a href="/about/" class="hover:text-stone-900">About</a>
            <a href="/contact/" class="hover:text-stone-900">Contact</a>
            <a href="/portal/" class="text-emerald-800 font-semibold">Patient Portal</a>
          </nav>
        </div>
      </header>

      <!-- Main Semantic Page Body -->
      <main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <!-- Breadcrumbs -->
        ${
          route.breadcrumbs
            ? `
          <nav aria-label="Breadcrumbs" class="text-xs text-stone-500 flex items-center gap-2">
            ${route.breadcrumbs
              .map((b, i) =>
                i === route.breadcrumbs!.length - 1
                  ? `<span class="font-semibold text-stone-900">${b.name}</span>`
                  : `<a href="${b.path ? `/${b.path}/` : '/'}" class="hover:underline text-stone-600">${b.name}</a> <span>/</span>`
              )
              .join(' ')}
          </nav>
        `
            : ''
        }

        <!-- Page Header -->
        <div class="space-y-3">
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">${route.h2Subtitle}</p>
          <h1 class="text-3xl sm:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-tight">${route.h1}</h1>
          ${
            route.reviewer
              ? `
            <div class="pt-2 flex flex-wrap items-center gap-3 text-xs text-stone-600 border-t border-stone-200 mt-3">
              <span class="font-semibold text-emerald-950">✓ Medically Reviewed by:</span>
              <a href="/team/" class="font-bold text-stone-900 underline">${route.reviewer.name}</a>
              <span class="text-stone-400">•</span>
              <span>${route.reviewer.regBody} (${route.reviewer.regNumber})</span>
              <span class="text-stone-400">•</span>
              <span>Last Reviewed: <time datetime="${route.lastReviewedDate}">${route.lastReviewedDate}</time></span>
            </div>
          `
              : ''
          }
        </div>

        <!-- Clinical Narrative Paragraphs -->
        <article class="prose prose-stone max-w-none text-base sm:text-lg text-stone-700 leading-relaxed space-y-4">
          ${route.bodyContent.map((p) => `<p>${p}</p>`).join('')}
        </article>

        <!-- Peer-Reviewed Citations / E-E-A-T Evidence Section -->
        ${
          route.citations && route.citations.length > 0
            ? `
          <div class="p-5 rounded-2xl bg-stone-100 border border-stone-200 text-xs space-y-2">
            <h3 class="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Clinical Sources & Guidelines:</h3>
            <ul class="list-disc pl-5 space-y-1 text-stone-600">
              ${route.citations.map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        `
            : ''
        }

        <!-- Route FAQs Section if Present -->
        ${
          route.faqs && route.faqs.length > 0
            ? `
          <section class="mt-8 pt-8 border-t border-stone-200 space-y-4">
            <h2 class="text-xl font-serif font-bold text-stone-950">Frequently Asked Questions</h2>
            <div class="space-y-3">
              ${route.faqs
                .map(
                  (f) => `
                <div class="p-4 rounded-xl bg-white border border-stone-200">
                  <h3 class="font-bold text-sm text-stone-900 mb-1">${f.question}</h3>
                  <p class="text-xs text-stone-600 leading-relaxed">${f.answer}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </section>
        `
            : ''
        }

        <!-- Consultation & Online Booking Callout -->
        <div class="mt-10 p-6 sm:p-8 rounded-2xl bg-emerald-900 text-stone-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div class="space-y-1">
            <h3 class="text-xl font-bold font-serif">Reserve Your Consultation</h3>
            <p class="text-xs sm:text-sm text-emerald-100">Direct booking with GCC-registered doctors in Central London.</p>
            <p class="text-xs text-emerald-200 mt-1">Telephone: ${CLINIC_PHONE} • ${CLINIC_ADDRESS_STREET}, ${CLINIC_LOCALITY} ${CLINIC_POSTAL}</p>
          </div>
          <a href="/first-visit/" class="px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition shrink-0 shadow-md">
            View First Visit Guide
          </a>
        </div>
      </main>

      <!-- Semantic Footer -->
      <footer class="border-t border-stone-200 bg-stone-900 text-stone-300 py-8 mt-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© ${new Date().getFullYear()} ${CLINIC_NAME}. Regulated by the General Chiropractic Council (UK).</p>
          <div class="flex items-center gap-4">
            <a href="/privacy/" class="hover:text-white">UK GDPR & Privacy</a>
            <a href="/terms/" class="hover:text-white">Terms of Care</a>
            <a href="/portal/" class="hover:text-white">Patient Portal</a>
          </div>
        </div>
      </footer>
    </div>
  `.trim();
}

export async function prerenderAllRoutes() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');
  console.log(`\n🚀 Starting Multi-Route Prerenderer (Real #root Markup + JSON-LD Graph) for ${ROUTES.length} routes...\n`);

  for (const route of ROUTES) {
    const fullCanonicalUrl = route.path ? `${BASE_URL}/${route.path}/` : `${BASE_URL}/`;
    let html = rawTemplate;

    // 1. Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // 2. Meta Description
    html = html.replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );

    // 3. Robots Directives
    if (route.noIndex) {
      if (html.includes('name="robots"')) {
        html = html.replace(/<meta\s+name=["']robots["']\s+content=["'].*?["']\s*\/?>/i, '<meta name="robots" content="noindex, nofollow" />');
      } else {
        html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');
      }
    } else {
      if (html.includes('name="robots"')) {
        html = html.replace(/<meta\s+name=["']robots["']\s+content=["'].*?["']\s*\/?>/i, '<meta name="robots" content="index, follow" />');
      }
    }

    // 4. Trailing-Slash Canonical Link
    if (html.includes('rel="canonical"')) {
      html = html.replace(
        /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
        `<link rel="canonical" href="${fullCanonicalUrl}" />`
      );
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${fullCanonicalUrl}" />\n</head>`);
    }

    // 5. OpenGraph & Twitter Meta Tags
    html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${fullCanonicalUrl}" />`);
    html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${route.ogImage}" />`);

    html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />`);
    html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${route.ogImage}" />`);

    // 6. Inject Unified Schema.org Graph
    const schemaJson = buildSchemaGraph(route);
    const schemaScriptTag = `<script type="application/ld+json">\n${schemaJson}\n</script>`;
    if (html.includes('application/ld+json')) {
      html = html.replace(/<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, schemaScriptTag);
    } else {
      html = html.replace('</head>', `  ${schemaScriptTag}\n</head>`);
    }

    // 7. Inject REAL pre-rendered markup into <div id="root">
    const preRenderedContent = buildPreRenderedDOM(route);
    html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${preRenderedContent}</div>`);

    // 8. Write to Physical Route Directory
    const targetDir = route.path ? path.join(distDir, route.path) : distDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf-8');

    console.log(`  ✓ Generated: /${route.path ? route.path + '/' : ''} (Saved: ${path.relative(distDir, targetFile)})`);
  }

  // 9. Generate XML Sitemap
  generateSitemap(distDir);

  // 10. Generate Robots.txt
  generateRobots(distDir);

  // 11. Generate Unified Server Configs
  generateServerConfigs(distDir);

  console.log(`\n🎉 Prerendering complete! Real #root markup, hydrateRoot compatibility, Schema graph, and unified host rewrites generated successfully.\n`);
}

function generateSitemap(distDir: string) {
  const today = new Date().toISOString().split('T')[0];
  const indexableRoutes = ROUTES.filter((r) => !r.noIndex);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexableRoutes
  .map((r) => {
    const loc = r.path ? `${BASE_URL}/${r.path}/` : `${BASE_URL}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
  })
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml.trim(), 'utf-8');
  console.log(`  ✓ Generated: sitemap.xml with lastmod dates`);
}

function generateRobots(distDir: string) {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /portal

Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt.trim(), 'utf-8');
  console.log(`  ✓ Generated: robots.txt with Disallow: /portal/`);
}

function generateServerConfigs(distDir: string) {
  // 1. Netlify / Cloudflare Pages _redirects
  const redirects = `# Single Source of Truth: Netlify & Cloudflare Pages Rewrite
/* /index.html 200
`;
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects.trim(), 'utf-8');

  // 2. Vercel vercel.json with EXPLICIT trailingSlash: true
  const vercelJson = JSON.stringify(
    {
      trailingSlash: true,
      cleanUrls: true,
      headers: [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
      ],
      rewrites: [
        {
          source: '/(.*)',
          destination: '/$1',
        },
      ],
    },
    null,
    2
  );
  fs.writeFileSync(path.join(distDir, 'vercel.json'), vercelJson, 'utf-8');

  // 3. Apache / cPanel .htaccess with trailing-slash directory enforcement
  const htaccess = `# Single Source of Truth: Apache / cPanel Rewrite Rules
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
  fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess.trim(), 'utf-8');

  console.log(`  ✓ Generated: vercel.json (trailingSlash: true), .htaccess, and _redirects from single source of truth`);
}

prerenderAllRoutes().catch((err) => {
  console.error('Fatal Prerendering Error:', err);
  process.exit(1);
});
