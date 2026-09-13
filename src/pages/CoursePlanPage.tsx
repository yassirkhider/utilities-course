import { Printer, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, Card, Button, SectionHeading, Badge } from '../components/ui';
import RichContent from '../components/RichContent';

export default function CoursePlanPage() {
  const { data, loading, error, refresh } = useCourseData();

  if (loading) return <LoadingState label="Loading course plan…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const downloadPlan = () => {
    const blob = new Blob([buildPlanText(data)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <SectionHeading eyebrow={data.course.duration} title={data.course.title} subtitle={data.course.subtitle} />
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={15} /> Print Course Plan
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPlan}>
            <Download size={15} /> Download Course Plan
          </Button>
        </div>
      </div>

      <Card className="p-5 mb-8">
        <h3 className="font-bold text-navy-900 mb-2">Course Objectives</h3>
        <RichContent html={data.course.objectives} />
      </Card>

      <ol className="relative border-l-2 border-slate-200 pl-6 space-y-8">
        {data.days.map((day) => {
          const topics = data.topics.filter((t) => day.topicIds.includes(t.id)).sort((a, b) => a.order - b.order);
          const activities = data.activities.filter((a) => a.dayId === day.id);
          const resources = data.resources.filter((r) => r.dayId === day.id);
          const quiz = data.quizzes.find((q) => q.kind === 'daily-review' && q.dayId === day.id);
          const hours = day.schedule.filter((s) => s.type !== 'break' && s.type !== 'lunch').length * 1.5;

          return (
            <li key={day.id} className="relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-brand-600 ring-4 ring-white" aria-hidden="true" />
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-navy-900">
                    Day {day.dayNumber}: {day.focus}
                  </h3>
                  <Badge className="bg-brand-100 text-brand-700 border-brand-200">~{hours.toFixed(1)} hrs</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{day.description}</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Topics</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {topics.map((t) => (
                        <li key={t.id}>
                          <Link to={`/topic/${t.slug}`} className="hover:text-brand-600">{t.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Learning Objectives</p>
                    <RichContent html={day.objectives} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Classroom Activities</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {activities.map((a) => <li key={a.id}>{a.title}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Resources</p>
                    <p className="text-slate-600">{resources.length} resource item(s)</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-semibold text-slate-700 mb-1">Assessment</p>
                    <p className="text-slate-600">{quiz ? quiz.title : 'No formal quiz assigned'}</p>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function buildPlanText(data: NonNullable<ReturnType<typeof useCourseData>['data']>): string {
  let out = `${data.course.title}\n${data.course.subtitle}\n${data.course.duration}\n\n`;
  data.days.forEach((day) => {
    out += `Day ${day.dayNumber}: ${day.focus}\n`;
    const topics = data.topics.filter((t) => day.topicIds.includes(t.id));
    topics.forEach((t) => (out += `  - ${t.title}\n`));
    out += '\n';
  });
  return out;
}
