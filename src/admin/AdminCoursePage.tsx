import { useEffect, useState } from 'react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, Card, Button } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import RichTextEditor from './components/RichTextEditor';
import { saveCourseMeta } from '../services/api';
import type { CourseMeta } from '../types';

const TEXT_FIELDS: { key: keyof CourseMeta; label: string; placeholder?: string }[] = [
  { key: 'title', label: 'Course Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'duration', label: 'Duration' },
  { key: 'audience', label: 'Audience' },
  { key: 'location', label: 'Location' },
  { key: 'dates', label: 'Dates' },
  { key: 'instructorName', label: 'Instructor Name' },
  { key: 'instructorTitle', label: 'Instructor Title' },
  { key: 'courseImage', label: 'Course Image URL' },
];

export default function AdminCoursePage() {
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const [form, setForm] = useState<CourseMeta | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data.course);
  }, [data]);

  if (loading) return <LoadingState label="Loading course details…" />;
  if (error || !data || !form) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const update = <K extends keyof CourseMeta>(key: K, value: CourseMeta[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCourseMeta(form);
      await refresh();
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <AdminPageHeader
        title="Course Details"
        subtitle="Edit the course title, description, objectives, and instructor information."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        }
      />

      <Card className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {TEXT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input
                value={(form[f.key] as string) || ''}
                onChange={(e) => update(f.key, e.target.value as CourseMeta[typeof f.key])}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>

        <RichTextEditor label="Description" value={form.description} onChange={(v) => update('description', v)} />
        <RichTextEditor label="Objectives" value={form.objectives} onChange={(v) => update('objectives', v)} />
        <RichTextEditor label="Instructor Bio" value={form.instructorBio} onChange={(v) => update('instructorBio', v)} />
        <RichTextEditor label="Footer Text" value={form.footerText} onChange={(v) => update('footerText', v)} minHeight={60} />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setForm(data.course)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
