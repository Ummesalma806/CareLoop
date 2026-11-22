import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import TicketList from '../components/TicketList.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    api.get('/tickets/me').then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);

  const active = tickets.filter((t) => t.status !== 'closed');
  const closed = tickets.filter((t) => t.status === 'closed');
  const toRate = tickets.filter((t) => t.status === 'resolved' && !t.isRated).length;
  const tabs = [['active', 'Active', active.length], ['closed', 'Closed', closed.length]];

  return (
    <div>
      <PageHeader title="My tickets" subtitle="Everything you have raised with your branch">
        <Link to="/tickets/new" className="btn-primary"><Plus size={18} /> New ticket</Link>
      </PageHeader>

      {toRate > 0 && (
        <div className="mb-4 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand-dark">
          {toRate === 1 ? 'One of your tickets is resolved.' : `${toRate} of your tickets are resolved.`} Open it and rate the service to close it.
        </div>
      )}

      <div className="mb-5 flex gap-2">
        {tabs.map(([key, label, n]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'border-brand bg-brand text-white shadow-glow' : 'border-stone-300 bg-white/80 hover:border-brand'}`}>
            {label}
            {!loading && <span className={`rounded-full px-1.5 text-xs ${tab === key ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>{n}</span>}
          </button>
        ))}
      </div>

      <TicketList tickets={tab === 'active' ? active : closed} loading={loading}
        empty={tab === 'active' ? 'No active tickets. Click “New ticket” if you need help from your branch.' : 'No closed tickets yet.'} />
    </div>
  );
}
