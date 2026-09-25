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
  Trash2,
  Crop,
  ChevronDown,
  ChevronUp,
  Sliders,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { ImageCropperModal, AspectRatioType } from './ImageCropperModal';
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
  aspectRatio: 'aspect-video' | 'aspect-[4/5]' | 'aspect-square' | 'aspect-[3/1]';
  cropperDefaultRatio: AspectRatioType;
  defaultAsset: string;
  icon: React.ElementType;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [processingState, setProcessingState] = useState<{
    slotId: string | null;
    progress: number;
    stepText: string;
  }>({
    slotId: null,
    progress: 0,
    stepText: '',
  });

  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [expandedAdvancedUrl, setExpandedAdvancedUrl] = useState<Record<string, boolean>>({});
  const [isDragOver, setIsDragOver] = useState<Record<string, boolean>>({});

  // Active crop modal state
  const [croppingModal, setCroppingModal] = useState<{
    isOpen: boolean;
    slot: ImageSlotConfig | null;
    imageSrc: string;
  }>({
    isOpen: false,
    slot: null,
    imageSrc: '',
  });

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
      cropperDefaultRatio: '16:9',
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
      cropperDefaultRatio: '4:5',
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
      cropperDefaultRatio: '16:9',
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
      cropperDefaultRatio: '1:1',
      defaultAsset: michaelImg,
      icon: HeartHandshake,
    },
    {
      id: 'logo',
      imageKey: 'logoUrl',
      altKey: 'logoUrlAlt',
      title: 'Practice Brand Logo / Mark',
      subtitle: 'Displayed in top navigation bar and footer branding block.',
      helperText: 'Transparent PNG or SVG vector. Standard horizontal layout: 250–400 × 50–100px. Square mark layout: 160 × 160px (or 512 × 512px). If blank, practice monogram initial is rendered.',
      recommendedSize: 'Horizontal: 300 × 75px | Square: 512 × 512px',
      aspectRatio: 'aspect-[3/1]',
      cropperDefaultRatio: '3:1',
      defaultAsset: '',
      icon: FileImage,
    },
  ];

  const handleFileUpload = async (slot: ImageSlotConfig, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    // Progress feedback simulation with real compression
    setProcessingState({
      slotId: slot.id,
      progress: 15,
      stepText: 'Reading image file...',
    });

    try {
      setTimeout(() => {
        setProcessingState((prev) =>
          prev.slotId === slot.id
            ? { ...prev, progress: 45, stepText: 'Analyzing dimensions & auto-compressing...' }
            : prev
        );
      }, 200);

      setTimeout(() => {
        setProcessingState((prev) =>
          prev.slotId === slot.id
            ? { ...prev, progress: 80, stepText: 'Optimizing high-fidelity WebP format...' }
            : prev
        );
      }, 450);

      // Compress to high quality while keeping local storage footprint small
      const compressed = await compressImage(file, 1400, 1400, 0.84);

      setProcessingState({
        slotId: slot.id,
        progress: 100,
        stepText: 'Finalizing image...',
      });

      const updatedClinicData: ClinicInfo = {
        ...clinic,
        [slot.imageKey]: compressed,
        // Auto populate alt text if empty
        [slot.altKey]: clinic[slot.altKey] || `${slot.title} at ${clinic.name || 'our clinic'}`,
      };

      // Keep logoUrl and logoImage dual properties synchronized
      if (slot.id === 'logo') {
        updatedClinicData.logoUrl = compressed;
        updatedClinicData.logoImage = compressed;
      }

      onUpdateClinic(updatedClinicData);

      setActiveNotification(`Successfully uploaded and optimized ${slot.title}!`);
      setTimeout(() => setActiveNotification(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to process image. Please try a different file.');
    } finally {
      setTimeout(() => {
        setProcessingState({ slotId: null, progress: 0, stepText: '' });
      }, 500);
    }
  };

  const handleClearImage = (slot: ImageSlotConfig) => {
    const updated: ClinicInfo = {
      ...clinic,
      [slot.imageKey]: '',
      [slot.altKey]: '',
    };
    if (slot.id === 'logo') {
      updated.logoUrl = '';
      updated.logoImage = '';
    }
    onUpdateClinic(updated);
    setActiveNotification(`Removed ${slot.title}.`);
    setTimeout(() => setActiveNotification(null), 2500);
  };

  const handleResetToDefault = (slot: ImageSlotConfig) => {
    const updated: ClinicInfo = {
      ...clinic,
      [slot.imageKey]: slot.defaultAsset,
      [slot.altKey]: undefined,
    };
    if (slot.id === 'logo') {
      updated.logoUrl = slot.defaultAsset;
      updated.logoImage = slot.defaultAsset;
    }
    onUpdateClinic(updated);
    setActiveNotification(`Restored studio preset for ${slot.title}.`);
    setTimeout(() => setActiveNotification(null), 2500);
  };

  const toggleAdvancedUrl = (slotId: string) => {
    setExpandedAdvancedUrl((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  const openCropper = (slot: ImageSlotConfig, currentVal: string) => {
    setCroppingModal({
      isOpen: true,
      slot,
      imageSrc: currentVal,
    });
  };

  const handleCroppedSave = (croppedDataUrl: string) => {
    if (!croppingModal.slot) return;
    const slot = croppingModal.slot;
    const updated: ClinicInfo = {
      ...clinic,
      [slot.imageKey]: croppedDataUrl,
    };
    if (slot.id === 'logo') {
      updated.logoUrl = croppedDataUrl;
      updated.logoImage = croppedDataUrl;
    }
    onUpdateClinic(updated);
    setActiveNotification(`Cropped and updated ${slot.title}!`);
    setTimeout(() => setActiveNotification(null), 3000);
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
            Upload custom practice photography with drag-and-drop. Auto-compresses for instant load times, includes built-in cropping, and enforces SEO Alt Text.
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
          <strong className="text-stone-100 font-semibold">Automatic Optimization, Framing & SEO Compliance:</strong>
          <p className="text-stone-400 text-[11px] mt-0.5 leading-relaxed">
            All files are automatically compressed in-browser to keep page speed blazing fast. Use the <strong className="text-stone-200">Crop & Frame</strong> tool to adjust positioning for 16:9, 4:5, or square layouts. Fill in descriptive <strong className="text-stone-200">Alt Text</strong> to boost Google SEO rankings.
          </p>
        </div>
      </div>

      {/* Image Slots Grid */}
      <div className="space-y-6">
        {imageSlots.map((slot) => {
          const Icon = slot.icon;
          const rawVal = clinic[slot.imageKey] as string | undefined;
          const currentValue = rawVal !== undefined ? rawVal : slot.defaultAsset;
          const currentAlt = (clinic[slot.altKey] as string) || '';
          const isProcessing = processingState.slotId === slot.id;
          const isBase64 = currentValue?.startsWith('data:image/');
          const isDefault = currentValue === slot.defaultAsset && !isBase64;
          const hasImage = Boolean(currentValue && currentValue.trim().length > 0);
          const isAdvancedOpen = Boolean(expandedAdvancedUrl[slot.id]);
          const isDraggingThis = Boolean(isDragOver[slot.id]);

          return (
            <div
              key={slot.id}
              className={`p-4 sm:p-5 bg-stone-850 border rounded-2xl space-y-4 transition ${
                isDraggingThis ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-stone-800/80' : 'border-stone-800 hover:border-stone-750'
              }`}
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
                      ) : isDefault ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                          Studio Preset
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                          Custom URL
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-400">{slot.subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] text-stone-500 font-mono hidden md:inline">
                    {slot.recommendedSize}
                  </span>

                  {/* Crop / Reframe button */}
                  {hasImage && (
                    <button
                      type="button"
                      onClick={() => openCropper(slot, currentValue)}
                      className="px-2.5 py-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      title="Adjust crop, framing & zoom"
                    >
                      <Crop className="w-3 h-3 text-emerald-400" />
                      <span>Crop / Frame</span>
                    </button>
                  )}

                  {/* Reset to Default */}
                  {(!isDefault || isBase64) && slot.defaultAsset && (
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(slot)}
                      className="px-2.5 py-1 text-stone-400 hover:text-amber-400 bg-stone-900 hover:bg-stone-800 border border-stone-750 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      title="Restore original template asset"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Preset</span>
                    </button>
                  )}

                  {/* Delete / Clear button */}
                  {hasImage && (
                    <button
                      type="button"
                      onClick={() => handleClearImage(slot)}
                      className="px-2 py-1 text-stone-400 hover:text-red-400 bg-stone-900 hover:bg-red-950/30 border border-stone-750 hover:border-red-800/60 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      title="Delete / Clear this photo"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Clear</span>
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
                    {hasImage ? (
                      <>
                        <img
                          src={currentValue}
                          alt={currentAlt || slot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {/* Quick Crop overlay button on hover */}
                        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCropper(slot, currentValue)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer hover:bg-emerald-400 transition"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Crop / Position</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearImage(slot)}
                            className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 text-stone-600">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No image configured</span>
                      </div>
                    )}

                    {/* Active Upload / Compression Progress Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 gap-2 text-white z-10 animate-fade-in">
                        <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                        <span className="text-xs font-bold tracking-tight">Auto-Compressing...</span>
                        <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${processingState.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 text-center font-mono">
                          {processingState.stepText || 'Optimizing image for web...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropzone & Inputs */}
                <div className="md:col-span-7 space-y-3">
                  {/* File Upload Zone with full drag and drop */}
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver((prev) => ({ ...prev, [slot.id]: true }));
                    }}
                    onDragLeave={() => {
                      setIsDragOver((prev) => ({ ...prev, [slot.id]: false }));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver((prev) => ({ ...prev, [slot.id]: false }));
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(slot, file);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer transition group text-center select-none ${
                      isDraggingThis
                        ? 'border-emerald-400 bg-emerald-950/30'
                        : 'border-stone-700 hover:border-emerald-500 bg-stone-900/60 hover:bg-stone-900'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      disabled={isProcessing}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(slot, file);
                      }}
                    />
                    <div className="flex items-center gap-2 mb-1.5">
                      <UploadCloud className="w-5 h-5 text-stone-400 group-hover:text-emerald-400 transition-colors" />
                      <Camera className="w-4 h-4 text-stone-500 sm:hidden" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200 group-hover:text-white">
                      Click to choose file or drag & drop photo
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      Auto-compressed to WebP/JPEG • Max quality • Touch / Mobile ready
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
                      <span>Helps Google search indexing and assists visually impaired screen readers.</span>
                    </p>
                  </div>

                  {/* Advanced Direct URL / Cloud Link (Hidden by default behind toggle) */}
                  <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/40">
                    <button
                      type="button"
                      onClick={() => toggleAdvancedUrl(slot.id)}
                      className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-850/60 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3 h-3 text-stone-500" />
                        <span>Advanced: Direct Image URL / Cloud CDN</span>
                      </span>
                      {isAdvancedOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                      )}
                    </button>

                    {isAdvancedOpen && (
                      <div className="p-3 border-t border-stone-800 space-y-2 bg-stone-950/40 animate-fade-in">
                        <p className="text-[10px] text-stone-400 leading-relaxed">
                          For developers or external CDN links (AWS S3, Supabase Storage, Cloudinary, etc.). Uploading a file above will automatically override this.
                        </p>
                        <input
                          type="text"
                          value={isBase64 ? '(Custom Uploaded File)' : currentValue}
                          disabled={isBase64}
                          placeholder="https://images.example.com/clinic-room.jpg"
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated: ClinicInfo = {
                              ...clinic,
                              [slot.imageKey]: val,
                            };
                            if (slot.id === 'logo') {
                              updated.logoUrl = val;
                              updated.logoImage = val;
                            }
                            onUpdateClinic(updated);
                          }}
                          className={`w-full bg-stone-900 border border-stone-750 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-300 placeholder-stone-600 focus:outline-none focus:border-emerald-500 ${
                            isBase64 ? 'opacity-60 cursor-not-allowed text-stone-500' : ''
                          }`}
                        />
                        {isBase64 && (
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Currently using your custom in-browser uploaded photo.</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Cropper Modal */}
      {croppingModal.isOpen && croppingModal.slot && (
        <ImageCropperModal
          isOpen={croppingModal.isOpen}
          imageSrc={croppingModal.imageSrc}
          title={croppingModal.slot.title}
          defaultAspectRatio={croppingModal.slot.cropperDefaultRatio}
          onCropComplete={handleCroppedSave}
          onClose={() => setCroppingModal({ isOpen: false, slot: null, imageSrc: '' })}
        />
      )}
    </div>
  );
};
