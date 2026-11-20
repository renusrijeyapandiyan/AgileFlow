import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/endpoints';
import { errorMessage } from '../services/api';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { name, ...(pw.newPassword ? pw : {}) };
      const res = await authApi.updateProfile(payload);
      setUser(res.data); setPw({ currentPassword: '', newPassword: '' });
      toast.success('Profile updated');
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <div className="grid max-w-3xl gap-6">
        <div className="card flex items-center gap-4 p-6"><Avatar name={user.name} size="h-16 w-16 text-xl" />
          <div><p className="text-lg font-semibold text-slate-900">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div></div>
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="font-semibold text-slate-900">Account</h2>
          <div><label className="label">Full name</label><input className="input" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input bg-slate-50" disabled value={user.email} /></div>
          <h2 className="pt-2 font-semibold text-slate-900">Change password</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Current password</label><input type="password" className="input" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
            <div><label className="label">New password</label><input type="password" className="input" minLength={8} maxLength={72} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          </div>
          <div className="flex justify-between pt-2">
            <button type="button" className="btn-secondary" onClick={logout}>Log out</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </>
  );
}
