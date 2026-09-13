import { Link } from 'react-router-dom';
import { BookOpen, FileText, Map, Puzzle, HelpCircle, UploadCloud } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, Card } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';

export default function AdminDashboardPage() {
  const { data, loading, error, refresh } = useCourseData();

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const totalQuizQuestions = data.quizzes.reduce((sum, q) => sum + q.questions.length, 0);
  const uploadedFiles = data.resources.filter((r) => r.blobKey).length;

  const stats = [
    { label: 'Total Topics', value: data.topics.length, icon: BookOpen, to: '/admin/topics' },
    { label: 'Total Handouts', value: data.resources.filter((r) => r.resourceType === 'handout').length, icon: FileText, to: '/admin/resources/handout' },
    { label: 'Total P&IDs', value: data.resources.filter((r) => r.resourceType === 'pid').length, icon: Map, to: '/admin/resources/pid' },
    { label: 'Total Activities', value: data.activities.length, icon: Puzzle, to: '/admin/activities' },
    { label: 'Total Quiz Questions', value: totalQuizQuestions, icon: HelpCircle, to: '/admin/quizzes' },
    { label: 'Uploaded Files', value: uploadedFiles, icon: UploadCloud, to: '/admin/resources' },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader title="Dashboard" subtitle={`${data.course.title} — last updated ${new Date(data.updatedAt).toLocaleString()}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="p-5 flex items-center gap-4 hover:border-brand-300 transition-colors">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon size={22} />
              </span>
              <div>
                <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-navy-900 mb-2">Days Overview</h3>
          <ul className="space-y-1.5 text-sm">
            {data.days.map((d) => (
              <li key={d.id} className="flex justify-between text-slate-600">
                <Link to="/admin/days" className="hover:text-brand-600">Day {d.dayNumber}: {d.focus}</Link>
                <span>{d.topicIds.length} topics · {d.schedule.length} sessions</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-navy-900 mb-2">Quick Tips</h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
            <li>Use <strong>Topics</strong> to edit the technical content trainees see on each topic page.</li>
            <li>Use <strong>Resources</strong> to upload handouts, P&IDs, videos and other files.</li>
            <li>Use <strong>Backup</strong> regularly to export a full copy of your course data.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
