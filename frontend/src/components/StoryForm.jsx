import { useState } from 'react';
import { PRIORITIES, STORY_STATUSES, label } from '../utils/format';

export default function StoryForm({ initial, onSubmit, onCancel, saving }) {
  const [f, setF] = useState({
    title: initial?.title || '', description: initial?.description || '', acceptanceCriteria: initial?.acceptanceCriteria || '',
    priority: initial?.priority || 'MEDIUM', status: initial?.status || 'TO_DO',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div><label className="label">Story title *</label><input className="input" required maxLength={200} value={f.title} onChange={set('title')} autoFocus placeholder="As a user, I can…" /></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={f.description} onChange={set('description')} /></div>
      <div><label className="label">Acceptance criteria</label><textarea className="input" rows={3} value={f.acceptanceCriteria} onChange={set('acceptanceCriteria')} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Priority</label><select className="input" value={f.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
        <div><label className="label">Status</label><select className="input" value={f.status} onChange={set('status')}>{STORY_STATUSES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Create story'}</button>
      </div>
    </form>
  );
}
