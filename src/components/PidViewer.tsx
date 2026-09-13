import { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Download, X } from 'lucide-react';
import { Button } from './ui';

export default function PidViewer({
  src,
  title,
  downloadHref,
  onClose,
}: {
  src: string;
  title: string;
  downloadHref?: string;
  onClose?: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const fitToScreen = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(Math.max(s + (e.deltaY < 0 ? 0.15 : -0.15), 0.5), 5));
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[90] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between gap-2 bg-navy-950 text-white px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{title}</p>
          <p className="text-xs text-teal-accent-400">Training P&ID — Verify against approved plant documentation</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="!text-white" onClick={zoomOut} aria-label="Zoom out">
            <ZoomOut size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="!text-white" onClick={zoomIn} aria-label="Zoom in">
            <ZoomIn size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="!text-white" onClick={fitToScreen} aria-label="Fit to screen">
            <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="!text-white" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            <Maximize size={18} />
          </Button>
          {downloadHref && (
            <a href={downloadHref} download className="inline-flex">
              <Button variant="ghost" size="sm" className="!text-white" aria-label="Download">
                <Download size={18} />
              </Button>
            </a>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" className="!text-white" onClick={onClose} aria-label="Close viewer">
              <X size={18} />
            </Button>
          )}
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        <img
          src={src}
          alt={title}
          draggable={false}
          className="max-w-none select-none"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: dragRef.current ? 'none' : 'transform 0.15s' }}
        />
      </div>
      <div className="bg-navy-950 text-center text-xs text-slate-400 py-2 no-print">Pinch, scroll, or use the zoom controls above — drag to pan</div>
    </div>
  );
}
