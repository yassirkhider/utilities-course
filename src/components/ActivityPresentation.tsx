import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';
import type { Activity } from '../types';
import { Button } from './ui';
import RichContent from './RichContent';
import { formatDuration } from '../utils/format';

export default function ActivityPresentation({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(activity.duration * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[95] bg-navy-950 text-white overflow-y-auto smartboard-mode">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <p className="text-teal-accent-400 text-sm font-semibold uppercase tracking-wide">{activity.activityType}</p>
          <h1 className="text-2xl md:text-3xl font-bold">{activity.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-mono text-2xl">
            <Timer size={22} className="text-teal-accent-400" />
            {mm}:{ss}
          </div>
          <Button variant="ghost" size="sm" className="!text-white" onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause timer' : 'Start timer'}>
            {running ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!text-white"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(activity.duration * 60);
            }}
            aria-label="Reset timer"
          >
            <RotateCcw size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="!text-white" onClick={onClose} aria-label="Close presentation mode">
            <X size={22} />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Duration</p>
            <p className="font-bold text-lg">{formatDuration(activity.duration)}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Group Size</p>
            <p className="font-bold text-lg">{activity.groupSize}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Resources Needed</p>
            <p className="font-bold text-lg">{activity.requiredResources || '—'}</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-teal-accent-400 mb-2">Objective</h2>
          <p className="text-lg text-slate-100">{activity.objective}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-teal-accent-400 mb-2">Instructions</h2>
          <RichContent html={activity.instructions} className="text-slate-100 text-lg [&_*]:text-slate-100" />
        </section>
      </div>
    </div>
  );
}
