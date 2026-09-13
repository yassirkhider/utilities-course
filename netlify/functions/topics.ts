import type { Handler } from '@netlify/functions';
import { getContent } from '../lib/store';
import { json, notFound, pathSegments, serverError } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const { topics } = await getContent();
    const [idOrSlug] = pathSegments(event, 'topics');
    if (idOrSlug) {
      const topic = topics.find((t) => t.id === idOrSlug || t.slug === idOrSlug);
      if (!topic) return notFound(`Topic '${idOrSlug}' not found`);
      return json(200, topic, { 'Cache-Control': 'no-store' });
    }
    return json(200, topics, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('topics.ts error', err);
    return serverError(err);
  }
};
