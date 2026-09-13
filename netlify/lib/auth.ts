import { SignJWT, jwtVerify } from 'jose';
import type { HandlerEvent } from '@netlify/functions';
import { parseCookies } from './http';

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET environment variable is missing or too short (set a random string of 32+ characters).');
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export async function verifyAdminSession(event: HandlerEvent): Promise<boolean> {
  try {
    const cookies = parseCookies(event);
    const token = cookies['ata_admin_session'];
    if (!token) return false;
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// Very simple in-memory rate limiter, best-effort within a warm function instance.
// Netlify Functions may cold-start per request, so this is a defense-in-depth layer,
// not a substitute for an edge/WAF rate limit.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return true;
  return false;
}
