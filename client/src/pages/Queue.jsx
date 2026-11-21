import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import TicketList from '../components/TicketList.jsx';

const FILTERS = [
  ['', 'All'],
  ['unassigned', 'Unassigned'],
  ['open', 'Open'],
  ['in_progress', 'In progress'],
  ['resolved', 'Resolved'],
  ['closed', 'Closed'],
];

export default function Queue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = filter === 'unassigned' ? { unassigned: true } : filter ? { status: filter } : {};
    api.get('/tickets', { params }).then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Ticket queue</h1>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === v ? 'border-brand bg-brand text-white' : 'border-stone-300 bg-white hover:border-brand'}`}>
            {label}
          </button>
        ))}
      </div>
      <TicketList tickets={tickets} loading={loading} showCustomer />
    </div>
  );
}
