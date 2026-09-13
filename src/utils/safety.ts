import type { SafetyTag } from '../types';

export const SAFETY_TAG_LABEL: Record<SafetyTag, string> = {
  h2s: 'H₂S Hazard',
  'high-pressure-steam': 'High-Pressure Steam',
  'hot-surfaces': 'Hot Surfaces',
  'rotating-equipment': 'Rotating Equipment',
  'chemical-exposure': 'Chemical Exposure',
  'pressure-systems': 'Pressure Systems',
  'confined-spaces': 'Confined Space',
  'electrical-equipment': 'Electrical Equipment',
  'hydrocarbon-release': 'Hydrocarbon Release',
};

export const ALL_SAFETY_TAGS = Object.keys(SAFETY_TAG_LABEL) as SafetyTag[];
