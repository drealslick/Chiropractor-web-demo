import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Maximize2,
  Move,
  Sparkles,
  Grid,
} from 'lucide-react';

export type AspectRatioType = '16:9' | '4:5' | '1:1' | '3:1' | 'free';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  defaultAspectRatio?: AspectRatioType;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  title,
  defaultAspectRatio = '16:9',
  onCropComplete,
  onClose,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(defaultAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync default aspect ratio when modal opens
  useEffect(() => {
    if (isOpen) {
      setAspectRatio(defaultAspectRatio);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, defaultAspectRatio]);

  // Touch and Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen || !imageSrc) return null;

  // Calculate target aspect ratio numeric value
  const getAspectNumeric = (): number => {
    switch (aspectRatio) {
      case '16:9':
        return 16 / 9;
      case '4:5':
        return 4 / 5;
      case '1:1':
        return 1;
      case '3:1':
        return 3 / 1;
      case 'free':
      default:
        return 16 / 9;
    }
  };

  // Perform canvas crop
  const handleApplyCrop = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    setIsProcessing(true);

    try {
      const containerRect = container.getBoundingClientRect();
      const targetAspect = getAspectNumeric();

      // Determine dimensions of crop box inside container
      let cropWidth = containerRect.width * 0.85;
      let cropHeight = cropWidth / targetAspect;

      if (cropHeight > containerRect.height * 0.85) {
        cropHeight = containerRect.height * 0.85;
        cropWidth = cropHeight * targetAspect;
      }

      // Output resolution target
      const outputWidth = Math.min(1600, Math.round(cropWidth * 2.5));
      const outputHeight = Math.round(outputWidth / targetAspect);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        alert('Could not initialize image processing canvas.');
        setIsProcessing(false);
        return;
      }

      // Calculate how the image is positioned relative to the crop box
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Base displayed image size before zoom
      const imgAspect = naturalWidth / naturalHeight;
      let displayedWidth = containerRect.width;
      let displayedHeight = displayedWidth / imgAspect;

      if (displayedHeight > containerRect.height) {
        displayedHeight = containerRect.height;
        displayedWidth = displayedHeight * imgAspect;
      }

      // Apply zoom to displayed size
      displayedWidth *= zoom;
      displayedHeight *= zoom;

      // Center offset of image inside container with pan
      const imgCenterX = containerRect.width / 2 + pan.x;
      const imgCenterY = containerRect.height / 2 + pan.y;

      const imgLeft = imgCenterX - displayedWidth / 2;
      const imgTop = imgCenterY - displayedHeight / 2;

      // Crop box bounds
      const cropLeft = (containerRect.width - cropWidth) / 2;
      const cropTop = (containerRect.height - cropHeight) / 2;

      // Relative coordinates of crop box on the natural image
      const scaleX = naturalWidth / displayedWidth;
      const scaleY = naturalHeight / displayedHeight;

      const sourceX = (cropLeft - imgLeft) * scaleX;
      const sourceY = (cropTop - imgTop) * scaleY;
      const sourceWidth = cropWidth * scaleX;
      const sourceHeight = cropHeight * scaleY;

      // Enable smooth image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw cropped section
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      // Export as high quality WebP/JPEG
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
      alert('Failed to crop image. Falling back to original.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPanZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Crop frame aspect ratio styling
  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : aspectRatio === '3:1'
      ? 'aspect-[3/1]'
      : 'aspect-video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-750 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Crop & Frame Photo:</span>
                <span className="text-emerald-400 font-normal truncate max-w-[200px] sm:max-w-xs">{title}</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Drag to position the subject. Zoom & adjust aspect ratio to frame perfectly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-5 py-2.5 bg-stone-850 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 text-[11px] font-medium mr-1 hidden sm:inline">Aspect Ratio:</span>
            {(['16:9', '4:5', '1:1', '3:1', 'free'] as AspectRatioType[]).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-emerald-500 text-stone-950 shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white'
                }`}
              >
                {ratio === '16:9'
                  ? '16:9 (Hero/Room)'
                  : ratio === '4:5'
                  ? '4:5 (Doctor Portrait)'
                  : ratio === '1:1'
                  ? '1:1 (Square)'
                  : ratio === '3:1'
                  ? '3:1 (Horizontal Logo)'
                  : 'Original'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                showGrid
                  ? 'bg-stone-800 border-emerald-500/50 text-emerald-300'
                  : 'bg-stone-800/60 border-stone-750 text-stone-400'
              }`}
              title="Toggle Rule-of-Thirds Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={handleResetPanZoom}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-750 text-stone-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
            >
              Recenter
            </button>
          </div>
        </div>

        {/* Viewport Workspace */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 min-h-[320px] sm:min-h-[380px] bg-stone-950 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        >
          {/* Active Image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source for cropping"
            draggable={false}
            className="max-w-none transition-transform duration-75 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              maxHeight: '85%',
              maxWidth: '85%',
              objectFit: 'contain',
            }}
          />

          {/* Darkened Overlay Framing Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div
              className={`w-full max-w-[85%] max-h-[85%] ${aspectClass} border-2 border-emerald-400/90 rounded-xl shadow-[0_0_0_9999px_rgba(10,10,10,0.72)] relative overflow-hidden`}
            >
              {/* Rule of thirds grid lines */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-emerald-300/60" />
                  <div className="border-r border-b border-emerald-300/60" />
                  <div className="border-b border-emerald-300/60" />
                  <div className="border-r border-b border-emerald-300/60" />
                  <div className="border-r border-b border-emerald-300/60" />
                  <div className="border-b border-emerald-300/60" />
                  <div className="border-r border-emerald-300/60" />
                  <div className="border-r border-emerald-300/60" />
                  <div />
                </div>
              )}

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-stone-950/80 backdrop-blur-xs text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                {aspectRatio} Crop Frame
              </div>
            </div>
          </div>

          {/* Hint Overlay */}
          <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs border border-stone-800 text-[10px] text-stone-300 flex items-center gap-1.5 shadow-sm">
            <Move className="w-3 h-3 text-emerald-400" />
            <span>Click & Drag to reposition</span>
          </div>
        </div>

        {/* Zoom & Action Footer */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setZoom(Math.max(1, zoom - 0.15))}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full sm:w-36 accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom + 0.15))}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-stone-400 min-w-[36px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Rendering...' : 'Save & Apply Crop'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
