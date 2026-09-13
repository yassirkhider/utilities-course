import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Clock,
  BookOpen,
  FileText,
  Map,
  Puzzle,
  Video,
  HelpCircle,
  Download,
} from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useProgress } from '../hooks/useProgress';
import { LoadingState, ErrorState, EmptyState, Card, Badge, Button, SectionHeading } from '../components/ui';
import ResourceCard from '../components/ResourceCard';
import RichContent from '../components/RichContent';
import HourlyProgressRail from '../components/HourlyProgressRail';
import { formatDuration } from '../utils/format';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'schedule', label: "Today's Schedule", icon: Clock },
  { key: 'topics', label: 'Topics', icon: BookOpen },
  { key: 'handouts', label: 'Handouts', icon: FileText },
  { key: 'pids', label: 'P&IDs', icon: Map },
  { key: 'activities', label: 'Activities', icon: Puzzle },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
  { key: 'downloads', label: 'Downloads', icon: Download },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function DayPage() {
  const { dayNumber, tab = 'overview' } = useParams<{ dayNumber: string; tab: string }>();
  const { data, loading, error, refresh } = useCourseData();
  const navigate = useNavigate();
  const progress = useProgress(data?.days.length ?? 5);

  const day = useMemo(() => data?.days.find((d) => String(d.dayNumber) === dayNumber), [data, dayNumber]);

  useEffect(() => {
    if (day) progress.markDayVisited(day.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.id]);

  if (loading) return <LoadingState label="Loading day…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;
  if (!day) return <EmptyState label={`Day ${dayNumber} not found`} />;

  const dayTopics = data.topics.filter((t) => day.topicIds.includes(t.id)).sort((a, b) => a.order - b.order);
  const dayActivities = data.activities.filter((a) => a.dayId === day.id).sort((a, b) => a.order - b.order);
  const dayResources = data.resources.filter((r) => r.dayId === day.id);
  const handouts = dayResources.filter((r) => r.resourceType === 'handout');
  const pids = dayResources.filter((r) => r.resourceType === 'pid');
  const videos = dayResources.filter((r) => r.resourceType === 'video');
  const dayQuiz = data.quizzes.find((q) => q.kind === 'daily-review' && q.dayId === day.id);

  const prevDay = data.days.find((d) => d.dayNumber === day.dayNumber - 1);
  const nextDay = data.days.find((d) => d.dayNumber === day.dayNumber + 1);

  const goTab = (t: TabKey) => navigate(`/day/${day.dayNumber}/${t}`);

  return (
    <div>
      <div className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <p className="text-teal-accent-400 font-semibold text-sm uppercase tracking-wide mb-1">Day {day.dayNumber} of {data.days.length}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{day.title}</h1>
          <p className="text-slate-300 mb-6">{day.focus}</p>

          <div className="mx-auto max-w-2xl rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-5 py-5 text-left shadow-lg">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-teal-accent-400 mb-2">Today's Objectives</p>
            <RichContent html={day.objectives} className="text-slate-100 marker:text-teal-accent-400 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white" />
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 no-print">
        <div className="mx-auto max-w-6xl px-4 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => goTab(t.key)}
                aria-current={tab === t.key ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[1fr_260px] lg:gap-8 lg:items-start">
      <div className="min-w-0">
        {tab === 'overview' && (
          <div className="space-y-8">
            <RichContent html={day.description ? `<p>${day.description}</p>` : ''} />
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-brand-700">{day.schedule.length}</p>
                <p className="text-sm text-slate-500">Schedule Sessions</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-brand-700">{handouts.length}</p>
                <p className="text-sm text-slate-500">Handouts</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-brand-700">{pids.length}</p>
                <p className="text-sm text-slate-500">P&IDs</p>
              </Card>
            </div>
            <div>
              <h3 className="font-bold text-navy-900 mb-2">Learning Objectives</h3>
              <RichContent html={day.objectives} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-navy-900 mb-2">Today's Topics</h3>
                <ol className="space-y-2">
                  {dayTopics.map((t, i) => (
                    <li key={t.id}>
                      <Link to={`/topic/${t.slug}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-brand-300 hover:bg-brand-50/40">
                        <span className="text-xs font-bold text-brand-600">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-medium text-slate-700">{t.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-2">Today's Activities</h3>
                <ol className="space-y-2">
                  {dayActivities.map((a) => (
                    <li key={a.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-sm font-medium text-slate-700">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.activityType} · {formatDuration(a.duration)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div>
            <SectionHeading title="Today's Schedule" />
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold w-40">Time</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {day.schedule.map((row) => (
                    <tr key={row.id} className={row.type === 'break' || row.type === 'lunch' ? 'bg-slate-50 text-slate-500' : ''}>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{row.startTime}–{row.endTime}</td>
                      <td className="px-4 py-3">
                        {row.title}
                        {row.type === 'activity' && <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-200">Activity</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {tab === 'topics' && (
          <div>
            <SectionHeading title="Training Topics" subtitle="Select a topic to view its full technical reference." />
            {dayTopics.length === 0 ? (
              <EmptyState label="No topics assigned to this day yet" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayTopics.map((t) => (
                  <Link key={t.id} to={`/topic/${t.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition-all">
                    <p className="font-semibold text-navy-900 mb-1">{t.title}</p>
                    {t.safetyTags.length > 0 && <p className="text-xs text-safety-red font-medium">{t.safetyTags.length} safety consideration(s)</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'handouts' && (
          <div>
            <SectionHeading title="Handouts" />
            {handouts.length === 0 ? <EmptyState label="No handouts for this day yet" /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {handouts.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'pids' && (
          <div>
            <SectionHeading title="P&IDs" />
            {pids.length === 0 ? <EmptyState label="No P&IDs for this day yet" /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pids.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'activities' && (
          <div>
            <SectionHeading title="Classroom Activities" />
            {dayActivities.length === 0 ? <EmptyState label="No activities for this day yet" /> : (
              <div className="grid sm:grid-cols-2 gap-5">
                {dayActivities.map((a) => (
                  <Card key={a.id} className="p-5">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-2">{a.activityType}</Badge>
                    <h3 className="font-bold text-navy-900 mb-1">{a.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{a.objective}</p>
                    <p className="text-xs text-slate-500 mb-3">{formatDuration(a.duration)} · {a.groupSize}</p>
                    <Link to={`/activities?id=${a.id}`}>
                      <Button size="sm">View Activity</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'videos' && (
          <div>
            <SectionHeading title="Videos & External Resources" />
            {videos.length === 0 ? <EmptyState label="No videos for this day yet" /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'quiz' && (
          <div>
            <SectionHeading title="Daily Review Quiz" />
            {dayQuiz ? (
              <Card className="p-6 max-w-md">
                <h3 className="font-bold text-navy-900 mb-1">{dayQuiz.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{dayQuiz.questions.length} questions</p>
                <Link to={`/quiz/${dayQuiz.id}`}>
                  <Button>Start Quiz</Button>
                </Link>
              </Card>
            ) : (
              <EmptyState label="No quiz assigned to this day yet" />
            )}
          </div>
        )}

        {tab === 'downloads' && (
          <div>
            <SectionHeading title="Downloadable Files" />
            {dayResources.length === 0 ? <EmptyState label="No downloadable files yet" /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {dayResources.map((r) => <ResourceCard key={r.id} resource={r} />)}
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex items-start justify-between gap-4 border-t border-slate-200 pt-6">
          {prevDay ? (
            <Link to={`/day/${prevDay.dayNumber}`} className="inline-flex items-start gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              <ChevronLeft size={16} className="mt-0.5 shrink-0" /> <span>Day {prevDay.dayNumber}: {prevDay.focus}</span>
            </Link>
          ) : <span />}
          {nextDay ? (
            <Link to={`/day/${nextDay.dayNumber}`} className="inline-flex items-start justify-end gap-1 text-right text-sm font-semibold text-brand-600 hover:text-brand-700">
              <span>Day {nextDay.dayNumber}: {nextDay.focus}</span> <ChevronRight size={16} className="mt-0.5 shrink-0" />
            </Link>
          ) : <span />}
        </div>
      </div>

      <HourlyProgressRail schedule={day.schedule} />
      </div>
    </div>
  );
}
