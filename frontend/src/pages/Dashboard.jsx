import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, FolderKanban, ListChecks, BookOpenCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { dashboardApi } from '../services/endpoints';
import { STATUS_COLORS, label, timeAgo } from '../utils/format';

const ACTION_TEXT = { CREATED: 'created', UPDATED: 'updated', DELETED: 'deleted', MOVED: 'moved', ADDED_MEMBER: 'added', REMOVED_MEMBER: 'removed' };

function Stat({ icon: Icon, label: text, value, tone }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{text}</p></div>
    </div>
  );
}

export default function Dashboard() {
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
      <PageHeader title="Dashboard" subtitle="An overview of your projects and tasks" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={FolderKanban} label="Total projects" value={s.totalProjects} tone="bg-indigo-50 text-indigo-600" />
        <Stat icon={BookOpenCheck} label="User stories" value={s.totalStories} tone="bg-violet-50 text-violet-600" />
        <Stat icon={ListChecks} label="Total tasks" value={s.totalTasks} tone="bg-sky-50 text-sky-600" />
        <Stat icon={CheckCircle2} label="Completed" value={s.completedTasks} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={Clock} label="Pending" value={s.pendingTasks} tone="bg-amber-50 text-amber-600" />
        <Stat icon={AlertTriangle} label="Overdue" value={s.overdueTasks} tone="bg-red-50 text-red-600" />
      </div>

      <div className="card mt-6 p-5">
        <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Overall progress</h2></div>
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
                <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
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
