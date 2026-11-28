import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import { SLA_HOURS } from '../lib/format.js';
import { FilePicker } from '../components/Attachments.jsx';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function NewTicket() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', category: '', priority: 'medium' });
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)); }, []);

  // Suggest help-center articles while the customer types the subject
  useEffect(() => {
    const word = form.subject.split(/\s+/).filter((w) => w.length > 3).sort((a, b) => b.length - a.length)[0];
    if (!word) return setSuggestions([]);
    const t = setTimeout(() => {
      api.get('/articles', { params: { search: word } }).then((r) => setSuggestions(r.data.slice(0, 3))).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [form.subject]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
     const fd = new FormData();
Object.entries(form).forEach(([k, v]) => fd.append(k, v));
files.forEach((f) => fd.append('attachments', f));
const { data } = await api.post('/tickets', fd);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-2xl font-bold">Raise a new ticket</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Subject</label>
          <input className="input" value={form.subject} onChange={set('subject')} placeholder="e.g. Wi-Fi not working in lab 2" required minLength={5} maxLength={150} />
        </div>

        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-lime-50 p-3 text-sm">
            <p className="mb-1 flex items-center gap-1 font-semibold text-lime-800"><Lightbulb size={16} /> These articles may solve your issue</p>
            <ul className="list-inside list-disc text-lime-900">
              {suggestions.map((a) => <li key={a._id}><Link to={`/knowledge?q=${encodeURIComponent(a.title)}`} target="_blank" className="underline">{a.title}</Link></li>)}
            </ul>
          </motion.div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold">Describe the problem</label>
          <textarea className="input min-h-32" value={form.description} onChange={set('description')} required minLength={10} placeholder="What happened? Since when? Which room or system?" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Category</label>
          <select className="input" value={form.category} onChange={set('category')} required>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Priority</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITIES.map((p) => (
              <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                className={`rounded-xl border px-3 py-2 text-sm capitalize transition ${form.priority === p ? 'border-brand bg-brand/10 font-semibold text-brand-dark' : 'border-stone-300 bg-white hover:border-brand'}`}>
                {p}<span className="block text-xs text-stone-500">within {SLA_HOURS[p]}h</span>
              </button>
            ))}
          </div>
        </div>

<FilePicker files={files} setFiles={setFiles} />

        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit ticket'}</button>
      </form>
    </motion.div>
  );
}
