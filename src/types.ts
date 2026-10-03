import { ColorPaletteId } from './data/colorPalettes';

export type UserRole = 'admin' | 'staff' | 'practitioner' | 'content_editor' | 'editor';

/**
 * Canonical Membership Schema
 */
export interface ClinicMembership {
  userId: string;
  clinicId: string;
  role: UserRole;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Canonical Clinic Service Schema
 */
export interface ClinicService {
  id: string;
  clinicId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  price: number; // Integer minor units (e.g. 8500 = £85.00)
  deposit: number; // Integer minor units (e.g. 2500 = £25.00)
  currency: string; // ISO lower (e.g. 'gbp', 'usd')
  active: boolean;
  serviceType: 'initial' | 'followup' | 'custom';
}

/**
 * Canonical Patient Inquiry Schema
 */
export interface PatientInquiry {
  id: string;
  clinicId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  message: string;
  source: 'contact' | 'lead' | 'website';
  status: 'new' | 'contacted' | 'resolved' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

/**
 * Canonical Appointment Record Schema (v1)
 */
export interface AppointmentRecord {
  schemaVersion: 1;
  id: string;
  clinicId: string; // Required organization/tenant boundary
  locationId?: string; // Physical practice branch
  practitionerId?: string; // Clinical provider ID
  practitionerName?: string;
  serviceId?: string;
  serviceTitle: string;
  serviceType: 'initial' | 'followup' | 'custom';
  durationMinutes: number;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM AM/PM
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  condition?: string;
  notes?: string;
  // Separate Appointment & Payment States
  status: 'new' | 'confirmed' | 'checked_in' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'deposit_paid' | 'paid_full' | 'card_hold' | 'refunded';
  // Financial Tracking
  currency: string; // ISO 4217, e.g. 'gbp', 'usd'
  priceAmount?: number; // Major or minor integer representation
  depositAmount?: number;
  amountPaid?: number;
  paymentMethod?: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash';
  transactionId?: string;
  cardLast4?: string;
  cardBrand?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClinicLocation {
  id: string;
  name: string;
  tagline?: string;
  isPrimary?: boolean;
  address: string;
  city: string;
  state?: string;
  cityState?: string;
  zip: string;
  phone: string;
  phoneRaw: string;
  email?: string;
  hoursWeekday?: string;
  hoursSaturday?: string;
  parkingNote?: string;
  transitNote?: string;
  mapEmbedUrl?: string;
  assignedPractitionerIds?: string[];
  imageUrl?: string;
  active?: boolean;
}

export interface BookingFormData {
  fullName?: string;
  name: string;
  email: string;
  phone: string;
  condition?: string;
  serviceType?: 'initial' | 'followup' | 'custom';
  serviceTitle?: string;
  servicePrice?: string;
  serviceDuration?: number;
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
  preferredPractitionerId?: string;
  preferredPractitionerName?: string;
  preferredDate?: string;
  preferredTime?: string;
  date?: string;
  time?: string;
  notes?: string;
  hp_website?: string;
  // Upfront Payment & No-Show Protection fields
  paymentChoice?: 'deposit' | 'full' | 'card_hold' | 'pay_at_clinic';
  paymentStatus?: 'paid_full' | 'deposit_paid' | 'card_hold' | 'unpaid';
  paymentAmount?: string;
  paymentMethod?: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash';
  cardLast4?: string;
  cardBrand?: string;
  transactionId?: string;
}

export type PaymentPolicyMode = 'deposit' | 'full' | 'card_hold' | 'flexible' | 'disabled';

export interface ClinicPaymentPolicy {
  enabled: boolean;
  mode: PaymentPolicyMode; // 'deposit' | 'full' | 'card_hold' | 'flexible' | 'disabled'
  depositAmount: number; // e.g. 25
  fullFeeAmount: number; // e.g. 49
  currencySymbol: string; // e.g. '$' | '£' | '€'
  noShowFee: number; // e.g. 35
  cancellationNoticeHours: number; // e.g. 24
  allowPayAtClinic: boolean; // if true, patients can opt to pay on arrival
  statementDescriptor: string; // e.g. "COLUMBUS CHIROPRACTIC"
  stripeMode: 'test' | 'live';
  stripeAccountId?: string; // Connected Stripe Account ID, e.g. "acct_1NzABC..."
  stripePublishableKey?: string; // pk_live_... or pk_test_...
  stripeConnectedEmail?: string;
  stripeConnectedAt?: string;
  stripePayoutSchedule?: 'daily' | 'weekly' | 'monthly';
  requireCardForOnlineBookings: boolean;
  customExplanation?: string;
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
  paymentPolicy?: ClinicPaymentPolicy;
  portalSettings?: PatientPortalSettings;
  marketRegion?: 'UK' | 'US' | 'GLOBAL';
  locations?: ClinicLocation[];
  activeLocationId?: string;
  showLocationSelector?: boolean;
  ownerEmail?: string;
  createdAt?: string;
  lastActive?: string;
  patientCount?: number;
  ehrIntegration?: string;
  smsQuotaUsed?: number;
  smsQuotaTotal?: number;
  notes?: string;
  [key: string]: any;
}

export interface PatientPortalSettings {
  enabled: boolean;
  pageTitle: string;
  pageSubtitle: string;
  welcomeMessage: string;
  allowSelfReschedule: boolean;
  allowSelfCancellation: boolean;
  allowReceiptDownload: boolean;
  allowExerciseGuides: boolean;
  cancellationNoticeHours: number;
  emergencyBannerText?: string;
  showEmergencyBanner: boolean;
  supportPhone?: string;
  supportEmail?: string;
  requirePhoneLast4?: boolean;
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
