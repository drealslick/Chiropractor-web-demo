import heroImg from '../assets/images/clinic_hero_care_1789573961612.jpg';
import doctorImg from '../assets/images/doctor_portrait_1789573972470.jpg';
import clinicRoomImg from '../assets/images/clinic_interior_room_1789573983752.jpg';
import michaelImg from '../assets/images/patient_michael_tennis_1789573994707.jpg';

import { ClinicInfo, ProblemCondition, ProcessStep, PatientTestimonial, FeaturedStory, FAQItem, HeroTriageOption } from '../types';

export const defaultTriageOptions: HeroTriageOption[] = [
  {
    id: 'back',
    label: 'Lower Back & Sciatica',
    shortLabel: 'Lower Back',
    summary: 'Lumbar facet restriction or disc decompression protocol.',
    typicalVisits: '3–5 visits to lasting relief',
    focus: 'Decompression & Spinal Alignment',
  },
  {
    id: 'neck',
    label: 'Neck & Desk Strain',
    shortLabel: 'Neck & Desk',
    summary: 'Cervical alignment, thoracic mobilization & ergonomic posture rehab.',
    typicalVisits: '2–4 visits to full range',
    focus: 'Cervical & Postural Correction',
  },
  {
    id: 'headache',
    label: 'Headaches & Migraines',
    shortLabel: 'Headaches',
    summary: 'Suboccipital tension release and upper cervical nerve pathway care.',
    typicalVisits: 'Rapid relief in 1–3 visits',
    focus: 'Cervicogenic Tension Release',
  },
  {
    id: 'sports',
    label: 'Athletic & Joint Injury',
    shortLabel: 'Athletic Rehab',
    summary: 'Functional biomechanics, extremity adjusting & kinetic chain rehab.',
    typicalVisits: 'Custom return-to-sport arc',
    focus: 'Sports Recovery & Performance',
  },
];

export const defaultClinic: ClinicInfo = {
  name: "Vance Health Practice Architecture",
  tagline: "Advanced private healthcare and chiropractic excellence, tailored to your active life.",
  city: "London / EU Central",
  state: "UK & Europe",
  cityState: "London, UK / EU Central",
  address: "742 Central Practice Ave",
  zip: "W1U 8ED",
  phone: "+44 20 7946 0912",
  phoneRaw: "442079460912",
  hoursWeekday: "Mon–Fri: 8:30am–6:30pm",
  hoursSaturday: "Sat: 9:00am–2:00pm",
  parkingNote: "Valet & dedicated client parking behind the facility.",
  doctorName: "Dr. Alistair Vance",
  doctorCredentials: "D.C., CCSP, MSc",
  doctorYears: "15",
  doctorQuote: "My vision for Vance Health is simple: deliver precise, root-cause care without guesswork, so our clients regain total freedom of movement.",
  doctorImage: doctorImg,
  heroImage: heroImg,
  clinicImage: clinicRoomImg,
  patientImage: michaelImg,
  offerHeadline: "New Patients: €49 Initial Exam & Diagnostic Review",
  offerSubtext: "Limited priority consultations available weekly.",
  offerCtaText: "CLAIM CONSULTATION →",
  colorPalette: "soft-ivory-forest",
  showStickyBanner: true,
  bookingType: 'modal',
  paymentModel: 'insurance_and_cash',
  googleRating: 4.9,
  googleReviewsCount: 127,
};

export const alternativeOffers = [
  {
    headline: "New Patients: €49 Initial Exam & Diagnostic Review",
    subtext: "Limited priority consultations available weekly.",
    cta: "CLAIM CONSULTATION →"
  },
  {
    headline: "Complimentary 15-Minute Phone Consultation",
    subtext: "Discuss your symptoms directly with the lead specialist before booking.",
    cta: "SCHEDULE CALL →"
  },
  {
    headline: "New Patient Special: €59 Exam, Imaging & Adjustment",
    subtext: "Comprehensive spinal assessment for new patients.",
    cta: "CLAIM SPECIAL →"
  }
];

export const conditionsData: ProblemCondition[] = [
  {
    id: "back-pain",
    title: "Back & Lower Back Pain",
    description: "Personalized care designed around your symptoms, movement, and goals.",
    symptoms: ["Sciatica & radiating leg pain", "Lumbar disc decompression", "Postural spasm & acute flare-ups"],
    approach: "Gentle spinal adjustments, targeted decompression, and core stabilization routines to unload disc pressure and restore lumbar flexibility."
  },
  {
    id: "neck-pain",
    title: "Neck & Shoulder Pain",
    description: "Address discomfort and movement limitations affecting your everyday life.",
    symptoms: ["Desk posture & tech-neck stiffness", "Cervical facet joint restriction", "Trapezius muscle tightness"],
    approach: "Precise cervical mobilization, soft tissue release, and ergonomic guidance to eliminate nerve impingement and ease chronic tension."
  },
  {
    id: "sports-activity",
    title: "Sports & Activity",
    description: "Support for active patients looking to move, perform, and recover.",
    symptoms: ["Joint impingement & biomechanical imbalance", "Runner's knee & hip tightness", "Rotator cuff rehabilitation"],
    approach: "Functional movement screening, joint manipulation, and dynamic rehab exercises to return you to training safely."
  },
  {
    id: "mobility-stiffness",
    title: "Mobility & Stiffness",
    description: "Restore range of motion so daily movement stops feeling like a negotiation.",
    symptoms: ["Morning spinal rigidity", "Limited torso rotation", "Hip & pelvic misalignment"],
    approach: "Passive and active spinal traction, myofascial release, and mobility protocols to keep your joints moving freely every day."
  },
  {
    id: "headaches-tension",
    title: "Headaches & Tension",
    description: "Find the root cause, not just temporary relief.",
    symptoms: ["Cervicogenic headaches", "Tension headaches from desk work", "Upper cervical subluxation"],
    approach: "Pinpoint upper neck misalignments that cause referral pain patterns, combining gentle manipulation with postural retraining."
  }
];

export const whyUsFeatures = [
  {
    title: "Personalized Care",
    description: "No cookie-cutter treatment plans. Every plan starts with your body, your history, your goals."
  },
  {
    title: "Evidence-Informed",
    description: "Treatment decisions based on assessment and individual needs — not guesswork."
  },
  {
    title: "Long-Term Results",
    description: "The goal isn't getting you off the table today. It's keeping you off it."
  }
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Assessment",
    description: "We listen, examine, and find the root cause."
  },
  {
    number: "02",
    title: "Treatment",
    description: "A plan built for your body. Not a template."
  },
  {
    number: "03",
    title: "Recovery",
    description: "Targeted care to get you moving without pain."
  },
  {
    number: "04",
    title: "Progress",
    description: "We track results and adjust as you improve."
  }
];

export const firstVisitSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Consultation",
    description: "We talk about your pain, history, and goals."
  },
  {
    number: "02",
    title: "Assessment",
    description: "Full exam to understand what's actually going on."
  },
  {
    number: "03",
    title: "Treatment Plan",
    description: "You leave knowing exactly what happens next, how long it takes, and what it costs."
  }
];

export const testimonials: PatientTestimonial[] = [
  {
    quote: "I walked in barely able to turn my neck. Three weeks later, I'm back at the gym.",
    author: "Elena R.",
    rating: 5,
    condition: "Neck & Shoulder"
  },
  {
    quote: "First clinician who actually explained what was happening and why.",
    author: "David K.",
    rating: 5,
    condition: "Postural Tension"
  },
  {
    quote: "After years of lower back pain, I finally feel like myself again.",
    author: "Sarah M.",
    rating: 5,
    condition: "Lower Back Pain"
  }
];

export const featuredStory: FeaturedStory = {
  patientName: "Michael",
  image: michaelImg,
  summary: "Michael came in after months of recurring lower-back pain. He'd tried rest, painkillers, and a rushed 15-minute routine elsewhere.",
  timeline: "We started with a full assessment, built a 12-week plan, and tracked progress every visit.",
  outcome: "By week 8, he was back on the tennis court."
};

export const faqs: FAQItem[] = [
  {
    question: "How long does a first visit take?",
    answer: "Your initial appointment takes about 45 to 60 minutes. This gives us time for a thorough health history, functional examination, diagnostic assessment, and if appropriate, your initial gentle treatment."
  },
  {
    question: "What should I wear?",
    answer: "Wear comfortable, flexible clothing like athletic wear, gym shorts, or comfortable pants and a t-shirt so we can easily assess your range of motion and posture."
  },
  {
    question: "Do I need a referral?",
    answer: "You do not need a medical referral from a doctor to book a private appointment or receive care with us."
  },
  {
    question: "How many visits will I need?",
    answer: "Every body is different. Some acute issues improve significantly within 3–6 visits, while chronic conditions may require a structured 8–12 week plan. We always present a clear timeline with measurable milestones after your exam."
  },
  {
    question: "Do you treat specific conditions like sciatica, disc bulges, or arthritis?",
    answer: "Yes. We frequently treat lumbar disc issues, sciatica, sports injuries, tension headaches, and age-related stiffness using evidence-informed adjustments, traction, and rehabilitation."
  },
  {
    question: "What if I've seen another specialist and it didn't help?",
    answer: "Many of our patients had previous experiences with rushed clinics. We take a root-cause approach combining joint mobilization, soft tissue therapy, and active rehabilitation tailored specifically to your body."
  }
];
