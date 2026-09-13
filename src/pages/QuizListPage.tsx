import { Link } from 'react-router-dom';
import { ClipboardCheck, CalendarCheck2, GraduationCap } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, Card, Button, SectionHeading, Badge } from '../components/ui';
import { useQuizResults } from '../hooks/useQuizResults';
import type { QuizKind } from '../types';

const KIND_META: Record<QuizKind, { label: string; icon: typeof ClipboardCheck; color: string }> = {
  'initial-assessment': { label: 'Initial Assessment', icon: ClipboardCheck, color: 'bg-brand-100 text-brand-700 border-brand-200' },
  'daily-review': { label: 'Daily Review Quiz', icon: CalendarCheck2, color: 'bg-teal-accent-100 text-teal-accent-600 border-teal-accent-100' },
  'final-assessment': { label: 'Final Assessment', icon: GraduationCap, color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export default function QuizListPage() {
  const { data, loading, error, refresh } = useCourseData();
  const { results } = useQuizResults();

  if (loading) return <LoadingState label="Loading quizzes…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SectionHeading title="Quizzes & Assessments" subtitle="Complete the initial placement test, daily review quizzes, and the final assessment." />
      <div className="space-y-4">
        {data.quizzes.map((q) => {
          const meta = KIND_META[q.kind];
          const day = data.days.find((d) => d.id === q.dayId);
          const result = results.find((r) => r.quizId === q.id);
          return (
            <Card key={q.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full border ${meta.color}`}>
                  <meta.icon size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className={meta.color}>{meta.label}</Badge>
                    {day && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Day {day.dayNumber}</Badge>}
                  </div>
                  <h3 className="font-bold text-navy-900">{q.title}</h3>
                  <p className="text-xs text-slate-500">{q.questions.length} questions{result ? ` · Last score: ${result.percentage}%` : ''}</p>
                </div>
              </div>
              <Link to={`/quiz/${q.id}`}>
                <Button size="sm">{result ? 'Retake Quiz' : 'Start Quiz'}</Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
