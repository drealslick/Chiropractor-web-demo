export interface ClinicInfo {
  name: string;
  tagline: string;
  city: string;
  state: string;
  cityState: string;
  address: string;
  zip: string;
  phone: string;
  phoneRaw: string;
  hoursWeekday: string;
  hoursSaturday: string;
  parkingNote: string;
  doctorName: string;
  doctorCredentials: string;
  doctorYears: string;
  doctorQuote: string;
  doctorImage: string;
  heroImage: string;
  clinicImage: string;
  patientImage: string;
  offerHeadline: string;
  offerSubtext: string;
  offerCtaText: string;

  // Custom Colors & Dynamic Styling
  colorPalette?: string;
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
  fontPairing?: string;

  // Branding & Logo
  logoText?: string;
  logoImage?: string;
  logoWidth?: number;
  logoPosition?: 'left' | 'center';

  // Hero & Content Overrides
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroAcceptingPillText?: string;
  heroGuaranteeText?: string;
  heroImageCaption?: string;
  offerPriceText?: string;

  // Doctor Info
  doctorTitle?: string;
  doctorBio?: string;
  doctorSubCredentials?: string;

  // Booking & Conversion
  finalCtaHeadline?: string;
  finalCtaButtonText?: string;
  finalCtaSubheadline?: string;
  finalCtaCallPrefix?: string;
  externalBookingUrl?: string;
  bookingUrl?: string;
  bookingType?: 'modal' | 'external';
  bookingMode?: 'modal' | 'external';
  showStickyBanner?: boolean;
  paymentModel?: 'insurance_and_cash' | 'cash_only_concierge';
  googleRating?: number;
  googleReviewsCount?: number;

  // Custom Arrays
  customConditions?: ProblemCondition[];
  customProcessSteps?: ProcessStep[];
  customTestimonials?: { quote: string; author: string; rating: number; condition?: string }[];
  customFaqs?: { q: string; a: string }[];

  // Why Us Pillars
  whyUsPillar1Title?: string;
  whyUsPillar1Desc?: string;
  whyUsPillar2Title?: string;
  whyUsPillar2Desc?: string;
  whyUsPillar3Title?: string;
  whyUsPillar3Desc?: string;

  // Section Visibilities
  showTrustBar?: boolean;
  showWhyUs?: boolean;
  showConditions?: boolean;
  showTheClinic?: boolean;
  showTheDoctor?: boolean;
  showTheProcess?: boolean;
  showPatients?: boolean;
  showInsurancePayment?: boolean;
  showFAQ?: boolean;

  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;

  // Section Headings & Titles
  whyUsTitle?: string;
  whyUsSubtitle?: string;
  conditionsTitle?: string;
  conditionsSubtitle?: string;
  clinicSectionTitle?: string;
  clinicSectionSubtitle?: string;
  doctorSectionTitle?: string;
  doctorSectionSubtitle?: string;
  processSectionTitle?: string;
  processSectionSubtitle?: string;
  patientsSectionTitle?: string;
  patientsSectionSubtitle?: string;
  faqSectionTitle?: string;
  faqSectionSubtitle?: string;

  // Contact & Social
  email?: string;
  instagram?: string;
  facebook?: string;
  googleBusiness?: string;

  // Featured Patient Story
  patientStoryName?: string;
  patientStoryRole?: string;
  patientStorySummary?: string;
  patientStoryTimeline?: string;
  patientStoryOutcome?: string;

  // Trust Bar Labels
  trustRatingLabel?: string;
  trustRatingSub?: string;
  trustExperienceLabel?: string;
  trustExperienceSub?: string;
  trustPatientsLabel?: string;
  trustPatientsSub?: string;

  // Navigation Links
  navLink1?: string;
  navLink2?: string;
  navLink3?: string;
  navLink4?: string;
  navButtonText?: string;

  // Footer Details
  footerDescription?: string;
  hoursFriday?: string;
  hoursDisclaimer?: string;

  // FAQ Details
  faqDescription?: string;

  // Insurance Section
  insuranceTitle?: string;
  insuranceSubtitle?: string;
  customInsurances?: string[];
  insuranceQuestionLabel?: string;
  insuranceCallCta?: string;

  // Location Section
  locationSectionSubtitle?: string;
  locationSectionTitle?: string;
  locationQuestionsLabel?: string;
  locationAddressLabel?: string;
  locationHoursLabel?: string;
  locationParkingLabel?: string;
  locationClosedLabel?: string;

  // Clinic Showcase Section
  clinicQuote?: string;
  clinicQuoteDescription?: string;

  // Patients Section
  patientsSectionFeaturedTitle?: string;

  // First Visit Section
  firstVisitSubtitle?: string;
  firstVisitTitle?: string;
  customFirstVisitSteps?: ProcessStep[];
}

export interface ProblemCondition {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  approach: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface PatientTestimonial {
  quote: string;
  author: string;
  rating: number;
  condition?: string;
}

export interface FeaturedStory {
  patientName: string;
  image: string;
  summary: string;
  timeline: string;
  outcome: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BookingFormData {
  condition: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}
