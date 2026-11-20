import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, AlertTriangle, BellOff, CheckCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, Spinner } from '../components/Feedback';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { notificationsApi } from '../services/endpoints';
import { errorMessage } from '../services/api';
import { formatDateTime, label, timeAgo } from '../utils/format';

const changed = () => window.dispatchEvent(new Event('agileflow:notifications-changed'));

export default function Notifications() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => notificationsApi.list(), []);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const markRead = async (n) => {
    if (n.read) return;
    try { await notificationsApi.markRead(n.id); reload(true); changed(); } catch (e) { toast.error(errorMessage(e)); }
  };
  const markAll = async () => {
    try { await notificationsApi.markAllRead(); toast.success('All notifications marked as read'); reload(true); changed(); } catch (e) { toast.error(errorMessage(e)); }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const unread = data.filter((n) => !n.read).length;
  const list = onlyUnread ? data.filter((n) => !n.read) : data;

  return (
    <>
      <PageHeader title="Notification Center" subtitle={`${unread} unread · generated automatically by the deadline checker`}
        actions={<><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} /> Unread only</label>
          <button className="btn-secondary" disabled={!unread} onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</button></>} />
      {!list.length ? <EmptyState icon={BellOff} title={onlyUnread ? 'No unread notifications' : "You're all caught up"} text="Upcoming and overdue task deadlines will appear here." /> : (
        <div className="card divide-y divide-slate-100">
          {list.map((n) => {
            const overdue = n.type === 'OVERDUE';
            const Icon = overdue ? AlertTriangle : AlarmClock;
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 ${n.read ? '' : 'bg-brand-50/40'}`}>
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${overdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-medium text-slate-900'}`}>{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{label(n.type)} · {formatDateTime(n.createdAt)} ({timeAgo(n.createdAt)})
                    {n.projectId && <> · <Link className="text-brand-600 hover:underline" to={`/kanban?project=${n.projectId}`}>Open board</Link></>}</p>
                </div>
                {!n.read && <button className="btn-secondary !py-1 text-xs" onClick={() => markRead(n)}>Mark read</button>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
