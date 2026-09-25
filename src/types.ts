import { ColorPaletteId } from './data/colorPalettes';

export type UserRole = 'admin' | 'editor' | 'staff';

export interface BookingFormData {
  fullName?: string;
  name: string;
  email: string;
  phone: string;
  condition?: string;
  preferredPractitionerId?: string;
  preferredPractitionerName?: string;
  preferredDate?: string;
  preferredTime?: string;
  date?: string;
  time?: string;
  notes?: string;
  hp_website?: string;
}

export interface DayWorkingHours {
  enabled: boolean;
  openTime: string; // e.g. "08:30"
  closeTime: string; // e.g. "18:30"
  lunchBreakEnabled: boolean;
  lunchStart: string; // e.g. "12:30"
  lunchEnd: string; // e.g. "13:30"
}

export interface PractitionerSchedulingOverride {
  practitionerId: string;
  practitionerName: string;
  role?: string;
  isOnHoliday?: boolean;
  holidayDates?: string[]; // ISO YYYY-MM-DD
  assignedConditions?: string[]; // e.g. ['Back pain', 'Sports injury']
  weeklyOffDays?: number[]; // [0, 6] for Sunday, Saturday
  isAcceptingNewPatients?: boolean;
}

export interface ClinicSchedulingRules {
  slotDurationMinutes: number; // default 45
  bufferTimeMinutes: number; // default 15
  clinicClosedDates: string[]; // ISO "YYYY-MM-DD" e.g. ["2026-12-25", "2026-12-26"]
  weeklySchedule: {
    monday: DayWorkingHours;
    tuesday: DayWorkingHours;
    wednesday: DayWorkingHours;
    thursday: DayWorkingHours;
    friday: DayWorkingHours;
    saturday: DayWorkingHours;
    sunday: DayWorkingHours;
  };
  practitionerOverrides?: PractitionerSchedulingOverride[];
  notifications: {
    clinicEmailAlert: boolean;
    clinicAlertRecipient: string;
    patientAutoResponder: boolean;
    autoResponderSubject: string;
    autoResponderMessage: string;
  };
}

export interface ProblemCondition {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  heroImage?: string;
  heroImageAlt?: string;
  symptoms?: string[];
  // How We Treat It detailed clinical sections
  ourApproach?: string;
  carePlan?: string[];
  homeCareAdvice?: string;
  homeCareQuoteAuthor?: string;
  // Legacy / fallback fields
  approach?: string;
  howWeHelp?: string;
  // Mini-page builder blog blocks
  blocks?: BlogBlock[];
  // Cross-linking
  relatedBlogSlugs?: string[];
  showPricingLink?: boolean;
  pricingNote?: string;
  [key: string]: any;
}

export interface ProcessStep {
  step?: number | string;
  number?: number | string;
  title?: string;
  description?: string;
  duration?: string;
  icon?: string;
  details?: string[];
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

export interface AboutPhilosophyPillar {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutGalleryImage {
  id: string;
  url: string;
  caption: string;
  alt?: string;
  tag?: string;
}

export interface PublicTeamMember {
  id: string;
  slug: string;
  name: string;
  credentials?: string;
  role: string;
  photoUrl?: string;
  photoAlt?: string;
  shortSummary: string;
  bioBlocks?: BlogBlock[];
  areasOfFocus: string[];
  assignedConditionSlugs?: string[];
  showOnWebsite: boolean;
  order?: number;
  email?: string;
  phone?: string;
  quote?: string;
  education?: string;
  registrationNumber?: string;
}

export interface SupportStaffMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
}

export interface AboutAssociation {
  id: string;
  name: string;
  abbreviation: string;
  role?: string;
  verified?: boolean;
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
  enableDropCap?: boolean;
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

export interface PricingFeeItem {
  id: string;
  title: string;
  price: string;
  description: string;
  badge?: string;
  icon?: 'user' | 'refresh' | 'activity' | 'zap' | 'sparkles' | 'heart';
  popular?: boolean;
  features: string[];
}

export interface FinancingOption {
  enabled?: boolean;
  provider?: string;
  badge?: string;
  headline?: string;
  description?: string;
  terms?: string;
  features?: string[];
  ctaText?: string;
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
  instagram?: string;
  facebook?: string;
  googleBusiness?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  logoUrl?: string;
  tagline?: string;
  description?: string;
  services?: string[];
  hours?: Record<string, string>;
  selectedPaletteId?: ColorPaletteId;
  colorPalette?: string;
  fontPairing?: string;
  globalDropCap?: boolean;
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
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
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
  customFeeItems?: PricingFeeItem[];
  financing?: FinancingOption;
  aboutApproach?: string;
  aboutMission?: string;
  aboutStory?: string;
  schedulingRules?: ClinicSchedulingRules;
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
