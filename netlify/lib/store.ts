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

/** Optional manual Netlify Blobs credentials — a fallback for deployments where Netlify's
 *  automatic ("zero-config") Blobs wiring doesn't reach the function at runtime (symptom:
 *  `MissingBlobsEnvironmentError` even on a real production deploy, not local dev). Set
 *  `BLOBS_SITE_ID` and `BLOBS_TOKEN` as environment variables on the Netlify site to force
 *  explicit credentials; see README "Troubleshooting" for where to find these two values.
 *  When they're unset (the normal case), this returns nothing extra and Netlify's automatic
 *  credentials are used exactly as before. */
function manualBlobsConfig() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function contentStore() {
  return getStore({ name: CONTENT_STORE, consistency: 'strong', ...manualBlobsConfig() });
}

function resourcesStore() {
  return getStore({ name: RESOURCES_STORE, consistency: 'strong', ...manualBlobsConfig() });
}

export function uploadsStore() {
  return getStore({ name: UPLOADS_STORE, consistency: 'strong', ...manualBlobsConfig() });
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
