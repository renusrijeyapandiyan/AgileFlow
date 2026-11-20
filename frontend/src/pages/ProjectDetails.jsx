import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, KanbanSquare, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import StoryForm from '../components/StoryForm';
import TaskForm from '../components/TaskForm';
import Avatar from '../components/Avatar';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi, storiesApi, tasksApi, teamApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { formatDate } from '../utils/format';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const project = useFetch(() => projectsApi.get(id), [id]);
  const stories = useFetch(() => storiesApi.list(id), [id], { initial: [] });
  const tasks = useFetch(() => tasksApi.byProject(id), [id], { initial: [] });
  const users = useFetch(() => teamApi.users(), [], { initial: [] });
  const [storyModal, setStoryModal] = useState(null); // 'new' | story
  const [taskModal, setTaskModal] = useState(null); // { story, task? }
  const [del, setDel] = useState(null); // { kind, item }
  const [addUser, setAddUser] = useState('');
  const [busy, setBusy] = useState(false);

  const byStory = useMemo(() => {
    const m = {};
    (tasks.data || []).forEach((t) => { (m[t.storyId] ||= []).push(t); });
    return m;
  }, [tasks.data]);

  const refresh = () => { project.reload(true); stories.reload(true); tasks.reload(true); };
  const run = async (fn, ok) => {
    setBusy(true);
    try { await fn(); toast.success(ok); refresh(); return true; }
    catch (e) { toast.error(errorMessage(e)); return false; } finally { setBusy(false); }
  };

  if (project.loading) return <Spinner />;
  if (project.error) return <ErrorState message={project.error} onRetry={project.reload} />;
  const p = project.data;
  const isOwner = p.ownerId === user.id;
  const memberIds = new Set(p.members.map((m) => m.userId));
  const candidates = (users.data || []).filter((u) => !memberIds.has(u.id));

  return (
    <>
      <Link to="/projects" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> All projects</Link>
      <PageHeader title={p.name} subtitle={p.description || 'No description'}
        actions={<><Link to={`/kanban?project=${p.id}`} className="btn-secondary"><KanbanSquare className="h-4 w-4" /> Kanban board</Link>
          <button className="btn-primary" onClick={() => setStoryModal('new')}><Plus className="h-4 w-4" /> Add story</button></>} />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4"><p className="label">Team Leader</p><p className="text-sm font-medium">{p.ownerName}</p></div>
        <div className="card p-4"><p className="label">Timeline</p><p className="flex items-center gap-1 text-sm font-medium"><Calendar className="h-4 w-4 text-slate-400" /> {formatDate(p.startDate)} → {formatDate(p.deadline)}</p></div>
        <div className="card p-4"><p className="label">Work items</p><p className="text-sm font-medium">{p.storyCount} stories · {p.taskCount} tasks ({p.doneTaskCount} done)</p></div>
        <div className="card p-4"><p className="label">Progress</p><ProgressBar value={p.progress} /></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">User stories</h2>
          {stories.loading ? <Spinner /> : !stories.data.length ? (
            <EmptyState title="No user stories" text="Break this project into user stories." action={<button className="btn-primary" onClick={() => setStoryModal('new')}><Plus className="h-4 w-4" /> Add story</button>} />
          ) : stories.data.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-semibold text-slate-900">{s.title}</p><div className="mt-1 flex gap-2"><PriorityBadge value={s.priority} /><StatusBadge value={s.status} /></div></div>
                <div className="flex gap-1">
                  <button className="btn-secondary !py-1" onClick={() => setTaskModal({ story: s })}><Plus className="h-3.5 w-3.5" /> Task</button>
                  <button className="btn-ghost !p-1.5" onClick={() => setStoryModal(s)}><Pencil className="h-4 w-4" /></button>
                  <button className="btn-ghost !p-1.5 hover:!text-red-600" onClick={() => setDel({ kind: 'story', item: s })}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3"><ProgressBar value={s.taskCount ? Math.round((s.doneTaskCount * 100) / s.taskCount) : 0} /></div>
              <ul className="mt-3 divide-y divide-slate-100">
                {(byStory[s.id] || []).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <button className="text-left hover:text-brand-600" onClick={() => setTaskModal({ story: s, task: t })}>{t.title}{t.overdue && <span className="ml-2 text-xs font-medium text-red-600">overdue</span>}</button>
                    <span className="flex items-center gap-2">{t.assigneeName && <Avatar name={t.assigneeName} size="h-6 w-6 text-[10px]" />}<StatusBadge value={t.status} />
                      <button className="text-slate-300 hover:text-red-600" onClick={() => setDel({ kind: 'task', item: t })}><Trash2 className="h-4 w-4" /></button></span>
                  </li>
                ))}
                {!(byStory[s.id] || []).length && <li className="py-2 text-sm text-slate-400">No tasks yet</li>}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Team</h2><Link to={`/team?project=${p.id}`} className="text-sm font-semibold text-brand-600 hover:underline">Manage team →</Link></div>
          <div className="card divide-y divide-slate-100">
            {p.members.map((m) => (
              <div key={m.userId} className="flex items-center gap-3 p-3">
                <Avatar name={m.name} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{m.name}</p><p className="text-xs text-slate-500">{m.role === 'OWNER' ? '👑 Team Leader' : (m.jobTitle || 'Team Member')} · {m.assignedTasks} tasks</p></div>
                {isOwner && m.role !== 'OWNER' && <button className="text-slate-300 hover:text-red-600" title="Remove" onClick={() => setDel({ kind: 'member', item: m })}><X className="h-4 w-4" /></button>}
              </div>
            ))}
            {isOwner && (
              <div className="flex gap-2 p-3">
                <select className="input" value={addUser} onChange={(e) => setAddUser(e.target.value)}>
                  <option value="">Add member…</option>{candidates.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button className="btn-primary" disabled={!addUser || busy} onClick={async () => { if (await run(() => teamApi.add(p.id, Number(addUser)), 'Member added')) setAddUser(''); }}><UserPlus className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={!!storyModal} onClose={() => setStoryModal(null)} title={storyModal === 'new' ? 'New user story' : 'Edit user story'} wide>
        {storyModal && <StoryForm initial={storyModal === 'new' ? null : storyModal} saving={busy} onCancel={() => setStoryModal(null)}
          onSubmit={async (f) => { if (await run(() => (storyModal === 'new' ? storiesApi.create(p.id, f) : storiesApi.update(storyModal.id, f)), 'Story saved')) setStoryModal(null); }} />}
      </Modal>
      <Modal open={!!taskModal} onClose={() => setTaskModal(null)} title={taskModal?.task ? 'Edit task' : `New task · ${taskModal?.story.title}`} wide>
        {taskModal && <TaskForm initial={taskModal.task} projectId={p.id} storyId={taskModal.story.id} saving={busy} onCancel={() => setTaskModal(null)}
          onSubmit={async (storyId, payload) => { if (await run(() => (taskModal.task ? tasksApi.update(taskModal.task.id, payload) : tasksApi.create(storyId, payload)), 'Task saved')) setTaskModal(null); }} />}
      </Modal>
      <ConfirmDialog open={!!del} busy={busy} onCancel={() => setDel(null)}
        confirmLabel={del?.kind === 'member' ? 'Remove' : 'Delete'}
        message={del && `${del.kind === 'member' ? 'Remove' : 'Delete'} ${del.kind} “${del.item.title || del.item.name}”?${del.kind === 'story' ? ' A story with tasks cannot be deleted.' : ''}${del.kind === 'member' && del.item.assignedTasks > 0 ? ` Their ${del.item.assignedTasks} assigned task(s) will become unassigned.` : ''}`}
        onConfirm={async () => {
          const d = del;
          await run(() => (d.kind === 'story' ? storiesApi.remove(d.item.id) : d.kind === 'task' ? tasksApi.remove(d.item.id) : teamApi.remove(p.id, d.item.userId, d.item.assignedTasks > 0)), 'Done');
          setDel(null);
        }} />
    </>
  );
}
