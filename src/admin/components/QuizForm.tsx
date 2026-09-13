import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import type { DayPlan, Quiz, QuizKind, Topic } from '../../types';

export default function QuizForm({
  initial,
  days,
  topics,
  onSave,
  onCancel,
}: {
  initial: Quiz;
  days: DayPlan[];
  topics: Topic[];
  onSave: (q: Quiz) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Quiz>(initial);

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { id: uuidv4(), question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }],
    });
  };

  const updateQuestion = (id: string, patch: Partial<Quiz['questions'][number]>) => {
    setForm({ ...form, questions: form.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setForm({
      ...form,
      questions: form.questions.map((q) => {
        if (q.id !== qId) return q;
        const options = [...q.options] as Quiz['questions'][number]['options'];
        options[idx] = value;
        return { ...q, options };
      }),
    });
  };

  const removeQuestion = (id: string) => {
    setForm({ ...form, questions: form.questions.filter((q) => q.id !== id) });
  };

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4 mt-3">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kind</label>
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as QuizKind })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="initial-assessment">Initial Assessment</option>
            <option value="daily-review">Daily Review Quiz</option>
            <option value="final-assessment">Final Assessment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
          <select value={form.dayId ?? ''} onChange={(e) => setForm({ ...form, dayId: e.target.value || null })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">None</option>
            {days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
          <select value={form.topicId ?? ''} onChange={(e) => setForm({ ...form, topicId: e.target.value || null })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">None</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-700 text-sm">Questions ({form.questions.length})</h4>
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus size={14} /> Add Question
          </Button>
        </div>
        <div className="space-y-4">
          {form.questions.map((q, qi) => (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-slate-700">Question {qi + 1}</label>
                <button onClick={() => removeQuestion(q.id)} className="text-slate-400 hover:text-safety-red" aria-label="Delete question">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                value={q.question}
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
                placeholder="Question text"
              />
              <div className="grid sm:grid-cols-2 gap-2 mb-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(q.id, { correctIndex: oi as 0 | 1 | 2 | 3 })}
                      aria-label={`Mark option ${oi + 1} correct`}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(q.id, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                ))}
              </div>
              <textarea
                value={q.explanation}
                onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                placeholder="Explanation shown after answering"
                rows={2}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
}
