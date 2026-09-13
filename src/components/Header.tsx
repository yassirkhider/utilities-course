import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShieldCheck, Factory, Clock, Target, ChevronDown } from 'lucide-react';
import { useCourseData } from '../context/CourseDataContext';
import { useProgress } from '../hooks/useProgress';
import RichContent from './RichContent';
import type { DayPlan } from '../types';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/course-plan', label: 'Course' },
  { to: '/day/1', label: 'Daily Plan' },
  { to: '/resources/handouts', label: 'Resources' },
  { to: '/activities', label: 'Activities' },
  { to: '/quiz', label: 'Quiz' },
];

/** Left-side logo lockup. Drop a real logo file at `public/logo.png` (or `public/logo.svg`,
 *  update the `src` below) and it replaces this generic mark automatically on next deploy —
 *  no code changes required. Until then, a clean generic academy mark is shown. */
function AcademyLogo() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-white/15 lg:h-14 lg:w-14"
      aria-hidden="true"
    >
      {imgOk ? (
        <img
          src="/logo.png"
          alt=""
          className="h-full w-full object-contain p-1"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-navy-950">
          <Factory size={22} className="text-teal-accent-400" />
        </span>
      )}
    </span>
  );
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function HeaderClock() {
  const now = useNow(15_000);
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'long' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-200">
      <Clock size={14} className="text-teal-accent-400" aria-hidden="true" />
      <span className="font-medium">{dateStr}</span>
      <span className="font-bold text-white">{timeStr}</span>
    </div>
  );
}

function TodaysObjectives({ days, currentDayId }: { days: DayPlan[]; currentDayId: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const day = days.find((d) => d.id === currentDayId) ?? days[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!day) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
      >
        <Target size={13} className="text-teal-accent-400" aria-hidden="true" />
        Day {day.dayNumber} Objectives
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`Day ${day.dayNumber} objectives`}
          className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl"
        >
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-teal-accent-600">
            Day {day.dayNumber} · Today&apos;s Objectives
          </p>
          <p className="mb-2 text-sm font-bold text-navy-900">{day.focus}</p>
          <RichContent html={day.objectives} className="text-sm text-slate-700" />
          <Link
            to={`/day/${day.dayNumber}`}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            View full day plan →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data } = useCourseData();
  const { currentDayId } = useProgress(data?.days.length ?? 5);
  const mobileDate = useNow(60_000).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });

  const activeDay = data?.days.find((d) => d.id === currentDayId) ?? data?.days[0];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    if (q) navigate(`/search?q=${encodeURIComponent(String(q))}`);
    setMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-50 bg-navy-900 text-white shadow-md">
      <div className="mx-auto max-w-[1536px] px-4">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[68px]">
          <NavLink to="/" className="flex min-w-0 shrink-0 items-center gap-3" aria-label="Go to homepage">
            <AcademyLogo />
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-teal-accent-400">
                ADNOC Technical Academy
              </span>
              <span className="block truncate text-sm font-bold text-white md:max-w-[220px] lg:max-w-none">
                Process Utilities Training
              </span>
            </span>
          </NavLink>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
            {/* lg–xl (1024–1279px): not enough room for the clock or objectives — show the course title only */}
            <div className="min-w-0 text-center xl:hidden">
              <p className="truncate text-sm font-bold md:text-base">
                {data?.course.title ?? 'Process Utilities & Auxiliary Support Systems Operation'}
              </p>
            </div>
            {/* xl–2xl (1280–1535px): room for the clock, but not the clock + objectives pill together */}
            <div className="hidden items-center justify-center xl:flex 2xl:hidden">
              <HeaderClock />
            </div>
            {/* 2xl+ (1536px and up): full clock + today's objectives */}
            <div className="hidden items-center justify-center gap-4 2xl:flex">
              <HeaderClock />
              <span className="h-4 w-px bg-white/20" aria-hidden="true" />
              {data && data.days.length > 0 && <TodaysObjectives days={data.days} currentDayId={currentDayId} />}
            </div>
          </div>

          <nav className="hidden shrink-0 items-center gap-0.5 xl:gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition-colors xl:px-3 ${
                    isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <form onSubmit={handleSearchSubmit} className="relative ml-1 shrink-0">
              <label htmlFor="header-search" className="sr-only">
                Search course content
              </label>
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Search…"
                className="w-20 rounded-md border border-white/20 bg-white/10 py-1.5 pl-8 pr-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-accent-400 xl:w-36"
              />
            </form>
            <NavLink
              to="/admin"
              aria-label="Instructor / Admin"
              title="Instructor / Admin"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <ShieldCheck size={18} />
            </NavLink>
          </nav>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 pb-4 lg:hidden" aria-label="Mobile navigation">
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-teal-accent-400" aria-hidden="true" />
                {mobileDate}
              </span>
              {activeDay && (
                <Link
                  to={`/day/${activeDay.dayNumber}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1 font-semibold text-teal-accent-400"
                >
                  <Target size={13} aria-hidden="true" />
                  Day {activeDay.dayNumber} Objectives →
                </Link>
              )}
            </div>
            <form onSubmit={handleSearchSubmit} className="relative my-3">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                name="q"
                type="search"
                placeholder="Search course content…"
                className="w-full rounded-md border border-white/20 bg-white/10 py-2 pl-8 pr-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-accent-400"
              />
            </form>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                <ShieldCheck size={16} /> Instructor / Admin
              </NavLink>
            </div>
          </nav>
        )}
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-teal-accent-500 via-brand-500 to-teal-accent-500" aria-hidden="true" />
    </header>
  );
}
