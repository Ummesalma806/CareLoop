import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../lib/api.js';
import AuthShell from '../components/AuthShell.jsx';

const BRANCHES = [['khi', 'Karachi'], ['lhr', 'Lahore'], ['isb', 'Islamabad']];
const ROLES = [
  ['Customer', (c) => `customer1.${c}@careloop.com`],
  ['Agent', (c) => `agent1.${c}@careloop.com`],
  ['Branch admin', (c) => `admin.${c}@careloop.com`],
  ['Super admin', () => 'super@careloop.com'],
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('khi');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { toast.error(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue to your workspace"
      footer={<p className="mt-5 text-center text-sm text-stone-500">New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link></p>}>
      <form onSubmit={submit} className="space-y-4">
        <input className="input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>

      <div className="mt-7 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Try a demo account · password: Password123</p>
        <div className="mb-3 flex gap-1.5 rounded-xl bg-stone-200/60 p-1">
          {BRANCHES.map(([code, name]) => (
            <button key={code} type="button" onClick={() => setBranch(code)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${branch === code ? 'bg-white text-brand shadow-sm' : 'text-stone-500 hover:text-ink'}`}>{name}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(([label, make]) => (
            <button key={label} type="button" onClick={() => { setEmail(make(branch)); setPassword('Password123'); }}
              className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm transition hover:border-brand hover:text-brand">{label}</button>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">Agents and admins only see the tickets of their own branch.</p>
      </div>
    </AuthShell>
  );
}
