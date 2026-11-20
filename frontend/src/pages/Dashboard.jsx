import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Clock, FolderKanban, ListChecks, BookOpenCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { dashboardApi } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS, label, timeAgo } from '../utils/format';

const ACTION_TEXT = { CREATED: 'created', UPDATED: 'updated', DELETED: 'deleted', MOVED: 'moved', ADDED_MEMBER: 'added', REMOVED_MEMBER: 'removed', UPDATED_MEMBER: 'updated', TRANSFERRED_LEADERSHIP: 'made leader', LEFT_PROJECT: 'left the project' };

function Stat({ icon: Icon, label: text, value, grad, icon }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br ${grad} p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift`}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/50" />
      <div className="relative flex items-center justify-between">
        <div><p className="text-4xl font-extrabold tracking-tight text-slate-800">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{text}</p></div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm ${icon}`}><Icon className="h-6 w-6" /></span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const summary = useFetch(() => dashboardApi.summary(), []);
  const activity = useFetch(() => dashboardApi.activity(), []);
  if (summary.loading) return <Spinner />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.reload} />;
  const s = summary.data;
  if (s.totalProjects === 0)
    return (<><PageHeader title="Dashboard" /><EmptyState icon={FolderKanban} title="No projects yet" text="Create your first project to see progress and activity here."
      action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /></>);

  const pie = Object.entries(s.tasksByStatus).map(([k, v]) => ({ key: k, name: label(k), value: v }));
  return (
    <>
      <div className="relative mb-8 animate-fade-up overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-sky-100 via-violet-100 to-emerald-100 p-7 shadow-soft sm:p-9">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-sky-300 to-violet-300 opacity-60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-56 w-56 rounded-full bg-emerald-200/70 blur-3xl" />
        <svg className="pointer-events-none absolute bottom-0 right-0 h-40 w-72 opacity-40" viewBox="0 0 300 160" fill="none"><path d="M0 140 C60 60 120 150 180 80 S280 40 300 70" stroke="#7dd3fc" strokeWidth="3" /><path d="M0 155 C70 90 130 160 190 110 S280 80 300 100" stroke="#c4b5fd" strokeWidth="3" strokeDasharray="6 8" /></svg>
        <div className="relative max-w-xl">
          <span className="chip bg-white/80 text-sky-700 shadow-sm"><Sparkles className="h-3.5 w-3.5" /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">Welcome back, <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span> 👋</h1>
          <p className="mt-2 text-sm text-slate-600">You have <b className="text-slate-800">{s.pendingTasks}</b> pending tasks{s.overdueTasks > 0 && <> and <b className="text-rose-500">{s.overdueTasks} overdue</b></>} across {s.totalProjects} projects.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/projects" className="btn-primary"><Plus className="h-4 w-4" /> New project</Link>
            <Link to="/kanban" className="btn-secondary">Open board <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={FolderKanban} label="Total projects" value={s.totalProjects} grad="from-sky-100 to-sky-50" icon="text-sky-600" />
        <Stat icon={BookOpenCheck} label="User stories" value={s.totalStories} grad="from-violet-100 to-violet-50" icon="text-violet-600" />
        <Stat icon={ListChecks} label="Total tasks" value={s.totalTasks} grad="from-cyan-100 to-cyan-50" icon="text-cyan-600" />
        <Stat icon={CheckCircle2} label="Completed" value={s.completedTasks} grad="from-emerald-100 to-emerald-50" icon="text-emerald-600" />
        <Stat icon={Clock} label="Pending" value={s.pendingTasks} grad="from-amber-100 to-amber-50" icon="text-amber-600" />
        <Stat icon={AlertTriangle} label="Overdue" value={s.overdueTasks} grad="from-rose-100 to-rose-50" icon="text-rose-500" />
      </div>

      <div className="card mt-6 border-l-4 border-l-sky-400 p-5">
        <div className="mb-2 flex items-center justify-between"><h2 className="font-bold text-slate-900">Overall progress</h2><span className="chip bg-sky-100 text-sky-700">{s.completedTasks} of {s.totalTasks} tasks done</span></div>
        <ProgressBar value={s.progress} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Tasks by status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pie.map((p) => <Cell key={p.key} fill={STATUS_COLORS[p.key]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Project progress (%)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={s.projectProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="progress" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Recent activity</h2>
        {activity.loading ? <Spinner /> : !activity.data?.length ? <p className="text-sm text-slate-500">No activity yet.</p> : (
          <ul className="divide-y divide-slate-100">
            {activity.data.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <p className="text-slate-700"><span className="font-medium text-slate-900">{a.userName}</span> {ACTION_TEXT[a.action] || a.action.toLowerCase()} {a.entityType.toLowerCase()}{' '}
                  <span className="font-medium">{a.details}</span> <Link to={`/projects/${a.projectId}`} className="text-brand-600 hover:underline">in {a.projectName}</Link></p>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
