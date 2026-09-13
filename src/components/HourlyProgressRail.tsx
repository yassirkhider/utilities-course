import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { ScheduleRow } from '../types';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function useNowMinutes(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now.getHours() * 60 + now.getMinutes();
}

const TYPE_STYLE: Record<ScheduleRow['type'], string> = {
  session: 'bg-brand-500',
  break: 'bg-slate-300',
  lunch: 'bg-amber-300',
  activity: 'bg-orange-400',
  assessment: 'bg-teal-accent-400',
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-sm ${color}`} /> {label}
    </span>
  );
}

/**
 * A sticky, hour-marked vertical progress rail for a training day's schedule.
 * Shows each schedule block sized proportionally to its duration, color-coded
 * by session type, with hour gridlines and a live "now" marker.
 */
export default function HourlyProgressRail({ schedule }: { schedule: ScheduleRow[] }) {
  const nowMin = useNowMinutes();

  if (!schedule || schedule.length === 0) return null;

  const start = Math.min(...schedule.map((r) => toMinutes(r.startTime)));
  const end = Math.max(...schedule.map((r) => toMinutes(r.endTime)));
  const span = Math.max(end - start, 1);

  const firstHour = Math.floor(start / 60);
  const lastHour = Math.ceil(end / 60);
  const hourTicks: number[] = [];
  for (let h = firstHour; h <= lastHour; h++) hourTicks.push(h * 60);

  const withinDay = nowMin >= start && nowMin <= end;
  const nowPct = ((Math.min(Math.max(nowMin, start), end) - start) / span) * 100;
  const elapsedPct = withinDay ? nowPct : nowMin > end ? 100 : 0;

  return (
    <aside className="hidden lg:block" aria-label="Hourly schedule progress">
      <div className="sticky top-32 rounded-xl border border-slate-200 bg-white shadow-sm p-4 w-[220px]">
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={14} className="text-brand-600" />
          <p className="text-xs font-bold uppercase tracking-wide text-navy-800">Hourly Progress</p>
        </div>

        <div className="relative flex gap-2" style={{ height: 480 }}>
          {/* Hour gridline labels */}
          <div className="relative w-10 shrink-0 text-[10px] text-slate-400 font-mono">
            {hourTicks.map((t) => (
              <span key={t} className="absolute -translate-y-1/2" style={{ top: `${((t - start) / span) * 100}%` }}>
                {String(Math.floor(t / 60)).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {/* Track */}
          <div className="relative flex-1 rounded-md bg-slate-100 overflow-hidden">
            {hourTicks.map((t) => (
              <div key={t} className="absolute left-0 right-0 border-t border-slate-200" style={{ top: `${((t - start) / span) * 100}%` }} />
            ))}

            {schedule.map((row) => {
              const top = ((toMinutes(row.startTime) - start) / span) * 100;
              const height = ((toMinutes(row.endTime) - toMinutes(row.startTime)) / span) * 100;
              const isActive = withinDay && nowMin >= toMinutes(row.startTime) && nowMin < toMinutes(row.endTime);
              const barClass = TYPE_STYLE[row.type] ?? TYPE_STYLE.session;
              return (
                <div
                  key={row.id}
                  className={`absolute left-0.5 right-0.5 rounded ${barClass} ${isActive ? 'ring-2 ring-navy-900 ring-offset-1' : 'opacity-70'}`}
                  style={{ top: `${top}%`, height: `${Math.max(height, 1.5)}%` }}
                  title={`${row.startTime}–${row.endTime} · ${row.title}`}
                />
              );
            })}

            <div className="absolute left-0 right-0 top-0 bg-navy-900/10 pointer-events-none" style={{ height: `${elapsedPct}%` }} />

            {withinDay && (
              <div className="absolute left-0 right-0 flex items-center gap-1" style={{ top: `${nowPct}%` }}>
                <div className="h-0.5 flex-1 bg-safety-red" />
                <span className="h-2 w-2 rounded-full bg-safety-red animate-pulse shrink-0" />
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500 leading-snug">
          {withinDay
            ? `${Math.round(elapsedPct)}% of today's session time elapsed.`
            : nowMin > end
            ? "Today's sessions have ended."
            : "Today's sessions haven't started yet."}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
          <LegendDot color="bg-brand-500" label="Session" />
          <LegendDot color="bg-orange-400" label="Activity" />
          <LegendDot color="bg-amber-300" label="Lunch" />
          <LegendDot color="bg-slate-300" label="Break" />
        </div>
      </div>
    </aside>
  );
}
