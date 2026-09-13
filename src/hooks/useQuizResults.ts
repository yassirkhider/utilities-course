import { useCallback, useEffect, useState } from 'react';
import type { QuizAttemptResult } from '../types';

const STORAGE_KEY = 'ata-putils-quiz-results-v1';

function readAll(): QuizAttemptResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(results: QuizAttemptResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    /* ignore */
  }
}

export function useQuizResults(quizId?: string) {
  const [results, setResults] = useState<QuizAttemptResult[]>(() => readAll());

  useEffect(() => {
    writeAll(results);
  }, [results]);

  const saveResult = useCallback((result: QuizAttemptResult) => {
    setResults((prev) => [...prev.filter((r) => r.quizId !== result.quizId), result]);
  }, []);

  const latestForQuiz = quizId ? results.find((r) => r.quizId === quizId) : undefined;

  return { results, latestForQuiz, saveResult };
}
