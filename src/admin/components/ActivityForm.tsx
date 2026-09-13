import { useState } from 'react';
import type { Activity, ActivityType } from '../../types';
import { Button } from '../../components/ui';
import RichTextEditor from './RichTextEditor';
import type { DayPlan, Topic } from '../../types';

const ACTIVITY_TYPES: ActivityType[] = [
  'P&ID Tracing',
  'Process Flow Challenge',
  'Troubleshooting Scenario',
  'Group Discussion',
  'Equipment Identification',
  'Hazard Identification',
  'Startup Sequencing',
  'Shutdown Sequencing',
  'Fault Finding',
  'Quick Quiz',
];

export default function ActivityForm({
  initial,
  days,
  topics,
  onSave,
  onCancel,
}: {
  initial: Activity;
  days: DayPlan[];
  topics: Topic[];
  onSave: (a: Activity) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Activity>(initial);

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4 mt-3">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
          <select value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value as ActivityType })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
          <select value={form.dayId ?? ''} onChange={(e) => setForm({ ...form, dayId: e.target.value || null })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Unassigned</option>
            {days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Related Topic</label>
          <select value={form.topicId ?? ''} onChange={(e) => setForm({ ...form, topicId: e.target.value || null })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">None</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
          <input type="number" min={5} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Group Size</label>
          <input value={form.groupSize} onChange={(e) => setForm({ ...form, groupSize: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
        <textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <RichTextEditor label="Instructions" value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Instructor Notes</label>
        <textarea value={form.instructorNotes} onChange={(e) => setForm({ ...form, instructorNotes: e.target.value })} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Required Resources</label>
        <input value={form.requiredResources} onChange={(e) => setForm({ ...form, requiredResources: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Expected Answer</label>
        <textarea value={form.expectedAnswer} onChange={(e) => setForm({ ...form, expectedAnswer: e.target.value })} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
}
