import { getStore } from '@netlify/blobs';
import type { Activity, CourseData, CourseMeta, DayPlan, Quiz, Resource, Topic } from '../../src/types';
import { courseSeed } from '../../src/data/seed';

type ContentBlob = {
  course: CourseMeta;
  days: DayPlan[];
  topics: Topic[];
  activities: Activity[];
  quizzes: Quiz[];
  updatedAt: string;
};

const CONTENT_STORE = 'course-content';
const RESOURCES_STORE = 'course-resources';
export const UPLOADS_STORE = 'course-uploads';
const CONTENT_KEY = 'data';
const RESOURCES_KEY = 'index';

function contentStore() {
  return getStore({ name: CONTENT_STORE, consistency: 'strong' });
}

function resourcesStore() {
  return getStore({ name: RESOURCES_STORE, consistency: 'strong' });
}

export function uploadsStore() {
  return getStore({ name: UPLOADS_STORE, consistency: 'strong' });
}

function seedContent(): ContentBlob {
  const { resources: _r, ...rest } = courseSeed;
  return rest;
}

export async function getContent(): Promise<ContentBlob> {
  const store = contentStore();
  const existing = await store.get(CONTENT_KEY, { type: 'json' });
  if (existing) return existing as ContentBlob;
  const seeded = seedContent();
  await store.setJSON(CONTENT_KEY, seeded);
  return seeded;
}

export async function saveContent(data: ContentBlob): Promise<void> {
  await contentStore().setJSON(CONTENT_KEY, { ...data, updatedAt: new Date().toISOString() });
}

export async function getResources(): Promise<Resource[]> {
  const store = resourcesStore();
  const existing = await store.get(RESOURCES_KEY, { type: 'json' });
  if (existing) return existing as Resource[];
  await store.setJSON(RESOURCES_KEY, courseSeed.resources);
  return courseSeed.resources;
}

export async function saveResources(list: Resource[]): Promise<void> {
  await resourcesStore().setJSON(RESOURCES_KEY, list);
}

export async function getFullCourseData(): Promise<CourseData> {
  const [content, resources] = await Promise.all([getContent(), getResources()]);
  return { ...content, resources };
}

export async function resetToSeed(): Promise<void> {
  await saveContent(seedContent());
  await saveResources(courseSeed.resources);
}

export async function importCourseData(data: CourseData): Promise<void> {
  const { resources, ...content } = data;
  await saveContent(content as ContentBlob);
  await saveResources(resources);
}
