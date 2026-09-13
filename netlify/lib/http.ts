import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export function json(statusCode: number, body: unknown, extraHeaders: Record<string, string> = {}): HandlerResponse {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

export function noContent(extraHeaders: Record<string, string> = {}): HandlerResponse {
  return { statusCode: 204, headers: extraHeaders, body: '' };
}

export function badRequest(message: string) {
  return json(400, { error: message });
}

export function unauthorized(message = 'Unauthorized') {
  return json(401, { error: message });
}

export function notFound(message = 'Not found') {
  return json(404, { error: message });
}

/** Debug-only opt-in: set DEBUG_ERRORS=true as a Netlify environment variable to have
 *  the *real* error message included in the JSON response body (as `detail`) so it's
 *  visible in the browser instead of only in the Netlify Functions logs. Turn this off
 *  again once you've diagnosed the issue — it can reveal internal error text to anyone
 *  hitting the API. */
export function serverError(err?: unknown, message = 'Internal server error') {
  const body: { error: string; detail?: string } = { error: message };
  if (process.env.DEBUG_ERRORS === 'true' && err !== undefined) {
    body.detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
  return json(500, body);
}

/** Extracts the path segments after the function name, e.g. for
 *  /.netlify/functions/days/day-1 with function "days" -> ["day-1"] */
export function pathSegments(event: HandlerEvent, functionName: string): string[] {
  const marker = `/${functionName}`;
  const idx = event.path.indexOf(marker);
  const rest = idx >= 0 ? event.path.slice(idx + marker.length) : '';
  return rest.split('/').filter(Boolean);
}

export function parseCookies(event: HandlerEvent): Record<string, string> {
  const header = event.headers.cookie || event.headers.Cookie || '';
  const out: Record<string, string> = {};
  header.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('=') || '');
  });
  return out;
}

const isProd = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';

export function sessionCookie(token: string, maxAgeSeconds: number): string {
  const parts = [
    `ata_admin_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(): string {
  const parts = ['ata_admin_session=', 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}
