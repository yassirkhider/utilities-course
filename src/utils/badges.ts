import type { ResourceType } from '../types';

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  handout: 'Handout',
  pid: 'P&ID',
  activity: 'Activity',
  presentation: 'Presentation',
  schedule: 'Schedule',
  video: 'Video',
  document: 'Document',
  worksheet: 'Worksheet',
  'quiz-support': 'Quiz Support',
};

export const RESOURCE_TYPE_BADGE_CLASS: Record<ResourceType, string> = {
  handout: 'bg-brand-100 text-brand-800 border-brand-200',
  pid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  activity: 'bg-orange-100 text-orange-800 border-orange-200',
  presentation: 'bg-orange-100 text-orange-800 border-orange-200',
  schedule: 'bg-slate-100 text-slate-700 border-slate-200',
  video: 'bg-purple-100 text-purple-800 border-purple-200',
  document: 'bg-slate-100 text-slate-700 border-slate-200',
  worksheet: 'bg-orange-100 text-orange-800 border-orange-200',
  'quiz-support': 'bg-teal-accent-100 text-teal-accent-600 border-teal-accent-100',
};
