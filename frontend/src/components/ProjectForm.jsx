import { useState } from 'react';
import { teamApi } from '../services/endpoints';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';

export default function ProjectForm({ initial, onSubmit, onCancel, saving }) {
  const { user } = useAuth();
  const editing = !!initial;
  const { data: users } = useFetch(() => teamApi.users(), [], { enabled: !editing });
  const [f, setF] = useState({
    name: initial?.name || '', description: initial?.description || '',
    startDate: initial?.startDate || '', deadline: initial?.deadline || '', memberIds: [],
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (id) => setF({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id] });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ name: f.name, description: f.description || null, startDate: f.startDate || null, deadline: f.deadline || null, memberIds: f.memberIds });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Project name *</label><input className="input" required maxLength={150} value={f.name} onChange={set('name')} autoFocus /></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} maxLength={2000} value={f.description} onChange={set('description')} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Start date</label><input type="date" className="input" value={f.startDate} onChange={set('startDate')} /></div>
        <div><label className="label">Deadline</label><input type="date" className="input" value={f.deadline} min={f.startDate || undefined} onChange={set('deadline')} /></div>
      </div>
      {!editing && (
        <div>
          <label className="label">Team members</label>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {(users || []).filter((u) => u.id !== user.id).map((u) => (
              <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={f.memberIds.includes(u.id)} onChange={() => toggle(u.id)} /> {u.name} <span className="text-slate-400">· {u.email}</span>
              </label>
            ))}
            {users && users.length <= 1 && <p className="px-2 py-1 text-sm text-slate-400">No other users yet.</p>}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create project'}</button>
      </div>
    </form>
  );
}
