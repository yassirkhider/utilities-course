import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ata-putils-progress-v1';

interface ProgressState {
  visitedDays: string[];
  currentDayId: string | null;
}

function readStorage(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visitedDays: [], currentDayId: null };
    return JSON.parse(raw);
  } catch {
    return { visitedDays: [], currentDayId: null };
  }
}

function writeStorage(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable — progress simply won't persist */
  }
}

export function useProgress(totalDays: number) {
  const [state, setState] = useState<ProgressState>(() => readStorage());

  useEffect(() => {
    writeStorage(state);
  }, [state]);

  const markDayVisited = useCallback((dayId: string) => {
    setState((prev) => ({
      visitedDays: prev.visitedDays.includes(dayId) ? prev.visitedDays : [...prev.visitedDays, dayId],
      currentDayId: dayId,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ visitedDays: [], currentDayId: null });
  }, []);

  const percentage = totalDays > 0 ? Math.round((state.visitedDays.length / totalDays) * 100) : 0;

  return { visitedDays: state.visitedDays, currentDayId: state.currentDayId, percentage, markDayVisited, resetProgress };
}
