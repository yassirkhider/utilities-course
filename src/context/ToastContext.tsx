import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastKind, string> = {
  success: 'bg-white border-l-4 border-safety-green text-slate-800',
  error: 'bg-white border-l-4 border-safety-red text-slate-800',
  info: 'bg-white border-l-4 border-brand-500 text-slate-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div key={t.id} role="status" className={`flex items-start gap-2 rounded-md shadow-lg px-4 py-3 min-w-[260px] max-w-sm ${STYLES[t.kind]}`}>
              <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-sm flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
