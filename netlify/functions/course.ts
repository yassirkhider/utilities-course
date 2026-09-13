import type { HandlerEvent } from '@netlify/functions';
import { getFullCourseData } from '../lib/store';
import { json, serverError } from '../lib/http';
import { v2Adapter } from '../lib/v2';

const legacyHandler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const data = await getFullCourseData();
    return json(200, data, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('course.ts error', err);
    return serverError(err);
  }
};

export default v2Adapter(legacyHandler);
