import type { Activity, CourseData, CourseMeta, DayPlan, Quiz, Resource } from '../types';

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      // `detail` is only ever present when the server has DEBUG_ERRORS=true set
      // (see netlify/lib/http.ts) — an opt-in diagnostic aid, off by default.
      if (body?.detail) message = `${message} — ${body.detail}`;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ---- Public reads ----
export const getCourseData = () => request<CourseData>('/course');
export const getDays = () => request<DayPlan[]>('/days');
export const getDay = (id: string) => request<DayPlan>(`/days/${id}`);
export const getTopics = () => request<CourseData['topics']>('/topics');
export const getTopic = (slugOrId: string) => request<CourseData['topics'][number]>(`/topics/${slugOrId}`);
export const getActivities = () => request<Activity[]>('/activities');
export const getQuizzes = () => request<Quiz[]>('/quizzes');
export const getResources = (filters?: { dayId?: string; topicId?: string; resourceType?: string }) => {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  return request<Resource[]>(`/resources${params ? `?${params}` : ''}`);
};

// ---- Auth ----
export const login = (password: string) => request<{ authenticated: boolean }>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
export const logout = () => request<{ authenticated: boolean }>('/auth/logout', { method: 'POST' });
export const verifyAuth = () => request<{ authenticated: boolean }>('/auth/verify');

// ---- Admin: course/day/topic/activity/quiz ----
export const saveCourseMeta = (meta: Partial<CourseMeta>) => request<CourseMeta>('/admin/course', { method: 'POST', body: JSON.stringify(meta) });
export const saveDay = (day: DayPlan) => request<DayPlan>('/admin/day', { method: 'POST', body: JSON.stringify(day) });
export const saveDayTopicsOrder = (dayId: string, topicIds: string[]) =>
  request(`/admin/day/${dayId}/topics-order`, { method: 'POST', body: JSON.stringify({ topicIds }) });

export const saveTopic = (topic: Partial<CourseData['topics'][number]>) =>
  request<CourseData['topics'][number]>('/admin/topic', { method: 'POST', body: JSON.stringify(topic) });
export const deleteTopic = (id: string) => request(`/admin/topic/${id}`, { method: 'DELETE' });

export const saveActivity = (activity: Partial<Activity>) => request<Activity>('/admin/activity', { method: 'POST', body: JSON.stringify(activity) });
export const deleteActivity = (id: string) => request(`/admin/activity/${id}`, { method: 'DELETE' });
export const reorderActivities = (ids: string[]) => request('/admin/activities/reorder', { method: 'POST', body: JSON.stringify({ ids }) });

export const saveQuiz = (quiz: Partial<Quiz>) => request<Quiz>('/admin/quiz', { method: 'POST', body: JSON.stringify(quiz) });
export const deleteQuiz = (id: string) => request(`/admin/quiz/${id}`, { method: 'DELETE' });

// ---- Admin: resources ----
export const createResource = (resource: Partial<Resource>) => request<Resource>('/admin/resource', { method: 'POST', body: JSON.stringify(resource) });
export const updateResource = (id: string, patch: Partial<Resource>) =>
  request<Resource>(`/admin/resource/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
export const deleteResource = (id: string) => request(`/admin/resource/${id}`, { method: 'DELETE' });
export const reorderResources = (ids: string[]) => request('/admin/resources/reorder', { method: 'POST', body: JSON.stringify({ ids }) });

export interface UploadFields {
  title: string;
  description?: string;
  resourceType: string;
  topicId?: string;
  dayId?: string;
  order?: number;
}

export function uploadResource(file: File, fields: UploadFields, onProgress?: (pct: number) => void): Promise<Resource> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(fields).forEach(([k, v]) => v !== undefined && form.append(k, String(v)));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/admin/upload`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          message = JSON.parse(xhr.responseText).error || message;
        } catch {
          /* ignore */
        }
        reject(new ApiError(message, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError('Network error during upload', 0));
    xhr.send(form);
  });
}

export function replaceResource(id: string, file: File, onProgress?: (pct: number) => void): Promise<Resource> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/admin/upload/${id}/replace`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new ApiError('Replace failed', xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('Network error during upload', 0));
    xhr.send(form);
  });
}

// ---- Admin: backup ----
export const exportBackup = () => request<CourseData>('/admin/backup');
export const importBackup = (data: CourseData) => request('/admin/backup', { method: 'POST', body: JSON.stringify({ data, confirm: true }) });
export const resetToSeedData = () => request('/admin/reset-seed', { method: 'POST', body: JSON.stringify({ confirm: true }) });

export function fileUrl(resourceId: string, download = false): string {
  return `${BASE}/file/${resourceId}${download ? '?download=1' : ''}`;
}
