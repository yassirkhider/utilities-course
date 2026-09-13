import type { Handler, HandlerEvent } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminSession } from '../lib/auth';
import { badRequest, json, notFound, pathSegments, serverError, unauthorized } from '../lib/http';
import { getContent, saveContent, getResources, saveResources, uploadsStore, getFullCourseData, importCourseData, resetToSeed } from '../lib/store';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, parseMultipart, sanitizeFileName, toArrayBuffer } from '../lib/upload';
import type { Activity, CourseData, DayPlan, Quiz, Resource, Topic } from '../../src/types';

async function requireAdmin(event: HandlerEvent): Promise<boolean> {
  return verifyAdminSession(event);
}

function readJsonBody<T>(event: HandlerEvent): T {
  try {
    return JSON.parse(event.body || '{}') as T;
  } catch {
    throw new Error('INVALID_JSON');
  }
}

export const handler: Handler = async (event) => {
  const segments = pathSegments(event, 'admin');
  const [route, subId, subAction] = segments;

  try {
    const isAdmin = await requireAdmin(event);
    if (!isAdmin) return unauthorized('Admin authentication required');

    // ---- Course meta ----
    if (route === 'course' && event.httpMethod === 'POST') {
      const body = readJsonBody<Partial<CourseData['course']>>(event);
      const content = await getContent();
      content.course = { ...content.course, ...body };
      await saveContent(content);
      return json(200, content.course);
    }

    // ---- Day ----
    if (route === 'day' && !subId && event.httpMethod === 'POST') {
      const body = readJsonBody<DayPlan>(event);
      if (!body.id) return badRequest('Day id is required');
      const content = await getContent();
      const idx = content.days.findIndex((d) => d.id === body.id);
      if (idx === -1) return notFound(`Day '${body.id}' not found`);
      const normalizedSchedule = (body.schedule || []).map((row, i) => ({ ...row, order: i }));
      content.days[idx] = { ...content.days[idx], ...body, schedule: normalizedSchedule };
      await saveContent(content);
      return json(200, content.days[idx]);
    }

    if (route === 'day' && subId && subAction === 'topics-order' && event.httpMethod === 'POST') {
      const body = readJsonBody<{ topicIds: string[] }>(event);
      const content = await getContent();
      const day = content.days.find((d) => d.id === subId);
      if (!day) return notFound(`Day '${subId}' not found`);
      day.topicIds = body.topicIds;
      body.topicIds.forEach((tid, i) => {
        const t = content.topics.find((x) => x.id === tid);
        if (t) t.order = i;
      });
      await saveContent(content);
      return json(200, day);
    }

    // ---- Topic ----
    if (route === 'topic' && event.httpMethod === 'POST') {
      const body = readJsonBody<Topic>(event);
      const content = await getContent();
      if (body.id) {
        const idx = content.topics.findIndex((t) => t.id === body.id);
        if (idx === -1) return notFound(`Topic '${body.id}' not found`);
        content.topics[idx] = { ...content.topics[idx], ...body };
        await saveContent(content);
        return json(200, content.topics[idx]);
      } else {
        const slug = (body.slug || body.title || 'topic')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const newTopic: Topic = { ...body, id: `topic-${slug}-${uuidv4().slice(0, 8)}`, slug };
        content.topics.push(newTopic);
        if (newTopic.dayId) {
          const day = content.days.find((d) => d.id === newTopic.dayId);
          if (day && !day.topicIds.includes(newTopic.id)) day.topicIds.push(newTopic.id);
        }
        await saveContent(content);
        return json(201, newTopic);
      }
    }

    if (route === 'topic' && subId && event.httpMethod === 'DELETE') {
      const content = await getContent();
      content.topics = content.topics.filter((t) => t.id !== subId);
      content.days.forEach((d) => (d.topicIds = d.topicIds.filter((id) => id !== subId)));
      await saveContent(content);
      const resources = await getResources();
      await saveResources(resources.filter((r) => r.topicId !== subId));
      return json(200, { deleted: subId });
    }

    // ---- Activity ----
    if (route === 'activity' && event.httpMethod === 'POST') {
      const body = readJsonBody<Activity>(event);
      const content = await getContent();
      if (body.id) {
        const idx = content.activities.findIndex((a) => a.id === body.id);
        if (idx === -1) return notFound(`Activity '${body.id}' not found`);
        content.activities[idx] = { ...content.activities[idx], ...body };
        await saveContent(content);
        return json(200, content.activities[idx]);
      } else {
        const newActivity: Activity = { ...body, id: `activity-${uuidv4()}` };
        content.activities.push(newActivity);
        await saveContent(content);
        return json(201, newActivity);
      }
    }

    if (route === 'activity' && subId && event.httpMethod === 'DELETE') {
      const content = await getContent();
      content.activities = content.activities.filter((a) => a.id !== subId);
      await saveContent(content);
      return json(200, { deleted: subId });
    }

    if (route === 'activities' && subAction === undefined && subId === 'reorder' && event.httpMethod === 'POST') {
      // POST /api/admin/activities/reorder  { ids: string[] }
      const body = readJsonBody<{ ids: string[] }>(event);
      const content = await getContent();
      body.ids.forEach((id, i) => {
        const a = content.activities.find((x) => x.id === id);
        if (a) a.order = i;
      });
      await saveContent(content);
      return json(200, { reordered: body.ids.length });
    }

    // ---- Quiz ----
    if (route === 'quiz' && event.httpMethod === 'POST') {
      const body = readJsonBody<Quiz>(event);
      const content = await getContent();
      if (body.id) {
        const idx = content.quizzes.findIndex((qz) => qz.id === body.id);
        if (idx === -1) return notFound(`Quiz '${body.id}' not found`);
        content.quizzes[idx] = { ...content.quizzes[idx], ...body };
        await saveContent(content);
        return json(200, content.quizzes[idx]);
      } else {
        const newQuiz: Quiz = { ...body, id: `quiz-${uuidv4()}` };
        content.quizzes.push(newQuiz);
        await saveContent(content);
        return json(201, newQuiz);
      }
    }

    if (route === 'quiz' && subId && event.httpMethod === 'DELETE') {
      const content = await getContent();
      content.quizzes = content.quizzes.filter((qz) => qz.id !== subId);
      await saveContent(content);
      return json(200, { deleted: subId });
    }

    // ---- Resource metadata (external URL or edit) ----
    if (route === 'resource' && !subId && event.httpMethod === 'POST') {
      const body = readJsonBody<Partial<Resource>>(event);
      if (!body.title || !body.resourceType) return badRequest('title and resourceType are required');
      const resources = await getResources();
      const now = new Date().toISOString();
      const newResource: Resource = {
        id: uuidv4(),
        title: body.title,
        description: body.description || '',
        fileName: body.fileName || '',
        blobKey: null,
        externalUrl: body.externalUrl || null,
        mimeType: body.mimeType || '',
        size: 0,
        resourceType: body.resourceType,
        topicId: body.topicId ?? null,
        dayId: body.dayId ?? null,
        thumbnail: body.thumbnail ?? null,
        order: body.order ?? resources.length,
        createdAt: now,
        updatedAt: now,
      };
      resources.push(newResource);
      await saveResources(resources);
      return json(201, newResource);
    }

    if (route === 'resource' && subId && event.httpMethod === 'PUT') {
      const body = readJsonBody<Partial<Resource>>(event);
      const resources = await getResources();
      const idx = resources.findIndex((r) => r.id === subId);
      if (idx === -1) return notFound(`Resource '${subId}' not found`);
      resources[idx] = { ...resources[idx], ...body, id: subId, updatedAt: new Date().toISOString() };
      await saveResources(resources);
      return json(200, resources[idx]);
    }

    if (route === 'resource' && subId && event.httpMethod === 'DELETE') {
      const resources = await getResources();
      const idx = resources.findIndex((r) => r.id === subId);
      if (idx === -1) return notFound(`Resource '${subId}' not found`);
      const [removed] = resources.splice(idx, 1);
      await saveResources(resources);
      if (removed.blobKey) {
        try {
          await uploadsStore().delete(removed.blobKey);
        } catch (err) {
          console.warn('Failed to delete blob for resource', removed.id, err);
        }
      }
      return json(200, { deleted: subId });
    }

    if (route === 'resources' && subId === 'reorder' && event.httpMethod === 'POST') {
      // POST /api/admin/resources/reorder { ids: string[] }
      const body = readJsonBody<{ ids: string[] }>(event);
      const resources = await getResources();
      body.ids.forEach((id, i) => {
        const r = resources.find((x) => x.id === id);
        if (r) r.order = i;
      });
      await saveResources(resources);
      return json(200, { reordered: body.ids.length });
    }

    // ---- Upload ----
    if (route === 'upload' && !subId && event.httpMethod === 'POST') {
      let parsed;
      try {
        parsed = await parseMultipart(event);
      } catch (err) {
        if (err instanceof Error && err.message === 'FILE_TOO_LARGE') {
          return json(413, { error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB` });
        }
        return badRequest('Could not parse upload. Ensure the request is multipart/form-data.');
      }
      const { fields, file } = parsed;
      if (!file) return badRequest('No file was included in the upload');
      if (!fields.title) return badRequest('title field is required');
      if (!fields.resourceType) return badRequest('resourceType field is required');

      const ext = ALLOWED_MIME_TYPES[file.mimeType];
      if (!ext) {
        return json(415, { error: `Unsupported file type: ${file.mimeType}. Allowed: PDF, PPTX, DOCX, XLSX, PNG, JPG, WEBP, MP4.` });
      }
      if (file.buffer.length > MAX_FILE_SIZE_BYTES) {
        return json(413, { error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB` });
      }

      const safeName = sanitizeFileName(file.fileName || `upload.${ext}`);
      const blobKey = `${uuidv4()}-${safeName}`;
      await uploadsStore().set(blobKey, toArrayBuffer(file.buffer), { metadata: { mimeType: file.mimeType } });

      const resources = await getResources();
      const now = new Date().toISOString();
      const newResource: Resource = {
        id: uuidv4(),
        title: fields.title,
        description: fields.description || '',
        fileName: safeName,
        blobKey,
        externalUrl: null,
        mimeType: file.mimeType,
        size: file.buffer.length,
        resourceType: fields.resourceType as Resource['resourceType'],
        topicId: fields.topicId || null,
        dayId: fields.dayId || null,
        thumbnail: null,
        order: fields.order ? Number(fields.order) : resources.length,
        createdAt: now,
        updatedAt: now,
      };
      resources.push(newResource);
      await saveResources(resources);
      return json(201, newResource);
    }

    if (route === 'upload' && subId && event.httpMethod === 'POST' && subAction === 'replace') {
      // POST /api/admin/upload/:resourceId/replace
      let parsed;
      try {
        parsed = await parseMultipart(event);
      } catch {
        return badRequest('Could not parse upload.');
      }
      const { file } = parsed;
      if (!file) return badRequest('No file included');
      const ext = ALLOWED_MIME_TYPES[file.mimeType];
      if (!ext) return json(415, { error: `Unsupported file type: ${file.mimeType}` });

      const resources = await getResources();
      const idx = resources.findIndex((r) => r.id === subId);
      if (idx === -1) return notFound('Resource not found');
      const old = resources[idx];
      if (old.blobKey) {
        try {
          await uploadsStore().delete(old.blobKey);
        } catch {
          /* ignore */
        }
      }
      const safeName = sanitizeFileName(file.fileName);
      const blobKey = `${uuidv4()}-${safeName}`;
      await uploadsStore().set(blobKey, toArrayBuffer(file.buffer), { metadata: { mimeType: file.mimeType } });
      resources[idx] = {
        ...old,
        fileName: safeName,
        blobKey,
        mimeType: file.mimeType,
        size: file.buffer.length,
        updatedAt: new Date().toISOString(),
      };
      await saveResources(resources);
      return json(200, resources[idx]);
    }

    // ---- Backup export/import ----
    if (route === 'backup' && event.httpMethod === 'GET') {
      const data = await getFullCourseData();
      return json(200, data, { 'Content-Disposition': 'attachment; filename="course-backup.json"' });
    }

    if (route === 'backup' && event.httpMethod === 'POST') {
      const body = readJsonBody<{ data: CourseData; confirm: boolean }>(event);
      if (!body.confirm) return badRequest('Import requires confirm: true to overwrite existing data');
      if (!body.data || !body.data.course || !Array.isArray(body.data.days)) {
        return badRequest('Invalid backup file structure');
      }
      await importCourseData(body.data);
      return json(200, { imported: true });
    }

    if (route === 'reset-seed' && event.httpMethod === 'POST') {
      const body = readJsonBody<{ confirm: boolean }>(event);
      if (!body.confirm) return badRequest('Reset requires confirm: true');
      await resetToSeed();
      return json(200, { reset: true });
    }

    return json(404, { error: `Unknown admin route: ${segments.join('/')}` });
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_JSON') return badRequest('Invalid JSON body');
    console.error('admin.ts error', err);
    return serverError(err);
  }
};
