import { AboutPhilosophyPillar, AboutGalleryImage, AboutAssociation } from '../types';
import { doctorImg, clinicRoomImg, heroImg, michaelImg } from './clinicData';

export const defaultPhilosophyPillars: AboutPhilosophyPillar[] = [
  {
    id: 'phil-1',
    icon: 'search',
    title: 'Diagnostic Rigor First',
    description:
      'We do not perform adjustments on what we have not thoroughly examined. Every treatment plan begins with orthopedic testing, neurological reflexes, and motion palpation to isolate the exact mechanical fault.',
  },
  {
    id: 'phil-2',
    icon: 'heart',
    title: 'Unhurried 1-on-1 Focus',
    description:
      'No multi-bed open bays or five-minute assembly-line cracks. You receive 30 to 45 minutes of dedicated one-on-one clinician time in a private suite every single appointment.',
  },
  {
    id: 'phil-3',
    icon: 'shield',
    title: 'Zero Pressure or Contracts',
    description:
      'No mandatory 40-visit upfront packages or scare tactics. We outline a transparent 3-phase roadmap with measurable recovery milestones, discharging you to active life as soon as your spine stabilizes.',
  },
  {
    id: 'phil-4',
    icon: 'activity',
    title: 'Active Mobility & Autonomy',
    description:
      'Lasting healing happens outside our clinic walls. We equip you with personalized decompression drills, postural habits, and load management so you never become dependent on weekly clinic visits.',
  },
];

export const defaultAboutGallery: AboutGalleryImage[] = [
  {
    id: 'gal-1',
    url: clinicRoomImg,
    caption: 'Private Treatment Suite: Precision motorized drop table, natural daylight, and acoustic privacy.',
    alt: 'Private chiropractic treatment room',
    tag: 'Treatment Suite',
  },
  {
    id: 'gal-2',
    url: heroImg,
    caption: 'Gentle Biomechanical Care: Dr. Vance conducting targeted kinetic movement screening and joint mobilization.',
    alt: 'Clinician examining patient spine and shoulder',
    tag: 'Clinical Care',
  },
  {
    id: 'gal-3',
    url: michaelImg,
    caption: 'Active Rehabilitation Lab: Functional kinetic chain loading and return-to-sport athletic conditioning.',
    alt: 'Patient active movement recovery and rehab',
    tag: 'Rehabilitation',
  },
];

export const defaultAboutAssociations: AboutAssociation[] = [
  {
    id: 'assoc-1',
    name: 'General Chiropractic Council',
    abbreviation: 'GCC Registered',
    role: 'UK Statutory Healthcare Regulatory Body (Reg #04821)',
    verified: true,
  },
  {
    id: 'assoc-2',
    name: 'British Chiropractic Association',
    abbreviation: 'BCA Full Member',
    role: 'Peak Professional Clinical Association',
    verified: true,
  },
  {
    id: 'assoc-3',
    name: 'Royal College of Chiropractors',
    abbreviation: 'FRCC (Sports)',
    role: 'Fellow of the Sports Faculty Specialist Panel',
    verified: true,
  },
  {
    id: 'assoc-4',
    name: 'International Federation of Sports Chiropractic',
    abbreviation: 'FICS Certified',
    role: 'International Olympic & Elite Athletics Care',
    verified: true,
  },
];

export const defaultAboutJourney = {
  subtitle: 'Our Founding Story',
  title: 'The Journey Behind Vance Health',
  paragraph1:
    'When I completed my clinical doctorate in chiropractic and biomechanics over twelve years ago, I entered a private healthcare environment that felt increasingly industrialized. Patients were being ushered through crowded waiting rooms, given hurried three-minute adjustments, and pressured into rigid 40-visit prepaid schemes before anyone had even listened to their full story.',
  paragraph2:
    'I believed that private musculoskeletal medicine could—and should—be practiced with the calm precision of an architectural design studio. In 2018, I established Vance Health Practice Architecture to prove that high-performance, evidence-based care thrives when clinicians take the time to look at the entire kinetic chain rather than chasing isolated symptoms.',
  paragraph3:
    'Today, our practice remains unapologetically boutique, private, and independent. We strictly limit our daily patient caseload so we can listen without a ticking timer, explain diagnostic imaging with crystal clarity, and treat each person who walks through our doors with the dignity and undivided attention they deserve.',
  quote:
    'I built this practice because I was tired of seeing injured people treated like numbers on an assembly line. True healing requires patience, precision, and genuine listening.',
};
