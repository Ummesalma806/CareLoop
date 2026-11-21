import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TicketList from '../components/TicketList.jsx';
import PageHeader from '../components/PageHeader.jsx';

const FILTERS = [['', 'All'], ['unassigned', 'Unassigned'], ['open', 'Open'], ['in_progress', 'In progress'], ['resolved', 'Resolved'], ['closed', 'Closed']];

export default function Queue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const isSuper = user.adminLevel === 'super';
  const scope = isSuper ? 'all branches' : user.branch?.name || 'your branch';

  useEffect(() => {
    setLoading(true);
    const params = filter === 'unassigned' ? { unassigned: true } : filter ? { status: filter } : {};
    api.get('/tickets', { params }).then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <PageHeader title="Ticket queue" subtitle={`Showing tickets from ${scope}${isSuper ? '' : ' only'}`} />
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === v ? 'border-brand bg-brand text-white shadow-glow' : 'border-stone-300 bg-white/80 hover:border-brand'}`}>{label}</button>
        ))}
      </div>
      <TicketList tickets={tickets} loading={loading} showCustomer
        empty={isSuper ? 'No tickets match this filter.' : `No tickets for ${scope} match this filter. You only see tickets raised for your own branch.`} />
    </div>
  );
}
