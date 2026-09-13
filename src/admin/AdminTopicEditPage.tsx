import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, EmptyState, Card, Button } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import RichTextEditor from './components/RichTextEditor';
import { deleteTopic, saveTopic } from '../services/api';
import { ALL_SAFETY_TAGS, SAFETY_TAG_LABEL } from '../utils/safety';
import type { SafetyTag, Topic } from '../types';

const RICH_SECTIONS: { key: keyof Topic; label: string }[] = [
  { key: 'learningObjectives', label: 'Learning Objectives' },
  { key: 'systemPurpose', label: 'System Purpose' },
  { key: 'processOverview', label: 'Process Overview' },
  { key: 'mainEquipment', label: 'Main Equipment' },
  { key: 'operatingParameters', label: 'Key Operating Parameters' },
  { key: 'processFlow', label: 'Process Flow' },
  { key: 'instrumentationControls', label: 'Instrumentation & Controls' },
  { key: 'startupConsiderations', label: 'Startup Considerations' },
  { key: 'normalOperation', label: 'Normal Operation' },
  { key: 'shutdownConsiderations', label: 'Shutdown Considerations' },
  { key: 'commonProblems', label: 'Common Problems' },
  { key: 'troubleshooting', label: 'Troubleshooting' },
  { key: 'safetyConsiderations', label: 'Safety Considerations' },
  { key: 'extendedContentHtml', label: 'Full Technical Reference (optional, extended narrative content)' },
];

const emptyTopic = (): Topic => ({
  id: '',
  slug: '',
  title: '',
  dayId: null,
  order: 0,
  learningObjectives: '',
  systemPurpose: '',
  processOverview: '',
  mainEquipment: '',
  operatingParameters: '',
  processFlow: '',
  instrumentationControls: '',
  startupConsiderations: '',
  normalOperation: '',
  shutdownConsiderations: '',
  commonProblems: '',
  troubleshooting: '',
  safetyConsiderations: '',
  safetyTags: [],
  extendedContentHtml: '',
});

export default function AdminTopicEditPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const isNew = topicId === 'new';
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);

  const serverTopic = !isNew ? data?.topics.find((t) => t.id === topicId) : undefined;

  useEffect(() => {
    if (isNew) setForm(emptyTopic());
    else if (serverTopic) setForm(serverTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, serverTopic?.id]);

  if (loading) return <LoadingState label="Loading topic…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;
  if (!form) return <EmptyState label="Topic not found" />;
  if (!isNew && !serverTopic) return <EmptyState label="Topic not found" />;

  const toggleSafetyTag = (tag: SafetyTag) => {
    setForm({ ...form, safetyTags: form.safetyTags.includes(tag) ? form.safetyTags.filter((t) => t !== tag) : [...form.safetyTags, tag] });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveTopic(form);
      await refresh();
      showToast('Changes saved successfully', 'success');
      if (isNew) navigate(`/admin/topics/${saved.id}`, { replace: true });
    } catch {
      showToast('Unable to save — try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serverTopic || !window.confirm(`Delete topic "${serverTopic.title}"? This cannot be undone.`)) return;
    try {
      await deleteTopic(serverTopic.id);
      await refresh();
      showToast('Resource deleted', 'success');
      navigate('/admin/topics');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <AdminPageHeader
        title={isNew ? 'Add Topic' : `Edit: ${serverTopic?.title}`}
        actions={
          <>
            {!isNew && (
              <a href={`/topic/${serverTopic?.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink size={14} /> Preview Topic
                </Button>
              </a>
            )}
            {!isNew && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      />

      <Card className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Topic Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Day</label>
            <select
              value={form.dayId ?? ''}
              onChange={(e) => setForm({ ...form, dayId: e.target.value || null })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {data.days.map((d) => (
                <option key={d.id} value={d.id}>Day {d.dayNumber}: {d.focus}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Safety Tags</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SAFETY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleSafetyTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  form.safetyTags.includes(tag) ? 'bg-safety-red text-white border-safety-red' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {SAFETY_TAG_LABEL[tag]}
              </button>
            ))}
          </div>
        </div>

        {RICH_SECTIONS.map((s) => (
          <RichTextEditor
            key={s.key}
            label={s.label}
            value={(form[s.key] as string) ?? ''}
            onChange={(v) => setForm({ ...form, [s.key]: v })}
          />
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate('/admin/topics')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </Card>
    </div>
  );
}
