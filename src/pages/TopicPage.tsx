import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, EmptyState, Card, Button } from '../components/ui';
import RichContent from '../components/RichContent';
import ResourceCard from '../components/ResourceCard';
import { SafetyWarningBanner } from '../components/SafetyWarning';
import { useSmartboard } from '../context/SmartboardContext';

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, refresh } = useCourseData();
  const { enter } = useSmartboard();

  if (loading) return <LoadingState label="Loading topic…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const topic = data.topics.find((t) => t.slug === slug);
  if (!topic) return <EmptyState label="Topic not found" />;

  const day = data.days.find((d) => d.id === topic.dayId);
  const siblingTopics = day ? data.topics.filter((t) => t.dayId === day.id).sort((a, b) => a.order - b.order) : [];
  const idx = siblingTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = idx > 0 ? siblingTopics[idx - 1] : undefined;
  const nextTopic = idx >= 0 && idx < siblingTopics.length - 1 ? siblingTopics[idx + 1] : undefined;

  const handout = data.resources.find((r) => r.topicId === topic.id && r.resourceType === 'handout');
  const pid = data.resources.find((r) => r.topicId === topic.id && r.resourceType === 'pid');
  const activity = data.activities.find((a) => a.topicId === topic.id);
  const quiz = data.quizzes.find((q) => q.topicId === topic.id) ?? data.quizzes.find((q) => q.kind === 'daily-review' && q.dayId === topic.dayId);

  const sections: { title: string; html: string }[] = [
    { title: 'Learning Objectives', html: topic.learningObjectives },
    { title: 'System Purpose', html: topic.systemPurpose },
    { title: 'Process Overview', html: topic.processOverview },
    { title: 'Main Equipment', html: topic.mainEquipment },
    { title: 'Key Operating Parameters', html: topic.operatingParameters },
    { title: 'Process Flow', html: topic.processFlow },
    { title: 'Instrumentation & Controls', html: topic.instrumentationControls },
    { title: 'Startup Considerations', html: topic.startupConsiderations },
    { title: 'Normal Operation', html: topic.normalOperation },
    { title: 'Shutdown Considerations', html: topic.shutdownConsiderations },
    { title: 'Common Problems', html: topic.commonProblems },
    { title: 'Troubleshooting', html: topic.troubleshooting },
    { title: 'Safety Considerations', html: topic.safetyConsiderations },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {day && (
        <p className="text-sm text-slate-500 mb-2">
          <Link to={`/day/${day.dayNumber}`} className="text-brand-600 hover:underline">
            Day {day.dayNumber}: {day.focus}
          </Link>
        </p>
      )}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900">{topic.title}</h1>
        <Button variant="outline" size="sm" onClick={enter} className="shrink-0 no-print">
          <Presentation size={15} /> Smartboard Mode
        </Button>
      </div>

      <SafetyWarningBanner tags={topic.safetyTags} />

      <div className="space-y-6 mb-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold text-navy-800 mb-2 border-b border-slate-200 pb-1">{s.title}</h2>
            <RichContent html={s.html} />
          </section>
        ))}

        {topic.extendedContentHtml && (
          <section>
            <h2 className="text-lg font-bold text-navy-800 mb-2 border-b border-slate-200 pb-1">Full Technical Reference</h2>
            <p className="text-xs text-slate-500 mb-3">
              Complete narrative content from the official course material, including reference tables and process flow notes.
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
              <RichContent html={topic.extendedContentHtml} />
            </div>
          </section>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        {handout && <ResourceCard resource={handout} />}
        {pid && <ResourceCard resource={pid} />}
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        {activity && (
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600 mb-1">Related Activity</p>
            <h3 className="font-bold text-navy-900 mb-1">{activity.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{activity.objective}</p>
            <Link to={`/activities?id=${activity.id}`}>
              <Button size="sm">Open Activity</Button>
            </Link>
          </Card>
        )}
        {quiz && (
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-accent-600 mb-1">Related Quiz</p>
            <h3 className="font-bold text-navy-900 mb-1">{quiz.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{quiz.questions.length} questions</p>
            <Link to={`/quiz/${quiz.id}`}>
              <Button size="sm">Start Quiz</Button>
            </Link>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        {prevTopic ? (
          <Link to={`/topic/${prevTopic.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ChevronLeft size={16} /> {prevTopic.title}
          </Link>
        ) : <span />}
        {nextTopic ? (
          <Link to={`/topic/${nextTopic.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            {nextTopic.title} <ChevronRight size={16} />
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
