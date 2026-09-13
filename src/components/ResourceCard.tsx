import { useState } from 'react';
import { Eye, Maximize2, Download, FileWarning, ExternalLink, FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { Resource } from '../types';
import { Card, Badge, Button } from './ui';
import { RESOURCE_TYPE_BADGE_CLASS, RESOURCE_TYPE_LABEL } from '../utils/badges';
import { fileUrl } from '../services/api';
import Lightbox from './Lightbox';
import PdfViewer from './PdfViewer';
import PidViewer from './PidViewer';
import { formatBytes } from '../utils/format';

function isImage(mime: string) {
  return mime.startsWith('image/');
}
function isPdf(mime: string) {
  return mime === 'application/pdf';
}
function isVideo(mime: string) {
  return mime.startsWith('video/');
}

export default function ResourceCard({ resource, dayLabel }: { resource: Resource; dayLabel?: string }) {
  const [viewer, setViewer] = useState<'lightbox' | 'pdf' | 'pid' | null>(null);
  const hasFile = !!resource.blobKey;
  const hasExternal = !!resource.externalUrl;
  const uploaded = hasFile || hasExternal;
  const src = hasFile ? fileUrl(resource.id) : resource.externalUrl || '';
  const downloadHref = hasFile ? fileUrl(resource.id, true) : undefined;

  const openViewer = () => {
    if (!uploaded) return;
    // Prefer the in-app viewers whenever we know the file type (works for both uploaded
    // blobs and bundled/external files) — only fall back to a new tab for unknown types
    // or external links that aren't a directly viewable media file.
    if (resource.resourceType === 'pid' && isImage(resource.mimeType)) setViewer('pid');
    else if (isImage(resource.mimeType)) setViewer('lightbox');
    else if (isPdf(resource.mimeType)) setViewer('pdf');
    else if (isVideo(resource.mimeType)) setViewer('lightbox'); // fallback below handles video render
    else if (hasExternal) window.open(resource.externalUrl!, '_blank', 'noopener');
    else window.open(src, '_blank', 'noopener');
  };

  const Icon = isVideo(resource.mimeType) ? Video : isPdf(resource.mimeType) ? FileText : isImage(resource.mimeType) ? ImageIcon : FileText;

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <div className="relative h-36 bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center">
          {isImage(resource.mimeType) && uploaded ? (
            <img src={src} alt={resource.title} className="h-full w-full object-cover" loading="lazy" />
          ) : uploaded ? (
            <Icon size={40} className="text-white/70" aria-hidden="true" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/60">
              <FileWarning size={32} aria-hidden="true" />
            </div>
          )}
          <Badge className={`absolute top-2 left-2 ${RESOURCE_TYPE_BADGE_CLASS[resource.resourceType]}`}>{RESOURCE_TYPE_LABEL[resource.resourceType]}</Badge>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-navy-900 leading-snug mb-1 line-clamp-2">{resource.title}</h3>
          <p className="text-xs text-slate-500 mb-3">
            {dayLabel ? `${dayLabel} · ` : ''}
            {uploaded ? (hasFile ? formatBytes(resource.size) : 'External link') : 'Resource not uploaded yet'}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={openViewer} disabled={!uploaded} className="flex-1 min-w-[84px]">
              <Eye size={14} /> View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => uploaded && setViewer(resource.resourceType === 'pid' ? 'pid' : 'lightbox')}
              disabled={!uploaded || (!isImage(resource.mimeType) && resource.resourceType !== 'pid')}
              className="flex-1 min-w-[84px]"
              title="Open Fullscreen"
            >
              <Maximize2 size={14} /> Fullscreen
            </Button>
            {hasFile ? (
              <a href={downloadHref} download className="flex-1 min-w-[84px]">
                <Button size="sm" variant="secondary" className="w-full">
                  <Download size={14} /> Download
                </Button>
              </a>
            ) : hasExternal ? (
              <a href={resource.externalUrl!} target="_blank" rel="noreferrer" className="flex-1 min-w-[84px]">
                <Button size="sm" variant="secondary" className="w-full">
                  <ExternalLink size={14} /> Open
                </Button>
              </a>
            ) : (
              <Button size="sm" variant="secondary" disabled className="flex-1 min-w-[84px]">
                <Download size={14} /> Download
              </Button>
            )}
          </div>
        </div>
      </Card>

      {viewer === 'lightbox' && isVideo(resource.mimeType) && (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setViewer(null)}>
          <video src={src} controls autoPlay className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      {viewer === 'lightbox' && isImage(resource.mimeType) && (
        <Lightbox src={src} title={resource.title} downloadHref={downloadHref} onClose={() => setViewer(null)} />
      )}
      {viewer === 'pdf' && <PdfViewer src={src} title={resource.title} downloadHref={downloadHref} onClose={() => setViewer(null)} />}
      {viewer === 'pid' && <PidViewer src={src} title={resource.title} downloadHref={downloadHref} onClose={() => setViewer(null)} />}
    </>
  );
}
