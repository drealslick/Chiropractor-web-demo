import { PublicTeamMember, SupportStaffMember } from '../types';
const doctorImg = '/images/doctor_portrait.jpg';

export const defaultPublicTeamMembers: PublicTeamMember[] = [
  {
    id: 'team-1',
    slug: 'dr-marcus-reed',
    name: 'Dr. Marcus Reed',
    credentials: 'D.C., CCSP, MSc (Sports Biomechanics)',
    role: 'Lead Chiropractic Physician & Practice Director',
    photoUrl: doctorImg,
    photoAlt: 'Dr. Marcus Reed Lead Chiropractic Physician portrait',
    shortSummary: 'Specializing in complex lumbar spine kinematics, intervertebral disc decompression, and restorative rehabilitation.',
    quote: 'I built this practice because patients deserve unhurried, root-cause diagnosis rather than fifteen-minute symptom band-aids.',
    education: 'Doctor of Chiropractic (AECC University College), MSc Sports & Exercise Biomechanics',
    registrationNumber: 'State Reg #OH-04821',
    email: 'dr.reed@columbuschiropractic.com',
    phone: '+44 20 7946 0912',
    showOnWebsite: true,
    order: 1,
    areasOfFocus: [
      'Complex Lumbar Disc Decompression',
      'Spinal Biomechanics & Kinematics',
      'Sports Injury & Kinetic Chain Rehab',
      'Sciatica & Nerve Entrapment Protocols',
      'Post-Surgical Movement Restoration'
    ],
    assignedConditionSlugs: [
      'lower-back-pain',
      'lower-back-sciatica',
      'sports-injuries',
      'neck-pain',
      'neck-shoulder-pain'
    ],
    bioBlocks: [
      {
        id: 'block_vance_1',
        type: 'paragraph',
        content: 'With over 12 years of specialized clinical experience, Dr. Marcus Reed leads our clinical team with a relentless commitment to evidence-based biomechanics. Having worked extensively with endurance athletes, post-surgical spine patients, and desk-bound executives suffering from repetitive strain, he advocates for precision diagnosis before any intervention begins.'
      },
      {
        id: 'block_vance_2',
        type: 'quote',
        quoteText: 'Pain is rarely an isolated event. When we restore proper joint motion and decompress irritated nerve roots, the body\'s natural resilience takes over.',
        quoteAuthor: 'Dr. Marcus Reed, D.C.'
      },
      {
        id: 'block_vance_3',
        type: 'heading',
        level: 'h2',
        headingText: 'Clinical Philosophy & Diagnostic Standard'
      },
      {
        id: 'block_vance_4',
        type: 'paragraph',
        content: 'Dr. Reed completed his postgraduate Master of Science in Sports Biomechanics, with research focused on lumbar flexion-distraction loading and asymmetrical SI joint mechanics. Every patient consultation begins with a 45-minute comprehensive orthopedic and neurological evaluation, ensuring that individual anatomical nuances guide every adjustment.'
      },
      {
        id: 'block_vance_5',
        type: 'callout',
        calloutVariant: 'takeaway',
        calloutTitle: 'Dr. Reed\'s 3-Rule Practice Commitment',
        calloutText: '1. No high-pressure long-term packages. 2. Clear diagnostic clarity on your first visit. 3. Active rehabilitation drills tailored to keep you independent of clinic visits.'
      }
    ]
  },
  {
    id: 'team-2',
    slug: 'dr-elena-rostova',
    name: 'Dr. Elena Rostova',
    credentials: 'D.C., B.Sc. (Hons) Chiro, CACCP',
    role: 'Senior Associate Chiropractor & Cervical Spine Lead',
    photoUrl: '/images/doctor_portrait.jpg',
    photoAlt: 'Dr. Elena Rostova Senior Associate Chiropractor portrait',
    shortSummary: 'Specializing in cervical motion restoration, tension headaches, vertigo relief, and perinatal chiropractic care.',
    quote: 'Restoring cervical alignment transforms not just physical neck mobility, but cognitive clarity and daily energy.',
    education: 'Doctor of Chiropractic (WIOC), Postgrad Perinatal & Pediatric Certification (CACCP)',
    registrationNumber: 'State Reg #OH-06194',
    email: 'dr.rostova@columbuschiropractic.com',
    showOnWebsite: true,
    order: 2,
    areasOfFocus: [
      'Cervicogenic Headache & Migraine Care',
      'Cervical Spine Motion & Whiplash Recovery',
      'Desk Posture & Thoracic Kyphosis',
      'Gentle Mobilization & Activator Methods',
      'Perinatal & Postpartum Pelvic Balancing'
    ],
    assignedConditionSlugs: [
      'neck-pain',
      'neck-shoulder-pain',
      'headaches',
      'headaches-migraines',
      'postural-strain',
      'posture-ergonomics'
    ],
    bioBlocks: [
      {
        id: 'block_rostova_1',
        type: 'paragraph',
        content: 'Dr. Elena Rostova brings a uniquely gentle, highly analytical perspective to upper cervical spine mechanics and posture-related neurological strain. Her clinical focus centers on relieving cervicogenic headaches, chronic jaw clenching (TMJ), and the severe neck stiffness typical of modern screen-intensive occupations.'
      },
      {
        id: 'block_rostova_2',
        type: 'callout',
        calloutVariant: 'tip',
        calloutTitle: 'Focus: Upper Cervical & Vagus Nerve Regulation',
        calloutText: 'Suboccipital joint restrictions can restrict blood flow and irritate the upper cervical nerve roots. Relieving this compression produces immediate relief from forehead throbbing and ocular fatigue.'
      },
      {
        id: 'block_rostova_3',
        type: 'paragraph',
        content: 'In addition to her spine focus, Dr. Rostova is certified in Webster Technique for pelvic balance during pregnancy, helping expectant mothers experience comfortable biomechanical adaptation throughout each trimester.'
      }
    ]
  },
  {
    id: 'team-3',
    slug: 'dr-marcus-sterling',
    name: 'Dr. Marcus Sterling',
    credentials: 'M.Chiro, CSCS, ART Certified',
    role: 'Sports Chiropractor & Functional Rehab Specialist',
    photoUrl: '/images/doctor_portrait.jpg',
    photoAlt: 'Dr. Marcus Sterling Sports Chiropractor portrait',
    shortSummary: 'Specializing in athletic performance kinematics, running gait correction, and kinetic chain extremity adjusting.',
    quote: 'Our goal isn\'t just to get you out of pain—it\'s to make your musculoskeletal system more robust than it was before.',
    education: 'Master of Chiropractic (Bournemouth University), Certified Strength & Conditioning Specialist (NSCA)',
    registrationNumber: 'State Reg #OH-07382',
    email: 'dr.sterling@columbuschiropractic.com',
    showOnWebsite: true,
    order: 3,
    areasOfFocus: [
      'Sports Biomechanics & Return-to-Play',
      'Rotator Cuff & Shoulder Impingement',
      'Running Gait & Foot-Ankle Mechanics',
      'Active Release Technique (ART)',
      'Spinal Stability Under Athletic Load'
    ],
    assignedConditionSlugs: [
      'sports-injuries',
      'lower-back-pain',
      'lower-back-sciatica',
      'postural-strain'
    ],
    bioBlocks: [
      {
        id: 'block_sterling_1',
        type: 'paragraph',
        content: 'Dr. Marcus Sterling bridges the gap between acute chiropractic adjustments and elite athletic performance. As a former university rugby player and competitive triathlete, Dr. Sterling understands that an injured shoulder or restricted hip flexor ripples through the entire kinetic chain.'
      },
      {
        id: 'block_sterling_2',
        type: 'quote',
        quoteText: 'True sports rehabilitation is never passive. We adjust the restricted joint, release scarred myofascial adhesions, and immediately reload the movement pattern with functional motor control.',
        quoteAuthor: 'Dr. Marcus Sterling, M.Chiro'
      },
      {
        id: 'block_sterling_3',
        type: 'paragraph',
        content: 'Dr. Sterling utilizes dynamic motion capture and electromyography insights to detect subtle compensations in runners, CrossFit athletes, and weekend golfers before small micro-tears turn into debilitating injuries.'
      }
    ]
  }
];

export const defaultSupportStaff: SupportStaffMember[] = [
  {
    id: 'staff-1',
    name: 'Sarah Jenkins',
    role: 'Practice Director & Patient Concierge',
    photoUrl: '/images/doctor_portrait.jpg',
    bio: 'Sarah oversees patient intake, insurance pre-authorizations, and ensures your first visit is completely seamless, unhurried, and welcoming.'
  },
  {
    id: 'staff-2',
    name: 'David Chen',
    role: 'Clinic Operations & Digital Records',
    photoUrl: '/images/doctor_portrait.jpg',
    bio: 'David coordinates diagnostic referrals, digital imaging uploads, and ensures seamless communication with your general practitioner.'
  },
  {
    id: 'staff-3',
    name: 'Maya Patel',
    role: 'Patient Care & Rehabilitation Assistant',
    photoUrl: '/images/doctor_portrait.jpg',
    bio: 'Maya walks patients through their customized home movement exercises, ensuring safe execution and progressive functional recovery.'
  }
];
