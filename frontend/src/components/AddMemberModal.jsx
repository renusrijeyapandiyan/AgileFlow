import { useEffect, useState } from 'react';
import { Check, Copy, Loader2, Mail, Search, UserPlus } from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import { JOB_TITLES } from '../utils/format';

export default function AddMemberModal({ open, onClose, candidates, busy, onAdd, onInvite }) {
  const [tab, setTab] = useState('find');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (open) { setTab('find'); setQ(''); setPicked(null); setEmail(''); setTitle(''); setCopied(false); } }, [open]);

  const list = candidates.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/register`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const titleField = (
    <div>
      <label className="label">Job title (optional)</label>
      <input className="input" list="job-titles" maxLength={80} placeholder="e.g. Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
      <datalist id="job-titles">{JOB_TITLES.map((t) => <option key={t} value={t} />)}</datalist>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Add team member">
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        {[['find', 'Find a user', Search], ['email', 'Add by email', Mail]].map(([k, name, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center justify-center gap-2 rounded-lg py-2 transition ${tab === k ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Icon className="h-4 w-4" />{name}</button>
        ))}
      </div>

      {tab === 'find' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {!list.length && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">{candidates.length ? 'No users match your search.' : 'Everyone is already on this project.'}</p>}
            {list.map((u) => (
              <button key={u.id} onClick={() => setPicked(u.id === picked ? null : u.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${picked === u.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <Avatar name={u.name} size="h-9 w-9 text-xs" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{u.name}</span><span className="block truncate text-xs text-slate-500">{u.email}</span></span>
                {picked === u.id && <Check className="h-5 w-5 text-brand-600" />}
              </button>
            ))}
          </div>
          {titleField}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={!picked || busy} onClick={() => onAdd(picked, title)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Add to project</button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onInvite(email, title); }}>
          <div><label className="label">Email address</label><input type="email" required className="input" placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {titleField}
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            The person needs an AgileFlow account first. Not registered yet? Send them the sign-up link, then add them here.
            <button type="button" onClick={copyLink} className="ml-2 inline-flex items-center gap-1 font-semibold underline">{copied ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy sign-up link</>}</button>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={!email || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Add member</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
