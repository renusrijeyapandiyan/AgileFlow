export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STORY_STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];
export const TASK_STATUSES = ['TO_DO', 'IN_PROGRESS', 'TESTING', 'DONE'];

export const LABELS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
  TO_DO: 'To Do', IN_PROGRESS: 'In Progress', TESTING: 'Testing', DONE: 'Done',
  OWNER: 'Team Leader', MEMBER: 'Team Member', UPCOMING_DEADLINE: 'Upcoming deadline', OVERDUE: 'Overdue',
};
export const label = (v) => LABELS[v] || v;

export const PRIORITY_STYLES = {
  LOW: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200', MEDIUM: 'bg-teal-100 text-teal-700 ring-1 ring-teal-200',
  HIGH: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200', CRITICAL: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
};
export const STATUS_STYLES = {
  TO_DO: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200', IN_PROGRESS: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  TESTING: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200', DONE: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};
export const PRIORITY_BORDER = { LOW: '#94a3b8', MEDIUM: '#14b8a6', HIGH: '#f97316', CRITICAL: '#38bdf8' };
export const STATUS_COLORS = { TO_DO: '#94a3b8', IN_PROGRESS: '#0ea5e9', TESTING: '#f59e0b', DONE: '#10b981' };

export function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const initials = (name = '?') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const JOB_TITLES = ['Product Manager', 'Scrum Master', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'UX Designer', 'QA Engineer', 'DevOps Engineer', 'Business Analyst'];
