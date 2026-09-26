import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  AlertCircle,
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  Smartphone,
  RotateCcw,
  Activity,
  Zap,
  Heart,
  Layers,
  FileText,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo, BookingFormData, PublicTeamMember, ClinicSchedulingRules, PricingFeeItem } from '../types';
import { useClinic } from '../data/ClinicContext';
import { saveLead } from '../data/leadsStore';
import { defaultPublicTeamMembers } from '../data/defaultTeamData';
import { defaultSchedulingRules, defaultPaymentPolicy } from '../data/clinicData';
import { StripeElementsCheckout } from './StripeElementsCheckout';

interface BookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  clinic?: ClinicInfo;
  initialCondition?: string;
  initialServiceType?: 'initial' | 'followup' | 'custom';
  initialServiceTitle?: string;
  initialServicePrice?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  clinic: propClinic,
  initialCondition: propInitialCondition,
  initialServiceType: propInitialServiceType,
  initialServiceTitle: propInitialServiceTitle,
  initialServicePrice: propInitialServicePrice,
}) => {
  const context = useClinic();
  const clinic = propClinic || context.clinicData;
  const isOpen = propIsOpen !== undefined ? propIsOpen : context.isBookingModalOpen;
  const onClose = propOnClose || context.closeBookingModal;
  const activeInitialCondition = propInitialCondition || context.bookingInitialCondition || 'Back pain';

  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<'initial' | 'followup' | 'custom'>('initial');
  const [selectedCustomServiceId, setSelectedCustomServiceId] = useState<string>('');
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');

  const [formData, setFormData] = useState<BookingFormData>({
    condition: activeInitialCondition,
    serviceType: 'initial',
    serviceTitle: 'Initial Consultation & Examination',
    preferredPractitionerId: '',
    preferredPractitionerName: 'First Available Practitioner',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Upfront Payment & No-Show Protection Policy
  const paymentPolicy = clinic.paymentPolicy || defaultPaymentPolicy;
  const isPaymentEnabled = (paymentPolicy.enabled !== false) && (paymentPolicy.mode !== 'disabled');
  const totalSteps = isPaymentEnabled ? 4 : 3;

  const currency = paymentPolicy.currencySymbol || clinic.currencySymbol || '£';
  const defaultDepositAmt = paymentPolicy.depositAmount || 25;
  const defaultFullAmt = paymentPolicy.fullFeeAmount || 49;
  const noShowFee = paymentPolicy.noShowFee || 35;
  const cancelNotice = paymentPolicy.cancellationNoticeHours || 24;

  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full' | 'card_hold' | 'pay_at_clinic'>(() => {
    if (paymentPolicy.mode === 'card_hold') return 'card_hold';
    if (paymentPolicy.mode === 'full') return 'full';
    return 'deposit';
  });

  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [cardZip, setCardZip] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [activeWalletModal, setActiveWalletModal] = useState<'apple_pay' | 'google_pay' | null>(null);
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState<{
    status: 'paid_full' | 'deposit_paid' | 'card_hold' | 'unpaid';
    amount: string;
    method: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash';
    last4: string;
    brand: string;
    transactionId: string;
  } | null>(null);
  const [createdBookingRefId, setCreatedBookingRefId] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [checkoutMode, setCheckoutMode] = useState<'elements' | 'simulator'>('elements');
  const [elementsFallbackNotice, setElementsFallbackNotice] = useState<string | null>(null);

  const detectedBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^(34|37)/.test(clean)) return 'Amex';
    return 'Card';
  }, [cardNumber]);

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const fillDemoCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setCardZip(clinic.zip || 'W1U 8ED');
    setCardHolder(formData.name || 'John Doe');
  };

  // Available practitioners
  const practitioners: PublicTeamMember[] = useMemo(() => {
    return clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers.filter((m) => m.showOnWebsite !== false)
      : defaultPublicTeamMembers;
  }, [clinic.publicTeamMembers]);

  // Active scheduling rules
  const schedulingRules: ClinicSchedulingRules = clinic.schedulingRules || defaultSchedulingRules;

  // Custom / Specialized Services catalog
  const customServicesList: PricingFeeItem[] = useMemo(() => {
    if (clinic.customFeeItems && clinic.customFeeItems.length > 0) {
      return clinic.customFeeItems;
    }
    const sym = clinic.currencySymbol || '£';
    return [
      {
        id: 'decompression',
        title: 'Spinal Decompression Therapy',
        price: `${sym}75`,
        description: 'Computerized motorized traction targeting herniated discs, sciatica, and chronic nerve compression.',
        popular: true,
        badge: 'Disc & Sciatica',
        icon: 'activity',
        features: ['Targeted lumbar/cervical traction', 'Negative intradiscal pressure', 'Relieves nerve pinching'],
      },
      {
        id: 'laser',
        title: 'Class IV Deep Tissue Laser Therapy',
        price: `${sym}65`,
        description: 'High-intensity photobiomodulation for accelerated cellular repair and rapid anti-inflammatory relief.',
        badge: 'Fast Relief',
        icon: 'zap',
        features: ['Deep tissue penetration', 'Accelerates tendon healing', 'Painless & non-invasive'],
      },
      {
        id: 'orthotics',
        title: 'Custom Orthotics & Biomechanical Gait Scan',
        price: `${sym}95`,
        description: '3D digital foot scanning and custom kinetic support for chronic pelvic, knee, and lower back alignment.',
        badge: 'Postural',
        icon: 'sparkles',
        features: ['3D digital dynamic foot scan', 'Pelvic kinetic chain review', 'Custom medical orthotic fitting'],
      },
      {
        id: 'sports_rehab',
        title: 'Sports Injury & Functional Movement Rehab',
        price: `${sym}70`,
        description: 'Targeted myofascial release, joint mobilization, and return-to-sport neuromuscular stabilization.',
        badge: 'Athletes',
        icon: 'user',
        features: ['Functional movement screen', 'Active soft tissue release', 'Tailored rehab protocol'],
      },
    ];
  }, [clinic.customFeeItems, clinic.currencySymbol]);

  // Sync props and context state on modal open
  useEffect(() => {
    if (isOpen) {
      // Check for active logged-in patient session in portal to auto-fill details!
      try {
        const savedSession = sessionStorage.getItem('vance_patient_portal_session_v2');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed?.name || parsed?.email) {
            let matchedPhone = '';
            try {
              const allLeads = JSON.parse(localStorage.getItem('vance_leads_v1') || '[]');
              if (Array.isArray(allLeads)) {
                const match = allLeads.find(
                  (l: any) =>
                    (parsed.email && l.email?.toLowerCase() === parsed.email.toLowerCase()) ||
                    (parsed.name && l.name?.toLowerCase() === parsed.name.toLowerCase())
                );
                if (match?.phone) {
                  matchedPhone = match.phone;
                }
              }
            } catch {
              // ignore
            }

            setFormData((prev) => ({
              ...prev,
              name: prev.name || parsed.name || '',
              email: prev.email || parsed.email || '',
              phone: prev.phone || matchedPhone || '',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to prefill patient booking details from session', err);
      }

      const resolvedType = propInitialServiceType || context.bookingInitialServiceType || 'initial';
      const resolvedTitle = propInitialServiceTitle || context.bookingInitialServiceTitle || '';
      const resolvedPrice = propInitialServicePrice || context.bookingInitialServicePrice;
      const resolvedDocId = context.bookingInitialPractitionerId || '';

      setServiceType(resolvedType);

      if (resolvedDocId) {
        setSelectedPractitionerId(resolvedDocId);
        const doc = practitioners.find((p) => p.id === resolvedDocId);
        if (doc) {
          setFormData((prev) => ({
            ...prev,
            preferredPractitionerId: doc.id,
            preferredPractitionerName: doc.name,
          }));
        }
      }

      if (resolvedType === 'custom') {
        const found = customServicesList.find(
          (c) => c.title.toLowerCase() === resolvedTitle.toLowerCase() || c.id === resolvedTitle.toLowerCase()
        );
        if (found) {
          setSelectedCustomServiceId(found.id);
        } else if (customServicesList.length > 0) {
          setSelectedCustomServiceId(customServicesList[0].id);
        }
      }
    }
  }, [
    isOpen,
    propInitialServiceType,
    propInitialServiceTitle,
    propInitialServicePrice,
    context.bookingInitialServiceType,
    context.bookingInitialServiceTitle,
    context.bookingInitialServicePrice,
    context.bookingInitialPractitionerId,
    practitioners,
    customServicesList,
  ]);

  // Selected Practitioner helper
  const selectedPractitioner = practitioners.find((p) => p.id === selectedPractitionerId);

  // Dynamic doctor prompt label
  const doctorPromptLabel = selectedPractitioner
    ? selectedPractitioner.name
    : clinic.doctorName || 'our clinical team';

  // Map condition to specialist
  const getSpecialistForCondition = (cond: string) => {
    const lower = cond.toLowerCase();
    if (lower.includes('sport')) {
      return (
        practitioners.find(
          (p) => p.name.toLowerCase().includes('marcus') || p.areasOfFocus?.some((a) => a.toLowerCase().includes('sport'))
        ) || practitioners[0]
      );
    }
    if (lower.includes('neck') || lower.includes('headache')) {
      return (
        practitioners.find(
          (p) =>
            p.name.toLowerCase().includes('elena') ||
            p.areasOfFocus?.some((a) => a.toLowerCase().includes('headache') || a.toLowerCase().includes('cervical'))
        ) || practitioners[0]
      );
    }
    if (lower.includes('back')) {
      return (
        practitioners.find(
          (p) =>
            p.name.toLowerCase().includes('alistair') ||
            p.name.toLowerCase().includes('vance') ||
            p.areasOfFocus?.some((a) => a.toLowerCase().includes('lumbar') || a.toLowerCase().includes('disc'))
        ) || practitioners[0]
      );
    }
    return practitioners[0];
  };

  // Active Service details derived dynamically
  const activeServiceDetails = useMemo(() => {
    const sym = clinic.currencySymbol || '£';
    if (serviceType === 'initial') {
      return {
        type: 'initial' as const,
        id: 'initial',
        title: 'Initial Consultation & Examination',
        price: clinic.examFee || `${sym}49`,
        durationMinutes: schedulingRules.slotDurationMinutes || 45,
        badge: 'New Patient',
        description: 'Comprehensive physical examination, digital posture analysis, orthopaedic testing & customized treatment plan.',
      };
    }
    if (serviceType === 'followup') {
      return {
        type: 'followup' as const,
        id: 'followup',
        title: 'Follow-Up Adjustment & Ongoing Care',
        price: clinic.followUpFee || `${sym}35`,
        durationMinutes: 20,
        badge: 'Returning Patient',
        description: 'Targeted chiropractic spinal adjustment, kinetic joint mobilization, and subluxation alignment.',
      };
    }
    // Custom / Specialized
    const match = customServicesList.find((c) => c.id === selectedCustomServiceId) || customServicesList[0];
    return {
      type: 'custom' as const,
      id: match?.id || 'custom',
      title: match?.title || 'Specialized Chiropractic Care',
      price: match?.price || `${sym}65`,
      durationMinutes: 35,
      badge: match?.badge || 'Specialized Care',
      description: match?.description || 'Targeted clinical procedure and therapeutic modalities.',
    };
  }, [serviceType, selectedCustomServiceId, customServicesList, clinic.examFee, clinic.followUpFee, schedulingRules.slotDurationMinutes, clinic.currencySymbol]);

  // Effective payment calculation based on active service price
  const parsedActiveFeeNumber = useMemo(() => {
    const raw = parseInt(activeServiceDetails.price.replace(/[^0-9]/g, ''), 10);
    return isNaN(raw) || raw <= 0 ? defaultFullAmt : raw;
  }, [activeServiceDetails.price, defaultFullAmt]);

  const effectiveFullAmt = parsedActiveFeeNumber;
  const effectiveDepositAmt = Math.min(defaultDepositAmt, effectiveFullAmt);

  // Generate next 6 available business days respecting holiday blockers & weekly closed days
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const closedDates = schedulingRules.clinicClosedDates || [];
    const weeklySchedule = schedulingRules.weeklySchedule || defaultSchedulingRules.weeklySchedule;
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

    for (let i = 1; i <= 14 && days.length < 6; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const dayKey = dayKeys[d.getDay()];

      if (closedDates.includes(dateString)) continue;

      const dayConfig = weeklySchedule[dayKey];
      if (dayConfig && !dayConfig.enabled) continue;

      if (selectedPractitioner) {
        const docOverride = schedulingRules.practitionerOverrides?.find((o) => o.practitionerId === selectedPractitioner.id);
        if (docOverride?.isOnHoliday) continue;
        if (docOverride?.holidayDates?.includes(dateString)) continue;
        if (docOverride?.weeklyOffDays?.includes(d.getDay())) continue;
      }

      days.push({
        dateObj: d,
        dateString,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isSaturday: d.getDay() === 6,
        dayKey,
      });
    }
    return days;
  }, [schedulingRules, selectedPractitioner]);

  useEffect(() => {
    if (activeInitialCondition) {
      setFormData((prev) => ({ ...prev, condition: activeInitialCondition }));
    }
  }, [activeInitialCondition]);

  useEffect(() => {
    if (nextDays.length > 0 && (!formData.date || !nextDays.some((d) => d.dateString === formData.date))) {
      setFormData((prev) => ({ ...prev, date: nextDays[0].dateString }));
      setSelectedDayIndex(0);
    }
  }, [nextDays, formData.date]);

  const initialConditions = [
    'Back pain',
    'Neck pain',
    'Sports injury',
    'Headaches',
    'Other / General Wellness',
  ];

  const followUpCareOptions = [
    {
      title: 'Standard Spinal Adjustment & Alignment',
      subtitle: 'Targeted manipulation & subluxation correction for active treatment plan.',
      duration: '20 min',
    },
    {
      title: 'Progress Review & Periodic Re-Exam',
      subtitle: 'Comparative range-of-motion scan and updated clinical care progression.',
      duration: '30 min',
    },
    {
      title: 'Wellness & Maintenance Adjustment',
      subtitle: 'Preventative postural alignment to keep joints and nervous system functioning optimally.',
      duration: '20 min',
    },
    {
      title: 'Acute Symptom Flare-Up / Fast Relief',
      subtitle: 'Immediate joint mobilization and pain relief for sudden spasm or injury.',
      duration: '25 min',
    },
  ];

  const currentDay = nextDays[selectedDayIndex] || nextDays[0];

  // Dynamic slot generation according to working hours, lunch break, and buffer
  const allSlots = useMemo(() => {
    if (!currentDay) return [];
    const dayKey = currentDay.dayKey;
    const weeklySchedule = schedulingRules.weeklySchedule || defaultSchedulingRules.weeklySchedule;
    const dayConfig = weeklySchedule[dayKey] || {
      enabled: true,
      openTime: currentDay.isSaturday ? '09:00' : '08:30',
      closeTime: currentDay.isSaturday ? '14:00' : '18:30',
      lunchBreakEnabled: !currentDay.isSaturday,
      lunchStart: '12:30',
      lunchEnd: '13:30',
    };

    if (!dayConfig.enabled) return [];

    const slotDuration = activeServiceDetails.durationMinutes || 45;
    const bufferTime = serviceType === 'followup' ? 10 : schedulingRules.bufferTimeMinutes || 15;
    const intervalMinutes = slotDuration + bufferTime;

    const parseTimeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const formatMinutesTo12h = (totalMins: number) => {
      const h24 = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const period = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${h12}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    const startMins = parseTimeToMinutes(dayConfig.openTime || '09:00');
    const endMins = parseTimeToMinutes(dayConfig.closeTime || '17:00');
    const lunchStartMins = dayConfig.lunchBreakEnabled ? parseTimeToMinutes(dayConfig.lunchStart || '12:30') : -1;
    const lunchEndMins = dayConfig.lunchBreakEnabled ? parseTimeToMinutes(dayConfig.lunchEnd || '13:30') : -1;

    const slots: string[] = [];
    for (let cur = startMins; cur + slotDuration <= endMins; cur += intervalMinutes) {
      if (dayConfig.lunchBreakEnabled && cur >= lunchStartMins && cur < lunchEndMins) {
        continue;
      }
      slots.push(formatMinutesTo12h(cur));
    }

    if (slots.length === 0) {
      return currentDay.isSaturday
        ? ['9:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '12:30 PM']
        : ['9:00 AM', '10:00 AM', '11:15 AM', '1:45 PM', '3:00 PM', '4:15 PM', '5:00 PM'];
    }

    return slots;
  }, [currentDay, schedulingRules, activeServiceDetails.durationMinutes, serviceType]);

  // Determine taken/booked slots strictly from actual recorded leads
  const takenSlotsForDay = useMemo(() => {
    if (!currentDay) return new Set<string>();
    const taken = new Set<string>();

    try {
      const stored = localStorage.getItem('agency_patient_leads_v1');
      if (stored) {
        const leads = JSON.parse(stored);
        leads.forEach((l: { date?: string; time?: string; status?: string; practitionerId?: string }) => {
          if (l.date === currentDay.dateString && l.time && l.status !== 'archived' && l.status !== 'cancelled') {
            if (selectedPractitionerId) {
              if (l.practitionerId === selectedPractitionerId) {
                taken.add(l.time);
              }
            } else {
              taken.add(l.time);
            }
          }
        });
      }
    } catch {
      // ignore
    }

    return taken;
  }, [currentDay, step, selectedPractitionerId]);

  const handlePractitionerChange = (docId: string) => {
    setSelectedPractitionerId(docId);
    const doc = practitioners.find((p) => p.id === docId);
    setFormData((prev) => ({
      ...prev,
      preferredPractitionerId: docId,
      preferredPractitionerName: doc ? doc.name : 'First Available Practitioner',
    }));
  };

  // Step 1: Select Initial condition
  const handleConditionSelect = (cond: string) => {
    let assignedDocName = formData.preferredPractitionerName;
    let assignedDocId = formData.preferredPractitionerId;

    if (!selectedPractitionerId) {
      const spec = getSpecialistForCondition(cond);
      if (spec) {
        assignedDocName = `${spec.name} (Recommended Specialist)`;
        assignedDocId = spec.id;
      }
    }

    setFormData((prev) => ({
      ...prev,
      condition: cond,
      serviceType: 'initial',
      serviceTitle: 'Initial Consultation & Examination',
      servicePrice: activeServiceDetails.price,
      serviceDuration: activeServiceDetails.durationMinutes,
      preferredPractitionerId: assignedDocId,
      preferredPractitionerName: assignedDocName || 'First Available Practitioner',
    }));
    setStep(2);
  };

  // Step 1: Select Follow-up Reason
  const handleFollowUpSelect = (opt: { title: string; subtitle: string; duration: string }) => {
    setFormData((prev) => ({
      ...prev,
      condition: `Follow-Up: ${opt.title}`,
      serviceType: 'followup',
      serviceTitle: opt.title,
      servicePrice: activeServiceDetails.price,
      serviceDuration: 20,
      preferredPractitionerId: formData.preferredPractitionerId,
      preferredPractitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
    }));
    setStep(2);
  };

  // Step 1: Select Custom Service
  const handleCustomServiceSelect = (svc: PricingFeeItem) => {
    setSelectedCustomServiceId(svc.id);
    setFormData((prev) => ({
      ...prev,
      condition: `Specialized: ${svc.title}`,
      serviceType: 'custom',
      serviceTitle: svc.title,
      servicePrice: svc.price,
      serviceDuration: 35,
      preferredPractitionerId: formData.preferredPractitionerId,
      preferredPractitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
    }));
    setStep(2);
  };

  const handleTimeSelect = (slot: string) => {
    if (takenSlotsForDay.has(slot)) return;
    setFormData((prev) => ({
      ...prev,
      date: currentDay.dateString,
      time: slot,
      serviceType: activeServiceDetails.type,
      serviceTitle: activeServiceDetails.title,
      servicePrice: activeServiceDetails.price,
      serviceDuration: activeServiceDetails.durationMinutes,
    }));
    setStep(3);
  };

  const doctorDisplayName = selectedPractitioner
    ? selectedPractitioner.name
    : formData.preferredPractitionerName || clinic.doctorName || 'Lead Practitioner';

  // Build prefilled external URL
  const prefilledExternalUrl = useMemo(() => {
    if (!clinic.externalBookingUrl) return '';
    try {
      const url = new URL(clinic.externalBookingUrl);
      const nameParts = (formData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (formData.name) url.searchParams.set('name', formData.name);
      if (firstName) url.searchParams.set('first_name', firstName);
      if (lastName) url.searchParams.set('last_name', lastName);
      if (formData.email) url.searchParams.set('email', formData.email);
      if (formData.phone) url.searchParams.set('phone', formData.phone);
      if (formData.condition) {
        url.searchParams.set('condition', formData.condition);
        url.searchParams.set('a1', formData.condition);
      }
      return url.toString();
    } catch {
      const params = new URLSearchParams();
      if (formData.name) params.set('name', formData.name);
      if (formData.email) params.set('email', formData.email);
      if (formData.phone) params.set('phone', formData.phone);
      if (formData.condition) params.set('condition', formData.condition);
      const q = params.toString();
      return clinic.externalBookingUrl.includes('?')
        ? `${clinic.externalBookingUrl}&${q}`
        : `${clinic.externalBookingUrl}?${q}`;
    }
  }, [clinic.externalBookingUrl, formData]);

  const handleSubmitStep3 = (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      console.warn('Bot submission blocked via honeypot');
      setStep(isPaymentEnabled ? 5 : 4);
      return;
    }

    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill in your name, phone number, and email.');
      return;
    }

    if (!cardHolder) {
      setCardHolder(formData.name);
    }

    if (isPaymentEnabled) {
      if (!createdBookingRefId) {
        const saved = saveLead({
          source: 'booking',
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          condition: formData.condition || activeServiceDetails.title,
          serviceType: activeServiceDetails.type,
          serviceTitle: activeServiceDetails.title,
          practitionerId: formData.preferredPractitionerId,
          practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
          date: formData.date,
          time: formData.time,
          durationMinutes: activeServiceDetails.durationMinutes,
          clinicName: clinic.name,
          notes: `Booking slot selected. Pending payment authorization. Service: ${activeServiceDetails.title}. Slot: ${formData.date} at ${formData.time}.`,
          status: 'new',
          paymentStatus: 'unpaid',
        });
        setCreatedBookingRefId(saved.id);
      }
      setStep(4);
    } else {
      // Direct booking without payment
      const saved = saveLead({
        source: 'booking',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        condition: formData.condition || activeServiceDetails.title,
        serviceType: activeServiceDetails.type,
        serviceTitle: activeServiceDetails.title,
        practitionerId: formData.preferredPractitionerId,
        practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
        date: formData.date,
        time: formData.time,
        durationMinutes: activeServiceDetails.durationMinutes,
        clinicName: clinic.name,
        notes: `Service: ${activeServiceDetails.title} (${activeServiceDetails.price}, ${activeServiceDetails.durationMinutes} min). Practitioner: ${formData.preferredPractitionerName || 'First Available'}. Slot: ${formData.date} at ${formData.time}. ${formData.notes || ''}`,
        status: 'new',
        paymentStatus: 'unpaid',
      });
      setCreatedBookingRefId(saved.id);
      setStep(4);
    }
  };

  const handleStripePaymentSuccess = (details: {
    paymentIntentId: string;
    status: string;
    amount: number;
    last4?: string;
    brand?: string;
  }) => {
    const statusMap = {
      deposit: 'deposit_paid' as const,
      full: 'paid_full' as const,
      card_hold: 'card_hold' as const,
      pay_at_clinic: 'unpaid' as const,
    };

    const paymentDetail = {
      status: statusMap[paymentChoice],
      amount: `${currency}${details.amount}.00`,
      method: 'card' as const,
      last4: details.last4 || '••••',
      brand: details.brand || 'Verified Stripe Card',
      transactionId: details.paymentIntentId,
    };

    setConfirmedPaymentDetails(paymentDetail);

    // Save lead with full payment & multi-service tracking
    const saved = saveLead({
      source: 'booking',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      condition: formData.condition || activeServiceDetails.title,
      serviceType: activeServiceDetails.type,
      serviceTitle: activeServiceDetails.title,
      practitionerId: formData.preferredPractitionerId,
      practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
      date: formData.date,
      time: formData.time,
      durationMinutes: activeServiceDetails.durationMinutes,
      clinicName: clinic.name,
      notes: `Stripe Payment ID: ${details.paymentIntentId}. Amount: ${currency}${details.amount}.00 (${paymentChoice}). Status: ${details.status}. Service: ${activeServiceDetails.title}`,
      status: 'confirmed',
      paymentStatus: statusMap[paymentChoice],
      paymentAmount: `${currency}${details.amount}.00`,
      paymentMethod: 'card',
      transactionId: details.paymentIntentId,
    });

    setCreatedBookingRefId(saved.id);
    setStep(isPaymentEnabled ? 5 : 4);
  };

  const handleTriggerWallet = (wallet: 'apple_pay' | 'google_pay') => {
    setActiveWalletModal(wallet);
  };

  const handleExecutePayment = (method: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash' = 'card') => {
    if (method === 'card' && paymentChoice !== 'pay_at_clinic') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        alert('Please enter a valid 16-digit card number (or click "Autofill Demo Card").');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        alert('Please enter expiration date (MM/YY).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        alert('Please enter the 3 or 4 digit security CVC code.');
        return;
      }
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setActiveWalletModal(null);

      const cleanNum = cardNumber.replace(/\s+/g, '');
      const last4 = method === 'apple_pay' ? '8812' : method === 'google_pay' ? '4119' : cleanNum.slice(-4) || '4242';
      const brand = method === 'apple_pay' ? 'Apple Pay' : method === 'google_pay' ? 'Google Pay' : detectedBrand;
      const txId = `tx_${method === 'card' ? 'ch' : method}_${Math.random().toString(36).substring(2, 9)}`;

      const statusMap = {
        deposit: 'deposit_paid' as const,
        full: 'paid_full' as const,
        card_hold: 'card_hold' as const,
        pay_at_clinic: 'unpaid' as const,
      };

      const amtMap = {
        deposit: `${currency}${effectiveDepositAmt}.00`,
        full: `${currency}${effectiveFullAmt}.00`,
        card_hold: `${currency}0.00 (Hold)`,
        pay_at_clinic: `${currency}0.00 (Pay on arrival)`,
      };

      const paymentDetail = {
        status: statusMap[paymentChoice],
        amount: amtMap[paymentChoice],
        method,
        last4,
        brand,
        transactionId: txId,
      };

      setConfirmedPaymentDetails(paymentDetail);

      // Save lead with full payment & multi-service tracking
      const saved = saveLead({
        source: 'booking',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        condition: formData.condition || activeServiceDetails.title,
        serviceType: activeServiceDetails.type,
        serviceTitle: activeServiceDetails.title,
        practitionerId: formData.preferredPractitionerId,
        practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
        date: formData.date,
        time: formData.time,
        durationMinutes: activeServiceDetails.durationMinutes,
        clinicName: clinic.name,
        notes: `Service: ${activeServiceDetails.title} (${activeServiceDetails.price}). Practitioner: ${formData.preferredPractitionerName || 'First Available'}. Slot: ${formData.date} at ${formData.time}. [Payment: ${paymentDetail.status.toUpperCase()} via ${brand} ending in ${last4}, Amount: ${paymentDetail.amount}, Ref: ${txId}]. ${formData.notes || ''}`,
        status: 'new',
        paymentStatus: paymentDetail.status,
        paymentAmount: paymentDetail.amount,
        paymentMethod: method,
        cardLast4: last4,
        cardBrand: brand,
        transactionId: txId,
        noShowProtected: paymentChoice !== 'pay_at_clinic',
      });
      setCreatedBookingRefId(saved.id);

      setStep(5);
    }, 1100);
  };

  const resetAndClose = () => {
    setStep(1);
    setServiceType('initial');
    setSelectedCustomServiceId('');
    setSelectedPractitionerId('');
    setFormData({
      condition: activeInitialCondition,
      serviceType: 'initial',
      serviceTitle: 'Initial Consultation & Examination',
      preferredPractitionerId: '',
      preferredPractitionerName: 'First Available Practitioner',
      date: '',
      time: '',
      name: '',
      phone: '',
      email: '',
      notes: '',
    });
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardZip('');
    setCardHolder('');
    setConfirmedPaymentDetails(null);
    onClose();
  };

  const [activeViewMode, setActiveViewMode] = useState<'flow' | 'iframe'>(
    clinic.bookingEmbedMode === 'iframe' && clinic.externalBookingUrl ? 'iframe' : 'flow'
  );

  useEffect(() => {
    if (isOpen) {
      setActiveViewMode(clinic.bookingEmbedMode === 'iframe' && clinic.externalBookingUrl ? 'iframe' : 'flow');
    }
  }, [isOpen, clinic.bookingEmbedMode, clinic.externalBookingUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-white rounded-2xl shadow-2xl border border-stone-200 w-full overflow-hidden flex flex-col max-h-[92vh] ${
              activeViewMode === 'iframe' ? 'max-w-3xl h-[85vh]' : 'max-w-lg'
            }`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                  {activeViewMode === 'iframe'
                    ? 'Integrated Live Schedule'
                    : (step === 5 || (!isPaymentEnabled && step === 4))
                    ? 'Appointment Guaranteed'
                    : `Step ${step} of ${totalSteps}`}
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900 leading-tight">
                  {activeViewMode === 'iframe'
                    ? `Book with ${doctorDisplayName}`
                    : step === 1
                    ? 'Select your appointment'
                    : step === 2
                    ? 'Choose a date & time'
                    : step === 3
                    ? 'Your details'
                    : step === 4 && isPaymentEnabled
                    ? 'Secure your appointment'
                    : 'Request Confirmed'}
                </h2>
                <p className="text-xs text-stone-500">
                  {activeViewMode === 'iframe'
                    ? 'Select your appointment type and slot below'
                    : step === 1
                    ? 'Initial exam, routine follow-up, or specialized care'
                    : step === 4 && isPaymentEnabled
                    ? 'Upfront slot protection to eliminate no-shows'
                    : (step === 5 || (!isPaymentEnabled && step === 4))
                    ? 'Your appointment has been registered with our front desk'
                    : 'Online appointment request'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeViewMode === 'iframe' && clinic.externalBookingUrl && (
                  <a
                    href={clinic.externalBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new window"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors text-xs font-medium"
                  >
                    ↗ New Window
                  </a>
                )}
                <button
                  onClick={resetAndClose}
                  aria-label="Close booking modal"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IFRAME EMBED VIEW */}
            {activeViewMode === 'iframe' && clinic.externalBookingUrl ? (
              <div className="flex-1 flex flex-col overflow-hidden relative bg-stone-50">
                <iframe
                  src={clinic.externalBookingUrl}
                  title={`${clinic.name} Online Booking Calendar`}
                  className="w-full h-full flex-1 border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
                <div className="p-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                  <span>Having trouble with the calendar?</span>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('flow')}
                    className="font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Switch to Quick Request Form →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                {step < (isPaymentEnabled ? 5 : 4) && (
                  <div className="w-full bg-stone-100 h-1">
                    <div
                      className="bg-emerald-700 h-1 transition-all duration-300"
                      style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                  </div>
                )}

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                  {/* STEP 1: Service Type Switcher + Dynamic Practitioner & Service Sub-Triage */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Optional Preferred Practitioner Dropdown */}
                      <div className="space-y-1.5 pb-2 border-b border-stone-200">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                          <span>Preferred Practitioner (Optional)</span>
                          <span className="text-[10px] text-stone-400 font-normal">Auto-assigned if blank</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                          <select
                            value={selectedPractitionerId}
                            onChange={(e) => handlePractitionerChange(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 bg-white font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                          >
                            <option value="">First Available Practitioner (Fastest)</option>
                            {practitioners.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} — {doc.role}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 3-Way Service Segmented Control */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          Select Service Category
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                          <button
                            type="button"
                            onClick={() => setServiceType('initial')}
                            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              serviceType === 'initial'
                                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>New Patient</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceType('followup')}
                            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              serviceType === 'followup'
                                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>Follow-Up</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServiceType('custom');
                              if (!selectedCustomServiceId && customServicesList.length > 0) {
                                setSelectedCustomServiceId(customServicesList[0].id);
                              }
                            }}
                            className={`py-2 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                              serviceType === 'custom'
                                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Specialized</span>
                          </button>
                        </div>
                      </div>

                      {/* --- TAB A: INITIAL VISIT & SYMPTOM TRIAGE --- */}
                      {serviceType === 'initial' && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs text-stone-600">
                            <span>What primary issue should {doctorPromptLabel} evaluate?</span>
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                              {clinic.examFee || `${currency}49`} (45 min)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {initialConditions.map((cond) => {
                              const isSelected = formData.condition === cond;
                              return (
                                <button
                                  key={cond}
                                  type="button"
                                  onClick={() => handleConditionSelect(cond)}
                                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-800'
                                      : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-800'
                                  }`}
                                >
                                  <div>
                                    <span className="text-base font-serif block">{cond}</span>
                                    {!selectedPractitionerId && (
                                      <span className="text-[11px] font-normal text-stone-500">
                                        Specialist: {getSpecialistForCondition(cond)?.name}
                                      </span>
                                    )}
                                  </div>
                                  <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-emerald-800' : 'text-stone-400'}`} />
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-stone-700">
                            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              <strong>New Patient Guarantee:</strong> Comprehensive exam, neurological testing, and first visit care plan included.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* --- TAB B: FOLLOW-UP / RETURNING PATIENT --- */}
                      {serviceType === 'followup' && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs text-stone-600">
                            <span>Select the focus for your follow-up visit:</span>
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                              {clinic.followUpFee || `${currency}35`} (20 min)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {followUpCareOptions.map((opt) => (
                              <button
                                key={opt.title}
                                type="button"
                                onClick={() => handleFollowUpSelect(opt)}
                                className="w-full text-left p-3.5 rounded-xl border border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/50 text-stone-800 transition-all cursor-pointer flex items-center justify-between group"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-serif font-bold text-stone-900 group-hover:text-emerald-950">
                                      {opt.title}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                      {opt.duration}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 line-clamp-1">{opt.subtitle}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 shrink-0 ml-2" />
                              </button>
                            ))}
                          </div>

                          <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-700">
                            <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              <strong>Returning Patient Fast-Track:</strong> Streamlined scheduling for existing care plans & tune-ups.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* --- TAB C: CUSTOM / SPECIALIZED THERAPIES --- */}
                      {serviceType === 'custom' && (
                        <div className="space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs text-stone-600">
                            <span>Select specialized therapy or advanced clinical procedure:</span>
                            <span className="text-[11px] text-stone-400 font-medium">Fixed Transparent Fees</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {customServicesList.map((svc) => {
                              const isSelected = selectedCustomServiceId === svc.id;
                              return (
                                <button
                                  key={svc.id}
                                  type="button"
                                  onClick={() => handleCustomServiceSelect(svc)}
                                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between group ${
                                    isSelected
                                      ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800 text-stone-900'
                                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                                  }`}
                                >
                                  <div className="space-y-1 flex-1 pr-2">
                                    <div className="flex items-center gap-2">
                                      {svc.badge && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-900 text-white px-1.5 py-0.5 rounded">
                                          {svc.badge}
                                        </span>
                                      )}
                                      <span className="text-sm font-serif font-bold text-stone-900">
                                        {svc.title}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                                      {svc.description}
                                    </p>
                                    <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-stone-500">
                                      <span className="text-emerald-800 font-bold text-xs">{svc.price}</span>
                                      <span>•</span>
                                      <span>35-45 min session</span>
                                    </div>
                                  </div>
                                  <ArrowRight className={`w-4 h-4 mt-1 ${isSelected ? 'text-emerald-800' : 'text-stone-400'}`} />
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              Can be combined with your standard chiropractic adjustments upon clinical review.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: Choose a time */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {/* Active service badge */}
                      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Selected Service
                          </span>
                          <p className="font-serif font-bold text-stone-900 text-sm">
                            {activeServiceDetails.title}
                          </p>
                          <span className="text-[11px] text-stone-600">
                            Doctor: {formData.preferredPractitionerName || 'First Available'} • Duration: {activeServiceDetails.durationMinutes} min
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-emerald-900 font-serif">
                            {activeServiceDetails.price}
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="block text-[10px] font-semibold text-emerald-800 hover:underline cursor-pointer mt-0.5"
                          >
                            Change service
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-stone-600 font-medium">
                          Select an upcoming date and time slot:
                        </p>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Back</span>
                        </button>
                      </div>

                      {/* Day horizontal picker */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {nextDays.map((day, idx) => {
                          const isSelected = selectedDayIndex === idx;
                          return (
                            <button
                              key={day.dateString}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-800 bg-emerald-900 text-white shadow-sm'
                                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                              }`}
                            >
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                                {day.dayName}
                              </span>
                              <span className="text-lg font-serif font-bold my-0.5">
                                {day.dayNumber}
                              </span>
                              <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                                {day.monthName}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Time slots for selected day */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
                            Openings for {currentDay?.dayName}, {currentDay?.monthName} {currentDay?.dayNumber}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] text-stone-500">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span>Available</span>
                            </span>
                            {takenSlotsForDay.size > 0 && (
                              <span className="inline-flex items-center gap-1 text-stone-400">
                                <span className="w-2 h-2 rounded-full bg-stone-300" />
                                <span>Booked</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                          {allSlots.map((slot) => {
                            const isTaken = takenSlotsForDay.has(slot);
                            const isSelected = formData.time === slot && formData.date === currentDay?.dateString;

                            if (isTaken) {
                              return (
                                <div
                                  key={slot}
                                  title="This slot is already booked"
                                  className="py-2.5 px-3 rounded-lg border border-stone-200/70 bg-stone-100/80 text-stone-400 text-xs sm:text-sm font-medium text-center flex items-center justify-between cursor-not-allowed select-none opacity-60"
                                >
                                  <span className="line-through">{slot}</span>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-200/80 px-1.5 py-0.5 rounded">
                                    Booked
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSelect(slot)}
                                className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-800 bg-emerald-800 text-white shadow-sm'
                                    : 'border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/60 text-stone-800'
                                }`}
                              >
                                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`} />
                                <span>{slot}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 text-center italic pt-1">
                        Need a specific time not shown? Call us directly at {clinic.phone}.
                      </p>
                    </div>
                  )}

                  {/* STEP 3: Your details + Summary with Quick Change links */}
                  {step === 3 && (
                    <form onSubmit={handleSubmitStep3} className="space-y-4">
                      {/* Summary with Quick "Change" links */}
                      <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
                        <div className="flex items-center justify-between">
                          <span>
                            Service: <strong className="text-stone-900">{activeServiceDetails.title} ({activeServiceDetails.price})</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                          >
                            Change service
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            Focus / Reason: <strong className="text-stone-900">{formData.condition}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                          >
                            Change focus
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            Practitioner: <strong className="text-stone-900">{formData.preferredPractitionerName || 'First Available'}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                          >
                            Change doctor
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            Time: <strong className="text-emerald-800 font-bold">{formData.date} at {formData.time}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                          >
                            Change time
                          </button>
                        </div>
                      </div>

                      {/* Honeypot field for bot spam prevention */}
                      <input
                        type="text"
                        name="b_website_hp"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden opacity-0 pointer-events-none absolute"
                      />

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (!cardHolder) setCardHolder(e.target.value);
                            }}
                            className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                            <input
                              type="tel"
                              required
                              placeholder="(614) 000-0000"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                            <input
                              type="email"
                              required
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Anything we should know? (Optional)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe symptoms, duration of pain, past treatments, or imaging..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full p-3 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          id="submit-booking-request-btn"
                          className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm tracking-wide rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>
                            {isPaymentEnabled
                              ? `Continue to Slot Protection (${currency}${paymentChoice === 'full' ? effectiveFullAmt : effectiveDepositAmt})`
                              : `Request Appointment (${activeServiceDetails.price})`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-stone-500 text-center mt-2.5 leading-snug">
                          {isPaymentEnabled
                            ? `Secures Dr. ${doctorDisplayName.split(' ')[1] || 'Vance'}'s suite. 100% refundable with ${cancelNotice}h notice.`
                            : `You will receive an instant confirmation once registered.`}
                        </p>
                      </div>

                      <p className="text-[11px] text-stone-400 text-center">
                        Patient information is handled with strict clinical confidentiality.
                      </p>
                    </form>
                  )}

                  {/* STEP 4: UPFRONT PAYMENT & NO-SHOW PROTECTION */}
                  {step === 4 && isPaymentEnabled && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Appointment & Fee Banner */}
                      <div className="p-3.5 bg-stone-900 text-white rounded-xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-300">
                          <span>{activeServiceDetails.title} ({activeServiceDetails.durationMinutes} min)</span>
                          <span className="font-semibold text-white">{activeServiceDetails.price}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-stone-700">
                          <div>
                            <span className="text-xs font-medium text-emerald-400 block">
                              {formData.date} at {formData.time}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              With {formData.preferredPractitionerName || clinic.doctorName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                              Due Now
                            </span>
                            <span className="text-lg font-bold text-emerald-400 font-serif">
                              {paymentChoice === 'card_hold' || paymentChoice === 'pay_at_clinic'
                                ? `${currency}0.00`
                                : paymentChoice === 'full'
                                ? `${currency}${effectiveFullAmt}.00`
                                : `${currency}${effectiveDepositAmt}.00`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Mode Selector Tabs */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          Choose How to Secure Your Slot
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Option 1: Deposit */}
                          <button
                            type="button"
                            onClick={() => setPaymentChoice('deposit')}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                              paymentChoice === 'deposit'
                                ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-800 text-white">
                              Recommended
                            </span>
                            <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{currency}{effectiveDepositAmt} Deposit</span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              Locks in your slot. Remaining {currency}{Math.max(0, effectiveFullAmt - effectiveDepositAmt)} payable on visit day.
                            </p>
                          </button>

                          {/* Option 2: Card Hold Guarantee */}
                          <button
                            type="button"
                            onClick={() => setPaymentChoice('card_hold')}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              paymentChoice === 'card_hold'
                                ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                              <span>{currency}0 Today (Card Hold)</span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              Card kept on file. Billed {currency}{noShowFee} only if you no-show without {cancelNotice}h notice.
                            </p>
                          </button>

                          {/* Option 3: Full Pre-payment */}
                          <button
                            type="button"
                            onClick={() => setPaymentChoice('full')}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              paymentChoice === 'full'
                                ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>{currency}{effectiveFullAmt} Pre-pay in Full</span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              Fast-track check-in. Zero checkout paperwork or delay after treatment.
                            </p>
                          </button>

                          {/* Option 4: Pay at Clinic */}
                          {paymentPolicy.allowPayAtClinic && (
                            <button
                              type="button"
                              onClick={() => setPaymentChoice('pay_at_clinic')}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                paymentChoice === 'pay_at_clinic'
                                  ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                                  : 'border-stone-200 hover:border-stone-300 bg-white'
                              }`}
                            >
                              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-stone-600" />
                                <span>Pay on Arrival</span>
                              </div>
                              <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                                Pay {currency}{effectiveFullAmt} at reception. Requires phone verification.
                              </p>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PAYMENT GATEWAY SELECTION & MODE */}
                      {paymentChoice !== 'pay_at_clinic' && (
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setElementsFallbackNotice(null);
                                setCheckoutMode('elements');
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                checkoutMode === 'elements'
                                  ? 'bg-emerald-800 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Stripe Elements (Live)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCheckoutMode('simulator')}
                              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                checkoutMode === 'simulator'
                                  ? 'bg-stone-800 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Demo Simulator</span>
                            </button>
                          </div>

                          {elementsFallbackNotice && checkoutMode === 'simulator' && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>{elementsFallbackNotice}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* STRIPE ELEMENTS (LIVE) */}
                      {paymentChoice !== 'pay_at_clinic' && checkoutMode === 'elements' ? (
                        <div className="pt-1">
                          <StripeElementsCheckout
                            clinicId={clinic.id || 'clinic_apex_columbus'}
                            appointmentId={createdBookingRefId || `appt_${Date.now()}`}
                            amount={paymentChoice === 'full' ? effectiveFullAmt : effectiveDepositAmt}
                            currencySymbol={currency}
                            paymentChoice={paymentChoice}
                            patientEmail={formData.email}
                            patientName={formData.name}
                            serviceTitle={activeServiceDetails.title}
                            onSuccess={handleStripePaymentSuccess}
                            onFallbackToDemo={(reason) => {
                              if (reason) setElementsFallbackNotice(reason);
                              setCheckoutMode('simulator');
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          {/* EXPRESS PAYMENT: Apple Pay / Google Pay */}
                          {paymentChoice !== 'pay_at_clinic' && (
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  disabled={isProcessingPayment}
                                  onClick={() => handleTriggerWallet('apple_pay')}
                                  className="py-2.5 px-3 bg-black hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                                >
                                  <span className="text-sm"></span>
                                  <span>Pay</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessingPayment}
                                  onClick={() => handleTriggerWallet('google_pay')}
                                  className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                                >
                                  <span className="text-xs font-black text-blue-600">G</span>
                                  <span className="text-xs font-bold text-stone-700">Pay</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-stone-400">
                                <div className="h-px bg-stone-200 flex-1" />
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                                  or pay with simulated card
                                </span>
                                <div className="h-px bg-stone-200 flex-1" />
                              </div>
                            </div>
                          )}

                          {/* SIMULATED CARD DETAILS FORM */}
                          {paymentChoice !== 'pay_at_clinic' ? (
                            <div className="p-3.5 bg-stone-50/90 rounded-xl border border-stone-200 space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                                    Card Number
                                  </label>
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                                    <Lock className="w-3 h-3 text-emerald-700" />
                                    <span>Demo Sandbox</span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                                  <input
                                    type="text"
                                    placeholder="4242 •••• •••• 4242"
                                    value={cardNumber}
                                    onChange={(e) => handleCardNumberChange(e.target.value)}
                                    maxLength={19}
                                    className="w-full pl-9 pr-16 py-2.5 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm font-mono tracking-wider focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                                  />
                                  <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 border border-stone-200">
                                    {detectedBrand}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                    Expiry
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => handleExpiryChange(e.target.value)}
                                    maxLength={5}
                                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-center focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                    CVC / CVV
                                  </label>
                                  <input
                                    type="password"
                                    placeholder="123"
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-center focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                    Postcode / Zip
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="W1U 8ED"
                                    value={cardZip}
                                    onChange={(e) => setCardZip(e.target.value.toUpperCase().slice(0, 10))}
                                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-center focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={fillDemoCard}
                                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                                >
                                  ⚡ Autofill Demo Card
                                </button>
                                <span className="text-[10px] text-stone-400">
                                  Descriptor: {paymentPolicy.statementDescriptor || clinic.name || 'VANCE HEALTH'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-700" />
                                <span>Pay on Arrival Policy</span>
                              </p>
                              <p className="text-[11px] text-amber-800 leading-snug">
                                No upfront card charge today. Full fee of {currency}{effectiveFullAmt} will be payable at the reception desk upon check-in.
                              </p>
                            </div>
                          )}

                          {/* Payment Action Button */}
                          <div className="pt-2">
                            <button
                              type="button"
                              disabled={isProcessingPayment}
                              onClick={() => handleExecutePayment('card')}
                              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm tracking-wide rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {isProcessingPayment ? (
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Simulating Payment...</span>
                                </div>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  <span>
                                    {paymentChoice === 'full'
                                      ? `Pay ${currency}${effectiveFullAmt}.00 & Confirm Slot`
                                      : paymentChoice === 'deposit'
                                      ? `Pay ${currency}${effectiveDepositAmt}.00 Deposit & Confirm`
                                      : paymentChoice === 'card_hold'
                                      ? 'Authorize Card Hold & Guarantee Slot'
                                      : 'Confirm Booking (Pay on Arrival)'}
                                  </span>
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-stone-500 text-center mt-2">
                              Demo simulator mode. 100% refundable with {cancelNotice} hours cancellation notice.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* STEP 5 / DIRECT 4: CONFIRMATION RECEIPT & NEXT STEPS */}
                  {((step === 5) || (!isPaymentEnabled && step === 4)) && (
                    <div className="space-y-4 text-center animate-fadeIn">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <Check className="w-8 h-8 stroke-[2.5]" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-serif font-bold text-stone-900">
                          Your Appointment is Reserved!
                        </h3>
                        <p className="text-xs text-stone-600 max-w-sm mx-auto">
                          Thank you, <strong className="text-stone-900">{formData.name}</strong>. A clinical calendar hold has been created.
                        </p>
                      </div>

                      {/* Secure Clinical Reference Passkey Badge */}
                      <div className="p-4 bg-stone-900 text-white rounded-2xl text-left space-y-2 border border-stone-800 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Your Unique Patient Passkey
                          </span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Save This Key
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                          <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wider">
                            {createdBookingRefId || 'VH-9428-K82X'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(createdBookingRefId || 'VH-9428-K82X');
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer flex items-center gap-1 transition"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                            <span>{copiedKey ? 'Copied ✓' : 'Copy Key'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          Use this unguessable reference passkey to log into your <strong>Patient Portal</strong>, print medical insurance receipts, or reschedule online.
                        </p>
                      </div>

                      {/* Payment receipt badge */}
                      {confirmedPaymentDetails && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-emerald-950">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-700" />
                              <span>
                                {confirmedPaymentDetails.status === 'deposit_paid'
                                  ? `Deposit Received: ${confirmedPaymentDetails.amount}`
                                  : confirmedPaymentDetails.status === 'card_hold'
                                  ? 'Card Hold Guarantee Active'
                                  : confirmedPaymentDetails.status === 'paid_full'
                                  ? `Paid in Full: ${confirmedPaymentDetails.amount}`
                                  : 'Pay on Arrival'}
                              </span>
                            </span>
                            <span className="text-[10px] text-emerald-800 font-mono">
                              Ref: {confirmedPaymentDetails.transactionId}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-stone-600 text-[11px]">
                            <span>Method: {confirmedPaymentDetails.brand} (•••• {confirmedPaymentDetails.last4})</span>
                            <span>
                              {confirmedPaymentDetails.status === 'deposit_paid'
                                ? `Balance due on visit: ${currency}${Math.max(0, effectiveFullAmt - effectiveDepositAmt)}.00`
                                : confirmedPaymentDetails.status === 'card_hold'
                                ? `${currency}0.00 charged today`
                                : 'All set!'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Appointment summary recap */}
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-left space-y-1.5 text-xs text-stone-700">
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Patient:</span>
                          <span className="font-semibold text-stone-900">{formData.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Service:</span>
                          <span className="font-semibold text-stone-900">{activeServiceDetails.title}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Practitioner:</span>
                          <span className="font-semibold text-stone-900">{formData.preferredPractitionerName || 'First Available'}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Reserved Time:</span>
                          <span className="font-semibold text-emerald-800">{formData.date} at {formData.time} ({activeServiceDetails.durationMinutes} min)</span>
                        </div>
                        <div className="flex justify-between pt-0.5 text-emerald-800 font-medium">
                          <span>Consultation Rate:</span>
                          <span>{activeServiceDetails.price}</span>
                        </div>
                      </div>

                      {/* Expectation Timeline: "What Happens Next" */}
                      <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-left space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>What Happens Next</span>
                        </div>
                        <div className="space-y-2.5 text-xs text-stone-700">
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              1
                            </div>
                            <div>
                              <strong className="text-stone-900 font-semibold block text-xs">
                                Slot Guaranteed & Receipt Dispatched
                              </strong>
                              <span className="text-stone-600 text-[11px] leading-tight">
                                Your appointment is reserved in our clinical schedule. Confirmation dispatched to {formData.email}.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              2
                            </div>
                            <div>
                              <strong className="text-stone-900 font-semibold block text-xs">
                                Clinical Chart Preparation
                              </strong>
                              <span className="text-stone-600 text-[11px] leading-tight">
                                Our receptionist prepares treatment room equipment and clinical chart notes for your session.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              3
                            </div>
                            <div>
                              <strong className="text-stone-900 font-semibold block text-xs">
                                Digital Intake Form Sent to Your Phone
                              </strong>
                              <span className="text-stone-600 text-[11px] leading-tight">
                                Complete your health questionnaire on your phone beforehand to skip waiting room clipboard delays.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const lookupVal = createdBookingRefId || 'VH-9428-K82X';
                            resetAndClose();
                            context.openPatientPortal(lookupVal);
                          }}
                          className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                        >
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>View Itinerary & Insurance Receipt in Patient Portal</span>
                        </button>

                        {prefilledExternalUrl ? (
                          <a
                            href={prefilledExternalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={resetAndClose}
                            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <span>Proceed to Live Diary with Pre-filled Info</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : null}

                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button
                            onClick={resetAndClose}
                            className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Done
                          </button>
                          <a
                            href={`tel:${clinic.phoneRaw || clinic.phone}`}
                            className="flex-1 py-2.5 px-4 border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-4 h-4 text-emerald-700" />
                            <span>Call Front Desk</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
