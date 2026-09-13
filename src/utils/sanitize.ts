import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u',
  'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'span', 'div',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty || '', { ALLOWED_TAGS, ALLOWED_ATTR });
}
