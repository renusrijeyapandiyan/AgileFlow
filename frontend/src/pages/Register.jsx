import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register(f.name, f.email, f.password); navigate('/', { replace: true }); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start managing projects the agile way">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div><label className="label">Full name</label><input className="input" required maxLength={100} value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" className="input" required value={f.email} onChange={set('email')} autoComplete="email" /></div>
        <div><label className="label">Password</label><input type="password" className="input" required minLength={8} maxLength={72} value={f.password} onChange={set('password')} autoComplete="new-password" />
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p></div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
