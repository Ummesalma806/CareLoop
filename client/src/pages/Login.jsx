import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../lib/api.js';
import Logo from '../components/Logo.jsx';

const DEMO = [
  { label: 'Customer', email: 'customer1.khi@careloop.com' },
  { label: 'Agent', email: 'agent1.khi@careloop.com' },
  { label: 'Branch Admin', email: 'admin.khi@careloop.com' },
  { label: 'Super Admin', email: 'super@careloop.com' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-10 text-white md:flex">
        <Logo light size={44} />
        <div>
          <h1 className="text-4xl font-bold leading-tight">Every voice,<br />resolved.</h1>
          <p className="mt-4 max-w-sm text-stone-300">Raise a ticket with your branch, follow every step, and rate the help you received.</p>
        </div>
        <p className="text-sm text-stone-400">Multi-branch support ticketing & knowledge base</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><Logo /></div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mb-6 text-stone-500">Log in to your account</p>

          <form onSubmit={submit} className="space-y-4">
            <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
          </form>

          <p className="mt-4 text-center text-sm text-stone-500">
            New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-stone-300 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Demo accounts (password: Password123)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO.map((d) => (
                <button key={d.label} type="button" onClick={() => { setEmail(d.email); setPassword('Password123'); }}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm hover:border-brand hover:text-brand">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
