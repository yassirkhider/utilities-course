import { Link } from 'react-router-dom';
import { Clock, CalendarRange, Droplets, Wrench, PlayCircle, ListChecks, FolderOpen } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useProgress } from '../hooks/useProgress';
import { LoadingState, ErrorState, Button } from '../components/ui';
import DayCard from '../components/DayCard';
import DayProgress from '../components/DayProgress';

const STATS = [
  { icon: Clock, label: '40 Hours' },
  { icon: CalendarRange, label: '5 Training Days' },
  { icon: Droplets, label: 'Utilities & Process Support Systems' },
  { icon: Wrench, label: 'Operations / Troubleshooting / Safety' },
];

export default function HomePage() {
  const { data, loading, error, refresh } = useCourseData();
  const progress = useProgress(data?.days.length ?? 5);

  if (loading) return <LoadingState label="Loading course…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 text-center">
          <p className="text-teal-accent-400 font-semibold uppercase tracking-widest text-sm mb-3">ADNOC Technical Academy</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{data.course.title}</h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8">{data.course.subtitle}</p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-10">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-medium">
                <s.icon size={16} className="text-teal-accent-400" aria-hidden="true" />
                {s.label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/day/1">
              <Button size="lg" className="gap-2">
                <PlayCircle size={18} /> Start Course
              </Button>
            </Link>
            <Link to="/course-plan">
              <Button size="lg" variant="outline" className="!text-white !border-white/40 hover:!bg-white/10">
                <ListChecks size={18} /> View 5-Day Plan
              </Button>
            </Link>
            <Link to="/resources/handouts">
              <Button size="lg" variant="outline" className="!text-white !border-white/40 hover:!bg-white/10">
                <FolderOpen size={18} /> Open Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <DayProgress days={data.days} visitedDays={progress.visitedDays} currentDayId={progress.currentDayId} percentage={progress.percentage} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-navy-900 mb-1">5-Day Program</h2>
        <p className="text-slate-500 mb-6">Click a day to view its schedule, topics, resources and activities.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.days.map((day) => (
            <DayCard key={day.id} day={day} topics={data.topics} />
          ))}
        </div>
      </section>
    </div>
  );
}
