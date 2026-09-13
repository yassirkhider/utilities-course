import { sanitizeHtml } from '../utils/sanitize';

export default function RichContent({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
