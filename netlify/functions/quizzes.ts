import type { Handler } from '@netlify/functions';
import { getContent } from '../lib/store';
import { json, notFound, pathSegments, serverError } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  try {
    const { quizzes } = await getContent();
    const [id] = pathSegments(event, 'quizzes');
    if (id) {
      const quiz = quizzes.find((q) => q.id === id);
      if (!quiz) return notFound(`Quiz '${id}' not found`);
      return json(200, quiz, { 'Cache-Control': 'no-store' });
    }
    return json(200, quizzes, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('quizzes.ts error', err);
    return serverError(err);
  }
};
