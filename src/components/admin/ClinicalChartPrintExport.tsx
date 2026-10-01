import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Check,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Stethoscope,
  Plus,
  Trash2,
  Calendar,
  User,
  CreditCard,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { PatientLead } from '../../data/leadsStore';
import { useClinic } from '../../data/ClinicContext';

interface ClinicalChartPrintExportProps {
  lead: PatientLead;
  onClose: () => void;
}

interface DiagnosisItem {
  code: string;
  description: string;
  selected: boolean;
}

interface ProcedureItem {
  cpt: string;
  description: string;
  fee: number;
  selected: boolean;
}

const DEFAULT_ICD10: DiagnosisItem[] = [
  { code: 'M99.03', description: 'Segmental and somatic dysfunction of lumbar region', selected: false },
  { code: 'M54.50', description: 'Low back pain, unspecified', selected: false },
  { code: 'M99.01', description: 'Segmental and somatic dysfunction of cervical region', selected: false },
  { code: 'M54.2', description: 'Cervicalgia (Neck pain)', selected: false },
  { code: 'M99.02', description: 'Segmental and somatic dysfunction of thoracic region', selected: false },
  { code: 'M99.05', description: 'Segmental and somatic dysfunction of pelvic region / SI joint', selected: false },
  { code: 'M54.16', description: 'Radiculopathy, lumbar region (Sciatica)', selected: false },
  { code: 'G44.209', description: 'Tension-type headache, unspecified', selected: false },
];

const DEFAULT_CPT: ProcedureItem[] = [
  { cpt: '99203', description: 'Office/Outpatient New Patient Evaluation & Management (30 min)', fee: 0, selected: false },
  { cpt: '98941', description: 'Chiropractic Manipulative Treatment (CMT); Spinal, 3-4 Regions', fee: 0, selected: false },
  { cpt: '98940', description: 'Chiropractic Manipulative Treatment (CMT); Spinal, 1-2 Regions', fee: 0, selected: false },
  { cpt: '97140', description: 'Manual Therapy Techniques (Joint Mobilization, Myofascial Release, 15 min)', fee: 0, selected: false },
  { cpt: '97110', description: 'Therapeutic Exercises (Postural Rehabilitation & Core Stability, 15 min)', fee: 0, selected: false },
];

export const ClinicalChartPrintExport: React.FC<ClinicalChartPrintExportProps> = ({ lead, onClose }) => {
  const { clinicData: clinic } = useClinic();
  const [icdList, setIcdList] = useState<DiagnosisItem[]>(DEFAULT_ICD10);
  const [cptList, setCptList] = useState<ProcedureItem[]>(DEFAULT_CPT);
  const [showBillingEditor, setShowBillingEditor] = useState<boolean>(false);
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  const intake = lead.intakeForm;

  const toggleIcd = (code: string) => {
    setIcdList((prev) =>
      prev.map((item) => (item.code === code ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleCpt = (cpt: string) => {
    setCptList((prev) =>
      prev.map((item) => (item.cpt === cpt ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedIcd = icdList.filter((i) => i.selected);
  const selectedCpt = cptList.filter((c) => c.selected);
  const totalBilling = selectedCpt.reduce((sum, item) => sum + item.fee, 0);

  const handlePrint = () => {
    if (!doctorNotes.trim() || !selectedIcd.length || !selectedCpt.length || selectedCpt.some(c=>!Number.isFinite(c.fee) || c.fee <= 0)) { alert('Record the actual encounter notes, diagnoses and performed procedures and actual procedure fees before printing.'); return; }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {/* Print-specific style rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-encounter-chart, #printable-encounter-chart * {
            visibility: visible;
          }
          #printable-encounter-chart {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] my-auto overflow-hidden">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Clinical Chart & Superbill Export
              </h3>
              <p className="text-xs text-stone-400">
                Patient: <strong className="text-white">{lead.name}</strong> • Ref:{' '}
                <span className="font-mono text-emerald-400">{lead.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBillingEditor(!showBillingEditor)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-stone-700"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showBillingEditor ? 'Hide Billing Editor' : 'Edit Codes / Notes'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Billing & Notes Editor Drawer (No-Print) */}
        {showBillingEditor && (
          <div className="p-4 sm:p-5 bg-stone-925 border-b border-stone-800 space-y-4 no-print text-xs text-stone-300">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-emerald-400 text-[11px]">
                Doctor's Superbill Customizer (ICD-10 & CPT)
              </span>
              <span className="text-[11px] text-stone-400">
                Select codes to include on the insurance statement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ICD-10 Selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Primary Diagnoses (ICD-10-CM)
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-stone-950 rounded-xl border border-stone-800">
                  {icdList.map((item) => (
                    <label
                      key={item.code}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-900 cursor-pointer text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleIcd(item.code)}
                          className="accent-emerald-600 rounded"
                        />
                        <span className="font-mono font-bold text-white">{item.code}</span>
                        <span className="text-stone-300 truncate max-w-[200px]">{item.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* CPT Procedures Selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Procedures & Modalities (CPT Codes)
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-stone-950 rounded-xl border border-stone-800">
                  {cptList.map((item) => (
                    <label
                      key={item.cpt}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-900 cursor-pointer text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleCpt(item.cpt)}
                          className="accent-emerald-600 rounded"
                        />
                        <span className="font-mono font-bold text-white">{item.cpt}</span>
                        <span className="text-stone-300 truncate max-w-[180px]">{item.description}</span>
                      </div>
                      <input type="number" min="0" step="0.01" aria-label={`Actual fee for ${item.cpt}`} value={item.fee || ''}
                        onChange={e=>setCptList(prev=>prev.map(c=>c.cpt===item.cpt?{...c,fee:Number(e.target.value)}:c))}
                        className="w-20 bg-stone-900 text-white border border-stone-700 rounded p-1" placeholder="Fee" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Editable Doctor Narrative */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Objective Findings & Clinical Notes
              </span>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-stone-900">
          <div
            id="printable-encounter-chart"
            className="bg-white text-stone-900 p-6 sm:p-10 rounded-2xl shadow-xl border border-stone-200 max-w-3xl mx-auto space-y-6 font-sans text-xs"
          >
            {/* 1. Official Letterhead */}
            <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-serif font-black text-xl sm:text-2xl text-stone-950 tracking-tight uppercase">
                  {clinic.name || 'Columbus Chiropractic & Spine Clinic'}
                </h1>
                <p className="text-stone-600 text-xs mt-0.5 font-medium">
                  {clinic.tagline || 'Excellence in Spinal Health, Biomechanics & Physical Rehabilitation'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-1.5 font-mono">
                  <span>Tel: {clinic.phone || '0121 496 0888'}</span>
                  <span>•</span>
                  <span>Email: {clinic.email || 'info@columbuschiropractic.co.uk'}</span>
                  <span>•</span>

                </div>
              </div>

              <div className="text-right sm:border-l sm:border-stone-300 sm:pl-4 shrink-0">
                <span className="inline-block bg-stone-900 text-white font-mono uppercase font-bold text-[9px] px-2 py-0.5 rounded tracking-wider mb-1">
                  CLINICAL SUMMARY
                </span>
                <p className="font-mono text-xs font-bold text-stone-900">CHART REF: {lead.id}</p>
                <p className="text-[11px] text-stone-500 font-mono">DOS: {lead.date} {lead.time}</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 flex items-center justify-between text-stone-800">
              <span className="font-serif font-bold uppercase tracking-wider text-xs">
                Chiropractic Encounter Record & Insurance Superbill Statement
              </span>
              <span className="font-mono text-[10px] text-stone-500">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* 2. Patient Demographics & Encounter Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-500 block">Patient Name</span>
                <span className="font-bold text-stone-950 text-sm">{lead.name}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-500 block">Contact Phone</span>
                <span className="font-mono text-stone-800">{lead.phone || 'On file'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-500 block">Attending Clinician</span>
                <span className="font-semibold text-stone-900">{lead.practitionerName || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-500 block">Account Status</span>
                <span className="font-semibold text-emerald-800">
                  {lead.status || 'Not recorded'}
                </span>
              </div>
            </div>

            {/* 3. Subjective Chief Complaint & 2D Anatomical Pain Mapping */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Subjective History & Anatomical Pain Mapping</span>
                </h4>
                <span className="font-mono text-[10px] text-stone-500">Visual Analog Scale (VAS)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Textual Subjective */}
                <div className="md:col-span-2 space-y-2">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Chief Complaint / Area:</span>
                      <strong className="text-stone-900">{intake?.painArea || lead.condition || 'Not recorded'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Pain Intensity (VAS):</span>
                      <strong className="text-emerald-900 font-mono text-sm">
                        {intake?.painLevel ?? 'Not recorded'} / 10 ({intake?.painType || 'Not recorded'})
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Onset / Chronicity:</span>
                      <span className="text-stone-800">{intake?.painDuration || 'Not recorded'}</span>
                    </div>
                  </div>

                  {/* Symptoms & Aggravating Factors */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <span className="font-bold text-stone-700 block mb-1 text-[10px] uppercase">Reported Symptoms:</span>
                      <p className="text-stone-600 leading-snug">
                        {intake?.symptoms?.join(', ') || 'Not recorded'}
                      </p>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <span className="font-bold text-stone-700 block mb-1 text-[10px] uppercase">Aggravating Factors:</span>
                      <p className="text-stone-600 leading-snug">
                        {intake?.aggravatingFactors?.join(', ') || 'Not recorded'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anatomy reference Diagram Box */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-bold text-stone-500 mb-1">
                    Anatomy reference
                  </span>
                  <div className="w-16 h-28 relative my-1 border border-stone-300 rounded-lg bg-white flex items-center justify-center p-1">
                    {/* Compact Stylized Silhouette for Print */}
                    <svg viewBox="0 0 100 180" className="w-full h-full text-stone-700">
                      <ellipse cx="50" cy="18" rx="10" ry="12" fill="#e7e5e4" stroke="#78716c" strokeWidth="1" />
                      <path d="M 30 38 Q 50 32 70 38 L 74 65 L 66 100 L 62 120 L 38 120 L 34 100 L 26 65 Z" fill="#e7e5e4" stroke="#78716c" strokeWidth="1" />
                      <line x1="50" y1="32" x2="50" y2="115" stroke="#059669" strokeWidth="2" strokeDasharray="2,2" />
                      {/* Highlighted indicator nodes */}



                    </svg>
                  </div>
                  <div className="text-[10px] text-stone-700 font-semibold mt-1">
                    {intake?.bodyRegions && intake.bodyRegions.length > 0
                      ? intake.bodyRegions.join(', ')
                      : 'No regions recorded'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Objective Clinical Triage & Safety Clearance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Patient-reported safety information</span>
                </h4>
                <span className="font-mono text-[10px] text-stone-500">Requires clinician review</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Cauda Equina / Saddle Anesthesia</span>
                  <strong className={intake?.contraindications?.lossOfBowelBladder ? 'text-rose-700' : 'text-emerald-800'}>
                    {intake?.contraindications?.lossOfBowelBladder ? '⚠️ POSITIVE - FLAGGED' : 'Not reported; review required'}
                  </strong>
                </div>

                <div className="p-2 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Osteoporosis / Fracture Screen</span>
                  <strong className={intake?.contraindications?.osteoporosisOrFracture ? 'text-amber-700' : 'text-emerald-800'}>
                    {intake?.contraindications?.osteoporosisOrFracture ? 'Positive' : 'Not reported; review required'}
                  </strong>
                </div>

                <div className="p-2 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Anticoagulants / Blood Thinners</span>
                  <strong className={intake?.contraindications?.bloodThinners ? 'text-amber-700' : 'text-emerald-800'}>
                    {intake?.contraindications?.bloodThinners ? 'Positive' : 'Not reported; review required'}
                  </strong>
                </div>

                <div className="p-2 bg-stone-50 rounded border border-stone-200">
                  <span className="text-stone-500 block">Pacemaker / Metallic Implants</span>
                  <strong className={intake?.contraindications?.pacemakerOrImplant ? 'text-stone-700' : 'text-emerald-800'}>
                    {intake?.contraindications?.pacemakerOrImplant ? 'Reported' : 'Not reported; review required'}
                  </strong>
                </div>
              </div>
            </div>

            {/* 5. Objective Clinical Narrative & Treatment Rendered */}
            <div className="space-y-1.5">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Assessment & Services Rendered</span>
              </h4>
              <p className="text-stone-700 text-xs leading-relaxed p-3 bg-stone-50 rounded-xl border border-stone-200 font-serif">
                {doctorNotes}
              </p>
            </div>

            {/* 6. Insurance Superbill Table (ICD-10 & CPT) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-stone-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>4. Clinician-entered procedure charges</span>
                </h4>
                <span className="font-mono text-[10px] text-stone-500">Diagnostic & Procedure Codes</span>
              </div>

              {/* Diagnoses Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase self-center mr-1">ICD-10:</span>
                {selectedIcd.map((i) => (
                  <span key={i.code} className="px-2 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px] text-stone-800">
                    <strong>{i.code}</strong>: {i.description}
                  </span>
                ))}
              </div>

              {/* Procedure Code Table */}
              <table className="w-full text-left border-collapse border border-stone-200 text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 uppercase font-bold text-[9px]">
                    <th className="p-2 border border-stone-200">CPT Code</th>
                    <th className="p-2 border border-stone-200">Service Description</th>
                    <th className="p-2 border border-stone-200 text-center">Units</th>
                    <th className="p-2 border border-stone-200 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCpt.map((c) => (
                    <tr key={c.cpt} className="border-b border-stone-200">
                      <td className="p-2 border border-stone-200 font-mono font-bold text-stone-900">{c.cpt}</td>
                      <td className="p-2 border border-stone-200 text-stone-800">{c.description}</td>
                      <td className="p-2 border border-stone-200 text-center font-mono">1</td>
                      <td className="p-2 border border-stone-200 text-right font-mono font-semibold">{clinic.currencySymbol || '$'}{c.fee.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 font-bold">
                    <td colSpan={3} className="p-2 text-right uppercase text-[10px] text-stone-600">Total Superbill Charge:</td>
                    <td className="p-2 text-right font-mono text-emerald-900 text-sm">{clinic.currencySymbol || '$'}{totalBilling.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7. Patient Informed Consent & Digital Signature Capture */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{intake?.informedConsentAgreed && intake?.signatureDataUrl ? 'Patient intake acknowledgment recorded' : 'No signed intake acknowledgment recorded'}</span>
                </div>
                <p className="text-[10px] text-stone-500 max-w-sm">
                  Review the recorded intake and discuss treatment consent with the patient. This summary does not verify identity or establish clinical clearance.
                </p>
                <p className="text-[10px] text-stone-400 font-mono">
                  Signed: {intake?.signedAt && intake?.signatureDataUrl ? new Date(intake.signedAt).toLocaleString() : 'Not recorded'}
                </p>
              </div>

              {intake?.signatureDataUrl ? (
                <div className="p-2 bg-white rounded-xl border border-stone-300 w-44 text-center shrink-0">
                  <img
                    src={intake.signatureDataUrl}
                    alt="Patient Digital Signature"
                    className="h-10 w-auto object-contain mx-auto"
                  />
                  <span className="text-[8px] font-mono text-stone-400 block mt-0.5 border-t border-stone-200 pt-0.5">
                    Patient-provided signature
                  </span>
                </div>
              ) : (
                <div className="p-2 bg-white rounded-xl border border-stone-300 w-44 text-center text-[10px] font-mono text-emerald-800">
                  Signature not recorded
                </div>
              )}
            </div>

            {/* 8. Attending Physician Attestation & Signature Line */}
            <div className="pt-2 border-t-2 border-stone-900 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-stone-500 block">Treating Provider Certification</span>
                <p className="text-[10px] text-stone-600 leading-snug">
                  I certify that the clinical history, examination, and procedures listed above were medically necessary and personally rendered by me in accordance with professional chiropractic standards.
                </p>
              </div>

              <div className="flex flex-col items-end justify-end">
                <div className="w-48 border-b border-stone-900 pb-1 text-center font-serif italic text-sm text-stone-800">
                  &nbsp;
                </div>
                <div className="w-48 flex justify-between text-[9px] text-stone-500 font-mono pt-0.5">
                  <span>Provider Signature</span>
                  <span>Date: {lead.date}</span>
                </div>
              </div>
            </div>

            {/* Statutory Medico-Legal Disclaimer Box */}
            <div className="p-2.5 bg-stone-100 rounded-lg text-[9px] text-stone-500 text-center border border-stone-200 leading-snug">
              <strong>Clinical & Medico-Legal Notice:</strong> This intake is educational and administrative. It does not replace professional clinical judgment. All findings must be reviewed by a licensed practitioner before treatment.
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0 no-print">
          <span className="text-xs text-stone-400">
            This print-only summary uses the notes and fees entered here. Save the PDF to your clinical record system before closing; this editor does not persist an encounter.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
