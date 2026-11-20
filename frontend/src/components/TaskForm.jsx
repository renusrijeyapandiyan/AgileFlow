import { useEffect, useState } from 'react';
import { storiesApi, teamApi } from '../services/endpoints';
import { PRIORITIES, TASK_STATUSES, label } from '../utils/format';

/**
 * Create/edit a task. For creation either pass a fixed storyId (+projectId) or a list of projects to choose from.
 * onSubmit(storyId, payload)
 */
export default function TaskForm({ initial, projects, projectId: fixedProjectId, storyId: fixedStoryId, onSubmit, onCancel, saving }) {
  const editing = !!initial;
  const [projectId, setProjectId] = useState(fixedProjectId ?? initial?.projectId ?? projects?.[0]?.id ?? '');
  const [stories, setStories] = useState([]);
  const [members, setMembers] = useState([]);
  const [f, setF] = useState({
    storyId: fixedStoryId ?? initial?.storyId ?? '', title: initial?.title || '', description: initial?.description || '',
    assigneeId: initial?.assigneeId ?? '', priority: initial?.priority || 'MEDIUM', status: initial?.status || 'TO_DO',
    startDate: initial?.startDate || '', dueDate: initial?.dueDate || '',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!projectId) return;
    Promise.all([storiesApi.list(projectId), teamApi.members(projectId)]).then(([s, m]) => {
      setStories(s.data);
      setMembers(m.data);
      setF((cur) => (cur.storyId || editing ? cur : { ...cur, storyId: s.data[0]?.id ?? '' }));
    });
  }, [projectId, editing]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit(Number(f.storyId), {
      title: f.title, description: f.description || null, assigneeId: f.assigneeId ? Number(f.assigneeId) : null,
      priority: f.priority, status: f.status, startDate: f.startDate || null, dueDate: f.dueDate || null,
    });
  };

  const showPicker = !editing && !fixedStoryId;
  return (
    <form onSubmit={submit} className="space-y-4">
      {showPicker && (
        <div className="grid grid-cols-2 gap-3">
          {!fixedProjectId && (
            <div><label className="label">Project *</label>
              <select className="input" value={projectId} onChange={(e) => { setProjectId(Number(e.target.value)); setF({ ...f, storyId: '' }); }}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
          )}
          <div className={fixedProjectId ? 'col-span-2' : ''}><label className="label">User story *</label>
            <select className="input" required value={f.storyId} onChange={set('storyId')}>
              <option value="" disabled>Select a story</option>
              {stories.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            {stories.length === 0 && <p className="mt-1 text-xs text-amber-600">This project has no user stories yet. Create a story first.</p>}
          </div>
        </div>
      )}
      <div><label className="label">Task title *</label><input className="input" required maxLength={200} value={f.title} onChange={set('title')} autoFocus /></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={f.description} onChange={set('description')} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="label">Assignee</label>
          <select className="input" value={f.assigneeId} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
          </select></div>
        <div><label className="label">Priority</label><select className="input" value={f.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={f.status} onChange={set('status')}>{TASK_STATUSES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Start date</label><input type="date" className="input" value={f.startDate} onChange={set('startDate')} /></div>
        <div><label className="label">Due date</label><input type="date" className="input" min={f.startDate || undefined} value={f.dueDate} onChange={set('dueDate')} /></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={saving || !f.storyId}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}</button>
      </div>
    </form>
  );
}
