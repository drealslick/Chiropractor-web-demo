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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientLead, savePatientIntakeForm } from '../data/leadsStore';

interface IntakeQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: PatientLead;
  onIntakeCompleted: (updatedLead: PatientLead) => void;
}

const PAIN_AREAS = [
  { id: 'lower_back', label: 'Lower Back & Sciatica', icon: '🦴' },
  { id: 'neck_cervical', label: 'Neck & Cervical Spine', icon: '🧠' },
  { id: 'shoulder_arm', label: 'Shoulder / Rotator Cuff', icon: '💪' },
  { id: 'mid_back', label: 'Mid-Back & Ribs', icon: '⚡' },
  { id: 'headaches', label: 'Headaches & Jaw / TMJ', icon: '💆' },
  { id: 'extremities', label: 'Hip / Knee / Extremity', icon: '🦵' },
];

const COMMON_SYMPTOMS = [
  'Sharp shooting pain',
  'Dull aching muscle tension',
  'Numbness or tingling in fingers/toes',
  'Morning stiffness (> 30 mins)',
  'Pain triggered by sitting at a desk',
  'Difficulty sleeping due to discomfort',
  'Reduced range of motion',
];

export const IntakeQuestionnaireModal: React.FC<IntakeQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  lead,
  onIntakeCompleted,
}) => {
  const [step, setStep] = useState<number>(1);
  const [painArea, setPainArea] = useState<string>(lead.condition || 'Lower Back & Sciatica');
  const [painLevel, setPainLevel] = useState<number>(6);
  const [painDuration, setPainDuration] = useState<string>('2 to 4 weeks');
  const [painType, setPainType] = useState<string>('Sharp / Stabbing');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Sharp shooting pain', 'Morning stiffness (> 30 mins)']);
  const [priorSurgeries, setPriorSurgeries] = useState<string>('None reported');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const intakePayload = {
        painArea,
        painLevel,
        painDuration,
        painType,
        symptoms: selectedSymptoms,
        priorSurgeries,
        completedAt: new Date().toISOString(),
      };

      const res = savePatientIntakeForm(lead.id, intakePayload);
      setIsSubmitting(false);
      setSuccess(true);
      if (res.success && res.updatedLead) {
        onIntakeCompleted(res.updatedLead);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-50 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Digital Pre-Visit Intake</h3>
              <p className="text-xs text-stone-300">Patient: {lead.name} • Ref: {lead.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-stone-900">Intake Questionnaire Received!</h4>
              <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                Thank you, {lead.name}. Your clinical intake details have been securely saved to your patient record. Your chiropractor will review this prior to your consultation.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-emerald-900 transition cursor-pointer shadow-md"
              >
                Return to Portal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 border-b border-stone-200 pb-3">
                <span className={step === 1 ? 'text-emerald-800 font-bold' : ''}>1. Pain Region & Severity</span>
                <span>→</span>
                <span className={step === 2 ? 'text-emerald-800 font-bold' : ''}>2. Symptoms & Medical History</span>
              </div>

              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Primary Pain Region / Area
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PAIN_AREAS.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setPainArea(area.label)}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                            painArea === area.label
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-base">{area.icon}</span>
                          <span>{area.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pain Severity Slider */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Pain Severity Level (1 to 10)
                      </label>
                      <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${
                        painLevel >= 8 ? 'bg-rose-100 text-rose-800' : painLevel >= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {painLevel} / 10 {painLevel >= 8 ? '(Severe)' : painLevel >= 5 ? '(Moderate)' : '(Mild)'}
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
                      <span>1 (Mild Discomfort)</span>
                      <span>5 (Moderate)</span>
                      <span>10 (Unbearable)</span>
                    </div>
                  </div>

                  {/* Pain Duration & Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Duration of Onset
                      </label>
                      <select
                        value={painDuration}
                        onChange={(e) => setPainDuration(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="Less than 1 week">Less than 1 week</option>
                        <option value="1 to 4 weeks">1 to 4 weeks</option>
                        <option value="1 to 6 months">1 to 6 months</option>
                        <option value="Over 6 months / Chronic">Over 6 months / Chronic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Pain Character
                      </label>
                      <select
                        value={painType}
                        onChange={(e) => setPainType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="Sharp / Stabbing">Sharp / Stabbing</option>
                        <option value="Dull / Aching">Dull / Aching</option>
                        <option value="Burning / Nerve-like">Burning / Nerve-like</option>
                        <option value="Throbbing / Stiff">Throbbing / Stiff</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Next: Symptoms & History</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Associated Symptoms (Select all that apply)
                    </label>
                    <div className="space-y-2">
                      {COMMON_SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <span>{symptom}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? 'bg-emerald-700 text-white' : 'border border-stone-300'}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Prior Surgeries, Accidents, or Medical Conditions
                    </label>
                    <textarea
                      rows={3}
                      value={priorSurgeries}
                      onChange={(e) => setPriorSurgeries(e.target.value)}
                      placeholder="e.g. Car accident in 2022, no prior spinal surgery..."
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Saving Intake...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <span>Submit Intake Questionnaire</span>
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
