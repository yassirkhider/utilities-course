import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, FileText, Map, Puzzle, HelpCircle, CalendarRange } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, EmptyState, Card, SectionHeading, Badge } from '../components/ui';

interface SearchResult {
  id: string;
  type: 'Topic' | 'Handout' | 'P&ID' | 'Activity' | 'Quiz' | 'Course Plan' | 'Video' | 'Document';
  title: string;
  subtitle?: string;
  href: string;
  icon: typeof BookOpen;
}

export default function SearchPage() {
  const { data, loading, error, refresh } = useCourseData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  const results = useMemo<SearchResult[]>(() => {
    if (!data || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const out: SearchResult[] = [];

    data.topics.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.systemPurpose.toLowerCase().includes(q)) {
        out.push({ id: t.id, type: 'Topic', title: t.title, href: `/topic/${t.slug}`, icon: BookOpen });
      }
    });
    data.resources.forEach((r) => {
      if (r.title.toLowerCase().includes(q)) {
        const day = data.days.find((d) => d.id === r.dayId);
        const typeLabel = r.resourceType === 'pid' ? 'P&ID' : r.resourceType === 'video' ? 'Video' : r.resourceType === 'handout' ? 'Handout' : 'Document';
        out.push({
          id: r.id,
          type: typeLabel,
          title: r.title,
          subtitle: day?.title,
          href: r.resourceType === 'pid' ? '/resources/pids' : r.resourceType === 'handout' ? '/resources/handouts' : '/resources/handouts',
          icon: r.resourceType === 'pid' ? Map : FileText,
        });
      }
    });
    data.activities.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.objective.toLowerCase().includes(q)) {
        out.push({ id: a.id, type: 'Activity', title: a.title, href: `/activities?id=${a.id}`, icon: Puzzle });
      }
    });
    data.quizzes.forEach((qz) => {
      if (qz.title.toLowerCase().includes(q)) {
        out.push({ id: qz.id, type: 'Quiz', title: qz.title, href: `/quiz/${qz.id}`, icon: HelpCircle });
      }
    });
    data.days.forEach((d) => {
      if (d.title.toLowerCase().includes(q) || d.focus.toLowerCase().includes(q)) {
        out.push({ id: d.id, type: 'Course Plan', title: `${d.title} — ${d.focus}`, href: `/day/${d.dayNumber}`, icon: CalendarRange });
      }
    });

    return out;
  }, [data, query]);

  if (loading) return <LoadingState label="Loading search index…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <SectionHeading title="Search Course Content" subtitle="Search across topics, handouts, P&IDs, activities, quizzes and the course plan." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: query });
        }}
        className="relative mb-8"
      >
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="e.g. boiler, breathing air, sulphur…"
          className="w-full rounded-lg border border-slate-300 pl-11 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          autoFocus
        />
      </form>

      {query.trim() === '' ? (
        <EmptyState label="Start typing to search" />
      ) : results.length === 0 ? (
        <EmptyState label={`No results for "${query}"`} hint="Try a shorter or more general term." />
      ) : (
        <div className="space-y-2">
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} to={r.href}>
              <Card className="p-4 flex items-center gap-3 hover:border-brand-300">
                <r.icon size={18} className="text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-slate-500 truncate">{r.subtitle}</p>}
                </div>
                <Badge className="ml-auto bg-slate-100 text-slate-600 border-slate-200 shrink-0">{r.type}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
