import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo, BookingFormData, PublicTeamMember, ClinicSchedulingRules } from '../types';
import { useClinic } from '../data/ClinicContext';
import { saveLead } from '../data/leadsStore';
import { defaultPublicTeamMembers } from '../data/defaultTeamData';
import { defaultSchedulingRules, defaultPaymentPolicy } from '../data/clinicData';

interface BookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  clinic?: ClinicInfo;
  initialCondition?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  clinic: propClinic,
  initialCondition: propInitialCondition,
}) => {
  const context = useClinic();
  const clinic = propClinic || context.clinicData;
  const isOpen = propIsOpen !== undefined ? propIsOpen : context.isBookingModalOpen;
  const onClose = propOnClose || context.closeBookingModal;
  const activeInitialCondition = propInitialCondition || context.bookingInitialCondition || 'Back pain';

  const [step, setStep] = useState<number>(1);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');

  const [formData, setFormData] = useState<BookingFormData>({
    condition: activeInitialCondition,
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
  const depositAmt = paymentPolicy.depositAmount || 25;
  const fullAmt = paymentPolicy.fullFeeAmount || 49;
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
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState<{
    status: 'paid_full' | 'deposit_paid' | 'card_hold' | 'unpaid';
    amount: string;
    method: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash';
    last4: string;
    brand: string;
    transactionId: string;
  } | null>(null);

  const detectedBrand = React.useMemo(() => {
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
  const practitioners: PublicTeamMember[] = React.useMemo(() => {
    return clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers.filter((m) => m.showOnWebsite !== false)
      : defaultPublicTeamMembers;
  }, [clinic.publicTeamMembers]);

  // Active scheduling rules
  const schedulingRules: ClinicSchedulingRules = clinic.schedulingRules || defaultSchedulingRules;

  // Selected practitioner helper
  const selectedPractitioner = practitioners.find((p) => p.id === selectedPractitionerId);

  // Dynamic doctor display label for prompt
  const doctorPromptLabel = selectedPractitioner
    ? selectedPractitioner.name
    : clinic.doctorName || 'our clinical team';

  // Map condition to specialist
  const getSpecialistForCondition = (cond: string) => {
    const lower = cond.toLowerCase();
    if (lower.includes('sport')) {
      return practitioners.find((p) => p.name.toLowerCase().includes('marcus') || p.areasOfFocus?.some(a => a.toLowerCase().includes('sport'))) || practitioners[0];
    }
    if (lower.includes('neck') || lower.includes('headache')) {
      return practitioners.find((p) => p.name.toLowerCase().includes('elena') || p.areasOfFocus?.some(a => a.toLowerCase().includes('headache') || a.toLowerCase().includes('cervical'))) || practitioners[0];
    }
    if (lower.includes('back')) {
      return practitioners.find((p) => p.name.toLowerCase().includes('alistair') || p.name.toLowerCase().includes('vance') || p.areasOfFocus?.some(a => a.toLowerCase().includes('lumbar') || a.toLowerCase().includes('disc'))) || practitioners[0];
    }
    return practitioners[0];
  };

  const recommendedDoctor = React.useMemo(() => {
    return getSpecialistForCondition(formData.condition || activeInitialCondition);
  }, [formData.condition, activeInitialCondition, practitioners]);

  // Generate next 6 available business days respecting holiday blockers & weekly closed days
  const nextDays = React.useMemo(() => {
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

      // 1. Check if clinic is closed on this holiday
      if (closedDates.includes(dateString)) {
        continue;
      }

      // 2. Check if day of week is enabled
      const dayConfig = weeklySchedule[dayKey];
      if (dayConfig && !dayConfig.enabled) {
        continue;
      }

      // 3. If a specific doctor is selected, check if doctor is on holiday or has off day
      if (selectedPractitioner) {
        const docOverride = schedulingRules.practitionerOverrides?.find((o) => o.practitionerId === selectedPractitioner.id);
        if (docOverride?.isOnHoliday) {
          continue;
        }
        if (docOverride?.holidayDates?.includes(dateString)) {
          continue;
        }
        if (docOverride?.weeklyOffDays?.includes(d.getDay())) {
          continue;
        }
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
    if (nextDays.length > 0 && (!formData.date || !nextDays.some(d => d.dateString === formData.date))) {
      setFormData((prev) => ({ ...prev, date: nextDays[0].dateString }));
      setSelectedDayIndex(0);
    }
  }, [nextDays, formData.date]);

  const conditions = [
    'Back pain',
    'Neck pain',
    'Sports injury',
    'Headaches',
    'Other'
  ];

  const currentDay = nextDays[selectedDayIndex] || nextDays[0];

  // Dynamic slot generation according to working hours, lunch break, and buffer
  const allSlots = React.useMemo(() => {
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

    const slotDuration = schedulingRules.slotDurationMinutes || 45;
    const bufferTime = schedulingRules.bufferTimeMinutes || 15;
    const intervalMinutes = slotDuration + bufferTime; // e.g. 60 min

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
      // Check if slot overlaps lunch break
      if (dayConfig.lunchBreakEnabled && cur >= lunchStartMins && cur < lunchEndMins) {
        continue;
      }
      slots.push(formatMinutesTo12h(cur));
    }

    // Fallback if calculated slots are empty
    if (slots.length === 0) {
      return currentDay.isSaturday
        ? ['9:30 AM', '10:45 AM', '11:45 AM', '12:30 PM']
        : ['9:00 AM', '10:15 AM', '11:30 AM', '1:45 PM', '3:00 PM', '4:15 PM', '5:00 PM'];
    }

    return slots;
  }, [currentDay, schedulingRules]);

  // Determine taken/booked slots strictly from actual recorded leads
  const takenSlotsForDay = React.useMemo(() => {
    if (!currentDay) return new Set<string>();
    const taken = new Set<string>();

    try {
      const stored = localStorage.getItem('agency_patient_leads_v1');
      if (stored) {
        const leads = JSON.parse(stored);
        leads.forEach((l: { date?: string; time?: string; status?: string; practitionerId?: string }) => {
          if (l.date === currentDay.dateString && l.time && l.status !== 'archived' && l.status !== 'cancelled') {
            // If a specific doctor is picked, only mark taken if that doctor is booked
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

  const handleConditionSelect = (cond: string) => {
    let assignedDocName = formData.preferredPractitionerName;
    let assignedDocId = formData.preferredPractitionerId;

    // If no specific practitioner chosen, suggest condition specialist
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
      preferredPractitionerId: assignedDocId,
      preferredPractitionerName: assignedDocName || 'First Available Practitioner',
    }));
    setStep(2);
  };

  const handleTimeSelect = (slot: string) => {
    if (takenSlotsForDay.has(slot)) return;
    setFormData((prev) => ({
      ...prev,
      date: currentDay.dateString,
      time: slot,
    }));
    setStep(3);
  };

  const feeDisplay = clinic.examFee || (clinic.currencySymbol === '£' ? '£45' : '$49');

  const doctorDisplayName = selectedPractitioner
    ? selectedPractitioner.name
    : formData.preferredPractitionerName || clinic.doctorName || 'Lead Practitioner';

  // Build prefilled external URL for JaneApp / Calendly / Acuity / Cliniko
  const prefilledExternalUrl = React.useMemo(() => {
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

    // Spam Honeypot Check: if bot filled this hidden field, silently reject
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
      setStep(4);
    } else {
      // Direct booking without payment
      saveLead({
        source: 'booking',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        condition: formData.condition || 'Chiropractic Initial Exam',
        practitionerId: formData.preferredPractitionerId,
        practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
        date: formData.date,
        time: formData.time,
        durationMinutes: schedulingRules.slotDurationMinutes || 45,
        clinicName: clinic.name,
        notes: `Requested: Initial Consultation (${feeDisplay}). Practitioner: ${formData.preferredPractitionerName || 'First Available'}. Slot: ${formData.date} at ${formData.time}. ${formData.notes || ''}`,
        status: 'new',
        paymentStatus: 'unpaid',
      });
      setStep(4);
    }
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
        deposit: `${currency}${depositAmt}.00`,
        full: `${currency}${fullAmt}.00`,
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

      // Save lead with full payment tracking!
      saveLead({
        source: 'booking',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        condition: formData.condition || 'Chiropractic Initial Exam',
        practitionerId: formData.preferredPractitionerId,
        practitionerName: formData.preferredPractitionerName || 'First Available Practitioner',
        date: formData.date,
        time: formData.time,
        durationMinutes: schedulingRules.slotDurationMinutes || 45,
        clinicName: clinic.name,
        notes: `Initial Exam (${feeDisplay}). Practitioner: ${formData.preferredPractitionerName || 'First Available'}. Slot: ${formData.date} at ${formData.time}. [Payment: ${paymentDetail.status.toUpperCase()} via ${brand} ending in ${last4}, Amount: ${paymentDetail.amount}, Ref: ${txId}]. ${formData.notes || ''}`,
        status: 'new',
        paymentStatus: paymentDetail.status,
        paymentAmount: paymentDetail.amount,
        paymentMethod: method,
        cardLast4: last4,
        cardBrand: brand,
        transactionId: txId,
        noShowProtected: paymentChoice !== 'pay_at_clinic',
      });

      setStep(5);
    }, 1100);
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPractitionerId('');
    setFormData({
      condition: activeInitialCondition,
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
                    ? 'What brings you in?'
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
                {step < 4 && (
                  <div className="w-full bg-stone-100 h-1">
                    <div
                      className="bg-emerald-700 h-1 transition-all duration-300"
                      style={{ width: `${(step / 3) * 100}%` }}
                    />
                  </div>
                )}

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                  {/* STEP 1: What brings you in? & Dynamic Doctor Selection */}
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

                      {/* Dynamic evaluation copy */}
                      <p className="text-sm text-stone-600">
                        Select the primary issue you'd like {doctorPromptLabel} to evaluate:
                      </p>

                      <div className="grid grid-cols-1 gap-2.5 pt-1">
                        {conditions.map((cond) => {
                          const isSelected = formData.condition === cond;
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => handleConditionSelect(cond)}
                              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
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

                      {/* Offer reminder */}
                      <div className="mt-4 p-3 rounded-lg bg-stone-100 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          <strong>New Patient Rate:</strong> {feeDisplay} initial consultation & assessment.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose a time */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-stone-600">
                            Select an upcoming day and preferred time slot:
                          </p>
                          <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                            Practitioner: {formData.preferredPractitionerName || 'First Available Practitioner'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
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

                      <p className="text-[11px] text-stone-500 text-center italic">
                        Need a specific time not shown? Call us directly at {clinic.phone}.
                      </p>
                    </div>
                  )}

                  {/* STEP 3: Your details + Change Links + Honeypot + Advance to Payment or Direct Booking */}
                  {step === 3 && (
                    <form onSubmit={handleSubmitStep3} className="space-y-4">
                      {/* Summary with Quick "Change" links for Reason, Doctor, and Time */}
                      <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
                        <div className="flex items-center justify-between">
                          <span>
                            Reason: <strong className="text-stone-900">{formData.condition}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                          >
                            Change reason
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            Doctor: <strong className="text-stone-900">{formData.preferredPractitionerName || 'First Available'}</strong>
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
                          placeholder="Describe your symptoms, how long you've felt pain, or any past treatments..."
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
                              ? `Continue to Payment & Slot Protection (${currency}${paymentChoice === 'full' ? fullAmt : depositAmt})`
                              : `Request Appointment (${feeDisplay})`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-stone-500 text-center mt-2.5 leading-snug">
                          {isPaymentEnabled
                            ? `Secures Dr. ${doctorDisplayName.split(' ')[1] || 'Vance'}'s suite. 100% refundable with ${cancelNotice}h notice.`
                            : `You will receive a confirmation email once our team approves your request.`}
                        </p>
                      </div>

                      <p className="text-[11px] text-stone-400 text-center">
                        Patient information is handled with strict confidentiality.
                      </p>
                    </form>
                  )}

                  {/* STEP 4: UPFRONT PAYMENT & NO-SHOW PROTECTION (When Enabled) */}
                  {step === 4 && isPaymentEnabled && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Appointment & Fee Banner */}
                      <div className="p-3.5 bg-stone-900 text-white rounded-xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-300">
                          <span>Initial Consultation & Exam</span>
                          <span className="font-semibold text-white">{feeDisplay}</span>
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
                                ? `${currency}${fullAmt}.00`
                                : `${currency}${depositAmt}.00`}
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
                              <span>{currency}{depositAmt} Deposit</span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              Locks in your slot. Remaining {currency}{fullAmt - depositAmt} payable on visit day.
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
                              <span>{currency}{fullAmt} Pre-pay in Full</span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              Fast-track check-in. Zero checkout paperwork or delay after treatment.
                            </p>
                          </button>

                          {/* Option 4: Pay at Clinic (if enabled) */}
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
                                Pay {currency}{fullAmt} at reception. Requires front desk phone confirmation.
                              </p>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* EXPRESS PAYMENT: Apple Pay / Google Pay */}
                      {paymentChoice !== 'pay_at_clinic' && (
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={isProcessingPayment}
                              onClick={() => handleExecutePayment('apple_pay')}
                              className="py-2.5 px-3 bg-black hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                            >
                              <span className="text-sm"></span>
                              <span>Pay</span>
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingPayment}
                              onClick={() => handleExecutePayment('google_pay')}
                              className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                            >
                              <span className="text-xs font-black text-blue-600">G</span>
                              <span className="text-xs font-bold text-stone-700">Pay</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-stone-400">
                            <div className="h-px bg-stone-200 flex-1" />
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                              or pay with card
                            </span>
                            <div className="h-px bg-stone-200 flex-1" />
                          </div>
                        </div>
                      )}

                      {/* CARD DETAILS FORM */}
                      {paymentChoice !== 'pay_at_clinic' ? (
                        <div className="p-3.5 bg-stone-50/90 rounded-xl border border-stone-200 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                                Card Number
                              </label>
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                                <span>{detectedBrand}</span>
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={19}
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 font-mono tracking-wider focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                              />
                              <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                Expires
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => handleExpiryChange(e.target.value)}
                                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 font-mono text-center focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                CVC / CVV
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="•••"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 font-mono text-center focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                                Postcode
                              </label>
                              <input
                                type="text"
                                maxLength={8}
                                placeholder="Postcode"
                                value={cardZip}
                                onChange={(e) => setCardZip(e.target.value.toUpperCase())}
                                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 text-center uppercase focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                              />
                            </div>
                          </div>

                          {/* Quick Autofill Test Button */}
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={fillDemoCard}
                              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              <span>Autofill Demo Card (4242)</span>
                            </button>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Stripe Sandbox Active
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-amber-950">
                            <AlertCircle className="w-4 h-4 text-amber-700" />
                            <span>Front Desk Confirmation Required</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Appointments requested without upfront deposit or card hold remain tentative until verified by our receptionist team via telephone call.
                          </p>
                        </div>
                      )}

                      {/* Security & Guarantees */}
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] text-stone-700 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                          <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>No-Risk Policy & Guarantee</span>
                        </div>
                        <p className="text-stone-600 leading-tight">
                          {paymentPolicy.customExplanation || `100% refundable if cancelled or rescheduled at least ${cancelNotice} hours prior to your visit. Encrypted with 256-bit TLS bank security.`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={() => setStep(3)}
                          className="py-3 px-4 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          id="execute-payment-btn"
                          disabled={isProcessingPayment}
                          onClick={() => handleExecutePayment(paymentChoice === 'pay_at_clinic' ? 'clinic_cash' : 'card')}
                          className="flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isProcessingPayment ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Securing with Card Issuer...</span>
                            </>
                          ) : paymentChoice === 'card_hold' ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-300" />
                              <span>Authorize Card & Guarantee Slot</span>
                            </>
                          ) : paymentChoice === 'pay_at_clinic' ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Confirm Slot (Pay at Clinic)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-emerald-300" />
                              <span>
                                Pay {currency}{paymentChoice === 'full' ? fullAmt : depositAmt}.00 & Guarantee Slot
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5 (OR 4 WHEN PAYMENT DISABLED): CONFIRMATION & VERIFIED RECEIPT */}
                  {(step === 5 || (!isPaymentEnabled && step === 4)) && (
                    <div className="text-center py-3 space-y-4 animate-fadeIn">
                      <div className="w-13 h-13 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-1">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-serif font-bold text-stone-900">
                          {confirmedPaymentDetails?.status === 'deposit_paid'
                            ? 'Appointment Reserved & Deposit Paid'
                            : confirmedPaymentDetails?.status === 'card_hold'
                            ? 'Appointment Slot Guaranteed'
                            : confirmedPaymentDetails?.status === 'paid_full'
                            ? 'Appointment Confirmed & Paid in Full'
                            : 'Request Received'}
                        </h3>
                        <p className="text-sm text-stone-700 font-medium max-w-sm mx-auto leading-relaxed">
                          {confirmedPaymentDetails?.status === 'deposit_paid' || confirmedPaymentDetails?.status === 'card_hold' || confirmedPaymentDetails?.status === 'paid_full'
                            ? `Your time slot with ${formData.preferredPractitionerName || clinic.doctorName} is officially guaranteed.`
                            : "We've received your request. Our team will contact you within 24 hours to confirm."}
                        </p>
                      </div>

                      {/* Payment Verification Receipt Badge */}
                      {confirmedPaymentDetails && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-left space-y-1.5">
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
                                ? `Balance due on arrival: ${currency}${fullAmt - depositAmt}.00`
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
                          <span className="text-stone-500">Reason:</span>
                          <span className="font-semibold text-stone-900">{formData.condition}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Practitioner:</span>
                          <span className="font-semibold text-stone-900">{formData.preferredPractitionerName || 'First Available'}</span>
                        </div>
                        <div className="flex justify-between border-b border-stone-200 pb-1.5">
                          <span className="text-stone-500">Reserved Time:</span>
                          <span className="font-semibold text-emerald-800">{formData.date} at {formData.time}</span>
                        </div>
                        <div className="flex justify-between pt-0.5 text-emerald-800 font-medium">
                          <span>Consultation Rate:</span>
                          <span>{feeDisplay}</span>
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
                                Your appointment is reserved in our clinical schedule with zero risk of double booking. Receipt emailed to {formData.email}.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              2
                            </div>
                            <div>
                              <strong className="text-stone-900 font-semibold block text-xs">
                                Clinical Chart & Insurance Review
                              </strong>
                              <span className="text-stone-600 text-[11px] leading-tight">
                                Our receptionist checks treatment room buffers and cross-references your intake reason with doctor availability.
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
                                Complete your health questionnaire on your phone beforehand to skip the waiting room clipboard delay.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col gap-2.5">
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
                            href={`tel:${clinic.phoneRaw}`}
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
