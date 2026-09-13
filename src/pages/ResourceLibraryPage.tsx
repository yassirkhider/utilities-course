import { useMemo, useState } from 'react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, EmptyState, SectionHeading } from '../components/ui';
import ResourceCard from '../components/ResourceCard';
import type { ResourceType } from '../types';

export default function ResourceLibraryPage({ resourceType, title, subtitle }: { resourceType: ResourceType; title: string; subtitle: string }) {
  const { data, loading, error, refresh } = useCourseData();
  const [dayFilter, setDayFilter] = useState('all');

  const resources = useMemo(() => {
    if (!data) return [];
    return data.resources
      .filter((r) => r.resourceType === resourceType)
      .filter((r) => dayFilter === 'all' || r.dayId === dayFilter)
      .sort((a, b) => a.order - b.order);
  }, [data, dayFilter, resourceType]);

  if (loading) return <LoadingState label="Loading resources…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const dayLabel = (dayId: string | null) => data.days.find((d) => d.id === dayId)?.title.split('—')[0].trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setDayFilter('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium border ${dayFilter === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
        >
          All Days
        </button>
        {data.days.map((d) => (
          <button
            key={d.id}
            onClick={() => setDayFilter(d.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border ${dayFilter === d.id ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>

      {resources.length === 0 ? (
        <EmptyState label="No resources found" hint="Try a different day filter, or check back after the instructor uploads material." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} dayLabel={dayLabel(r.dayId)} />
          ))}
        </div>
      )}
    </div>
  );
}
