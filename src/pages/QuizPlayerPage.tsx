import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { LoadingState, ErrorState, EmptyState, Card, Button } from '../components/ui';
import { useQuizResults } from '../hooks/useQuizResults';

export default function QuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { data, loading, error, refresh } = useCourseData();
  const { saveResult } = useQuizResults();

  const quiz = data?.quizzes.find((q) => q.id === quizId);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return answers.reduce((acc, ans, i) => (ans === quiz.questions[i].correctIndex ? acc + 1 : acc), 0);
  }, [answers, quiz]);

  if (loading) return <LoadingState label="Loading quiz…" />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load course data'} onRetry={refresh} />;
  if (!quiz) return <EmptyState label="Quiz not found" />;
  if (quiz.questions.length === 0) return <EmptyState label="This quiz has no questions yet" />;

  const question = quiz.questions[step];
  const total = quiz.questions.length;

  const checkAnswer = () => {
    if (selected === null) return;
    setChecked(true);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);
    setSelected(null);
    setChecked(false);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const finalScore = newAnswers.reduce((acc, ans, i) => (ans === quiz.questions[i].correctIndex ? acc + 1 : acc), 0);
      saveResult({
        quizId: quiz.id,
        score: finalScore,
        total,
        percentage: Math.round((finalScore / total) * 100),
        answers: newAnswers,
        completedAt: new Date().toISOString(),
      });
      setFinished(true);
    }
  };

  const restart = () => {
    setStep(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round((score / total) * 100);
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-8 text-center mb-8">
          <Award size={48} className="mx-auto text-teal-accent-500 mb-3" />
          <h1 className="text-2xl font-bold text-navy-900 mb-1">{quiz.title} — Complete</h1>
          <p className="text-5xl font-extrabold text-brand-700 my-4">{percentage}%</p>
          <p className="text-slate-600">{score} of {total} correct</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={restart}>
              <RotateCcw size={15} /> Retake Quiz
            </Button>
            <Link to="/quiz">
              <Button>Back to Quizzes</Button>
            </Link>
          </div>
        </Card>

        <h2 className="font-bold text-navy-900 mb-3">Review Answers</h2>
        <div className="space-y-3">
          {quiz.questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            return (
              <Card key={q.id} className={`p-4 border-l-4 ${isCorrect ? 'border-l-safety-green' : 'border-l-safety-red'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="text-safety-green shrink-0 mt-0.5" size={18} /> : <XCircle className="text-safety-red shrink-0 mt-0.5" size={18} />}
                  <div>
                    <p className="font-medium text-slate-800">{q.question}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Your answer: {answers[i] >= 0 ? q.options[answers[i]] : 'No answer'} {!isCorrect && <>· Correct: {q.options[q.correctIndex]}</>}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 italic">{q.explanation}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>{quiz.title}</span>
          <span>Question {step + 1} of {total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${((step + (checked ? 1 : 0)) / total) * 100}%` }} />
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-5">{question.question}</h2>
        <div className="space-y-2 mb-6">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectOption = i === question.correctIndex;
            let stateClass = 'border-slate-200 hover:border-brand-300';
            if (checked) {
              if (isCorrectOption) stateClass = 'border-safety-green bg-green-50';
              else if (isSelected) stateClass = 'border-safety-red bg-red-50';
            } else if (isSelected) {
              stateClass = 'border-brand-500 bg-brand-50';
            }
            return (
              <button
                key={i}
                disabled={checked}
                onClick={() => setSelected(i)}
                className={`w-full text-left rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between gap-2 ${stateClass}`}
              >
                <span>{opt}</span>
                {checked && isCorrectOption && <CheckCircle2 size={18} className="text-safety-green shrink-0" />}
                {checked && isSelected && !isCorrectOption && <XCircle size={18} className="text-safety-red shrink-0" />}
              </button>
            );
          })}
        </div>

        {checked && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-6 text-sm text-slate-700">
            <p className="font-semibold mb-1">Explanation</p>
            <p>{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!checked ? (
            <Button onClick={checkAnswer} disabled={selected === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion}>{step + 1 < total ? 'Next Question' : 'See Results'}</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
