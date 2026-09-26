import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool, ShieldCheck, AlertCircle } from 'lucide-react';

interface DigitalSignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  initialSignature?: string;
  readOnly?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSignatureChange,
  initialSignature,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature));
  const [useTypeMode, setUseTypeMode] = useState(false);
  const [typedName, setTypedName] = useState('');

  // Setup canvas resolution and drawing parameters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#064e3b'; // Deep emerald ink
    ctx.lineWidth = 2.5;

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = initialSignature;
    }
  }, [initialSignature, useTypeMode]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly || useTypeMode) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly || useTypeMode) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || readOnly || useTypeMode) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    setTypedName('');
    onSignatureChange(null);
  };

  const handleTypedNameChange = (val: string) => {
    setTypedName(val);
    if (!val.trim()) {
      setHasSignature(false);
      onSignatureChange(null);
      return;
    }

    // Render typed cursive signature on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.font = 'italic 28px "Caveat", "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = '#064e3b';
    ctx.fillText(val, 20, rect.height / 2 + 10);

    setHasSignature(true);
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-emerald-700" />
          <span>Patient Digital Signature</span>
        </label>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUseTypeMode(!useTypeMode);
                clearSignature();
              }}
              className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              {useTypeMode ? 'Draw with finger/mouse' : 'Type name instead'}
            </button>
            {hasSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="relative border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/60 overflow-hidden">
        {useTypeMode ? (
          <div className="p-4">
            <input
              type="text"
              value={typedName}
              onChange={(e) => handleTypedNameChange(e.target.value)}
              placeholder="Type your full legal name..."
              className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-lg font-serif italic text-emerald-950 focus:border-emerald-700 focus:outline-none"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              By typing your legal name, you execute an electronic signature under the Uniform Electronic Transactions Act.
            </p>
          </div>
        ) : null}

        {/* The Signature Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-28 touch-none block ${useTypeMode ? 'hidden' : 'cursor-crosshair'}`}
        />

        {/* Signature Line & Guideline */}
        {!useTypeMode && (
          <div className="absolute bottom-4 left-6 right-6 pointer-events-none flex items-center justify-between border-t border-stone-300 text-[10px] text-stone-400 font-mono">
            <span>✕ Sign on line above</span>
            <span>Electronic Health Signature</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-stone-500 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Clinical Informed Consent Protocol</span>
        </span>
        <span className="font-mono">
          Timestamp: {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
