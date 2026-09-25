import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Filter,
  ArrowRight,
  Search,
  Send,
  Bell,
  ShieldAlert,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders,
  FileText,
  CalendarCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useClinic } from '../../data/ClinicContext';
import {
  BookingEmbedMode,
  BookingPlatformPreset,
  ClinicSchedulingRules,
  DayWorkingHours,
  PractitionerSchedulingOverride,
  PublicTeamMember,
  UserRole,
} from '../../types';
import { defaultSchedulingRules } from '../../data/clinicData';
import { defaultPublicTeamMembers } from '../../data/defaultTeamData';
import {
  PatientLead,
  getStoredLeads,
  updateLeadStatus,
  updateLeadDetails,
  deleteLead,
  saveLead,
  getDispatchedNotifications,
  logNotification,
  clearDispatchedNotifications,
  DispatchedNotification,
} from '../../data/leadsStore';
import { ReceptionDayView } from './ReceptionDayView';
import { WaitlistDrawer } from './WaitlistDrawer';

interface PlatformPresetItem {
  id: BookingPlatformPreset;
  name: string;
  badge: string;
  placeholder: string;
  exampleUrl: string;
  hint: string;
}

const PLATFORM_PRESETS: PlatformPresetItem[] = [
  {
    id: 'jane',
    name: 'Jane App',
    badge: 'Most Popular for Clinics',
    placeholder: 'https://yourclinic.janeapp.com',
    exampleUrl: 'https://demo.janeapp.com',
    hint: 'Works both as an embedded modal iframe or as a direct redirect.'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    badge: 'Auto-Sync Google/Outlook',
    placeholder: 'https://calendly.com/your-clinic/initial-exam',
    exampleUrl: 'https://calendly.com',
    hint: 'Seamlessly embeds inside the website popup modal.'
  },
  {
    id: 'cliniko',
    name: 'Cliniko',
    badge: 'Popular in UK & Australia',
    placeholder: 'https://yourclinic.cliniko.com/bookings',
    exampleUrl: 'https://cliniko.com',
    hint: 'Ideal for allied health practices with multiple practitioners.'
  },
  {
    id: 'acuity',
    name: 'Acuity / Squarespace',
    badge: 'Payment & Intake',
    placeholder: 'https://yourclinic.as.me/schedule.php',
    exampleUrl: 'https://acuityscheduling.com',
    hint: 'Supports custom intake questions and instant deposit collection.'
  },
  {
    id: 'custom',
    name: 'Custom Portal / Webhook',
    badge: 'Any EHR System',
    placeholder: 'https://booking.yourclinic.com',
    exampleUrl: '',
    hint: 'Compatible with ChiroTouch, WriteUpp, Phorest, or internal portals.'
  }
];

type ManagerSubTab = 'calendar' | 'rules' | 'practitioners' | 'crm' | 'integrations';

interface BookingSettingsProps {
  role?: UserRole;
  initialCalendarMode?: 'day' | 'month';
  assignedLead?: PatientLead | null;
  onClearAssignedLead?: () => void;
}

export const BookingSettings: React.FC<BookingSettingsProps> = ({
  role = 'admin',
  initialCalendarMode,
  assignedLead,
  onClearAssignedLead,
}) => {
  const { clinicData: clinic, updateClinic } = useClinic();
  const [activeSubTab, setActiveSubTab] = useState<ManagerSubTab>('calendar');

  // Leads & Appointments
  const [leads, setLeads] = useState<PatientLead[]>(getStoredLeads);
  const [notifications, setNotifications] = useState<DispatchedNotification[]>(getDispatchedNotifications);

  // Calendar View State: Default to 'day' view for staff, or based on initial mode
  const [calendarMode, setCalendarMode] = useState<'day' | 'month'>(() => {
    if (role === 'staff') return 'day';
    return initialCalendarMode || 'day';
  });
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(''); // YYYY-MM-DD
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reschedule Modal
  const [reschedulingLead, setReschedulingLead] = useState<PatientLead | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleDoctor, setRescheduleDoctor] = useState<string>('');

  // Cancel Modal
  const [cancellingLead, setCancellingLead] = useState<PatientLead | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Patient requested change');

  // New Walk-in / Phone Booking Modal
  const [isAddBookingOpen, setIsAddBookingOpen] = useState<boolean>(false);
  const [newBookingData, setNewBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    condition: 'Back pain',
    practitionerName: 'Dr. Alistair Vance',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    notes: 'Booked directly by front desk receptionist',
  });

  // Scheduling rules state
  const currentRules: ClinicSchedulingRules = clinic.schedulingRules || defaultSchedulingRules;

  // New Holiday Blocker Input
  const [newHolidayDate, setNewHolidayDate] = useState<string>('');
  const [newHolidayNote, setNewHolidayNote] = useState<string>('Clinic Closed / Public Holiday');

  // Listen to storage events
  useEffect(() => {
    const handleLeadsUpdate = (e: Event) => {
      const custom = e as CustomEvent<PatientLead[]>;
      setLeads(custom.detail || getStoredLeads());
    };
    const handleNotifsUpdate = (e: Event) => {
      const custom = e as CustomEvent<DispatchedNotification[]>;
      setNotifications(custom.detail || getDispatchedNotifications());
    };

    window.addEventListener('leads_updated', handleLeadsUpdate);
    window.addEventListener('notifications_updated', handleNotifsUpdate);
    return () => {
      window.removeEventListener('leads_updated', handleLeadsUpdate);
      window.removeEventListener('notifications_updated', handleNotifsUpdate);
    };
  }, []);

  // Practitioners list
  const practitioners: PublicTeamMember[] = useMemo(() => {
    return clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers.filter((m) => m.showOnWebsite !== false)
      : defaultPublicTeamMembers;
  }, [clinic.publicTeamMembers]);

  // Handle incoming lead assignment from Patient Inquiries or Waitlist
  useEffect(() => {
    if (assignedLead) {
      setCalendarMode('day');
      setNewBookingData({
        name: assignedLead.name,
        phone: assignedLead.phone,
        email: assignedLead.email || '',
        condition: assignedLead.condition || 'General Consultation',
        practitionerName: assignedLead.practitionerName || practitioners[0]?.name || 'Dr. Alistair Vance',
        date: assignedLead.date || new Date().toISOString().split('T')[0],
        time: assignedLead.time || '10:00 AM',
        notes: assignedLead.notes || `Scheduled from patient inquiry.`,
      });
      setIsAddBookingOpen(true);
      if (onClearAssignedLead) {
        onClearAssignedLead();
      }
    }
  }, [assignedLead, practitioners, onClearAssignedLead]);

  // Update scheduling rules in clinic data
  const handleUpdateRules = (updatedRules: ClinicSchedulingRules) => {
    updateClinic({
      ...clinic,
      schedulingRules: updatedRules,
    });
  };

  // Status Change
  const handleConfirmAppointment = (lead: PatientLead) => {
    updateLeadStatus(lead.id, 'confirmed');
  };

  const handleOpenReschedule = (lead: PatientLead) => {
    setReschedulingLead(lead);
    setRescheduleDate(lead.date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(lead.time || '10:00 AM');
    setRescheduleDoctor(lead.practitionerName || practitioners[0]?.name || 'Lead Practitioner');
  };

  const handleSaveReschedule = () => {
    if (!reschedulingLead) return;
    updateLeadDetails(reschedulingLead.id, {
      date: rescheduleDate,
      time: rescheduleTime,
      practitionerName: rescheduleDoctor,
      status: 'confirmed',
    });
    setReschedulingLead(null);
  };

  const handleOpenCancel = (lead: PatientLead) => {
    setCancellingLead(lead);
    setCancellationReason('Patient requested schedule change');
  };

  const handleConfirmCancel = () => {
    if (!cancellingLead) return;
    updateLeadStatus(cancellingLead.id, 'cancelled', cancellationReason);
    setCancellingLead(null);
  };

  const handleCreateWalkInBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingData.name || !newBookingData.phone) {
      alert('Please enter patient name and phone number.');
      return;
    }

    saveLead({
      source: 'booking',
      name: newBookingData.name,
      phone: newBookingData.phone,
      email: newBookingData.email || 'walkin@example.com',
      condition: newBookingData.condition,
      practitionerName: newBookingData.practitionerName,
      date: newBookingData.date,
      time: newBookingData.time,
      durationMinutes: currentRules.slotDurationMinutes || 45,
      notes: newBookingData.notes,
      clinicName: clinic.name || 'Clinic',
      status: 'confirmed',
    });

    setIsAddBookingOpen(false);
    setNewBookingData({
      name: '',
      phone: '',
      email: '',
      condition: 'Back pain',
      practitionerName: 'Dr. Alistair Vance',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      notes: 'Booked directly by front desk receptionist',
    });
  };

  // Add / Remove Holiday Blocker
  const handleAddHoliday = () => {
    if (!newHolidayDate) return;
    if (currentRules.clinicClosedDates.includes(newHolidayDate)) {
      alert('This date is already blocked.');
      return;
    }
    const updated = {
      ...currentRules,
      clinicClosedDates: [...currentRules.clinicClosedDates, newHolidayDate].sort(),
    };
    handleUpdateRules(updated);
    setNewHolidayDate('');
  };

  const handleRemoveHoliday = (dateStr: string) => {
    const updated = {
      ...currentRules,
      clinicClosedDates: currentRules.clinicClosedDates.filter((d) => d !== dateStr),
    };
    handleUpdateRules(updated);
  };

  // Test Notification Trigger
  const handleTestNotification = () => {
    logNotification({
      type: 'clinic_alert',
      recipient: currentRules.notifications?.clinicAlertRecipient || 'reception@vancehealth.co.uk',
      channel: 'email',
      subject: `[TEST ALERT] New Appointment Request Received`,
      message: `TEST ALERT: Patient Sarah Jenkins requested Initial Exam on 2026-10-18 at 10:15 AM with Dr. Marcus Sterling. Honeypot check: Passed.`,
    });

    logNotification({
      type: 'patient_autoresponder',
      recipient: 'sarah.jenkins@example.com',
      channel: 'email',
      subject: currentRules.notifications?.autoResponderSubject || "We've received your request",
      message: `TEST AUTORESPONDER: Hi Sarah, we received your appointment request for 2026-10-18 at 10:15 AM. Our care team will review within 24 hours.`,
    });

    alert('Test notification dispatched! Check the CRM & Notification Activity Log below.');
  };

  // Filtered Leads
  const filteredBookings = useMemo(() => {
    return leads
      .filter((l) => l.source === 'booking')
      .filter((l) => {
        if (doctorFilter !== 'all') {
          if (!l.practitionerName?.toLowerCase().includes(doctorFilter.toLowerCase())) return false;
        }
        if (statusFilter !== 'all') {
          if (statusFilter === 'pending' && l.status !== 'new') return false;
          if (statusFilter === 'confirmed' && l.status !== 'confirmed' && l.status !== 'booked') return false;
          if (statusFilter === 'cancelled' && l.status !== 'cancelled') return false;
        }
        if (selectedDateFilter && l.date !== selectedDateFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = l.name.toLowerCase().includes(q);
          const matchPhone = l.phone.toLowerCase().includes(q);
          const matchEmail = l.email.toLowerCase().includes(q);
          const matchCond = (l.condition || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail && !matchCond) return false;
        }
        return true;
      });
  }, [leads, doctorFilter, statusFilter, selectedDateFilter, searchQuery]);

  // Calendar Month Navigation
  const daysInMonth = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Pad leading days from previous month
    const startWeekday = firstDay.getDay(); // 0 is Sunday
    for (let p = startWeekday - 1; p >= 0; p--) {
      const prevDate = new Date(year, month, -p);
      days.push({
        dateObj: prevDate,
        dateString: prevDate.toISOString().split('T')[0],
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }
    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateObj: curDate,
        dateString: curDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: true,
      });
    }
    return days;
  }, [selectedMonth]);

  // External Platform Sync Handlers
  const currentUrl = clinic.externalBookingUrl || '';
  const currentMode: BookingEmbedMode = clinic.bookingEmbedMode || (currentUrl ? 'iframe' : 'triage_request');
  const isExternalSync = currentMode === 'iframe' || currentMode === 'redirect';
  const [previewOpen, setPreviewOpen] = useState(false);

  const detectPlatform = (url: string): BookingPlatformPreset => {
    const lower = url.toLowerCase();
    if (lower.includes('janeapp.com')) return 'jane';
    if (lower.includes('calendly.com')) return 'calendly';
    if (lower.includes('cliniko.com')) return 'cliniko';
    if (lower.includes('as.me') || lower.includes('acuityscheduling.com')) return 'acuity';
    return 'custom';
  };

  const detectedPlatform = detectPlatform(currentUrl);

  const platformName =
    clinic.bookingPlatformPreset === 'jane' || currentUrl.includes('janeapp.com')
      ? 'Jane App'
      : clinic.bookingPlatformPreset === 'cliniko' || currentUrl.includes('cliniko.com')
      ? 'Cliniko'
      : clinic.bookingPlatformPreset === 'calendly' || currentUrl.includes('calendly.com')
      ? 'Calendly'
      : clinic.bookingPlatformPreset === 'acuity' || currentUrl.includes('as.me') || currentUrl.includes('acuityscheduling.com')
      ? 'Acuity Scheduling'
      : 'Jane App';

  // Automatically switch away from Availability Rules or Practitioner Mapping if External Sync is enabled
  useEffect(() => {
    if (isExternalSync && (activeSubTab === 'rules' || activeSubTab === 'practitioners')) {
      setActiveSubTab('calendar');
    }
  }, [isExternalSync, activeSubTab]);

  const handleUrlChange = (newUrl: string) => {
    updateClinic({
      ...clinic,
      externalBookingUrl: newUrl,
      bookingPlatformPreset: detectPlatform(newUrl),
    });
  };

  const handleModeChange = (mode: BookingEmbedMode) => {
    updateClinic({
      ...clinic,
      bookingEmbedMode: mode,
    });
  };

  const handleApplyPreset = (preset: PlatformPresetItem) => {
    if (!currentUrl || currentUrl.trim() === '') {
      updateClinic({
        ...clinic,
        externalBookingUrl: preset.placeholder,
        bookingPlatformPreset: preset.id,
        bookingEmbedMode: clinic.bookingEmbedMode || 'iframe',
      });
    } else {
      updateClinic({
        ...clinic,
        bookingPlatformPreset: preset.id,
      });
    }
  };

  const isValidHttps = currentUrl.startsWith('https://') && currentUrl.length > 12;

  return (
    <div className="space-y-6 max-w-5xl text-stone-900">
      {/* Top Engine Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isExternalSync
                  ? `Mode 2: External Sync Active • ${platformName}`
                  : 'Mode 1: On-Site Triage • Full Practice Engine'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {isExternalSync ? `Booking Managed by ${platformName}` : 'Reception Desk & Scheduling Center'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              {isExternalSync
                ? `Patient bookings and doctor schedules are managed inside ${platformName}. Internal calendars and availability rules are hidden to eliminate double-booking confusion.`
                : 'Manage live appointment requests, customize working hours & buffer times, map conditions to doctors, and automate patient confirmations.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isExternalSync ? (
              <button
                type="button"
                onClick={() => setIsAddBookingOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Walk-in / Phone Booking</span>
              </button>
            ) : (
              <a
                href={currentUrl || 'https://demo.janeapp.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition active:scale-[0.99] cursor-pointer"
              >
                <span>Open {platformName === 'Jane App' ? 'Jane' : platformName} Dashboard →</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation (Availability Rules and Practitioner Mapping are hidden when in External Sync mode) */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-stone-200 overflow-x-auto">
          {[
            {
              id: 'calendar',
              label: isExternalSync ? 'Direct Launch Card' : 'Admin Calendar & Requests',
              icon: CalendarIcon,
              count: isExternalSync ? 0 : leads.filter((l) => l.source === 'booking' && l.status === 'new').length,
            },
            ...(isExternalSync
              ? []
              : [
                  { id: 'rules', label: 'Availability & Scheduling Rules', icon: Clock },
                  { id: 'practitioners', label: 'Practitioner Mapping', icon: Users },
                ]),
            { id: 'crm', label: 'Notifications & CRM Automation', icon: Bell, count: notifications.length },
            { id: 'integrations', label: 'External EHR / Iframe Sync', icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as ManagerSubTab)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.count && tab.count > 0) && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-500 text-stone-950' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ADMIN CALENDAR & REQUESTS */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          {isExternalSync ? (
            /* Direct Launch Card for External Sync (Jane App / Cliniko / Calendly) */
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-stone-100 relative overflow-hidden shadow-lg space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/80 text-xs font-bold uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>External EHR Active • {platformName}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Your booking is managed by {platformName}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                    Patient calendar scheduling, appointment times, practitioner hours, and clinical intake are handled directly inside your {platformName} workspace. Internal calendar views, Availability Rules, and Practitioner Mapping are hidden to keep your admin panel clean.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <a
                    href={currentUrl || 'https://demo.janeapp.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] cursor-pointer"
                  >
                    <span>Open {platformName === 'Jane App' ? 'Jane' : platformName} Dashboard →</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('integrations')}
                    className="px-4 py-3 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Sync Settings
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Website Contact Inquiries
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    Even when patients schedule appointments on {platformName}, prospective patients still ask questions through your website form (e.g. &ldquo;Do you take my insurance?&rdquo; or &ldquo;Do you treat sciatica?&rdquo;). Those general inquiries go straight to your receptionist&apos;s <strong>Patient Inquiries</strong> inbox.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Connected EHR Portal
                  </span>
                  <span className="font-mono text-emerald-400 break-all select-all block">
                    {currentUrl || 'https://demo.janeapp.com'}
                  </span>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleModeChange('triage_request')}
                      className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
                    >
                      Want to run practice triage on this website? Switch to Mode 1 (On-Site Triage)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Calendar View Switcher (Day View Columns vs Month Grid) & Waitlist Action */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCalendarMode('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  calendarMode === 'day'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Day View (Doctor Columns)</span>
                {role === 'staff' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full font-mono">
                    Staff
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  calendarMode === 'month'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Month Grid & List</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWaitlistOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Waitlist Queue</span>
                {leads.filter((l) => l.status === 'waitlist').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                    {leads.filter((l) => l.status === 'waitlist').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {calendarMode === 'day' ? (
            <ReceptionDayView
              leads={leads}
              practitioners={practitioners}
              clinicName={clinic.name || 'Clinic'}
              onOpenNewBookingModal={() => setIsAddBookingOpen(true)}
              onOpenWaitlistModal={() => setIsWaitlistOpen(true)}
              waitlistCount={leads.filter((l) => l.status === 'waitlist').length}
            />
          ) : (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone, or condition..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700 bg-stone-50/50"
              />
            </div>

            {/* Doctor Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Doctor:</span>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-stone-300 bg-white font-medium"
              >
                <option value="all">All Practitioners</option>
                {practitioners.map((doc) => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-stone-300 bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Request</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Clear date filter if active */}
            {selectedDateFilter && (
              <button
                type="button"
                onClick={() => setSelectedDateFilter('')}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Viewing: {selectedDateFilter}</span>
                <X className="w-3 h-3 text-stone-500" />
              </button>
            )}
          </div>

          {/* Interactive Month Grid + Day Appointments Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Mini Calendar Grid */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-800" />
                  <span>
                    {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(selectedMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setSelectedMonth(prev);
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(new Date())}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(selectedMonth);
                      next.setMonth(next.getMonth() + 1);
                      setSelectedMonth(next);
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day) => {
                  const isBlocked = currentRules.clinicClosedDates.includes(day.dateString);
                  const isSelected = selectedDateFilter === day.dateString;
                  const dayBookings = leads.filter(
                    (l) => l.source === 'booking' && l.date === day.dateString && l.status !== 'cancelled'
                  );
                  const hasNew = dayBookings.some((b) => b.status === 'new');
                  const count = dayBookings.length;

                  return (
                    <button
                      key={day.dateString}
                      type="button"
                      onClick={() => {
                        setSelectedDateFilter(selectedDateFilter === day.dateString ? '' : day.dateString);
                      }}
                      className={`h-11 rounded-xl p-1 flex flex-col items-center justify-between text-xs transition cursor-pointer border ${
                        isSelected
                          ? 'border-emerald-800 bg-emerald-900 text-white shadow-sm'
                          : isBlocked
                          ? 'bg-rose-50 border-rose-200 text-rose-400 opacity-60'
                          : !day.isCurrentMonth
                          ? 'bg-stone-50 border-stone-100 text-stone-300'
                          : 'bg-white border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/40 text-stone-800'
                      }`}
                    >
                      <span className="text-[11px] font-semibold">{day.dayNumber}</span>
                      <div className="flex items-center gap-0.5">
                        {isBlocked ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Clinic Closed" />
                        ) : count > 0 ? (
                          <span
                            className={`text-[9px] font-bold px-1 rounded-full ${
                              isSelected
                                ? 'bg-emerald-200 text-emerald-950'
                                : hasNew
                                ? 'bg-amber-400 text-stone-900 animate-pulse'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {count}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending Request
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> Confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Clinic Closed
                </span>
              </div>
            </div>

            {/* Right: Appointment Requests / Schedule List */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    {selectedDateFilter ? `Schedule for ${selectedDateFilter}` : 'Upcoming Bookings & Requests'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {filteredBookings.length} appointment{filteredBookings.length === 1 ? '' : 's'} found
                  </p>
                </div>
                {selectedDateFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('')}
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    View All Dates
                  </button>
                )}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-stone-200 rounded-xl">
                  <CalendarCheck className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">No appointments match the active filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateFilter('');
                      setDoctorFilter('all');
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-emerald-800 font-semibold underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredBookings.map((item) => {
                    const isNew = item.status === 'new';
                    const isConfirmed = item.status === 'confirmed' || item.status === 'booked';
                    const isCancelled = item.status === 'cancelled';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isNew
                            ? 'border-amber-300 bg-amber-50/40'
                            : isConfirmed
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-stone-200 bg-stone-50 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/70">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isNew
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : isConfirmed
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                            <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>
                              {item.date} at {item.time}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Reason / Condition:</span>
                            <span className="font-medium text-stone-800">{item.condition || 'General Exam'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Assigned Doctor:</span>
                            <span className="font-semibold text-emerald-800">
                              {item.practitionerName || 'First Available Practitioner'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Contact:</span>
                            <div className="flex items-center gap-2 text-stone-700">
                              <a href={`tel:${item.phone}`} className="hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {item.phone}
                              </a>
                              <a href={`mailto:${item.email}`} className="hover:underline flex items-center gap-1">
                                <Mail className="w-3 h-3 text-stone-400" />
                                {item.email}
                              </a>
                            </div>
                          </div>
                          {item.notes && (
                            <div>
                              <span className="text-stone-400 block text-[10px] uppercase font-bold">Notes:</span>
                              <span className="text-stone-600 italic line-clamp-1">{item.notes}</span>
                            </div>
                          )}
                          {item.cancellationReason && (
                            <div className="sm:col-span-2 text-rose-700 bg-rose-50 p-2 rounded-lg text-[11px]">
                              <strong>Cancellation note:</strong> {item.cancellationReason}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Receptionist */}
                        <div className="pt-2 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {/* Confirm Button */}
                            {!isConfirmed && (
                              <button
                                type="button"
                                onClick={() => handleConfirmAppointment(item)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Confirm Appointment</span>
                              </button>
                            )}

                            {/* Reschedule Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <Edit3 className="w-3 h-3 text-stone-500" />
                              <span>Reschedule</span>
                            </button>

                            {/* Cancel Button */}
                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => handleOpenCancel(item)}
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition"
                              >
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>

                          <span className="text-[10px] text-stone-400">
                            Logged: {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</div>
)}

      {/* TAB 2: AVAILABILITY & SCHEDULING RULES */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          {/* Section: Working Hours & Lunch Breaks */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>Weekly Working Hours & Lunch Breaks</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Configure opening times, closing times, and automated lunch break blockers for each day.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Day</th>
                    <th className="py-2.5 font-bold">Status</th>
                    <th className="py-2.5 font-bold">Open Time</th>
                    <th className="py-2.5 font-bold">Close Time</th>
                    <th className="py-2.5 font-bold">Lunch Break</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map(
                    (dayKey) => {
                      const schedule = currentRules.weeklySchedule[dayKey];
                      return (
                        <tr key={dayKey} className="hover:bg-stone-50/60">
                          <td className="py-3 font-semibold text-stone-900 capitalize">{dayKey}</td>
                          <td className="py-3">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={schedule?.enabled}
                                onChange={(e) => {
                                  const updated = {
                                    ...currentRules,
                                    weeklySchedule: {
                                      ...currentRules.weeklySchedule,
                                      [dayKey]: {
                                        ...schedule,
                                        enabled: e.target.checked,
                                      },
                                    },
                                  };
                                  handleUpdateRules(updated);
                                }}
                                className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                              />
                              <span
                                className={`text-[11px] font-bold ${
                                  schedule?.enabled ? 'text-emerald-800' : 'text-stone-400'
                                }`}
                              >
                                {schedule?.enabled ? 'Open' : 'Closed'}
                              </span>
                            </label>
                          </td>
                          <td className="py-3">
                            <input
                              type="time"
                              disabled={!schedule?.enabled}
                              value={schedule?.openTime || '08:30'}
                              onChange={(e) => {
                                const updated = {
                                  ...currentRules,
                                  weeklySchedule: {
                                    ...currentRules.weeklySchedule,
                                    [dayKey]: { ...schedule, openTime: e.target.value },
                                  },
                                };
                                handleUpdateRules(updated);
                              }}
                              className="p-1.5 border border-stone-300 rounded-lg text-xs bg-white disabled:bg-stone-100 disabled:text-stone-400"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="time"
                              disabled={!schedule?.enabled}
                              value={schedule?.closeTime || '18:30'}
                              onChange={(e) => {
                                const updated = {
                                  ...currentRules,
                                  weeklySchedule: {
                                    ...currentRules.weeklySchedule,
                                    [dayKey]: { ...schedule, closeTime: e.target.value },
                                  },
                                };
                                handleUpdateRules(updated);
                              }}
                              className="p-1.5 border border-stone-300 rounded-lg text-xs bg-white disabled:bg-stone-100 disabled:text-stone-400"
                            />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!schedule?.enabled}
                                  checked={schedule?.lunchBreakEnabled}
                                  onChange={(e) => {
                                    const updated = {
                                      ...currentRules,
                                      weeklySchedule: {
                                        ...currentRules.weeklySchedule,
                                        [dayKey]: {
                                          ...schedule,
                                          lunchBreakEnabled: e.target.checked,
                                        },
                                      },
                                    };
                                    handleUpdateRules(updated);
                                  }}
                                  className="rounded text-emerald-700 h-3.5 w-3.5"
                                />
                                <span className="text-[11px] text-stone-600">Block:</span>
                              </label>
                              {schedule?.lunchBreakEnabled && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={schedule?.lunchStart || '12:30'}
                                    onChange={(e) => {
                                      const updated = {
                                        ...currentRules,
                                        weeklySchedule: {
                                          ...currentRules.weeklySchedule,
                                          [dayKey]: { ...schedule, lunchStart: e.target.value },
                                        },
                                      };
                                      handleUpdateRules(updated);
                                    }}
                                    className="p-1 border border-stone-300 rounded text-xs bg-white"
                                  />
                                  <span className="text-stone-400">to</span>
                                  <input
                                    type="time"
                                    value={schedule?.lunchEnd || '13:30'}
                                    onChange={(e) => {
                                      const updated = {
                                        ...currentRules,
                                        weeklySchedule: {
                                          ...currentRules.weeklySchedule,
                                          [dayKey]: { ...schedule, lunchEnd: e.target.value },
                                        },
                                      };
                                      handleUpdateRules(updated);
                                    }}
                                    className="p-1 border border-stone-300 rounded text-xs bg-white"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Buffer Times & Slot Durations */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <span>Appointment Duration & Cleaning Buffer Times</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Automatically space patient appointments to guarantee time for clinical notes, sanitization, and room turnaround.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Consultation Duration
                </label>
                <div className="flex items-center gap-3">
                  {[30, 45, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        handleUpdateRules({
                          ...currentRules,
                          slotDurationMinutes: dur,
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                        currentRules.slotDurationMinutes === dur
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {dur} Minutes
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500">
                  Standard time allocated with the chiropractor or clinician per patient.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Buffer Time Between Patients
                </label>
                <div className="flex items-center gap-3">
                  {[10, 15, 20].map((buf) => (
                    <button
                      key={buf}
                      type="button"
                      onClick={() => {
                        handleUpdateRules({
                          ...currentRules,
                          bufferTimeMinutes: buf,
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                        currentRules.bufferTimeMinutes === buf
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {buf} Minutes
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500">
                  Automatically added after every slot for clinical charting and sanitization.
                </p>
              </div>
            </div>

            {/* Visual Calculator Summary */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Active Formula:</strong> {currentRules.slotDurationMinutes}m appointment +{' '}
                {currentRules.bufferTimeMinutes}m buffer ={' '}
                <strong>{currentRules.slotDurationMinutes + currentRules.bufferTimeMinutes} minutes</strong> between patient arrival slots. Front-end booking automatically calculates and displays matching openings.
              </span>
            </div>
          </div>

          {/* Section: Holiday & Clinic Closure Blockers */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-800" />
                <span>Holiday & Clinic Closure Blockers</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Dates marked here are <strong>automatically hidden or disabled</strong> on the front-end appointment calendar.
              </p>
            </div>

            {/* Add Date Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="p-2 border border-stone-300 rounded-xl text-xs bg-white font-medium focus:ring-1 focus:ring-emerald-700"
              />
              <button
                type="button"
                onClick={handleAddHoliday}
                disabled={!newHolidayDate}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Block Date (Clinic Closed)</span>
              </button>
            </div>

            {/* Current Blocked Dates Badges */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Currently Blocked Dates ({currentRules.clinicClosedDates.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {currentRules.clinicClosedDates.length === 0 ? (
                  <span className="text-xs text-stone-400 italic">No closure dates set.</span>
                ) : (
                  currentRules.clinicClosedDates.map((dateStr) => (
                    <div
                      key={dateStr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold"
                    >
                      <span>{dateStr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(dateStr)}
                        className="p-0.5 rounded hover:bg-rose-200 text-rose-700 cursor-pointer"
                        title="Remove blocker"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRACTITIONER MAPPING */}
      {activeSubTab === 'practitioners' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>Practitioner Specialization & Vacation Mapping</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Link clinical conditions (e.g. Back Pain, Sports Injury, Headaches) to individual doctors. If a doctor is marked on vacation, their slots are hidden from the booking calendar.
              </p>
            </div>

            <div className="space-y-4">
              {practitioners.map((doc) => {
                const override = currentRules.practitionerOverrides?.find(
                  (o) => o.practitionerId === doc.id
                ) || {
                  practitionerId: doc.id,
                  practitionerName: doc.name,
                  role: doc.role,
                  isOnHoliday: false,
                  holidayDates: [],
                  assignedConditions: doc.assignedConditionSlugs?.includes('sports-injuries')
                    ? ['Sports injury', 'Back pain']
                    : doc.assignedConditionSlugs?.includes('headaches')
                    ? ['Neck pain', 'Headaches']
                    : ['Back pain', 'Neck pain', 'Other'],
                  weeklyOffDays: [0],
                  isAcceptingNewPatients: true,
                };

                const isHoliday = override.isOnHoliday;

                return (
                  <div
                    key={doc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isHoliday
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        {doc.photoUrl ? (
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {doc.name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h5 className="font-serif font-bold text-stone-900 text-sm">{doc.name}</h5>
                          <span className="text-xs text-stone-500">{doc.role}</span>
                        </div>
                      </div>

                      {/* Vacation / Holiday Toggle */}
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isHoliday}
                            onChange={(e) => {
                              const updatedOverrides = (
                                currentRules.practitionerOverrides || []
                              ).filter((o) => o.practitionerId !== doc.id);
                              updatedOverrides.push({
                                ...override,
                                isOnHoliday: e.target.checked,
                              });
                              handleUpdateRules({
                                ...currentRules,
                                practitionerOverrides: updatedOverrides,
                              });
                            }}
                            className="rounded text-amber-600 focus:ring-amber-600 h-4 w-4"
                          />
                          <span className={isHoliday ? 'text-amber-900 font-bold' : 'text-stone-600'}>
                            {isHoliday ? '🏖️ On Vacation (Slots Hidden)' : 'Active & Available'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Conditions Linkage */}
                    <div className="pt-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                        Linked Treatment Reasons (Auto-Assigns in Booking Modal):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Back pain', 'Neck pain', 'Sports injury', 'Headaches', 'Other'].map((cond) => {
                          const isAssigned = override.assignedConditions?.includes(cond);
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => {
                                const newConditions = isAssigned
                                  ? (override.assignedConditions || []).filter((c) => c !== cond)
                                  : [...(override.assignedConditions || []), cond];

                                const updatedOverrides = (
                                  currentRules.practitionerOverrides || []
                                ).filter((o) => o.practitionerId !== doc.id);
                                updatedOverrides.push({
                                  ...override,
                                  assignedConditions: newConditions,
                                });
                                handleUpdateRules({
                                  ...currentRules,
                                  practitionerOverrides: updatedOverrides,
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isAssigned
                                  ? 'border-emerald-700 bg-emerald-100 text-emerald-900'
                                  : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
                              }`}
                            >
                              {isAssigned ? '✓ ' : '+ '}
                              {cond}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS & CRM AUTOMATION */}
      {activeSubTab === 'crm' && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-800" />
                  <span>Email & SMS Automation Templates</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Automate clinic receptionist alerts, instant patient auto-responder receipts, and spam shielding.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Notification</span>
              </button>
            </div>

            {/* Notification Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clinic Front Desk Alert */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Clinic Front Desk Alert
                  </span>
                  <input
                    type="checkbox"
                    checked={currentRules.notifications?.clinicEmailAlert}
                    onChange={(e) => {
                      handleUpdateRules({
                        ...currentRules,
                        notifications: {
                          ...currentRules.notifications,
                          clinicEmailAlert: e.target.checked,
                        },
                      });
                    }}
                    className="rounded text-emerald-700 h-4 w-4"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Sends an immediate alert to reception when a new appointment request is submitted online.
                </p>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Front Desk Email:
                  </label>
                  <input
                    type="email"
                    value={currentRules.notifications?.clinicAlertRecipient || 'reception@vancehealth.co.uk'}
                    onChange={(e) => {
                      handleUpdateRules({
                        ...currentRules,
                        notifications: {
                          ...currentRules.notifications,
                          clinicAlertRecipient: e.target.value,
                        },
                      });
                    }}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Patient Auto-Responder */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Patient Auto-Responder (Instant Receipt)
                  </span>
                  <input
                    type="checkbox"
                    checked={currentRules.notifications?.patientAutoResponder}
                    onChange={(e) => {
                      handleUpdateRules({
                        ...currentRules,
                        notifications: {
                          ...currentRules.notifications,
                          patientAutoResponder: e.target.checked,
                        },
                      });
                    }}
                    className="rounded text-emerald-700 h-4 w-4"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Sends an immediate confirmation receipt to the patient setting 24-hour expectations.
                </p>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Auto-Responder Subject:
                  </label>
                  <input
                    type="text"
                    value={
                      currentRules.notifications?.autoResponderSubject ||
                      "We've received your appointment request"
                    }
                    onChange={(e) => {
                      handleUpdateRules({
                        ...currentRules,
                        notifications: {
                          ...currentRules.notifications,
                          autoResponderSubject: e.target.value,
                        },
                      });
                    }}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Spam Protection Status */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-stone-700 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-semibold">
                  Spam Protection & Honeypot Defense Active:
                </strong>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  The appointment modal includes an invisible honeypot field (<code className="text-emerald-900 font-mono">b_website_hp</code>) that traps automated crawler bots without bothering real patients with annoying captchas. Malicious spam submissions are blocked before reaching your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Notifications Log */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-800" />
                  <span>Notification & CRM Dispatch Activity Log ({notifications.length})</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time history of simulated confirmation emails, SMS texts, and clinic inbox alerts.
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearDispatchedNotifications}
                  className="text-xs text-stone-400 hover:text-stone-700 underline cursor-pointer"
                >
                  Clear log
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 italic">
                No notification alerts logged yet. Submit a test booking or click "Send Test Notification".
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            n.type === 'clinic_alert'
                              ? 'bg-amber-100 text-amber-900'
                              : n.type === 'status_update'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          {n.type.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-stone-800">{n.subject}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                      <span>Recipient: {n.recipient} ({n.channel.toUpperCase()})</span>
                      <span className="text-emerald-700 font-semibold">✓ Dispatched</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: EXTERNAL EHR & IFRAME PRESETS */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              1. Choose Your External Booking Platform Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORM_PRESETS.map((p) => {
                const isSelected = detectedPlatform === p.id && Boolean(currentUrl);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-stone-900 text-sm">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded inline-block mb-1.5">
                        {p.badge}
                      </span>
                      <p className="text-[11px] text-stone-500 leading-snug">{p.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* External Booking URL Input */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                2. External Booking System URL
              </label>
              {isValidHttps ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid HTTPS Link
                </span>
              ) : currentUrl ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle className="w-3 h-3" />
                  Must start with https://
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">Optional (Leave blank to use on-site triage)</span>
              )}
            </div>

            <div className="relative">
              <Link2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={currentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="e.g. https://apexchiro.janeapp.com"
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
              />
              {currentUrl && (
                <button
                  type="button"
                  onClick={() => handleUrlChange('')}
                  className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-100 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              Paste the direct link to your JaneApp clinic page, Calendly event type, Cliniko schedule, or Acuity booking page.
            </p>
          </div>

          {/* Booking Experience Mode Toggle */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              3. Patient Experience Mode
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Mode A: Integrated Modal Embed (iframe) */}
              <div
                onClick={() => handleModeChange('iframe')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'iframe'
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      Seamless Modal Embed (iframe)
                    </h4>
                    {currentMode === 'iframe' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Loads your live booking schedule <strong>directly inside a popup modal on your website</strong>. Patients never leave your domain, maximizing brand consistency and trust.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Best for Calendly & Jane</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Mode B: Direct Redirect / Smart Handoff */}
              <div
                onClick={() => handleModeChange('redirect')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'redirect'
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      Direct Redirect / New Tab
                    </h4>
                    {currentMode === 'redirect' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Opens your external booking portal in a clean new tab or redirects the patient directly, passing their pre-filled info so they can finalize their time slot.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Fastest Direct Handoff</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Mode C: 3-Step Triage & Callback Request */}
              <div
                onClick={() => handleModeChange('triage_request')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'triage_request'
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-stone-900 text-sm">
                      3-Step On-Site Triage
                    </h4>
                    {currentMode === 'triage_request' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Uses our high-converting 3-step intake form (Symptom → Time Window → Contact Info). Captures the lead directly in your Requests inbox for front-desk confirmation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Zero Tech Required</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Test & Preview Simulator */}
          {currentUrl && (
            <div className="border border-stone-200 bg-stone-50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-stone-700" />
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                    Live Embed Test ({currentMode.toUpperCase()})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                >
                  {previewOpen ? 'Hide Embed Preview' : 'Show Live Iframe Preview'}
                </button>
              </div>

              {previewOpen && (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-inner">
                  <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span className="truncate max-w-md">{currentUrl}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {currentMode === 'iframe' ? 'Modal Iframe Mode' : 'Direct Link Mode'}
                    </span>
                  </div>
                  <div className="h-[420px] w-full bg-stone-50 flex items-center justify-center relative">
                    <iframe
                      src={currentUrl}
                      title="Live Booking Schedule Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {reschedulingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base">
                Reschedule: {reschedulingLead.name}
              </h4>
              <button
                type="button"
                onClick={() => setReschedulingLead(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">New Date:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">New Time Slot:</label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="e.g. 10:15 AM"
                  className="w-full p-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Assigned Practitioner:</label>
                <select
                  value={rescheduleDoctor}
                  onChange={(e) => setRescheduleDoctor(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg"
                >
                  {practitioners.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReschedulingLead(null)}
                className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save & Notify Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL APPOINTMENT */}
      {cancellingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-rose-900 text-base">
                Cancel Appointment Request
              </h4>
              <button
                type="button"
                onClick={() => setCancellingLead(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Are you sure you want to cancel the appointment for <strong>{cancellingLead.name}</strong> on {cancellingLead.date} at {cancellingLead.time}?
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Reason for Cancellation:</label>
              <textarea
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Patient requested schedule change, Doctor emergency, etc."
                className="w-full p-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingLead(null)}
                className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW WALK-IN / PHONE BOOKING */}
      {isAddBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateWalkInBooking}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Schedule Walk-In / Phone Patient</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddBookingOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Ross"
                    value={newBookingData.name}
                    onChange={(e) => setNewBookingData({ ...newBookingData, name: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7700 900123"
                    value={newBookingData.phone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="david@example.com"
                  value={newBookingData.email}
                  onChange={(e) => setNewBookingData({ ...newBookingData, email: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Condition / Reason</label>
                  <select
                    value={newBookingData.condition}
                    onChange={(e) => setNewBookingData({ ...newBookingData, condition: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  >
                    <option value="Back pain">Back pain</option>
                    <option value="Neck pain">Neck pain</option>
                    <option value="Sports injury">Sports injury</option>
                    <option value="Headaches">Headaches</option>
                    <option value="Other">Other / Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Assigned Clinician</label>
                  <select
                    value={newBookingData.practitionerName}
                    onChange={(e) => setNewBookingData({ ...newBookingData, practitionerName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  >
                    {practitioners.map((doc) => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newBookingData.date}
                    onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={newBookingData.time}
                    onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Internal Front-Desk Notes</label>
                <textarea
                  rows={2}
                  value={newBookingData.notes}
                  onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddBookingOpen(false)}
                className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm & Add to Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient Cancellation Waitlist Drawer */}
      <WaitlistDrawer
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        leads={leads}
        clinicName={clinic.name || 'Clinic'}
        onAssignToCalendar={(patient) => {
          setCalendarMode('day');
          setNewBookingData({
            name: patient.name,
            phone: patient.phone,
            email: patient.email || '',
            condition: patient.condition || 'Cancellation opening fill',
            practitionerName: patient.practitionerName || practitioners[0]?.name || 'Dr. Alistair Vance',
            date: new Date().toISOString().split('T')[0],
            time: '3:00 PM',
            notes: `Waitlist slot offer: ${patient.notes || ''}`,
          });
          setIsAddBookingOpen(true);
        }}
      />
    </div>
  );
};
