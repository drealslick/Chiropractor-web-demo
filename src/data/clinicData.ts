import heroImg from '../assets/images/clinic_hero_care_1789573961612.jpg';
import doctorImg from '../assets/images/doctor_portrait_1789573972470.jpg';
import clinicRoomImg from '../assets/images/clinic_interior_room_1789573983752.jpg';
import michaelImg from '../assets/images/patient_michael_tennis_1789573994707.jpg';

export { heroImg, doctorImg, clinicRoomImg, michaelImg };

import { ClinicInfo, ProblemCondition, ProcessStep, PatientTestimonial, FeaturedStory, FAQItem, HeroTriageOption, ClinicSchedulingRules } from '../types';

export const defaultSchedulingRules: ClinicSchedulingRules = {
  slotDurationMinutes: 45,
  bufferTimeMinutes: 15,
  clinicClosedDates: [
    '2026-12-25',
    '2026-12-26',
    '2027-01-01'
  ],
  weeklySchedule: {
    monday: { enabled: true, openTime: '08:30', closeTime: '18:30', lunchBreakEnabled: true, lunchStart: '12:30', lunchEnd: '13:30' },
    tuesday: { enabled: true, openTime: '08:30', closeTime: '18:30', lunchBreakEnabled: true, lunchStart: '12:30', lunchEnd: '13:30' },
    wednesday: { enabled: true, openTime: '08:30', closeTime: '18:30', lunchBreakEnabled: true, lunchStart: '12:30', lunchEnd: '13:30' },
    thursday: { enabled: true, openTime: '08:30', closeTime: '18:30', lunchBreakEnabled: true, lunchStart: '12:30', lunchEnd: '13:30' },
    friday: { enabled: true, openTime: '08:30', closeTime: '18:30', lunchBreakEnabled: true, lunchStart: '12:30', lunchEnd: '13:30' },
    saturday: { enabled: true, openTime: '09:00', closeTime: '14:00', lunchBreakEnabled: false, lunchStart: '12:00', lunchEnd: '12:30' },
    sunday: { enabled: false, openTime: '09:00', closeTime: '13:00', lunchBreakEnabled: false, lunchStart: '12:00', lunchEnd: '12:30' },
  },
  practitionerOverrides: [
    {
      practitionerId: 'team-1',
      practitionerName: 'Dr. Alistair Vance',
      role: 'Lead Chiropractic Physician',
      isOnHoliday: false,
      holidayDates: [],
      assignedConditions: ['Back pain', 'Sports injury'],
      weeklyOffDays: [0], // Sunday
      isAcceptingNewPatients: true,
    },
    {
      practitionerId: 'team-2',
      practitionerName: 'Dr. Elena Rostova',
      role: 'Senior Associate Chiropractor',
      isOnHoliday: false,
      holidayDates: [],
      assignedConditions: ['Neck pain', 'Headaches', 'Other'],
      weeklyOffDays: [0, 6], // Sat & Sun
      isAcceptingNewPatients: true,
    },
    {
      practitionerId: 'team-3',
      practitionerName: 'Dr. Marcus Sterling',
      role: 'Sports Chiropractor & Rehab Specialist',
      isOnHoliday: false,
      holidayDates: [],
      assignedConditions: ['Sports injury', 'Back pain'],
      weeklyOffDays: [0], // Sunday
      isAcceptingNewPatients: true,
    }
  ],
  notifications: {
    clinicEmailAlert: true,
    clinicAlertRecipient: 'reception@vancehealth.co.uk',
    patientAutoResponder: true,
    autoResponderSubject: "We've received your appointment request - Vance Health",
    autoResponderMessage: `Hello {patient_name},

Thank you for requesting an appointment with {clinic_name}! We received your request for {date} at {time} with {practitioner_name}.

Next steps:
1. Our clinical care team is reviewing your intake condition and insurance benefits.
2. You will receive an official confirmation call or email within 24 business hours.
3. Quick digital health forms will be sent to your email to complete before your visit.

Clinic Phone: {clinic_phone}
Address: {clinic_address}`,
  }
};

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
  instagram: "https://instagram.com/vancehealth",
  facebook: "https://facebook.com/vancehealth",
  googleBusiness: "https://maps.google.com/?q=Vance+Health+Central+Practice+London",
  youtube: "https://youtube.com/@vancehealth",
  linkedin: "https://linkedin.com/company/vancehealth",
  twitter: "https://x.com/vancehealth",
  schedulingRules: defaultSchedulingRules,
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
    slug: "back-lower-back-pain",
    description: "Personalized care designed around your symptoms, movement, and goals.",
    icon: "lumbar",
    heroImage: clinicRoomImg,
    heroImageAlt: "Spinal decompression and lumbar examination suite",
    symptoms: [
      "Sciatica & sharp shooting pain down the leg or foot",
      "Dull, persistent ache in the lumbar spine after prolonged sitting",
      "Acute muscular spasm and difficulty straightening upright",
      "Morning lower back stiffness lasting more than 20 minutes"
    ],
    ourApproach: "Lower back pain is almost never an isolated muscular issue. In the vast majority of cases, it results from prolonged axial compression of intervertebral discs (L4-L5 and L5-S1) combined with restricted facet joint motion and pelvic compensation. Our clinical approach isolates the exact mechanical restriction, restores normal vertebral articulation through gentle spinal adjustments, and unloads posterior disc pressure before strengthening your deep core kinetic chain.",
    carePlan: [
      "Phase 1: Precision spinal manipulation to unlock restricted facet joints and relieve nerve impingement",
      "Phase 2: Targeted flexion-distraction and manual soft tissue therapy to decompress intervertebral discs",
      "Phase 3: Pelvic girdle and sacroiliac (SI) joint re-alignment to eliminate asymmetric weight distribution",
      "Phase 4: Progressive core stabilization protocols (McGill Big 3) to prevent recurring disc flare-ups"
    ],
    homeCareAdvice: "Avoid sitting for longer than 30 continuous minutes during acute flare-ups. Perform gentle standing lumbar extensions (hands on hips, arching backward 5 times) and use cold therapy over the lumbosacral junction for 15 minutes twice daily.",
    homeCareQuoteAuthor: "Clinical Home Care Protocol",
    approach: "Gentle spinal adjustments, targeted decompression, and core stabilization routines to unload disc pressure and restore lumbar flexibility.",
    howWeHelp: "Comprehensive lumbar motion analysis, gentle joint mobilization, and decompression therapies to relieve sciatic nerve pressure and restore pain-free movement.",
    relatedBlogSlugs: ["decompression-habits-for-desk-workers", "sciatica-vs-piriformis-syndrome"],
    showPricingLink: true,
    blocks: [
      {
        id: "block_back_1",
        type: "callout",
        calloutVariant: "takeaway",
        calloutTitle: "Clinical Takeaway: Disc Unloading vs Muscle Relaxers",
        calloutText: "Medications may dull the sensation of pain, but they cannot physically widen a narrowed neural foramen or reduce mechanical disc protrusion. Restoring joint biomechanics addresses the physical cause directly."
      },
      {
        id: "block_back_2",
        type: "quote",
        quoteText: "When the lumbar joints move normally, the surrounding musculature can finally relax without perpetual protective spasm.",
        quoteAuthor: "Lead Chiropractic Biomechanist"
      }
    ]
  },
  {
    id: "neck-pain",
    title: "Neck & Shoulder Pain",
    slug: "neck-shoulder-pain",
    description: "Address discomfort and movement limitations affecting your everyday life.",
    icon: "cervical",
    heroImage: clinicRoomImg,
    heroImageAlt: "Cervical spine alignment and posture treatment",
    symptoms: [
      "Chronic tension at the base of the skull and upper trapezius",
      "Forward head posture ('text neck') causing upper back fatigue",
      "Sharp pinching pain when turning head while driving or looking over shoulder",
      "Occasional numbness, tingling, or radiating warmth down the arm"
    ],
    ourApproach: "For every inch your head shifts forward past your center of gravity, your cervical spine must support an extra 10 to 12 pounds of mechanical weight. Over time, this leads to chronic suboccipital compression, cervical facet joint irritation, and upper cross syndrome. Our clinical protocol releases hypertonic neck muscles, mobilizes restricted cervical vertebrae (C2-C7), and restores natural cervical lordosis.",
    carePlan: [
      "Phase 1: Gentle cervical spine mobilization to restore smooth rotation and side-bending kinematics",
      "Phase 2: Suboccipital myofascial release and trigger point therapy to alleviate upper shoulder tightness",
      "Phase 3: Thoracic spine extension mobilization to correct compensatory hunching and round shoulders",
      "Phase 4: Deep cervical flexor neuromuscular re-education to maintain upright posture effortlessly"
    ],
    homeCareAdvice: "Position your computer monitor so your eye line meets the top third of the screen. Implement chin tucks (retraction exercises) holding for 5 seconds, repeated 10 times throughout the workday.",
    homeCareQuoteAuthor: "Cervical Ergonomics Advisory",
    approach: "Precise cervical mobilization, soft tissue release, and ergonomic guidance to eliminate nerve impingement and ease chronic tension.",
    howWeHelp: "Targeted cervical adjustments, myofascial release of tight trapezius bands, and ergonomic coaching to permanently eliminate postural neck pain.",
    relatedBlogSlugs: ["decompression-habits-for-desk-workers", "neck-tension-and-headaches"],
    showPricingLink: true,
    blocks: [
      {
        id: "block_neck_1",
        type: "callout",
        calloutVariant: "tip",
        calloutTitle: "The 20-20-20 Posture Rule",
        calloutText: "Every 20 minutes of screen work, look at an object 20 feet away for 20 seconds, and roll your shoulders gently backward down into your back pockets."
      }
    ]
  },
  {
    id: "sports-activity",
    title: "Sports & Activity",
    slug: "sports-activity",
    description: "Support for active patients looking to move, perform, and recover.",
    icon: "sports",
    heroImage: michaelImg,
    heroImageAlt: "Athletic rehab and kinetic performance",
    symptoms: [
      "Asymmetric hip or knee tightness during running and cycling",
      "Rotator cuff impingement or shoulder restriction during overhead lifts",
      "Recurrent hamstring, calf, or Achilles tendon strains",
      "Suboptimal athletic power output and prolonged post-workout soreness"
    ],
    ourApproach: "Athletic injuries rarely occur in a vacuum; an issue in the knee or ankle often stems from a restricted sacroiliac joint or inhibited gluteal firing in the pelvis. We evaluate the entire functional kinetic chain, identifying compensations and micro-instabilities that compromise performance and increase injury risk.",
    carePlan: [
      "Phase 1: Comprehensive joint-by-joint movement screening to identify rotational deficiencies",
      "Phase 2: High-velocity low-amplitude (HVLA) extremity and spinal manipulation to restore joint mechanics",
      "Phase 3: Instrument-assisted soft tissue mobilization (IASTM) to break down fascial adhesions and scar tissue",
      "Phase 4: Sport-specific dynamic neuromuscular stabilization and progressive load management"
    ],
    homeCareAdvice: "Incorporate dynamic warm-up drills prioritizing thoracic rotation and hip mobility prior to training. Emphasize eccentric tendon loading exercises for chronic tendon stiffness.",
    homeCareQuoteAuthor: "Sports Recovery Protocol",
    approach: "Functional movement screening, joint manipulation, and dynamic rehab exercises to return you to training safely.",
    howWeHelp: "Full kinetic chain assessment, extremity joint manipulation, and functional rehab drills to keep you competing without downtime.",
    relatedBlogSlugs: ["what-happens-during-first-visit", "decompression-habits-for-desk-workers"],
    showPricingLink: true
  },
  {
    id: "mobility-stiffness",
    title: "Mobility & Stiffness",
    slug: "mobility-stiffness",
    description: "Restore range of motion so daily movement stops feeling like a negotiation.",
    icon: "mobility",
    heroImage: clinicRoomImg,
    heroImageAlt: "Full body mobility and spinal articulation suite",
    symptoms: [
      "Generalized morning stiffness that requires an hour to 'warm up'",
      "Difficulty checking blind spots while driving or reaching overhead",
      "Feeling locked up in the mid-back and ribs after sitting",
      "Crepitus (cracking/grinding sensations) and restricted joint movement"
    ],
    ourApproach: "Joint stiffness is the brain's protective response to perceived instability or chronic immobility. When spinal segments lose their normal micro-gliding motion, joint fluid circulates poorly and surrounding tissues tighten. We systematically restore segmental motion to every restricted vertebra and rib head, allowing fluid nutrition to return to articular cartilage.",
    carePlan: [
      "Phase 1: Gentle multi-segmental spinal traction and rib cage mobilization to enhance thoracic breathing",
      "Phase 2: Full-spine chiropractic adjustments tailored to your comfort and bone density tolerance",
      "Phase 3: Passive and active range of motion stretching to lengthen chronically shortened hip flexors",
      "Phase 4: Daily movement 'hygiene' routines that take under 5 minutes to maintain joint longevity"
    ],
    homeCareAdvice: "Adopt the 'cat-cow' spinal flexion-extension sequence for 2 minutes upon waking, followed by 10 deep belly breaths to expand your costovertebral joints.",
    homeCareQuoteAuthor: "Active Longevity Directive",
    approach: "Passive and active spinal traction, myofascial release, and mobility protocols to keep your joints moving freely every day.",
    howWeHelp: "Gentle segmental mobilization, assisted stretching, and rib joint alignment to restore effortless fluidity to your daily routine.",
    relatedBlogSlugs: ["decompression-habits-for-desk-workers"],
    showPricingLink: true
  },
  {
    id: "headaches-tension",
    title: "Headaches & Tension",
    slug: "headaches-tension",
    description: "Find the root cause, not just temporary relief.",
    icon: "headache",
    heroImage: doctorImg,
    heroImageAlt: "Cervicogenic headache evaluation and diagnosis",
    symptoms: [
      "Pain starting at the base of skull radiating like a 'ram horn' behind one eye",
      "Band-like pressure wrapping around the forehead and temples",
      "Headaches triggered or worsened by desk work, stress, or driving",
      "Associated jaw (TMJ) clenching and neck stiffness"
    ],
    ourApproach: "Over 80% of persistent non-migraine headaches have a direct biomechanical cervical component. The upper three cervical spinal nerves converge with the cranial trigeminal sensory nerve in the brainstem. When the C1 (Atlas) or C2 (Axis) vertebrae are restricted, pain is referred straight into the head, brow, and temples. Correcting this misalignment relieves the nerve irritation at its physical source.",
    carePlan: [
      "Phase 1: Precise, ultra-gentle upper cervical manipulation (C1-C3) without harsh twisting",
      "Phase 2: Suboccipital muscle decompression using ischemic pressure and gentle traction",
      "Phase 3: Temporomandibular joint (TMJ) assessment to address compensatory jaw clenching",
      "Phase 4: Ergonomic and blue-light screen habit optimization to decrease ocular-cervical fatigue"
    ],
    homeCareAdvice: "Place a small cervical towel roll beneath the hollow of your neck while lying flat on your back for 10 minutes to re-establish the cervical curve and decompress the occiput.",
    homeCareQuoteAuthor: "Headache Relief Protocol",
    approach: "Pinpoint upper neck misalignments that cause referral pain patterns, combining gentle manipulation with postural retraining.",
    howWeHelp: "Specialized upper cervical adjustments and suboccipital release to eliminate the nerve irritation causing recurrent tension headaches.",
    relatedBlogSlugs: ["neck-tension-and-headaches", "decompression-habits-for-desk-workers"],
    showPricingLink: true,
    blocks: [
      {
        id: "block_head_1",
        type: "callout",
        calloutVariant: "research",
        calloutTitle: "Clinical Evidence: Cervicogenic Mechanism",
        calloutText: "Peer-reviewed neuro-anatomy confirms that sensory afferents from C1-C3 nerves share interneurons with the trigeminal nerve. Restoring normal upper neck motion provides statistically significant relief in headache frequency and severity."
      }
    ]
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
    duration: "15 mins",
    icon: "chat",
    description: "We listen carefully to your health history, previous treatments, pain triggers, and everyday mobility goals.",
    details: [
      "Detailed medical & symptom history deep-dive",
      "Postural habits & workday ergonomic review",
      "Clarifying your personal return-to-activity goals"
    ]
  },
  {
    number: "02",
    title: "Assessment & Exam",
    duration: "20 mins",
    icon: "search",
    description: "Comprehensive orthopedic, neurological, and biomechanical movement examination to pinpoint restricted vertebral segments.",
    details: [
      "Active & passive spinal range of motion testing",
      "Dermatome sensory & deep tendon reflex checks",
      "Motion palpation of spinal facet joints & nerve pathways"
    ]
  },
  {
    number: "03",
    title: "Treatment Plan & First Adjustment",
    duration: "15 mins",
    icon: "clipboard",
    description: "You leave knowing exactly what is causing your symptoms, how long recovery takes, and what it costs—with your first gentle treatment if indicated.",
    details: [
      "Report of findings explained clearly with zero medical jargon",
      "Co-created care schedule with clear recovery milestones",
      "Initial gentle spinal decompression or targeted adjustment"
    ]
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
