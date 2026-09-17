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
  colorPalette?: string;
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
  logoText?: string;
  logoImage?: string;
  logoWidth?: number;
  logoPosition?: 'left' | 'center';
  finalCtaHeadline?: string;
  finalCtaButtonText?: string;
  externalBookingUrl?: string;
  bookingType?: 'modal' | 'external';
  showStickyBanner?: boolean;
  paymentModel?: 'insurance_and_cash' | 'cash_only_concierge';
  googleRating?: number;
  googleReviewsCount?: number;
  customConditions?: ProblemCondition[];
  customProcessSteps?: ProcessStep[];
  customTestimonials?: { quote: string; author: string; rating: number; condition?: string }[];
  customFaqs?: { q: string; a: string }[];
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
