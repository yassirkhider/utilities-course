import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookText,
  CalendarDays,
  Clock,
  BookOpen,
  FileText,
  Map as MapIcon,
  Puzzle,
  HelpCircle,
  Video,
  FolderOpen,
  Settings,
  DatabaseBackup,
  ExternalLink,
  LogOut,
  Factory,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/course', label: 'Course Details', icon: BookText },
  { to: '/admin/days', label: 'Days', icon: CalendarDays },
  { to: '/admin/schedule', label: 'Schedule', icon: Clock },
  { to: '/admin/topics', label: 'Topics', icon: BookOpen },
  { to: '/admin/resources/handout', label: 'Handouts', icon: FileText },
  { to: '/admin/resources/pid', label: 'P&IDs', icon: MapIcon },
  { to: '/admin/activities', label: 'Activities', icon: Puzzle },
  { to: '/admin/quizzes', label: 'Quizzes', icon: HelpCircle },
  { to: '/admin/resources/video', label: 'Videos', icon: Video },
  { to: '/admin/resources', label: 'Resources', icon: FolderOpen, end: true },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/backup', label: 'Backup', icon: DatabaseBackup },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 shrink-0 bg-navy-950 text-slate-200 flex flex-col no-print">
        <div className="flex items-center gap-2 px-4 h-16 border-b border-white/10">
          <Factory size={22} className="text-teal-accent-400" />
          <span className="font-bold text-white text-sm">Admin Dashboard</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="w-full !text-slate-200 !border-white/20 hover:!bg-white/10">
              <ExternalLink size={14} /> Preview Website
            </Button>
          </a>
          <Button variant="ghost" size="sm" className="w-full !text-slate-300 hover:!bg-white/10" onClick={() => logout()}>
            <LogOut size={14} /> Log Out
          </Button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
