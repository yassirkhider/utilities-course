import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayCircle, Users, Clock, ChevronDown } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, EmptyState, Card, Badge, Button, SectionHeading } from '../components/ui';
import ActivityPresentation from '../components/ActivityPresentation';
import { formatDuration } from '../utils/format';
import type { Activity, ActivityType } from '../types';

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

export default function ActivitiesPage() {
  const { data, loading, error, refresh } = useCourseData();
  const [params] = useSearchParams();
  const [dayFilter, setDayFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [presenting, setPresenting] = useState<Activity | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const id = params.get('id');
    if (id && data) {
      const act = data.activities.find((a) => a.id === id);
      if (act) setExpanded(act.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, data?.activities.length]);

  const activities = useMemo(() => {
    if (!data) return [];
    return data.activities
      .filter((a) => dayFilter === 'all' || a.dayId === dayFilter)
      .filter((a) => topicFilter === 'all' || a.topicId === topicFilter)
      .filter((a) => typeFilter === 'all' || a.activityType === typeFilter)
      .filter((a) => durationFilter === 'all' || (durationFilter === 'short' ? a.duration <= 20 : durationFilter === 'medium' ? a.duration > 20 && a.duration <= 35 : a.duration > 35))
      .sort((a, b) => a.order - b.order);
  }, [data, dayFilter, topicFilter, typeFilter, durationFilter]);

  if (loading) return <LoadingState label="Loading activities…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeading title="Classroom Activities" subtitle="Filter activities by day, topic, type or duration. Click Start Activity for a smartboard-ready presentation mode." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All Days</option>
          {data.days.map((d) => (
            <option key={d.id} value={d.id}>Day {d.dayNumber}</option>
          ))}
        </select>
        <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All Topics</option>
          {data.topics.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="all">All Activity Types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Any Duration</option>
          <option value="short">Short (&le; 20 min)</option>
          <option value="medium">Medium (21-35 min)</option>
          <option value="long">Long (35+ min)</option>
        </select>
      </div>

      {activities.length === 0 ? (
        <EmptyState label="No activities match your filters" />
      ) : (
        <div className="grid gap-5">
          {activities.map((a) => {
            const day = data.days.find((d) => d.id === a.dayId);
            const isOpen = expanded === a.id;
            return (
              <Card key={a.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">{a.activityType}</Badge>
                      {day && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Day {day.dayNumber}</Badge>}
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{a.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{a.objective}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock size={13} /> {formatDuration(a.duration)}</span>
                      <span className="inline-flex items-center gap-1"><Users size={13} /> {a.groupSize}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <Button size="sm" onClick={() => setPresenting(a)}>
                      <PlayCircle size={15} /> Start Activity
                    </Button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : a.id)}
                      className="text-xs font-medium text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
                    >
                      Details <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">Instructor Notes</p>
                      <p className="text-slate-500">{a.instructorNotes || '—'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 mb-1">Required Resources</p>
                      <p className="text-slate-500">{a.requiredResources || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-semibold text-slate-700 mb-1">Expected Answer</p>
                      <p className="text-slate-500">{a.expectedAnswer || '—'}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {presenting && <ActivityPresentation activity={presenting} onClose={() => setPresenting(null)} />}
    </div>
  );
}
