import heroImg from '../assets/images/clinic_hero_care_1789573961612.jpg';
import doctorImg from '../assets/images/doctor_portrait_1789573972470.jpg';
import clinicRoomImg from '../assets/images/clinic_interior_room_1789573983752.jpg';
import michaelImg from '../assets/images/patient_michael_tennis_1789573994707.jpg';

import { ClinicInfo, ProblemCondition, ProcessStep, PatientTestimonial, FeaturedStory, FAQItem } from '../types';

export const defaultClinic: ClinicInfo = {
  name: "Columbus Chiropractic Care",
  tagline: "Personalized chiropractic care in Columbus for people who refuse to slow down.",
  city: "Columbus",
  state: "OH",
  cityState: "Columbus, OH",
  address: "742 S High St",
  zip: "43206",
  phone: "(614) 555-0194",
  phoneRaw: "6145550194",
  hoursWeekday: "Mon–Fri: 9am–6pm",
  hoursSaturday: "Sat: 9am–1pm",
  parkingNote: "Free parking behind the building.",
  doctorName: "Dr. Marcus Vance",
  doctorCredentials: "D.C., CCSP",
  doctorYears: "15",
  doctorQuote: "I became a chiropractor because I saw how quickly pain can shrink someone's world. My job is to give that world back.",
  doctorImage: doctorImg,
  heroImage: heroImg,
  clinicImage: clinicRoomImg,
  patientImage: michaelImg,
  offerHeadline: "New Patients: $49 Initial Exam + Consultation",
  offerSubtext: "Limited slots each week.",
  offerCtaText: "CLAIM YOURS →",
  colorPalette: "emerald-healing",
};

export const alternativeOffers = [
  {
    headline: "New Patients: $49 Initial Exam + Consultation",
    subtext: "Limited slots each week.",
    cta: "CLAIM YOURS →"
  },
  {
    headline: "Complimentary 15-Minute Phone Consultation",
    subtext: "Discuss your symptoms directly with the doctor before booking.",
    cta: "SCHEDULE CALL →"
  },
  {
    headline: "New Patient Special: $59 Exam, X-Rays & Adjustment",
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
    quote: "First chiropractor who actually explained what was happening and why.",
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
  summary: "Michael came in after months of recurring lower-back pain. He'd tried rest, painkillers, and a chiropractor who rushed him through 15-minute adjustments.",
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
    answer: "In Ohio, chiropractors are primary contact healthcare professionals, meaning you do not need a medical referral from a doctor to book an appointment or receive care."
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
    question: "What if I've seen another chiropractor and it didn't help?",
    answer: "Many of our patients had previous experiences with rushed 5-minute crack-and-go clinics. We take a root-cause approach combining joint mobilization, soft tissue therapy, and active rehabilitation tailored specifically to your body."
  }
];
