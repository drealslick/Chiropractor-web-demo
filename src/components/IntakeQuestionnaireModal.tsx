import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
  Check,
  AlertTriangle,
  PenTool,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientLead, savePatientIntakeForm } from '../data/leadsStore';
import { BodyPainLocator } from './BodyPainLocator';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface IntakeQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: PatientLead;
  onIntakeCompleted?: (updatedLead: PatientLead) => void;
}

const COMMON_SYMPTOMS = [
  'Sharp radiating or shooting pain',
  'Dull aching muscular tension',
  'Numbness or tingling in fingers, toes, or feet',
  'Morning stiffness lasting > 30 minutes',
  'Pain triggered by prolonged desk sitting',
  'Difficulty falling or staying asleep due to discomfort',
  'Noticeable reduction in spinal range of motion',
  'Tension headaches originating from base of skull',
];

const AGGRAVATING_FACTORS = [
  'Prolonged sitting at desk/driving',
  'Bending forward or lifting',
  'Standing upright for > 20 mins',
  'Walking or running',
  'Coughing, sneezing, or bearing down',
  'Morning waking / sleeping flat',
];

export const IntakeQuestionnaireModal: React.FC<IntakeQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  lead,
  onIntakeCompleted,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Body Map & Pain Character
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>(
    lead.intakeForm?.bodyRegions || ['lumbar']
  );
  const [painArea, setPainArea] = useState<string>(
    lead.intakeForm?.painArea || lead.condition || 'Lower Back & Lumbar Spine'
  );
  const [painLevel, setPainLevel] = useState<number>(lead.intakeForm?.painLevel || 6);
  const [painDuration, setPainDuration] = useState<string>(lead.intakeForm?.painDuration || '2 to 4 weeks');
  const [painType, setPainType] = useState<string>(lead.intakeForm?.painType || 'Sharp / Stabbing');
  const [selectedAggravators, setSelectedAggravators] = useState<string[]>(
    lead.intakeForm?.aggravatingFactors || ['Prolonged sitting at desk/driving']
  );

  // Step 2: Symptoms & Red Flags
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    lead.intakeForm?.symptoms || ['Sharp radiating or shooting pain', 'Morning stiffness lasting > 30 minutes']
  );
  const [contraindications, setContraindications] = useState({
    lossOfBowelBladder: lead.intakeForm?.contraindications?.lossOfBowelBladder || false,
    unexplainedWeightLoss: lead.intakeForm?.contraindications?.unexplainedWeightLoss || false,
    historyOfCancer: lead.intakeForm?.contraindications?.historyOfCancer || false,
    osteoporosisOrFracture: lead.intakeForm?.contraindications?.osteoporosisOrFracture || false,
    pacemakerOrImplant: lead.intakeForm?.contraindications?.pacemakerOrImplant || false,
    bloodThinners: lead.intakeForm?.contraindications?.bloodThinners || false,
    pregnant: lead.intakeForm?.contraindications?.pregnant || false,
  });
  const [priorSurgeries, setPriorSurgeries] = useState<string>(
    lead.intakeForm?.priorSurgeries || 'No prior surgeries or spinal implants reported.'
  );

  // Step 3: Consent & Signature
  const [informedConsentAgreed, setInformedConsentAgreed] = useState<boolean>(
    lead.intakeForm?.informedConsentAgreed !== false
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(
    lead.intakeForm?.signatureDataUrl || null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const hasRedFlags =
    contraindications.lossOfBowelBladder ||
    contraindications.unexplainedWeightLoss ||
    contraindications.historyOfCancer ||
    contraindications.osteoporosisOrFracture ||
    contraindications.bloodThinners;

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const toggleAggravator = (factor: string) => {
    if (selectedAggravators.includes(factor)) {
      setSelectedAggravators(selectedAggravators.filter((f) => f !== factor));
    } else {
      setSelectedAggravators([...selectedAggravators, factor]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!informedConsentAgreed) {
      alert('Please review and check the informed consent acknowledgment to proceed.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const intakePayload = {
        painArea,
        bodyRegions: selectedBodyRegions,
        painLevel,
        painDuration,
        painType,
        symptoms: selectedSymptoms,
        aggravatingFactors: selectedAggravators,
        priorSurgeries,
        contraindications,
        hasRedFlags,
        informedConsentAgreed,
        signatureDataUrl: signatureDataUrl || undefined,
        signedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const res = savePatientIntakeForm(lead.id, intakePayload);
      setIsSubmitting(false);
      setSuccess(true);
      if (res.success && res.updatedLead && onIntakeCompleted) {
        onIntakeCompleted(res.updatedLead);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-50 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Digital Pre-Visit Intake & Triage
              </h3>
              <p className="text-xs text-stone-300">
                Patient: <span className="font-semibold text-emerald-400">{lead.name}</span> • Ref:{' '}
                <span className="font-mono text-stone-300">{lead.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persistent Medico-Legal Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-5 py-2.5 flex items-start gap-2.5 text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
            <strong>Medical Notice:</strong> This intake is educational and administrative. It does not replace professional clinical judgment. All findings must be reviewed by a licensed practitioner before treatment.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-stone-900">
                Clinical Intake Received & Locked
              </h4>
              <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{lead.name}</strong>. Your anatomical pain mapping, triage markers,
                and digital signature have been securely encrypted and attached to your appointment record.
              </p>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl max-w-sm mx-auto text-left text-xs space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Pain Level:</span>
                  <strong className="text-stone-900">{painLevel} / 10</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mapped Regions:</span>
                  <strong className="text-stone-900">{selectedBodyRegions.length} zones</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-emerald-700">Ready for Doctor Review ✓</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-emerald-900 transition cursor-pointer shadow-md"
                >
                  Return to Patient Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clinical Flow Step Tracker */}
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 border-b border-stone-200 pb-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    step === 1 ? 'text-emerald-800 font-bold' : 'hover:text-stone-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>2D Pain Map</span>
                </button>
                <span className="text-stone-300">→</span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    step === 2 ? 'text-emerald-800 font-bold' : 'hover:text-stone-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Symptoms & Triage</span>
                </button>
                <span className="text-stone-300">→</span>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    step === 3 ? 'text-emerald-800 font-bold' : 'hover:text-stone-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Consent & Signature</span>
                </button>
              </div>

              {/* STEP 1: 2D Pain Map & Characteristics */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Interactive Body Pain Locator */}
                  <BodyPainLocator
                    selectedRegions={selectedBodyRegions}
                    onChange={(regions) => {
                      setSelectedBodyRegions(regions);
                      if (regions.length > 0) {
                        setPainArea(regions.join(', '));
                      }
                    }}
                  />

                  {/* Pain Severity Slider (1-10) */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Pain Severity Level (Visual Analog Scale 1–10)
                      </label>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          painLevel >= 8
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : painLevel >= 5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {painLevel} / 10{' '}
                        {painLevel >= 8
                          ? '(Severe / Debilitating)'
                          : painLevel >= 5
                          ? '(Moderate Tension)'
                          : '(Mild Discomfort)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                      <span>1 (Barely noticeable)</span>
                      <span>5 (Interrupts desk work)</span>
                      <span>10 (Emergency/Incapacitating)</span>
                    </div>
                  </div>

                  {/* Duration & Quality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Onset Duration
                      </label>
                      <select
                        value={painDuration}
                        onChange={(e) => setPainDuration(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="Less than 1 week (Acute)">Less than 1 week (Acute)</option>
                        <option value="1 to 4 weeks (Subacute)">1 to 4 weeks (Subacute)</option>
                        <option value="1 to 6 months (Persistent)">1 to 6 months (Persistent)</option>
                        <option value="Over 6 months (Chronic)">Over 6 months (Chronic)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Pain Sensation Character
                      </label>
                      <select
                        value={painType}
                        onChange={(e) => setPainType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="Sharp / Stabbing">Sharp / Stabbing</option>
                        <option value="Dull / Deep Aching">Dull / Deep Aching</option>
                        <option value="Burning / Radicular Nerve Pain">Burning / Radicular Nerve Pain</option>
                        <option value="Throbbing / Joint Stiffness">Throbbing / Joint Stiffness</option>
                      </select>
                    </div>
                  </div>

                  {/* Aggravating Factors */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      What Aggravates Your Symptoms? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AGGRAVATING_FACTORS.map((factor) => {
                        const isSelected = selectedAggravators.includes(factor);
                        return (
                          <button
                            key={factor}
                            type="button"
                            onClick={() => toggleAggravator(factor)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <span>{factor}</span>
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                isSelected ? 'bg-emerald-700 text-white' : 'border border-stone-300'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Next: Symptoms & Clinical Triage</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Associated Symptoms & Red Flags */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Neurological & Functional Symptoms */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Associated Symptoms (Select all that apply)
                    </label>
                    <div className="space-y-1.5">
                      {COMMON_SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <span>{symptom}</span>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-emerald-700 text-white' : 'border border-stone-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CLINICAL SAFETY: Contraindications & Red Flags */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Clinical Safety & Contraindication Screen
                      </h4>
                    </div>

                    {/* Prominent Emergency Escalation Notice */}
                    <div className="p-3 bg-rose-100/90 border border-rose-300 rounded-xl space-y-1 text-rose-950">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                        <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>EMERGENCY RED FLAG PROTOCOL (CAUDA EQUINA SYNDROME)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-900">
                        Sudden loss of bowel or bladder control, numbness in the groin/saddle region, or progressive lower limb weakness are clinical red flags requiring <strong>immediate hospital Emergency Department (A&E / ER) medical evaluation</strong>. Do not wait for a clinic appointment if experiencing these symptoms.
                      </p>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-snug">
                      To ensure your safety and adjust treatment techniques appropriately, please answer the
                      following health questions honestly:
                    </p>

                    <div className="space-y-2 pt-1 text-xs">
                      {/* Red Flag 1: Cauda Equina */}
                      <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contraindications.lossOfBowelBladder}
                          onChange={(e) =>
                            setContraindications({
                              ...contraindications,
                              lossOfBowelBladder: e.target.checked,
                            })
                          }
                          className="mt-0.5 accent-rose-600 rounded"
                        />
                        <span className="text-stone-800">
                          <strong>Sudden loss of bowel or bladder control</strong> or numbness in the groin /
                          saddle area (Cauda Equina Red Flag).
                        </span>
                      </label>

                      {/* Red Flag 2: Bone Density / Fracture */}
                      <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contraindications.osteoporosisOrFracture}
                          onChange={(e) =>
                            setContraindications({
                              ...contraindications,
                              osteoporosisOrFracture: e.target.checked,
                            })
                          }
                          className="mt-0.5 accent-amber-600 rounded"
                        />
                        <span className="text-stone-800">
                          Diagnosed <strong>osteoporosis</strong>, bone density reduction, or recent spinal fracture.
                        </span>
                      </label>

                      {/* Red Flag 3: Blood thinners */}
                      <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contraindications.bloodThinners}
                          onChange={(e) =>
                            setContraindications({
                              ...contraindications,
                              bloodThinners: e.target.checked,
                            })
                          }
                          className="mt-0.5 accent-amber-600 rounded"
                        />
                        <span className="text-stone-800">
                          Taking <strong>blood thinners / anticoagulant medication</strong> (e.g. Warfarin,
                          Eliquis).
                        </span>
                      </label>

                      {/* Red Flag 4: Pacemaker */}
                      <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contraindications.pacemakerOrImplant}
                          onChange={(e) =>
                            setContraindications({
                              ...contraindications,
                              pacemakerOrImplant: e.target.checked,
                            })
                          }
                          className="mt-0.5 accent-amber-600 rounded"
                        />
                        <span className="text-stone-800">
                          Implanted <strong>cardiac pacemaker</strong>, defibrillator, or metallic surgical hardware.
                        </span>
                      </label>
                    </div>

                    {hasRedFlags && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>
                          Clinical Notice: Your doctor has been flagged to perform tailored gentle neurological
                          examination protocols prior to any manual therapy.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Prior Surgeries / Freeform History */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Prior Surgeries, Major Accidents, or Medical Conditions
                    </label>
                    <textarea
                      rows={2}
                      value={priorSurgeries}
                      onChange={(e) => setPriorSurgeries(e.target.value)}
                      placeholder="e.g. Lumbar microdiscectomy in 2021, fractured clavicle in childhood..."
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Pain Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Next: Informed Consent</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Informed Consent & Digital Signature */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Informed Consent Policy Accordion */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-900 text-[11px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Informed Consent for Chiropractic Examination & Care</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto pr-2 space-y-2 text-[11px] leading-relaxed text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
                      <p>
                        I hereby request and consent to the performance of chiropractic examinations, postural
                        scans, orthopaedic and neurological tests, and subsequent manual or instrument-assisted
                        spinal adjustments.
                      </p>
                      <p>
                        I understand that, as with any healthcare procedure, chiropractic care involves potential
                        benefits as well as risks. Common reactions include transient muscle soreness or
                        stiffness lasting 24–48 hours following spinal mobilization. Extremely rare risks include
                        sprains, disc injuries, or vascular complications.
                      </p>
                      <p>
                        I acknowledge that I have the right to ask questions, discuss treatment options, and
                        decline any specific diagnostic or therapeutic modality at any point.
                      </p>
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={informedConsentAgreed}
                        onChange={(e) => setInformedConsentAgreed(e.target.checked)}
                        className="mt-0.5 accent-emerald-700 rounded"
                      />
                      <span className="text-[11px] text-stone-800 font-medium">
                        I have read, understood, and agree to the clinical informed consent terms outlined above.
                      </span>
                    </label>
                  </div>

                  {/* Digital Signature Pad */}
                  <DigitalSignaturePad
                    initialSignature={signatureDataUrl || undefined}
                    onSignatureChange={(sig) => setSignatureDataUrl(sig)}
                  />

                  {/* Explicit Medico-Legal Disclaimer Box */}
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Clinical & Regulatory Disclaimer</span>
                    </p>
                    <p className="leading-relaxed">
                      This intake is educational and administrative. It does not replace professional clinical judgment. All findings must be reviewed by a licensed practitioner before treatment.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !informedConsentAgreed}
                      className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving Clinical Chart...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <span>Submit & Lock Intake Form</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
