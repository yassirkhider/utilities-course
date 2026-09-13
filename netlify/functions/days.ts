import type { HandlerEvent } from '@netlify/functions';
import { getContent } from '../lib/store';
import { json, notFound, pathSegments, serverError } from '../lib/http';
import { v2Adapter } from '../lib/v2';

const legacyHandler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const { days } = await getContent();
    const [id] = pathSegments(event, 'days');
    if (id) {
      const day = days.find((d) => d.id === id || String(d.dayNumber) === id);
      if (!day) return notFound(`Day '${id}' not found`);
      return json(200, day, { 'Cache-Control': 'no-store' });
    }
    return json(200, days, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('days.ts error', err);
    return serverError(err);
  }
};

export default v2Adapter(legacyHandler);
