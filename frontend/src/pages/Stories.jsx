import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StoryForm from '../components/StoryForm';
import ProjectSelect from '../components/ProjectSelect';
import ProgressBar from '../components/ProgressBar';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import useProjectSelection from '../hooks/useProjectSelection';
import { useToast } from '../context/ToastContext';
import { projectsApi, storiesApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { PRIORITIES, STORY_STATUSES, label } from '../utils/format';

export default function Stories() {
  const toast = useToast();
  const projects = useFetch(() => projectsApi.list(), []);
  const [projectId, setProjectId] = useProjectSelection(projects.data);
  const stories = useFetch(() => storiesApi.list(projectId), [projectId], { enabled: !!projectId, initial: [] });
  const [q, setQ] = useState(''); const [priority, setPriority] = useState(''); const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null); const [busy, setBusy] = useState(false);

  const list = useMemo(() => (stories.data || []).filter((s) =>
    `${s.title} ${s.description || ''}`.toLowerCase().includes(q.toLowerCase()) && (!priority || s.priority === priority) && (!status || s.status === status)), [stories.data, q, priority, status]);

  const act = async (fn, ok, done) => {
    setBusy(true);
    try { await fn(); toast.success(ok); done(); stories.reload(true); } catch (e) { toast.error(errorMessage(e)); done(); } finally { setBusy(false); }
  };

  if (projects.loading) return <Spinner />;
  if (projects.error) return <ErrorState message={projects.error} onRetry={projects.reload} />;
  if (!projects.data.length) return (<><PageHeader title="User Stories" /><EmptyState title="No projects" text="Create a project before adding user stories." action={<Link to="/projects" className="btn-primary">Go to projects</Link>} /></>);

  return (
    <>
      <PageHeader title="User Stories" subtitle="Requirements written from the user's perspective"
        actions={<><ProjectSelect projects={projects.data} value={projectId} onChange={setProjectId} />
          <button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New story</button></>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Search stories…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STORY_STATUSES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select>
      </div>

      {stories.loading ? <Spinner /> : stories.error ? <ErrorState message={stories.error} onRetry={stories.reload} /> : !stories.data.length ? (
        <EmptyState icon={BookOpenCheck} title="No user stories yet" text="Add the first story for this project." action={<button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New story</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100 bg-slate-50"><tr><th className="th">ID</th><th className="th">Story</th><th className="th">Priority</th><th className="th">Status</th><th className="th w-40">Tasks</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="td text-slate-400">#{s.id}</td>
                  <td className="td max-w-md"><p className="font-medium text-slate-900">{s.title}</p>{s.acceptanceCriteria && <p className="line-clamp-1 text-xs text-slate-500">AC: {s.acceptanceCriteria}</p>}</td>
                  <td className="td"><PriorityBadge value={s.priority} /></td>
                  <td className="td"><StatusBadge value={s.status} /></td>
                  <td className="td"><ProgressBar value={s.taskCount ? Math.round((s.doneTaskCount * 100) / s.taskCount) : 0} /><p className="mt-0.5 text-xs text-slate-400">{s.doneTaskCount}/{s.taskCount} done</p></td>
                  <td className="td text-right"><button className="btn-ghost !p-1.5" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></button>
                    <button className="btn-ghost !p-1.5 hover:!text-red-600" onClick={() => setDeleting(s)}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} className="td py-8 text-center text-slate-500">No stories match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New user story' : 'Edit user story'} wide>
        {editing && <StoryForm initial={editing === 'new' ? null : editing} saving={busy} onCancel={() => setEditing(null)}
          onSubmit={(f) => act(() => (editing === 'new' ? storiesApi.create(projectId, f) : storiesApi.update(editing.id, f)), 'Story saved', () => setEditing(null))} />}
      </Modal>
      <ConfirmDialog open={!!deleting} busy={busy} onCancel={() => setDeleting(null)} message={deleting && `Delete story “${deleting.title}”? A story that still has tasks cannot be deleted.`}
        onConfirm={() => act(() => storiesApi.remove(deleting.id), 'Story deleted', () => setDeleting(null))} />
    </>
  );
}
