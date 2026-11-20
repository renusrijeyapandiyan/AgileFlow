import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Crown, ListChecks, LogOut, Search, UserPlus, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectSelect from '../components/ProjectSelect';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import MemberCard, { WorkloadBar } from '../components/MemberCard';
import AddMemberModal from '../components/AddMemberModal';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import useProjectSelection from '../hooks/useProjectSelection';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi, teamApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { JOB_TITLES, formatDate } from '../utils/format';

function Tile({ icon: Icon, label, value, tone }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
      <div><p className="text-xl font-extrabold text-slate-900">{value}</p><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p></div>
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const toast = useToast();
  const projects = useFetch(() => projectsApi.list(), []);
  const [projectId, setProjectId] = useProjectSelection(projects.data);
  const members = useFetch(() => teamApi.members(projectId), [projectId], { enabled: !!projectId, initial: [] });
  const users = useFetch(() => teamApi.users(), [], { initial: [] });
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [editing, setEditing] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [leaving, setLeaving] = useState(false);

  if (projects.loading) return <Spinner />;
  if (projects.error) return <ErrorState message={projects.error} onRetry={projects.reload} />;
  if (!projects.data.length) return (<><PageHeader title="Team" /><EmptyState icon={Users} title="No projects" text="Create a project to build your team." action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /></>);

  const project = projects.data.find((p) => p.id === projectId);
  const isLeader = project?.ownerId === user.id;
  const list = members.data;
  const leader = list.find((m) => m.role === 'OWNER');
  const ids = new Set(list.map((m) => m.userId));
  const candidates = users.data.filter((u) => !ids.has(u.id));
  const visible = list.filter((m) => `${m.name} ${m.email} ${m.jobTitle || ''}`.toLowerCase().includes(q.toLowerCase()));
  const totals = list.reduce((a, m) => ({ open: a.open + m.assignedTasks - m.doneTasks, overdue: a.overdue + m.overdueTasks }), { open: 0, overdue: 0 });

  const act = async (fn, ok) => {
    setBusy(true);
    try { await fn(); toast.success(ok); members.reload(true); projects.reload(true); return true; }
    catch (e) { toast.error(errorMessage(e)); return false; } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Team" subtitle="Your team leader, members and who is working on what"
        actions={<>
          <ProjectSelect projects={projects.data} value={projectId} onChange={setProjectId} />
          {isLeader && <button className="btn-primary" onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> Add member</button>}
          {!isLeader && <button className="btn-secondary" onClick={() => setLeaving(true)}><LogOut className="h-4 w-4" /> Leave project</button>}
        </>} />

      {project && (
        <div className="card mb-6 animate-fade-up p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 className="text-lg font-bold text-slate-900">{project.name}</h2>{project.description && <p className="mt-0.5 max-w-3xl text-sm text-slate-500">{project.description}</p>}</div>
            <span className="chip bg-slate-100 text-slate-600"><CalendarClock className="h-3.5 w-3.5" />Deadline {formatDate(project.deadline)}</span>
          </div>
          <div className="mt-4"><ProgressBar value={project.progress} /></div>
        </div>
      )}

      {members.loading ? <Spinner /> : members.error ? <ErrorState message={members.error} onRetry={members.reload} /> : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile icon={Users} label="Team size" value={list.length} tone="bg-teal-50 text-teal-600" />
            <Tile icon={ListChecks} label="Open tasks" value={totals.open} tone="bg-sky-50 text-sky-600" />
            <Tile icon={AlertTriangle} label="Overdue" value={totals.overdue} tone="bg-red-50 text-red-600" />
            <Tile icon={Crown} label="Leader" value={leader ? leader.name.split(' ')[0] : '—'} tone="bg-amber-50 text-amber-600" />
          </div>

          {leader && (
            <div className="relative mb-8 animate-fade-up overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-orange-600 to-amber-600 p-6 text-white shadow-lift">
              <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex flex-wrap items-center gap-5">
                <Avatar name={leader.name} size="h-20 w-20 text-2xl" ring />
                <div className="min-w-0 flex-1">
                  <span className="chip bg-white/20 text-white backdrop-blur"><Crown className="h-3.5 w-3.5" /> Team Leader</span>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{leader.name}{leader.userId === user.id && <span className="ml-2 text-sm font-medium text-white/70">(you)</span>}</h2>
                  <p className="text-sm text-white/80">{leader.jobTitle || 'Project owner'} · {leader.email}</p>
                  <p className="mt-1 text-xs text-white/60">Leading since {formatDate(leader.joinedAt)} · manages members, stories and deadlines</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[['Assigned', leader.assignedTasks], ['Done', leader.doneTasks], ['Overdue', leader.overdueTasks]].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur"><p className="text-xl font-extrabold">{v}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Members <span className="text-slate-400">({visible.length})</span></h2>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Search name, email or title…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          {visible.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((m) => (
                <MemberCard key={m.userId} m={m} isMe={m.userId === user.id} canManage={isLeader}
                  onEditTitle={(x) => { setEditing(x); setTitleDraft(x.jobTitle || ''); }} onTransfer={setTransfer} onRemove={setRemoving} />
              ))}
            </div>
          ) : <EmptyState icon={Search} title="No members found" text="Try a different search." />}

          {isLeader && !!list.length && (
            <div className="card mt-8 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-900">Workload comparison</h3>
              <div className="space-y-3">
                {list.map((m) => (
                  <div key={m.userId} className="grid items-center gap-3 sm:grid-cols-[180px_1fr]">
                    <div className="flex items-center gap-2"><Avatar name={m.name} size="h-7 w-7 text-[10px]" /><span className="truncate text-sm font-medium">{m.name}</span></div>
                    <WorkloadBar m={m} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AddMemberModal open={adding} onClose={() => setAdding(false)} candidates={candidates} busy={busy}
        onAdd={async (uid, title) => { if (await act(() => teamApi.add(projectId, uid, title), 'Member added')) setAdding(false); }}
        onInvite={async (email, title) => { if (await act(() => teamApi.invite(projectId, email, title), 'Member added')) setAdding(false); }} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Job title · ${editing?.name || ''}`}>
        <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); if (await act(() => teamApi.update(projectId, editing.userId, titleDraft), 'Title updated')) setEditing(null); }}>
          <div>
            <label className="label">Job title</label>
            <input className="input" list="edit-titles" maxLength={80} autoFocus value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} placeholder="e.g. Backend Developer" />
            <datalist id="edit-titles">{JOB_TITLES.map((t) => <option key={t} value={t} />)}</datalist>
          </div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
        </form>
      </Modal>

      <Modal open={!!transfer} onClose={() => setTransfer(null)} title="Make team leader">
        {transfer && (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50"><Crown className="h-5 w-5 text-amber-500" /></span>
              <p className="text-sm text-slate-600"><b>{transfer.name}</b> will become the team leader of this project and gain the right to add and remove members and edit the project. You will stay on the team as a regular member.</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setTransfer(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy} onClick={async () => { await act(() => teamApi.transferLeadership(projectId, transfer.userId), 'Leadership transferred'); setTransfer(null); }}>{busy ? 'Working…' : 'Transfer leadership'}</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog open={!!removing} busy={busy} confirmLabel="Remove" onCancel={() => setRemoving(null)}
        message={removing && (removing.assignedTasks > 0 ? `Remove ${removing.name} from this project? Their ${removing.assignedTasks} assigned task(s) will become unassigned.` : `Remove ${removing.name} from this project?`)}
        onConfirm={async () => { await act(() => teamApi.remove(projectId, removing.userId, removing.assignedTasks > 0), 'Member removed'); setRemoving(null); }} />

      <ConfirmDialog open={leaving} busy={busy} confirmLabel="Leave project" onCancel={() => setLeaving(false)}
        message="Leave this project? Tasks assigned to you will become unassigned and you will lose access until the team leader adds you again."
        onConfirm={async () => { await act(() => teamApi.leave(projectId), 'You left the project'); setLeaving(false); }} />
    </>
  );
}
