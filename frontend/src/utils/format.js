export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STORY_STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];
export const TASK_STATUSES = ['TO_DO', 'IN_PROGRESS', 'TESTING', 'DONE'];

export const LABELS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
  TO_DO: 'To Do', IN_PROGRESS: 'In Progress', TESTING: 'Testing', DONE: 'Done',
  OWNER: 'Owner', MEMBER: 'Member', UPCOMING_DEADLINE: 'Upcoming deadline', OVERDUE: 'Overdue',
};
export const label = (v) => LABELS[v] || v;

export const PRIORITY_STYLES = {
  LOW: 'bg-slate-100 text-slate-600', MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-orange-50 text-orange-700', CRITICAL: 'bg-red-50 text-red-700',
};
export const STATUS_STYLES = {
  TO_DO: 'bg-slate-100 text-slate-700', IN_PROGRESS: 'bg-blue-50 text-blue-700',
  TESTING: 'bg-amber-50 text-amber-700', DONE: 'bg-emerald-50 text-emerald-700',
};
export const STATUS_COLORS = { TO_DO: '#94a3b8', IN_PROGRESS: '#6366f1', TESTING: '#f59e0b', DONE: '#10b981' };

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
