import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CourseData } from '../types';
import { getCourseData } from '../services/api';

interface CourseDataContextValue {
  data: CourseData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CourseDataContext = createContext<CourseDataContextValue | undefined>(undefined);

export function CourseDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCourseData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);

  return <CourseDataContext.Provider value={value}>{children}</CourseDataContext.Provider>;
}

export function useCourseData(): CourseDataContextValue {
  const ctx = useContext(CourseDataContext);
  if (!ctx) throw new Error('useCourseData must be used within CourseDataProvider');
  return ctx;
}
