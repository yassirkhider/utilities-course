import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, Card, Button, Badge } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import ActivityForm from './components/ActivityForm';
import SortableList, { DragHandle } from './components/SortableList';
import { deleteActivity, reorderActivities, saveActivity } from '../services/api';
import type { Activity } from '../types';

const emptyActivity = (): Activity => ({
  id: '',
  title: '',
  objective: '',
  activityType: 'Group Discussion',
  dayId: null,
  topicId: null,
  duration: 20,
  groupSize: 'Groups of 3-4',
  instructions: '',
  instructorNotes: '',
  requiredResources: '',
  expectedAnswer: '',
  order: 0,
});

export default function AdminActivitiesPage() {
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dayFilter, setDayFilter] = useState('all');

  if (loading) return <LoadingState label="Loading activities…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const activities = data.activities.filter((a) => dayFilter === 'all' || a.dayId === dayFilter).sort((a, b) => a.order - b.order);

  const handleSave = async (activity: Activity) => {
    try {
      await saveActivity(activity);
      await refresh();
      setEditingId(null);
      setCreating(false);
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete activity "${title}"?`)) return;
    try {
      await deleteActivity(id);
      await refresh();
      showToast('Resource deleted', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const handleReorder = async (newList: Activity[]) => {
    try {
      await reorderActivities(newList.map((a) => a.id));
      await refresh();
    } catch {
      showToast('Unable to save order — try again', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <AdminPageHeader
        title="Activities"
        subtitle="Manage classroom activities. Drag to reorder within the current filter."
        actions={
          <Button onClick={() => { setCreating(true); setEditingId(null); }}>
            <Plus size={15} /> Add Activity
          </Button>
        }
      />

      <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="all">All Days</option>
        {data.days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber}</option>)}
      </select>

      {creating && (
        <Card className="p-5 mb-4">
          <h3 className="font-semibold text-navy-900 mb-1">New Activity</h3>
          <ActivityForm initial={emptyActivity()} days={data.days} topics={data.topics} onSave={handleSave} onCancel={() => setCreating(false)} />
        </Card>
      )}

      <SortableList
        items={activities}
        onReorder={handleReorder}
        className="space-y-3"
        renderItem={(a, handle) => (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DragHandle {...handle.attributes} {...handle.listeners} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">{a.activityType}</Badge>
                  {a.dayId && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Day {data.days.find((d) => d.id === a.dayId)?.dayNumber}</Badge>}
                </div>
                <p className="font-medium text-navy-900 truncate">{a.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(editingId === a.id ? null : a.id); setCreating(false); }} aria-label="Edit">
                <Pencil size={15} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id, a.title)} aria-label="Delete" className="hover:!text-safety-red">
                <Trash2 size={15} />
              </Button>
            </div>
            {editingId === a.id && <ActivityForm initial={a} days={data.days} topics={data.topics} onSave={handleSave} onCancel={() => setEditingId(null)} />}
          </Card>
        )}
      />
    </div>
  );
}
