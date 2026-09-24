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
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  symptoms?: string[];
  [key: string]: any;
}

export interface ProcessStep {
  step?: number | string;
  number?: number | string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface PatientTestimonial {
  id?: string;
  name?: string;
  author?: string;
  role?: string;
  quote?: string;
  rating?: number;
  avatarUrl?: string;
  [key: string]: any;
}

export interface FeaturedStory {
  id?: string;
  title?: string;
  summary?: string;
  imageUrl?: string;
  image?: string;
  patientName?: string;
  timeline?: string;
  outcome?: string;
  [key: string]: any;
}

export interface FAQItem {
  question?: string;
  answer?: string;
  [key: string]: any;
}

export interface AnnouncementBannerConfig {
  enabled: boolean;
  message: string;
  badge?: string;
  linkText?: string;
  linkUrl?: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'stone';
}

export type BlogBlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'image'
  | 'callout'
  | 'quote'
  | 'cta';

export interface BlogBlock {
  id: string;
  type: BlogBlockType;
  // Paragraph
  content?: string;
  // Heading
  level?: 'h2' | 'h3';
  headingText?: string;
  // List
  listType?: 'bullet' | 'numbered';
  items?: string[];
  // Image
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  // Callout Box
  calloutVariant?: 'takeaway' | 'warning' | 'tip' | 'research';
  calloutTitle?: string;
  calloutText?: string;
  // Pull Quote
  quoteText?: string;
  quoteAuthor?: string;
  // CTA Card
  ctaHeadline?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
}

export interface ClinicPost {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  body?: string;
  author?: string;
  category?: string;
  readTime?: string;
  status?: 'published' | 'draft';
  blocks?: BlogBlock[];
}

export type BookingEmbedMode = 'triage_request' | 'iframe' | 'redirect';
export type BookingPlatformPreset = 'jane' | 'calendly' | 'cliniko' | 'acuity' | 'custom';

export interface HeroTriageOption {
  id: string;
  label: string;
  shortLabel?: string;
  summary: string;
  typicalVisits: string;
  focus: string;
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
  showHeroTriage?: boolean;
  heroTriageHeadline?: string;
  heroTriageSubheadline?: string;
  customTriageOptions?: HeroTriageOption[];
  offerHeadline?: string;
  offerPriceText?: string;
  showStickyBanner?: boolean;
  bookingType?: string;
  externalBookingUrl?: string;
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
  announcementBanner?: AnnouncementBannerConfig;
  customPosts?: ClinicPost[];
  customTeamMembers?: any[];
  privacyPolicyText?: string;
  termsOfServiceText?: string;
  cancellationPolicyText?: string;
  isProductionMode?: boolean;
  heroImageAlt?: string;
  doctorImageAlt?: string;
  clinicImageAlt?: string;
  patientImageAlt?: string;
  logoUrlAlt?: string;
  examFee?: string;
  followUpFee?: string;
  aboutApproach?: string;
  aboutMission?: string;
  aboutStory?: string;
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
