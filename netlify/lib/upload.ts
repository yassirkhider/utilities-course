import Busboy from 'busboy';
import type { HandlerEvent } from '@netlify/functions';

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
};

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface ParsedUpload {
  fields: Record<string, string>;
  file: { buffer: Buffer; fileName: string; mimeType: string } | null;
}

/** Converts a Node Buffer to a plain ArrayBuffer (Netlify Blobs' `set` does not accept Buffer/Uint8Array directly). */
export function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150);
  return base || 'file';
}

export function parseMultipart(event: HandlerEvent): Promise<ParsedUpload> {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('Expected multipart/form-data request'));
      return;
    }
    const busboy = Busboy({ headers: { 'content-type': contentType }, limits: { fileSize: MAX_FILE_SIZE_BYTES } });
    const fields: Record<string, string> = {};
    let file: ParsedUpload['file'] = null;
    let fileTooLarge = false;

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (_name, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('limit', () => {
        fileTooLarge = true;
      });
      stream.on('end', () => {
        if (!fileTooLarge) {
          file = { buffer: Buffer.concat(chunks), fileName: info.filename, mimeType: info.mimeType };
        }
      });
    });

    busboy.on('error', (err) => reject(err));
    busboy.on('finish', () => {
      if (fileTooLarge) {
        reject(new Error('FILE_TOO_LARGE'));
        return;
      }
      resolve({ fields, file });
    });

    const bodyBuffer = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : Buffer.from(event.body || '', 'utf8');
    busboy.end(bodyBuffer);
  });
}
