import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, Card } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';

export default function AdminSchedulePage() {
  const { data, loading, error, refresh } = useCourseData();

  if (loading) return <LoadingState label="Loading schedules…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <AdminPageHeader title="Schedule" subtitle="Choose a day to add, edit, reorder or delete its schedule rows." />
      <div className="space-y-3">
        {data.days.map((d) => (
          <Link key={d.id} to={`/admin/days/${d.id}?tab=schedule`}>
            <Card className="p-4 flex items-center justify-between hover:border-brand-300">
              <div>
                <p className="font-semibold text-navy-900">Day {d.dayNumber}: {d.focus}</p>
                <p className="text-sm text-slate-500">{d.schedule.length} schedule rows</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
