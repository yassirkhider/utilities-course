import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useToast } from '../context/ToastContext';
import { LoadingState, ErrorState, Card, Button, Badge } from '../components/ui';
import AdminPageHeader from './components/AdminPageHeader';
import QuizForm from './components/QuizForm';
import { deleteQuiz, saveQuiz } from '../services/api';
import type { Quiz } from '../types';

const emptyQuiz = (): Quiz => ({ id: '', title: '', kind: 'daily-review', dayId: null, topicId: null, questions: [] });

export default function AdminQuizzesPage() {
  const { data, loading, error, refresh } = useCourseData();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <LoadingState label="Loading quizzes…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;

  const handleSave = async (quiz: Quiz) => {
    if (!quiz.title.trim()) {
      showToast('Quiz title is required', 'error');
      return;
    }
    try {
      await saveQuiz(quiz);
      await refresh();
      setEditingId(null);
      setCreating(false);
      showToast('Changes saved successfully', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete quiz "${title}"?`)) return;
    try {
      await deleteQuiz(id);
      await refresh();
      showToast('Resource deleted', 'success');
    } catch {
      showToast('Unable to save — try again', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <AdminPageHeader
        title="Quizzes"
        subtitle="Manage the initial assessment, daily review quizzes, and final assessment."
        actions={
          <Button onClick={() => { setCreating(true); setEditingId(null); }}>
            <Plus size={15} /> Add Quiz
          </Button>
        }
      />

      {creating && (
        <Card className="p-5 mb-4">
          <h3 className="font-semibold text-navy-900 mb-1">New Quiz</h3>
          <QuizForm initial={emptyQuiz()} days={data.days} topics={data.topics} onSave={handleSave} onCancel={() => setCreating(false)} />
        </Card>
      )}

      <div className="space-y-3">
        {data.quizzes.map((q) => (
          <Card key={q.id} className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge className="bg-teal-accent-100 text-teal-accent-600 border-teal-accent-100">{q.kind}</Badge>
                  {q.dayId && <Badge className="bg-slate-100 text-slate-600 border-slate-200">Day {data.days.find((d) => d.id === q.dayId)?.dayNumber}</Badge>}
                </div>
                <p className="font-medium text-navy-900 truncate">{q.title}</p>
                <p className="text-xs text-slate-500">{q.questions.length} questions</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(editingId === q.id ? null : q.id); setCreating(false); }} aria-label="Edit">
                <Pencil size={15} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id, q.title)} aria-label="Delete" className="hover:!text-safety-red">
                <Trash2 size={15} />
              </Button>
            </div>
            {editingId === q.id && <QuizForm initial={q} days={data.days} topics={data.topics} onSave={handleSave} onCancel={() => setEditingId(null)} />}
          </Card>
        ))}
      </div>
    </div>
  );
}
