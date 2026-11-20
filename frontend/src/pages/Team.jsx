import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, UserPlus, Users, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectSelect from '../components/ProjectSelect';
import Avatar from '../components/Avatar';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import useProjectSelection from '../hooks/useProjectSelection';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi, teamApi } from '../services/endpoints';
import { errorMessage } from '../services/api';

export default function Team() {
  const { user } = useAuth();
  const toast = useToast();
  const projects = useFetch(() => projectsApi.list(), []);
  const [projectId, setProjectId] = useProjectSelection(projects.data);
  const members = useFetch(() => teamApi.members(projectId), [projectId], { enabled: !!projectId, initial: [] });
  const users = useFetch(() => teamApi.users(), [], { initial: [] });
  const [addUser, setAddUser] = useState(''); const [removing, setRemoving] = useState(null); const [busy, setBusy] = useState(false);

  if (projects.loading) return <Spinner />;
  if (projects.error) return <ErrorState message={projects.error} onRetry={projects.reload} />;
  if (!projects.data.length) return (<><PageHeader title="Team" /><EmptyState icon={Users} title="No projects" text="Create a project to build your team." action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /></>);

  const project = projects.data.find((p) => p.id === projectId);
  const isOwner = project?.ownerId === user.id;
  const ids = new Set(members.data.map((m) => m.userId));
  const candidates = users.data.filter((u) => !ids.has(u.id));

  const act = async (fn, ok) => {
    setBusy(true);
    try { await fn(); toast.success(ok); members.reload(true); projects.reload(true); return true; }
    catch (e) { toast.error(errorMessage(e)); return false; } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Team Members" subtitle="People working on this project and their workload" actions={<ProjectSelect projects={projects.data} value={projectId} onChange={setProjectId} />} />
      {isOwner && (
        <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
          <UserPlus className="h-5 w-5 text-brand-600" />
          <select className="input max-w-xs" value={addUser} onChange={(e) => setAddUser(e.target.value)}>
            <option value="">{candidates.length ? 'Select a user to add…' : 'Everyone is already a member'}</option>
            {candidates.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
          <button className="btn-primary" disabled={!addUser || busy} onClick={async () => { if (await act(() => teamApi.add(projectId, Number(addUser)), 'Member added')) setAddUser(''); }}>Add to project</button>
        </div>
      )}
      {members.loading ? <Spinner /> : members.error ? <ErrorState message={members.error} onRetry={members.reload} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.data.map((m) => (
            <div key={m.userId} className="card flex items-center gap-4 p-5">
              <Avatar name={m.name} size="h-12 w-12 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{m.name}{m.userId === user.id && <span className="ml-1 text-xs font-normal text-slate-400">(you)</span>}</p>
                <p className="flex items-center gap-1 truncate text-xs text-slate-500"><Mail className="h-3 w-3" />{m.email}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${m.role === 'OWNER' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{m.role === 'OWNER' ? 'Owner' : 'Member'}</span>
                  <span className="text-slate-500">{m.assignedTasks} assigned task{m.assignedTasks === 1 ? '' : 's'}</span>
                </div>
              </div>
              {isOwner && m.role !== 'OWNER' && <button className="text-slate-300 hover:text-red-600" title="Remove from project" onClick={() => setRemoving(m)}><X className="h-5 w-5" /></button>}
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!removing} busy={busy} confirmLabel="Remove" onCancel={() => setRemoving(null)}
        message={removing && (removing.assignedTasks > 0 ? `Remove ${removing.name} from this project? Their ${removing.assignedTasks} assigned task(s) will become unassigned.` : `Remove ${removing.name} from this project?`)}
        onConfirm={async () => { await act(() => teamApi.remove(projectId, removing.userId, removing.assignedTasks > 0), 'Member removed'); setRemoving(null); }} />
    </>
  );
}
