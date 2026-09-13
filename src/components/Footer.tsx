import { useCourseData } from '../context/CourseDataContext';

export default function Footer() {
  const { data } = useCourseData();
  return (
    <footer className="bg-navy-950 text-slate-300 no-print">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="font-semibold text-white">{data?.course.title}</p>
          <p>{data?.course.dates} · {data?.course.location}</p>
        </div>
        <p className="mt-4 text-xs text-slate-500 max-w-3xl">{data?.course.footerText}</p>
      </div>
    </footer>
  );
}
