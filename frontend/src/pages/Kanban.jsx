import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, KanbanSquare, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import ProjectSelect from '../components/ProjectSelect';
import Avatar from '../components/Avatar';
import { PriorityBadge } from '../components/Badges';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import useProjectSelection from '../hooks/useProjectSelection';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi, storiesApi, tasksApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { PRIORITY_BORDER, STATUS_COLORS, TASK_STATUSES, formatDate, label } from '../utils/format';

const COLUMN_TINT = { TO_DO: 'bg-slate-100/80', IN_PROGRESS: 'bg-sky-50/80', TESTING: 'bg-amber-50/80', DONE: 'bg-emerald-50/80' };

export default function Kanban() {
  const { user } = useAuth();
  const toast = useToast();
  const projects = useFetch(() => projectsApi.list(), []);
  const [projectId, setProjectId] = useProjectSelection(projects.data);
  const tasks = useFetch(() => tasksApi.byProject(projectId), [projectId], { enabled: !!projectId, initial: [] });
  const stories = useFetch(() => storiesApi.list(projectId), [projectId], { enabled: !!projectId, initial: [] });
  const [dragId, setDragId] = useState(null); const [over, setOver] = useState(null);
  const [mine, setMine] = useState(false); const [editing, setEditing] = useState(null); const [busy, setBusy] = useState(false);

  const visible = useMemo(() => (tasks.data || []).filter((t) => !mine || t.assigneeId === user.id), [tasks.data, mine, user.id]);

  const move = async (taskId, status) => {
    const task = tasks.data.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    const previous = tasks.data;
    tasks.setData(previous.map((t) => (t.id === taskId ? { ...t, status } : t))); // optimistic
    try { await tasksApi.setStatus(taskId, status); toast.success(`Moved to ${label(status)}`); tasks.reload(true); }
    catch (e) { tasks.setData(previous); toast.error(errorMessage(e)); }
  };

  const save = async (storyId, payload) => {
    setBusy(true);
    try {
      if (editing === 'new') await tasksApi.create(storyId, payload); else await tasksApi.update(editing.id, payload);
      toast.success('Task saved'); setEditing(null); tasks.reload(true);
    } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  };

  if (projects.loading) return <Spinner />;
  if (projects.error) return <ErrorState message={projects.error} onRetry={projects.reload} />;
  if (!projects.data.length) return (<><PageHeader title="Kanban Board" /><EmptyState icon={KanbanSquare} title="No projects" text="Create a project to use the board." action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /></>);

  return (
    <>
      <PageHeader title="Kanban Board" subtitle="Drag cards between columns to update their status"
        actions={<><ProjectSelect projects={projects.data} value={projectId} onChange={setProjectId} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> My tasks</label>
          <button className="btn-primary" disabled={!stories.data?.length} title={!stories.data?.length ? 'Create a user story first' : ''} onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New task</button></>} />
      {tasks.loading ? <Spinner /> : tasks.error ? <ErrorState message={tasks.error} onRetry={tasks.reload} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const col = visible.filter((t) => t.status === status);
            return (
              <div key={status} onDragOver={(e) => { e.preventDefault(); setOver(status); }} onDragLeave={() => setOver((o) => (o === status ? null : o))}
                onDrop={(e) => { e.preventDefault(); setOver(null); move(Number(e.dataTransfer.getData('text/plain')) || dragId, status); setDragId(null); }}
                className={`flex min-h-[420px] flex-col rounded-2xl border p-3 transition ${COLUMN_TINT[status]} ${over === status ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-white/60'}`}>
                <div className="mb-3 flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 shadow-sm" style={{ borderTop: `3px solid ${STATUS_COLORS[status]}` }}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />{label(status)}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: STATUS_COLORS[status] }}>{col.length}</span>
                </div>
                <div className="flex-1 space-y-3">
                  {col.map((t) => (
                    <div key={t.id} draggable onDragStart={(e) => { setDragId(t.id); e.dataTransfer.setData('text/plain', String(t.id)); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => { setDragId(null); setOver(null); }} onClick={() => setEditing(t)}
                      style={{ borderLeft: `4px solid ${PRIORITY_BORDER[t.priority]}` }}
                      className={`cursor-grab rounded-xl border border-slate-200/70 bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:cursor-grabbing ${dragId === t.id ? 'opacity-40' : ''}`}>
                      <p className="text-sm font-medium text-slate-900">{t.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{t.storyTitle}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <PriorityBadge value={t.priority} />
                        <div className="flex items-center gap-2">
                          {t.dueDate && <span className={`flex items-center gap-1 text-xs ${t.overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}><Calendar className="h-3 w-3" />{formatDate(t.dueDate)}</span>}
                          {t.assigneeName && <Avatar name={t.assigneeName} size="h-6 w-6 text-[10px]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!col.length && <p className="py-8 text-center text-xs text-slate-400">Drop tasks here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New task' : 'Edit task'} wide>
        {editing && <TaskForm initial={editing === 'new' ? null : editing} projectId={projectId} saving={busy} onCancel={() => setEditing(null)} onSubmit={save} />}
      </Modal>
    </>
  );
}
