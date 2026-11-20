import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, FolderKanban, KanbanSquare, LayoutDashboard, ListChecks, LogOut, Menu, UserCircle, Users, BookOpenCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/endpoints';
import Avatar from '../components/Avatar';
import Aurora from '../components/Aurora';

const NAV = [
  { group: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
  ] },
  { group: 'Work', items: [
    { to: '/stories', label: 'User Stories', icon: BookOpenCheck },
    { to: '/tasks', label: 'Tasks', icon: ListChecks },
    { to: '/kanban', label: 'Kanban Board', icon: KanbanSquare },
  ] },
  { group: 'People', items: [
    { to: '/team', label: 'Team', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ] },
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
    <aside className="flex h-full w-72 flex-col border-r border-white/70 bg-white/75 text-slate-600 shadow-soft backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-400 text-lg font-extrabold text-white shadow-glow">A</div>
        <div><span className="block text-lg font-bold leading-tight tracking-tight text-slate-900">AgileFlow</span><span className="text-[11px] uppercase tracking-widest text-slate-400">Team workspace</span></div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{group}</p>
            <div className="space-y-1">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                  className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-sky-100 to-violet-100 text-sky-800 shadow-sm' : 'hover:bg-slate-100/80 hover:text-slate-900'}`}>
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -left-4 top-2 h-6 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-violet-400" />}
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                      <span className="flex-1">{label}</span>
                      {label === 'Notifications' && unread > 0 && <span className="rounded-full bg-rose-400 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-4 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 p-3 ring-1 ring-sky-100">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="h-10 w-10 text-sm" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
          <button title="Log out" onClick={() => { logout(); navigate('/login'); }} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="relative flex h-screen overflow-hidden">
      <Aurora />
      <div className="relative z-10 hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50">{sidebar}</div>
        </div>
      )}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <span className="font-bold text-slate-900">AgileFlow</span>
          <button onClick={() => navigate('/notifications')} className="relative rounded-lg p-2 hover:bg-slate-100"><Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1 text-[10px] text-white">{unread}</span>}</button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10"><div className="mx-auto max-w-7xl"><Outlet /></div></main>
      </div>
    </div>
  );
}
