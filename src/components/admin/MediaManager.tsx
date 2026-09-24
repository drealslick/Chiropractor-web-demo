import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
  User,
  Building,
  HeartHandshake,
  FileImage,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import heroImg from '../../assets/images/clinic_hero_care_1789573961612.jpg';
import doctorImg from '../../assets/images/doctor_portrait_1789573972470.jpg';
import clinicRoomImg from '../../assets/images/clinic_interior_room_1789573983752.jpg';
import michaelImg from '../../assets/images/patient_michael_tennis_1789573994707.jpg';

interface MediaManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

interface ImageSlotConfig {
  id: string;
  imageKey: keyof ClinicInfo;
  altKey: keyof ClinicInfo;
  title: string;
  subtitle: string;
  helperText: string;
  recommendedSize: string;
  aspectRatio: 'aspect-video' | 'aspect-[4/5]' | 'aspect-square';
  defaultAsset: string;
  icon: React.ElementType;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const imageSlots: ImageSlotConfig[] = [
    {
      id: 'hero',
      imageKey: 'heroImage',
      altKey: 'heroImageAlt',
      title: 'Homepage Hero & Header Visual',
      subtitle: 'Primary visual card shown above the fold on the homepage right next to the discomfort selector.',
      helperText: 'Shows your clean clinic environment, modern equipment, or welcoming reception desk.',
      recommendedSize: '1200 × 800px (16:9 Landscape)',
      aspectRatio: 'aspect-video',
      defaultAsset: heroImg,
      icon: Layers,
    },
    {
      id: 'doctor',
      imageKey: 'doctorImage',
      altKey: 'doctorImageAlt',
      title: 'Lead Doctor Portrait',
      subtitle: 'Doctor profile photo in the "Meet Dr. Vance" and credentials section.',
      helperText: 'Professional clinical headshot, warm smile, white coat or clinical scrubs.',
      recommendedSize: '800 × 1000px (4:5 Portrait)',
      aspectRatio: 'aspect-[4/5]',
      defaultAsset: doctorImg,
      icon: User,
    },
    {
      id: 'clinic',
      imageKey: 'clinicImage',
      altKey: 'clinicImageAlt',
      title: 'Treatment Room & Sanctuary Interior',
      subtitle: 'Shows treatment tables, spinal decompression bay, or rehabilitation space in the Clinic Tour.',
      helperText: 'High-res photo illustrating a calm, spotless, and comforting practice setting.',
      recommendedSize: '1200 × 800px (16:9 Landscape)',
      aspectRatio: 'aspect-video',
      defaultAsset: clinicRoomImg,
      icon: Building,
    },
    {
      id: 'patient',
      imageKey: 'patientImage',
      altKey: 'patientImageAlt',
      title: 'Patient Recovery & Comeback Story',
      subtitle: 'Featured patient testimonial showcase (active lifestyle / athletic comeback).',
      helperText: 'Patient doing what they love after recovery (tennis, running, golf, or pain-free family time).',
      recommendedSize: '800 × 800px (1:1 Square)',
      aspectRatio: 'aspect-square',
      defaultAsset: michaelImg,
      icon: HeartHandshake,
    },
    {
      id: 'logo',
      imageKey: 'logoUrl',
      altKey: 'logoUrlAlt',
      title: 'Practice Brand Logo / Mark',
      subtitle: 'Displayed in top navbar and footer branding block.',
      helperText: 'Transparent PNG or SVG vector logo. If blank, the practice initial monogram is rendered.',
      recommendedSize: '512 × 512px (Square / Transparent PNG)',
      aspectRatio: 'aspect-square',
      defaultAsset: '',
      icon: FileImage,
    },
  ];

  const handleFileUpload = async (slot: ImageSlotConfig, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    setProcessingKey(slot.id);

    try {
      // Compress to high quality while keeping local storage footprint small
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      onUpdateClinic({
        ...clinic,
        [slot.imageKey]: compressed,
        // Auto populate alt text if empty
        [slot.altKey]: clinic[slot.altKey] || `${slot.title} at ${clinic.name || 'our clinic'}`,
      });

      setActiveNotification(`Successfully uploaded ${slot.title}!`);
      setTimeout(() => setActiveNotification(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to process image. Please try a different file.');
    } finally {
      setProcessingKey(null);
    }
  };

  const handleReset = (slot: ImageSlotConfig) => {
    onUpdateClinic({
      ...clinic,
      [slot.imageKey]: slot.defaultAsset,
      [slot.altKey]: undefined,
    });
    setActiveNotification(`Reset ${slot.title} to studio default.`);
    setTimeout(() => setActiveNotification(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Photos & Visual Assets (Image Uploader)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Upload custom practice photography with drag-and-drop. Auto-compresses for fast mobile load times and enforces SEO Alt Text.
          </p>
        </div>

        {activeNotification && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeNotification}</span>
          </div>
        )}
      </div>

      {/* Info Tip */}
      <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-3 text-xs text-stone-300">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-100 font-semibold">Automatic Optimization & SEO Compliance:</strong>
          <p className="text-stone-400 text-[11px] mt-0.5 leading-relaxed">
            Uploaded images are processed in-browser, converted to lightweight WebP/JPEG data, and saved instantly. Always include descriptive <strong className="text-stone-200">Alt Text</strong> to improve Google Image search rankings and assist visually impaired visitors.
          </p>
        </div>
      </div>

      {/* Image Slots Grid */}
      <div className="space-y-6">
        {imageSlots.map((slot) => {
          const Icon = slot.icon;
          const currentValue = (clinic[slot.imageKey] as string) || slot.defaultAsset;
          const currentAlt = (clinic[slot.altKey] as string) || '';
          const isProcessing = processingKey === slot.id;
          const isBase64 = currentValue?.startsWith('data:image/');
          const isDefault = currentValue === slot.defaultAsset && !isBase64;

          return (
            <div
              key={slot.id}
              className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4 hover:border-stone-750 transition"
            >
              {/* Slot Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-750 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 tracking-tight flex items-center gap-2">
                      {slot.title}
                      {isBase64 ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Custom Upload
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                          Studio Preset
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-400">{slot.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] text-stone-500 font-mono hidden md:inline">
                    {slot.recommendedSize}
                  </span>
                  {(!isDefault || isBase64) && (
                    <button
                      type="button"
                      onClick={() => handleReset(slot)}
                      className="px-2.5 py-1 text-stone-400 hover:text-amber-400 bg-stone-900 hover:bg-stone-800 border border-stone-750 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      title="Restore original template asset"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Default</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Drop Zone & Preview Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Visual Preview */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div
                    className={`w-full max-w-[260px] ${slot.aspectRatio} rounded-xl overflow-hidden bg-stone-950 border border-stone-750 relative shadow-inner flex items-center justify-center group`}
                  >
                    {currentValue ? (
                      <img
                        src={currentValue}
                        alt={currentAlt || slot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4 text-stone-600">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No image configured</span>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                        <span className="text-xs font-bold">Compressing...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropzone & Inputs */}
                <div className="md:col-span-7 space-y-3">
                  {/* File Upload Zone */}
                  <label className="relative border-2 border-dashed border-stone-700 hover:border-emerald-500 bg-stone-900/60 hover:bg-stone-900 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition group text-center">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot, file);
                      }}
                    />
                    <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-emerald-400 transition-colors mb-1.5" />
                    <span className="text-xs font-semibold text-stone-200 group-hover:text-white">
                      Click to choose or drag & drop photo
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      Supports PNG, JPG, or WebP • Recommended: {slot.recommendedSize}
                    </span>
                  </label>

                  {/* Alt Text for SEO */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
                        <span>Image Alt Text (SEO & Accessibility)</span>
                        <span className="text-amber-400">*</span>
                      </label>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {currentAlt.length}/100 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={currentAlt}
                      placeholder={`e.g. ${slot.title} at ${clinic.name || 'our clinic'}`}
                      onChange={(e) =>
                        onUpdateClinic({
                          ...clinic,
                          [slot.altKey]: e.target.value,
                        })
                      }
                      className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Info className="w-3 h-3 text-stone-500 shrink-0" />
                      <span>Used by Google Image search bots and screen readers.</span>
                    </p>
                  </div>

                  {/* Direct URL Input (Alternative) */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-medium text-stone-400 block">
                      Direct Image URL (Optional CDN / Cloud Storage link)
                    </label>
                    <input
                      type="text"
                      value={isBase64 ? '(Custom Uploaded File)' : currentValue}
                      disabled={isBase64}
                      placeholder="https://example.com/images/clinic.jpg"
                      onChange={(e) =>
                        onUpdateClinic({
                          ...clinic,
                          [slot.imageKey]: e.target.value,
                        })
                      }
                      className={`w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-300 placeholder-stone-600 focus:outline-none focus:border-emerald-500 ${
                        isBase64 ? 'opacity-60 cursor-not-allowed text-stone-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
