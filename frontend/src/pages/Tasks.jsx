import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskForm from '../components/TaskForm';
import Avatar from '../components/Avatar';
import { PriorityBadge } from '../components/Badges';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi, tasksApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { PRIORITIES, TASK_STATUSES, formatDate, label } from '../utils/format';

export default function Tasks() {
  const { user } = useAuth();
  const toast = useToast();
  const projects = useFetch(() => projectsApi.list(), [], { initial: [] });
  const tasks = useFetch(() => tasksApi.all(), []);
  const [f, setF] = useState({ q: '', status: '', priority: '', project: '', mine: false, overdue: false });
  const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null); const [busy, setBusy] = useState(false);

  const list = useMemo(() => (tasks.data || []).filter((t) =>
    `${t.title} ${t.description || ''} ${t.storyTitle}`.toLowerCase().includes(f.q.toLowerCase())
    && (!f.status || t.status === f.status) && (!f.priority || t.priority === f.priority)
    && (!f.project || t.projectId === Number(f.project)) && (!f.mine || t.assigneeId === user.id) && (!f.overdue || t.overdue)), [tasks.data, f, user.id]);

  const act = async (fn, ok, done) => {
    setBusy(true);
    try { await fn(); toast.success(ok); done(); tasks.reload(true); } catch (e) { toast.error(errorMessage(e)); done(); } finally { setBusy(false); }
  };
  const changeStatus = (t, status) => act(() => tasksApi.setStatus(t.id, status), 'Status updated', () => {});

  if (tasks.loading) return <Spinner />;
  if (tasks.error) return <ErrorState message={tasks.error} onRetry={tasks.reload} />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Tasks" subtitle="All tasks across your projects"
        actions={<button className="btn-primary" disabled={!projects.data.length} onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New task</button>} />
      {!projects.data.length ? <EmptyState title="No projects" text="Create a project and a user story before adding tasks." action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /> : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Search tasks…" value={f.q} onChange={set('q')} /></div>
            <select className="input w-auto" value={f.project} onChange={set('project')}><option value="">All projects</option>{projects.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <select className="input w-auto" value={f.status} onChange={set('status')}><option value="">All statuses</option>{TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
            <select className="input w-auto" value={f.priority} onChange={set('priority')}><option value="">All priorities</option>{PRIORITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.mine} onChange={(e) => setF({ ...f, mine: e.target.checked })} /> Assigned to me</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.overdue} onChange={(e) => setF({ ...f, overdue: e.target.checked })} /> Overdue</label>
          </div>
          {!tasks.data.length ? <EmptyState icon={ListChecks} title="No tasks yet" text="Tasks belong to user stories. Add one to get started." action={<button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New task</button>} /> : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100 bg-slate-50"><tr><th className="th">Task</th><th className="th">Project / Story</th><th className="th">Assignee</th><th className="th">Priority</th><th className="th">Status</th><th className="th">Due</th><th className="th text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="td font-medium text-slate-900">{t.title}</td>
                      <td className="td text-xs text-slate-500"><p className="font-medium text-slate-700">{t.projectName}</p>{t.storyTitle}</td>
                      <td className="td">{t.assigneeName ? <span className="flex items-center gap-2"><Avatar name={t.assigneeName} size="h-6 w-6 text-[10px]" />{t.assigneeName}</span> : <span className="text-slate-400">Unassigned</span>}</td>
                      <td className="td"><PriorityBadge value={t.priority} /></td>
                      <td className="td"><select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs" value={t.status} onChange={(e) => changeStatus(t, e.target.value)}>{TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></td>
                      <td className={`td whitespace-nowrap ${t.overdue ? 'font-medium text-red-600' : ''}`}>{formatDate(t.dueDate)}{t.overdue && ' ⚠'}</td>
                      <td className="td text-right"><button className="btn-ghost !p-1.5" onClick={() => setEditing(t)}><Pencil className="h-4 w-4" /></button>
                        <button className="btn-ghost !p-1.5 hover:!text-red-600" onClick={() => setDeleting(t)}><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                  {!list.length && <tr><td colSpan={7} className="td py-8 text-center text-slate-500">No tasks match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New task' : 'Edit task'} wide>
        {editing && <TaskForm initial={editing === 'new' ? null : editing} projects={projects.data} saving={busy} onCancel={() => setEditing(null)}
          onSubmit={(storyId, payload) => act(() => (editing === 'new' ? tasksApi.create(storyId, payload) : tasksApi.update(editing.id, payload)), 'Task saved', () => setEditing(null))} />}
      </Modal>
      <ConfirmDialog open={!!deleting} busy={busy} onCancel={() => setDeleting(null)} message={deleting && `Delete task “${deleting.title}”?`}
        onConfirm={() => act(() => tasksApi.remove(deleting.id), 'Task deleted', () => setDeleting(null))} />
    </>
  );
}
