import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errMsg } from '../lib/api.js';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', branch: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/branches').then((r) => setBranches(r.data)).catch(() => {}); }, []);
  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        <div className="mb-8"><Logo /></div>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="mb-6 text-stone-500">Choose the branch you are connected with</p>
        <form onSubmit={submit} className="space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required minLength={2} />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className="input" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required minLength={6} />
          <select className="input" value={form.branch} onChange={set('branch')} required>
            <option value="">Select your branch</option>
            {branches.map((b) => <option key={b._id} value={b._id}>{b.name} ({b.city})</option>)}
          </select>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account? <Link to="/login" className="font-semibold text-brand">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
