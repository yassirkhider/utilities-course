import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SmartboardContextValue {
  active: boolean;
  enter: () => void;
  exit: () => void;
  toggle: () => void;
}

const SmartboardContext = createContext<SmartboardContextValue | undefined>(undefined);

export function SmartboardProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  const enter = useCallback(() => setActive(true), []);
  const exit = useCallback(() => setActive(false), []);
  const toggle = useCallback(() => setActive((a) => !a), []);

  const value = useMemo(() => ({ active, enter, exit, toggle }), [active, enter, exit, toggle]);

  return (
    <SmartboardContext.Provider value={value}>
      <div className={active ? 'smartboard-mode' : ''}>{children}</div>
    </SmartboardContext.Provider>
  );
}

export function useSmartboard(): SmartboardContextValue {
  const ctx = useContext(SmartboardContext);
  if (!ctx) throw new Error('useSmartboard must be used within SmartboardProvider');
  return ctx;
}
