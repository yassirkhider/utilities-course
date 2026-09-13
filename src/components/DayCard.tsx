import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type { DayPlan, Topic } from '../types';

export default function DayCard({ day, topics }: { day: DayPlan; topics: Topic[] }) {
  const dayTopics = topics.filter((t) => day.topicIds.includes(t.id)).sort((a, b) => a.order - b.order);
  return (
    <Link
      to={`/day/${day.dayNumber}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-brand-300"
    >
      <div className="flex items-center gap-2 text-teal-accent-600 mb-2">
        <CalendarDays size={16} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wide">Day {day.dayNumber}</span>
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-1">{day.focus}</h3>
      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{day.description}</p>
      <ul className="text-sm text-slate-600 space-y-1 mb-4 flex-1">
        {dayTopics.slice(0, 4).map((t) => (
          <li key={t.id} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" aria-hidden="true" />
            {t.title}
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
        View Day {day.dayNumber} <ArrowRight size={15} aria-hidden="true" />
      </span>
    </Link>
  );
}
