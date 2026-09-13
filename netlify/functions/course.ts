import type { Handler } from '@netlify/functions';
import { getFullCourseData } from '../lib/store';
import { json, serverError } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const data = await getFullCourseData();
    return json(200, data, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('course.ts error', err);
    return serverError(err);
  }
};
