import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, FolderKanban, KanbanSquare, LayoutDashboard, ListChecks, LogOut, Menu, UserCircle, Users, BookOpenCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/endpoints';
import Avatar from '../components/Avatar';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/stories', label: 'User Stories', icon: BookOpenCheck },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/kanban', label: 'Kanban Board', icon: KanbanSquare },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () => notificationsApi.unread().then((r) => setUnread(r.data.count)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    window.addEventListener('agileflow:notifications-changed', load);
    return () => { clearInterval(t); window.removeEventListener('agileflow:notifications-changed', load); };
  }, []);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 font-bold text-white">A</div>
        <span className="text-lg font-semibold tracking-tight text-white">AgileFlow</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-600/25 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Icon className="h-4 w-4" /> <span className="flex-1">{label}</span>
            {label === 'Notifications' && unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{user.name}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
          <button title="Log out" onClick={() => { logout(); navigate('/login'); }} className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="relative z-50">{sidebar}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(!open)} className="rounded p-1.5 hover:bg-slate-100" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <span className="font-semibold text-slate-900">AgileFlow</span>
          <button onClick={() => navigate('/notifications')} className="relative rounded p-1.5 hover:bg-slate-100"><Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1 text-[10px] text-white">{unread}</span>}</button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl"><Outlet /></div></main>
      </div>
    </div>
  );
}
