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
    title: 'Address & Postal Code',
    status: hasCompleteAddress ? 'pass' : 'warning',
    detail: hasCompleteAddress
      ? formattedAddress
      : 'Address is missing street, city, or postal code.',
  });

  const hasPhone = Boolean(clinic.phone);
  auditItems.push({
    id: 'phone',
    category: 'seo',
    title: 'Phone Number',
    status: hasPhone ? 'pass' : 'fail',
    detail: hasPhone ? clinic.phone! : 'No phone number set.',
  });

  const hasHours = Boolean(clinic.hoursWeekday);
  auditItems.push({
    id: 'hours',
    category: 'seo',
    title: 'Operating Hours',
    status: hasHours ? 'pass' : 'warning',
    detail: hasHours ? clinic.hoursWeekday! : 'No weekly hours specified.',
  });

  // 2. Conversion & Booking
  const hasBooking = Boolean(clinic.externalBookingUrl || clinic.bookingType);
  auditItems.push({
    id: 'booking',
    category: 'conversion',
    title: 'Booking Link',
    status: hasBooking ? 'pass' : 'warning',
    detail: clinic.externalBookingUrl
      ? 'Calendar linked'
      : 'Default booking form enabled.',
  });

  const hasPricing = Boolean(clinic.examFee);
  auditItems.push({
    id: 'pricing',
    category: 'conversion',
    title: 'Pricing',
    status: hasPricing ? 'pass' : 'warning',
    detail: hasPricing ? `Exam Fee: ${clinic.examFee}` : 'No exam fee set.',
  });

  // 3. Clinical Credibility
  const hasDoctorCreds = Boolean(clinic.doctorName && clinic.doctorCredentials);
  auditItems.push({
    id: 'doctor',
    category: 'clinical',
    title: 'Doctor & Credentials',
    status: hasDoctorCreds ? 'pass' : 'warning',
    detail: hasDoctorCreds
      ? `${clinic.doctorName} (${clinic.doctorCredentials})`
      : 'Doctor name or credentials missing.',
  });

  const customFaqsCount = clinic.customFaqs?.length || 6;
  auditItems.push({
    id: 'faqs',
    category: 'clinical',
    title: 'FAQs',
    status: customFaqsCount >= 4 ? 'pass' : 'warning',
    detail: `${customFaqsCount} FAQs configured.`,
  });

  const conditionsCount = clinic.customConditions?.length || 4;
  auditItems.push({
    id: 'conditions',
    category: 'clinical',
    title: 'Conditions Treated',
    status: conditionsCount >= 4 ? 'pass' : 'warning',
    detail: `${conditionsCount} condition pages configured.`,
  });

  // 4. Technical & Cloud Sync
  auditItems.push({
    id: 'sync',
    category: 'technical',
    title: 'Storage & Sync',
    status: hasSupabase ? 'pass' : 'warning',
    detail: hasSupabase
      ? `Cloud sync active (${syncStatus})`
      : 'Saved locally in browser.',
  });

  const hasAnnouncement = Boolean(clinic.announcementBanner?.enabled);
  auditItems.push({
    id: 'announcement',
    category: 'technical',
    title: 'Announcement Banner',
    status: hasAnnouncement ? 'pass' : 'warning',
    detail: hasAnnouncement
      ? `Active: "${clinic.announcementBanner?.message}"`
      : 'Banner disabled.',
  });

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-stone-850 border border-stone-800">
        <h3 className="text-sm font-semibold text-stone-200">Site Checklist</h3>
        <p className="text-xs text-stone-400 mt-0.5">
          Verification of clinic details, contact information, and booking state.
        </p>
      </div>

      {/* Checklist List */}
      <div className="space-y-2">
        {auditItems.map((item) => {
          return (
            <div
              key={item.id}
              className="p-3 bg-stone-850/80 border border-stone-800 rounded-lg space-y-1"
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
                  <h4 className="text-xs font-medium text-stone-200">{item.title}</h4>
                </div>
                <span
                  className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                    item.status === 'pass'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : item.status === 'warning'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      : 'bg-red-950 text-red-400 border border-red-800/40'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-stone-400 pl-6">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
