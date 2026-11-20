import { accent } from '../utils/theme';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FolderKanban, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectForm from '../components/ProjectForm';
import ProgressBar from '../components/ProgressBar';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { projectsApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { formatDate } from '../utils/format';

export default function Projects() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => projectsApi.list(), []);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | project
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => (data || []).filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase())), [data, q]);

  const save = async (payload) => {
    setBusy(true);
    try {
      if (editing === 'new') await projectsApi.create(payload); else await projectsApi.update(editing.id, payload);
      toast.success(editing === 'new' ? 'Project created' : 'Project updated');
      setEditing(null); reload(true);
    } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await projectsApi.remove(deleting.id); toast.success('Project deleted'); setDeleting(null); reload(true); }
    catch (e) { toast.error(errorMessage(e)); setDeleting(null); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Projects" subtitle="Plan, track and deliver your team's work"
        actions={<button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New project</button>} />
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input className="input pl-9" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : !data.length ? (
        <EmptyState icon={FolderKanban} title="No projects yet" text="Create a project to start adding user stories and tasks."
          action={<button className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> Create project</button>} />
      ) : !list.length ? <EmptyState title="No matching projects" text="Try a different search term." /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="card-hover flex flex-col overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${accent(p.id).grad}`} />
              <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/projects/${p.id}`} className="text-base font-bold text-slate-900 hover:text-brand-600">{p.name}</Link>
                {p.ownerId === user.id && (
                  <div className="flex shrink-0">
                    <button className="btn-ghost !p-1.5" title="Edit" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></button>
                    <button className="btn-ghost !p-1.5 hover:!text-red-600" title="Delete" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">{p.description || 'No description'}</p>
              <div className="mt-4"><ProgressBar value={p.progress} /></div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(p.deadline)}</span>
                <span>{p.storyCount} stories · {p.taskCount} tasks</span>
                <span className={`chip ${accent(p.id).soft}`}><Users className="h-3.5 w-3.5" /> {p.members.length}</span>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New project' : 'Edit project'}>
        {editing && <ProjectForm initial={editing === 'new' ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} saving={busy} />}
      </Modal>
      <ConfirmDialog open={!!deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove}
        message={deleting && `Delete project “${deleting.name}”? Projects that still contain user stories cannot be deleted.`} />
    </>
  );
}
