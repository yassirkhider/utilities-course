import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, Card, Button, Badge } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import { deleteTopic } from '../services/api';

export default function AdminTopicsPage() {
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (loading) return <LoadingState label="Loading topics…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete topic "${title}"? This cannot be undone.`)) return;
    try {
      await deleteTopic(id);
      await refresh();
      showToast('Resource deleted', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <AdminPageHeader
        title="Topics"
        subtitle="Manage the 16 course topics and their technical content."
        actions={
          <Button onClick={() => navigate('/admin/topics/new')}>
            <Plus size={15} /> Add Topic
          </Button>
        }
      />
      <div className="space-y-2">
        {data.topics.map((t) => {
          const day = data.days.find((d) => d.id === t.dayId);
          return (
            <Card key={t.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-navy-900 truncate">{t.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {day ? <Badge className="bg-brand-100 text-brand-700 border-brand-200">Day {day.dayNumber}</Badge> : <Badge className="bg-slate-100 text-slate-500 border-slate-200">Unassigned</Badge>}
                  {t.safetyTags.length > 0 && <span className="text-xs text-safety-red">{t.safetyTags.length} safety tag(s)</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link to={`/topic/${t.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" aria-label="Preview">
                    <Eye size={15} />
                  </Button>
                </Link>
                <Link to={`/admin/topics/${t.id}`}>
                  <Button variant="ghost" size="sm" aria-label="Edit">
                    <Pencil size={15} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id, t.title)} aria-label="Delete" className="hover:!text-safety-red">
                  <Trash2 size={15} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
