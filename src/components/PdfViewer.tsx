import { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui';

export default function PdfViewer({ src, title, downloadHref, onClose }: { src: string; title: string; downloadHref?: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/90 flex flex-col" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex items-center justify-between gap-2 bg-navy-950 text-white px-4 py-3">
        <p className="font-semibold truncate">{title}</p>
        <div className="flex items-center gap-1 shrink-0">
          <a href={src} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" className="!text-white" aria-label="Open in new tab">
              <ExternalLink size={18} />
            </Button>
          </a>
          {downloadHref && (
            <a href={downloadHref} download>
              <Button variant="ghost" size="sm" className="!text-white" aria-label="Download">
                <Download size={18} />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" className="!text-white" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-slate-800">
        <iframe title={title} src={src} className="w-full h-full border-0" />
      </div>
    </div>
  );
}
