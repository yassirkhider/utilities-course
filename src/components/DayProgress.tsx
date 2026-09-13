import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { DayPlan } from '../types';

export default function DayProgress({
  days,
  visitedDays,
  currentDayId,
  percentage,
}: {
  days: DayPlan[];
  visitedDays: string[];
  currentDayId: string | null;
  percentage: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy-900">Course Progress</h3>
        <span className="text-sm font-bold text-brand-700">Course Progress: {percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 mb-5 overflow-hidden">
        <div className="h-full rounded-full bg-teal-accent-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <ol className="flex items-center justify-between gap-1">
        {days.map((day, i) => {
          const visited = visitedDays.includes(day.id);
          const isCurrent = currentDayId === day.id;
          return (
            <li key={day.id} className="flex flex-1 items-center">
              <Link
                to={`/day/${day.dayNumber}`}
                className="flex flex-col items-center gap-1.5 group flex-1"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    isCurrent
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : visited
                        ? 'border-safety-green bg-safety-green text-white'
                        : 'border-slate-300 bg-white text-slate-500 group-hover:border-brand-400'
                  }`}
                >
                  {visited && !isCurrent ? <Check size={16} /> : day.dayNumber}
                </span>
                <span className={`text-xs font-medium text-center ${isCurrent ? 'text-brand-700' : 'text-slate-500'}`}>Day {day.dayNumber}</span>
              </Link>
              {i < days.length - 1 && <span className="h-0.5 flex-1 bg-slate-200 -mx-1 mb-5" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
