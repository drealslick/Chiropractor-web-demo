import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { ClinicInfo } from '../../types';

interface PracticeAuditProps {
  clinic: ClinicInfo;
  hasSupabase: boolean;
  syncStatus: string;
}

interface AuditItem {
  id: string;
  category: 'seo' | 'conversion' | 'clinical' | 'technical';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  recommendation?: string;
}

export function PracticeAudit({ clinic, hasSupabase, syncStatus }: PracticeAuditProps) {
  const auditItems: AuditItem[] = [];

  // 1. Local SEO & Schema Audit
  const hasCompleteAddress = Boolean(clinic.address && (clinic.cityState || clinic.city) && clinic.zip);
  const formattedAddress = hasCompleteAddress
    ? `${clinic.address}, ${clinic.cityState || clinic.city || ''} ${clinic.zip || ''}`.trim().replace(/,\s*,/g, ',').replace(/\s+/g, ' ')
    : '';

  auditItems.push({
    id: 'address',
    category: 'seo',
    title: 'Local NAP & Schema Address',
    status: hasCompleteAddress ? 'pass' : 'warning',
    detail: hasCompleteAddress
      ? formattedAddress
      : 'Address is missing street, city, or postal code.',
    recommendation: 'Complete address is mandatory for Google Maps rankings and Schema.org integration.',
  });

  const hasPhone = Boolean(clinic.phone);
  auditItems.push({
    id: 'phone',
    category: 'seo',
    title: 'Direct Click-to-Call Line',
    status: hasPhone ? 'pass' : 'fail',
    detail: hasPhone ? clinic.phone! : 'No phone number configured.',
    recommendation: 'Ensures patients with severe acute pain can call immediately from mobile device taps.',
  });

  const hasHours = Boolean(clinic.hoursWeekday);
  auditItems.push({
    id: 'hours',
    category: 'seo',
    title: 'Operating & Clinic Hours',
    status: hasHours ? 'pass' : 'warning',
    detail: hasHours ? clinic.hoursWeekday! : 'No weekly hours specified.',
  });

  // 2. Conversion & Booking
  const hasBooking = Boolean(clinic.externalBookingUrl || clinic.bookingType);
  auditItems.push({
    id: 'booking',
    category: 'conversion',
    title: 'Patient Intake / Scheduling Engine',
    status: hasBooking ? 'pass' : 'warning',
    detail: clinic.externalBookingUrl
      ? 'Calendar linked'
      : 'Integrated interactive 3-step booking modal enabled.',
  });

  const hasPricing = Boolean(clinic.examFee);
  auditItems.push({
    id: 'pricing',
    category: 'conversion',
    title: 'Transparent Pricing & Fees',
    status: hasPricing ? 'pass' : 'warning',
    detail: hasPricing ? `Exam Fee: ${clinic.examFee}` : 'No explicit examination fee label configured.',
  });

  // 3. Clinical Credibility
  const hasDoctorCreds = Boolean(clinic.doctorName && clinic.doctorCredentials);
  auditItems.push({
    id: 'doctor',
    category: 'clinical',
    title: 'Lead Practitioner Credentials',
    status: hasDoctorCreds ? 'pass' : 'warning',
    detail: hasDoctorCreds
      ? `${clinic.doctorName} (${clinic.doctorCredentials})`
      : 'Doctor name or credentials missing.',
  });

  const customFaqsCount = clinic.customFaqs?.length || 6;
  auditItems.push({
    id: 'faqs',
    category: 'clinical',
    title: 'Clinical FAQs & Treatment Transparency',
    status: customFaqsCount >= 4 ? 'pass' : 'warning',
    detail: `${customFaqsCount} clinical answers addressing patient concerns.`,
  });

  const conditionsCount = clinic.customConditions?.length || 4;
  auditItems.push({
    id: 'conditions',
    category: 'clinical',
    title: 'Specialized Condition Landing Depth',
    status: conditionsCount >= 4 ? 'pass' : 'warning',
    detail: `${conditionsCount} dedicated spine, neck, and sports condition protocols.`,
  });

  // 4. Technical & Cloud Sync
  auditItems.push({
    id: 'sync',
    category: 'technical',
    title: 'Cloud Database Architecture',
    status: hasSupabase ? 'pass' : 'warning',
    detail: hasSupabase
      ? `Supabase Cloud Connected (Status: ${syncStatus})`
      : 'LocalStorage Cache Active (Configure Supabase env vars to enable multi-device cloud replication).',
  });

  const hasAnnouncement = Boolean(clinic.announcementBanner?.enabled);
  auditItems.push({
    id: 'announcement',
    category: 'technical',
    title: 'Emergency / Holiday Alert System',
    status: hasAnnouncement ? 'pass' : 'warning',
    detail: hasAnnouncement
      ? `Active: "${clinic.announcementBanner?.message}"`
      : 'Announcement banner is idle. Ready to broadcast weather or holiday notices.',
  });

  return (
    <div className="space-y-6">
      {/* Title Header without the 90% score badge */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700/80 shadow-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Practice Checklist
        </span>
        <h3 className="text-xl font-bold text-white mt-1">Practice Readiness</h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Real-time verification of local SEO tags, booking integration states, and clinic configurations.
        </p>
      </div>

      {/* Checklist List */}
      <div className="space-y-2.5">
        {auditItems.map((item) => {
          return (
            <div
              key={item.id}
              className="p-3.5 bg-stone-800/60 border border-stone-700/50 rounded-xl space-y-1 hover:border-stone-600 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.status === 'pass' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {item.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  {item.status === 'fail' && (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === 'pass'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                      : item.status === 'warning'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                      : 'bg-red-950/80 text-red-300 border border-red-800/40'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-stone-300 pl-6 leading-relaxed">{item.detail}</p>
              {item.recommendation && (
                <p className="text-[11px] text-stone-500 pl-6 italic">
                  💡 {item.recommendation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
