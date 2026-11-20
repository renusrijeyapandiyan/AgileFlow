import { Calendar, Crown, Mail, MoreVertical, Pencil, UserMinus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { STATUS_COLORS, formatDate } from '../utils/format';

const SEGMENTS = [
  ['todoTasks', 'TO_DO', 'To do'], ['inProgressTasks', 'IN_PROGRESS', 'In progress'],
  ['testingTasks', 'TESTING', 'Testing'], ['doneTasks', 'DONE', 'Done'],
];

export function WorkloadBar({ m }) {
  const total = m.assignedTasks;
  if (!total) return <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">No tasks assigned yet</p>;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        {SEGMENTS.map(([k, status, name]) => m[k] > 0 && (
          <div key={k} title={`${name}: ${m[k]}`} style={{ width: `${(m[k] / total) * 100}%`, background: STATUS_COLORS[status] }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {SEGMENTS.map(([k, status, name]) => (
          <span key={k} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />{name} {m[k]}</span>
        ))}
      </div>
    </div>
  );
}

export default function MemberCard({ m, isMe, canManage, onEditTitle, onTransfer, onRemove }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef(null);
  const isLeader = m.role === 'OWNER';
  const canEdit = canManage || isMe;
  const hasMenu = canEdit || (canManage && !isLeader);

  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  return (
    <div className="card-hover animate-fade-up p-5">
      <div className="flex items-start gap-4">
        <Avatar name={m.name} size="h-14 w-14 text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-slate-900">{m.name}</p>
            {isMe && <span className="chip bg-slate-100 text-slate-500">You</span>}
          </div>
          <p className="truncate text-sm text-slate-500">{m.jobTitle || <span className="italic text-slate-400">No title set</span>}</p>
          <span className={`chip mt-1.5 ${isLeader ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-600'}`}>
            {isLeader && <Crown className="h-3 w-3" />}{isLeader ? 'Team Leader' : 'Team Member'}
          </span>
        </div>
        {hasMenu && (
          <div className="relative" ref={ref}>
            <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setMenu(!menu)} aria-label="Member actions"><MoreVertical className="h-5 w-5" /></button>
            {menu && (
              <div className="absolute right-0 z-20 mt-1 w-52 animate-pop overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift">
                {canEdit && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setMenu(false); onEditTitle(m); }}><Pencil className="h-4 w-4 text-slate-400" /> Edit job title</button>}
                {canManage && !isLeader && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setMenu(false); onTransfer(m); }}><Crown className="h-4 w-4 text-amber-500" /> Make team leader</button>}
                {canManage && !isLeader && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenu(false); onRemove(m); }}><UserMinus className="h-4 w-4" /> Remove from project</button>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />{m.email}</p>
        <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />Joined {formatDate(m.joinedAt)}</p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-500">Workload</span>
          <span className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{m.assignedTasks} task{m.assignedTasks === 1 ? '' : 's'}</span>
            {m.overdueTasks > 0 && <span className="chip bg-red-50 text-red-600">{m.overdueTasks} overdue</span>}
          </span>
        </div>
        <WorkloadBar m={m} />
      </div>
    </div>
  );
}
