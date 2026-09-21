import { ColorPaletteId } from './data/colorPalettes';

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface ProblemCondition {
  id: string;
  title: string;
  description: string;
  icon?: string;
  symptoms?: string[];
  [key: string]: any;
}

export interface ProcessStep {
  step?: number;
  number?: number;
  title: string;
  description: string;
  [key: string]: any;
}

export interface PatientTestimonial {
  id: string;
  name?: string;
  author?: string;
  role?: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  [key: string]: any;
}

export interface FeaturedStory {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  image?: string;
  patientName?: string;
  timeline?: string;
  outcome?: string;
  [key: string]: any;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ClinicInfo {
  id?: string;
  name?: string;
  doctorName?: string;
  doctorTitle?: string;
  doctorCredentials?: string;
  doctorQuote?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  cityState?: string;
  website?: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;
  services?: string[];
  hours?: Record<string, string>;
  selectedPaletteId?: ColorPaletteId;
  colorPalette?: string;
  fontPairing?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  offerHeadline?: string;
  offerPriceText?: string;
  showStickyBanner?: boolean;
  bookingType?: string;
  externalBookingUrl?: string;
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
  [key: string]: any;
}

export interface ClientData {
  id: string;
  clinicName: string;
  doctorName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  paletteId: ColorPaletteId;
  info: ClinicInfo;
}
