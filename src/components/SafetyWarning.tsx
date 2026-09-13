import { AlertOctagon, Flame, Thermometer, RotateCw, FlaskConical, Gauge, DoorClosed, Zap, Droplets } from 'lucide-react';
import type { SafetyTag } from '../types';
import { SAFETY_TAG_LABEL } from '../utils/safety';

const ICONS: Record<SafetyTag, typeof AlertOctagon> = {
  h2s: AlertOctagon,
  'high-pressure-steam': Flame,
  'hot-surfaces': Thermometer,
  'rotating-equipment': RotateCw,
  'chemical-exposure': FlaskConical,
  'pressure-systems': Gauge,
  'confined-spaces': DoorClosed,
  'electrical-equipment': Zap,
  'hydrocarbon-release': Droplets,
};

export function SafetyTagChip({ tag }: { tag: SafetyTag }) {
  const Icon = ICONS[tag];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-safety-red/30 bg-red-50 px-2.5 py-1 text-xs font-semibold text-safety-red">
      <Icon size={14} aria-hidden="true" />
      {SAFETY_TAG_LABEL[tag]}
    </span>
  );
}

export function SafetyWarningBanner({ tags }: { tags: SafetyTag[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div role="note" aria-label="Safety warnings" className="rounded-lg border-l-4 border-safety-red bg-red-50 p-4 mb-6">
      <div className="flex items-center gap-2 mb-2 text-safety-red font-bold">
        <AlertOctagon size={20} aria-hidden="true" />
        <span>Safety Reminder — Training Purposes Only</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <SafetyTagChip key={t} tag={t} />
        ))}
      </div>
      <p className="text-sm text-red-900/80">
        These hazard tags are training reminders only and do not replace site permit-to-work, JSA, or approved plant safety procedures. Always follow your
        site's official HSE requirements.
      </p>
    </div>
  );
}
