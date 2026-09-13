import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, EmptyState, Card, Button } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import RichTextEditor from './components/RichTextEditor';
import SortableList, { DragHandle } from './components/SortableList';
import { saveDay, saveDayTopicsOrder, saveTopic } from '../services/api';
import type { DayPlan, ScheduleRow } from '../types';

type Tab = 'details' | 'topics' | 'schedule';

export default function AdminDayEditPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'details';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState<DayPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const serverDay = data?.days.find((d) => d.id === dayId);

  useEffect(() => {
    if (serverDay) setForm(serverDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDay?.id, serverDay?.schedule.length]);

  if (loading) return <LoadingState label="Loading day…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;
  if (!serverDay || !form) return <EmptyState label="Day not found" />;

  const assignedTopics = form.topicIds.map((id) => data.topics.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);
  const availableTopics = data.topics.filter((t) => !form.topicIds.includes(t.id));

  const saveDetails = async () => {
    setSaving(true);
    try {
      await saveDay(form);
      await refresh();
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTopicToDay = async (topicId: string) => {
    try {
      const newTopicIds = [...form.topicIds, topicId];
      setForm({ ...form, topicIds: newTopicIds });
      await saveTopic({ id: topicId, dayId: form.id, order: newTopicIds.length - 1 });
      await saveDayTopicsOrder(form.id, newTopicIds);
      await refresh();
      showToast('Topic assigned to day', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const removeTopicFromDay = async (topicId: string) => {
    if (!window.confirm('Remove this topic from the day? The topic itself will not be deleted.')) return;
    try {
      const newTopicIds = form.topicIds.filter((id) => id !== topicId);
      setForm({ ...form, topicIds: newTopicIds });
      await saveTopic({ id: topicId, dayId: null });
      await saveDayTopicsOrder(form.id, newTopicIds);
      await refresh();
      showToast('Topic removed from day', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const reorderTopics = async (newOrder: typeof assignedTopics) => {
    const ids = newOrder.map((t) => t.id);
    setForm({ ...form, topicIds: ids });
    try {
      await saveDayTopicsOrder(form.id, ids);
      await refresh();
    } catch {
      showToast('Unable to save order — try again', 'error');
    }
  };

  const addScheduleRow = () => {
    const newRow: ScheduleRow = { id: uuidv4(), order: form.schedule.length, startTime: '08:00', endTime: '08:30', title: 'New Session', type: 'session' };
    setForm({ ...form, schedule: [...form.schedule, newRow] });
  };

  const updateRow = (id: string, patch: Partial<ScheduleRow>) => {
    setForm({ ...form, schedule: form.schedule.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  };

  const deleteRow = (id: string) => {
    setForm({ ...form, schedule: form.schedule.filter((r) => r.id !== id) });
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await saveDay(form);
      await refresh();
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <AdminPageHeader title={`Day ${form.dayNumber}: ${form.focus}`} subtitle="Edit day details, assigned topics, and the daily schedule." />

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(['details', 'topics', 'schedule'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <Card className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Day Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Focus (short subtitle)</label>
              <input value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <RichTextEditor label="Objectives" value={form.objectives} onChange={(v) => setForm({ ...form, objectives: v })} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setForm(serverDay)}>Cancel</Button>
            <Button onClick={saveDetails} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </Card>
      )}

      {tab === 'topics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="font-semibold text-navy-900 mb-3">Assigned Topics (drag to reorder)</h3>
            {assignedTopics.length === 0 ? (
              <EmptyState label="No topics assigned" />
            ) : (
              <SortableList
                items={assignedTopics}
                onReorder={reorderTopics}
                className="space-y-2"
                renderItem={(t, handle) => (
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <DragHandle {...handle.attributes} {...handle.listeners} />
                    <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                    <button onClick={() => removeTopicFromDay(t.id)} className="text-slate-400 hover:text-safety-red" aria-label={`Remove ${t.title}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              />
            )}
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-navy-900 mb-3">Available Topics</h3>
            {availableTopics.length === 0 ? (
              <EmptyState label="All topics are assigned" />
            ) : (
              <div className="space-y-2">
                {availableTopics.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                    <button onClick={() => addTopicToDay(t.id)} className="text-brand-600 hover:text-brand-800" aria-label={`Add ${t.title}`}>
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'schedule' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Daily Schedule</h3>
            <Button size="sm" variant="outline" onClick={addScheduleRow}>
              <Plus size={14} /> Add Row
            </Button>
          </div>
          <SortableList
            items={form.schedule}
            onReorder={(rows) => setForm({ ...form, schedule: rows })}
            className="space-y-2"
            renderItem={(row, handle) => (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <DragHandle {...handle.attributes} {...handle.listeners} />
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateRow(row.id, { startTime: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateRow(row.id, { endTime: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  value={row.title}
                  onChange={(e) => updateRow(row.id, { title: e.target.value })}
                  className="flex-1 min-w-[160px] rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <select
                  value={row.type}
                  onChange={(e) => updateRow(row.id, { type: e.target.value as ScheduleRow['type'] })}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="session">Session</option>
                  <option value="break">Break</option>
                  <option value="lunch">Lunch</option>
                  <option value="activity">Activity</option>
                  <option value="assessment">Assessment</option>
                </select>
                <button onClick={() => deleteRow(row.id)} className="text-slate-400 hover:text-safety-red" aria-label="Delete row">
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setForm(serverDay)}>Cancel</Button>
            <Button onClick={saveSchedule} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
