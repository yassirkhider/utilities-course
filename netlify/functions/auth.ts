import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { isRateLimited, signAdminSession, verifyAdminSession, SESSION_MAX_AGE } from '../lib/auth';
import { badRequest, json, pathSegments, serverError, sessionCookie, clearSessionCookie, unauthorized } from '../lib/http';

export const handler: Handler = async (event) => {
  const [action] = pathSegments(event, 'auth');

  try {
    if (action === 'login' && event.httpMethod === 'POST') {
      const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
      if (isRateLimited(`login:${ip}`)) {
        return json(429, { error: 'Too many login attempts. Please wait a minute and try again.' });
      }

      const passwordHash = process.env.ADMIN_PASSWORD_HASH;
      if (!passwordHash) {
        console.error('ADMIN_PASSWORD_HASH is not configured');
        return serverError(undefined, 'Admin authentication is not configured on the server.');
      }

      let body: { password?: string };
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return badRequest('Invalid request body');
      }
      if (!body.password || typeof body.password !== 'string') {
        return badRequest('Password is required');
      }

      const valid = await bcrypt.compare(body.password, passwordHash);
      if (!valid) {
        return unauthorized('Incorrect password');
      }

      const token = await signAdminSession();
      return json(
        200,
        { authenticated: true },
        { 'Set-Cookie': sessionCookie(token, SESSION_MAX_AGE) }
      );
    }

    if (action === 'logout' && event.httpMethod === 'POST') {
      return json(200, { authenticated: false }, { 'Set-Cookie': clearSessionCookie() });
    }

    if (action === 'verify' && event.httpMethod === 'GET') {
      const authed = await verifyAdminSession(event);
      return json(200, { authenticated: authed });
    }

    return json(404, { error: 'Unknown auth action' });
  } catch (err) {
    console.error('auth.ts error', err);
    return serverError(err);
  }
};
