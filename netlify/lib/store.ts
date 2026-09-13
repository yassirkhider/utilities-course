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

/**
 * Netlify Functions v2 automatically injects the Blobs context, so normally
 * getStore(name) is all that is required.
 *
 * This optional fallback is useful for unusual/manual environments. SITE_ID is
 * a Netlify read-only runtime variable; therefore an administrator normally only
 * needs to provide BLOBS_TOKEN (a Netlify PAT) if automatic Blobs injection is
 * unavailable. BLOBS_SITE_ID can override the runtime site id when necessary.
 */
function manualBlobsConfig(): { siteID: string; token: string } | undefined {
  const siteID = process.env.BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  return siteID && token ? { siteID, token } : undefined;
}

function openStore(name: string) {
  const manual = manualBlobsConfig();
  return manual ? getStore(name, manual) : getStore(name);
}

function contentStore() {
  return openStore(CONTENT_STORE);
}

function resourcesStore() {
  return openStore(RESOURCES_STORE);
}

export function uploadsStore() {
  return openStore(UPLOADS_STORE);
}

function seedContent(): ContentBlob {
  const { resources: _r, ...rest } = courseSeed;
  return rest;
}

export async function getContent(): Promise<ContentBlob> {
  const store = contentStore();
  const existing = await store.get(CONTENT_KEY, { type: 'json', consistency: 'strong' });
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
  const existing = await store.get(RESOURCES_KEY, { type: 'json', consistency: 'strong' });
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
