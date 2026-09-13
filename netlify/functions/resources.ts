import type { HandlerEvent } from '@netlify/functions';
import { getResources } from '../lib/store';
import { json, notFound, pathSegments, serverError } from '../lib/http';
import { v2Adapter } from '../lib/v2';

const legacyHandler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const all = await getResources();
    const [id] = pathSegments(event, 'resources');
    if (id) {
      const resource = all.find((r) => r.id === id);
      if (!resource) return notFound(`Resource '${id}' not found`);
      return json(200, resource, { 'Cache-Control': 'no-store' });
    }
    const q = event.queryStringParameters || {};
    let list = all;
    if (q.dayId) list = list.filter((r) => r.dayId === q.dayId);
    if (q.topicId) list = list.filter((r) => r.topicId === q.topicId);
    if (q.resourceType) list = list.filter((r) => r.resourceType === q.resourceType);
    list = [...list].sort((a, b) => a.order - b.order);
    return json(200, list, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('resources.ts error', err);
    return serverError(err);
  }
};

export default v2Adapter(legacyHandler);
