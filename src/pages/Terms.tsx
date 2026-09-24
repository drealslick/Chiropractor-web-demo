import React from 'react';
import { FileCheck, ArrowLeft, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultTermsText } from '../components/admin/LegalPolicyManager';

export default function Terms() {
  const { clinicData: clinic } = useClinic();
  const termsText =
    clinic.termsOfServiceText || defaultTermsText(clinic.name || 'Private Practice');

  const paragraphs = termsText.split('\n\n').filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-stone-50 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Legal Conditions
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Terms of Service & Clinical Disclaimer
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Please review the terms governing use of the {clinic.name || 'our practice'} website and introductory appointment requests.
          </p>

          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Licensed Chiropractic Facility
            </span>
          </div>
        </div>

        {/* Terms Body */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
            {paragraphs.map((p, idx) => {
              const lines = p.split('\n');
              const firstLine = lines[0];
              const rest = lines.slice(1).join(' ');

              if (/^\d+\./.test(firstLine)) {
                return (
                  <div key={idx} className="space-y-1.5 pt-2">
                    <h2 className="text-sm sm:text-base font-bold text-stone-900">{firstLine}</h2>
                    {rest && <p className="text-stone-600 leading-relaxed">{rest}</p>}
                  </div>
                );
              }

              return (
                <p key={idx} className="text-stone-600 leading-relaxed">
                  {p}
                </p>
              );
            })}
          </div>

          {/* Contact Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-600">
            <h3 className="font-bold text-stone-900 text-xs sm:text-sm">Questions Regarding Terms</h3>
            <p>
              For inquiries about clinic policies, fees, or appointment procedures, contact our front desk:
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-medium text-emerald-800">
              <a href={`tel:${clinic.phoneRaw}`} className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{clinic.phone}</span>
              </a>
              {clinic.email && (
                <a href={`mailto:${clinic.email}`} className="flex items-center gap-1.5 hover:underline">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{clinic.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
