import React, { useRef, useState } from 'react';
import { FileUp, ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface ImageUploadProps {
  label: string;
  description?: string;
  currentValue: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  aspectRatioClassName?: string; // e.g. "aspect-video" or "aspect-square"
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  description,
  currentValue,
  onChange,
  onReset,
  aspectRatioClassName = "aspect-video"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file must be an image.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Compress to prevent exceeding localstorage constraints while maintaining good resolution
      const base64 = await compressImage(file, 1000, 1000, 0.75);
      onChange(base64);
    } catch (err: any) {
      console.error(err);
      setError('Could not process this image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const isBase64 = currentValue?.startsWith('data:image/');

  return (
    <div className="space-y-2">
      {/* Label and Reset */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          {label}
        </label>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] text-stone-500 hover:text-stone-900 font-bold tracking-tight cursor-pointer"
          >
            Reset Default
          </button>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-stone-500 leading-normal -mt-1 font-normal">
          {description}
        </p>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone & File Input */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fileInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/25 ring-4 ring-emerald-600/5'
            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 text-white z-10">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-bold">Processing image file...</span>
          </div>
        )}

        {currentValue ? (
          <div className="w-full space-y-3">
            <div className={`relative ${aspectRatioClassName} rounded-xl overflow-hidden border border-stone-200 bg-stone-100`}>
              <img
                src={currentValue}
                alt={`${label} Preview`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                {isBase64 ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-100 uppercase tracking-wider shadow-sm">
                    Base64 Photo
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-stone-100 uppercase tracking-wider shadow-sm">
                    Default Presets
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center text-[11px] text-stone-500">
              <FileUp className="w-3.5 h-3.5 text-stone-400" />
              <span>Click to choose or drop a local image file</span>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-white border border-stone-200 rounded-xl text-stone-400 shadow-3xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-stone-700">Choose custom image file</p>
            <p className="text-[10px] text-stone-500">Supports PNG, JPG, or WebP</p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-stone-500">Source String Value</label>
        <input
          type="text"
          value={currentValue || ''}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL directly..."
          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-700 focus:bg-white focus:border-emerald-600 outline-none transition-all truncate"
        />
      </div>
    </div>
  );
};
