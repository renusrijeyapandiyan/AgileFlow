import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(email, password); navigate(location.state?.from?.pathname || '/', { replace: true }); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your AgileFlow workspace">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div><label className="label">Email</label><input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div><label className="label">Password</label><input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in</button>
      </form>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Demo account: <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => { setEmail('demo@agileflow.local'); setPassword('Demo@1234'); }}>demo@agileflow.local / Demo@1234</button>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">New here? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}
