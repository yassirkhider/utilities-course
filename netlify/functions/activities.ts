import type { HandlerEvent } from '@netlify/functions';
import { getContent } from '../lib/store';
import { json, notFound, pathSegments, serverError } from '../lib/http';
import { v2Adapter } from '../lib/v2';

const legacyHandler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const { activities } = await getContent();
    const [id] = pathSegments(event, 'activities');
    if (id) {
      const activity = activities.find((a) => a.id === id);
      if (!activity) return notFound(`Activity '${id}' not found`);
      return json(200, activity, { 'Cache-Control': 'no-store' });
    }
    return json(200, activities, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('activities.ts error', err);
    return serverError(err);
  }
};

export default v2Adapter(legacyHandler);
