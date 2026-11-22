import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TicketList from '../components/TicketList.jsx';
import PageHeader from '../components/PageHeader.jsx';

// Each tab is a rule. Closed tickets stay in the database (audit trail) but live in their own tab.
const TABS = [
  ['active', 'Active', (t) => t.status !== 'closed'],
  ['unassigned', 'Unassigned', (t) => !t.assignedTo && t.status !== 'closed'],
  ['overdue', 'Overdue', (t) => t.isOverdue],
  ['open', 'Open', (t) => t.status === 'open'],
  ['in_progress', 'In progress', (t) => t.status === 'in_progress'],
  ['resolved', 'Resolved', (t) => t.status === 'resolved'],
  ['closed', 'Closed', (t) => t.status === 'closed'],
  ['all', 'All', () => true],
];

export default function Queue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  const isSuper = user.adminLevel === 'super';
  const scope = isSuper ? 'all branches' : user.branch?.name || 'your branch';

  useEffect(() => {
    api.get('/tickets').then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);

  const rule = TABS.find((t) => t[0] === tab)[2];
  const visible = tickets.filter(rule);

  return (
    <div>
      <PageHeader title="Ticket queue" subtitle={`Showing tickets from ${scope}${isSuper ? '' : ' only'}`} />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([key, label, fn]) => {
          const count = tickets.filter(fn).length;
          const on = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${on ? 'border-brand bg-brand text-white shadow-glow' : 'border-stone-300 bg-white/80 hover:border-brand'}`}>
              {label}
              {!loading && <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-white/20' : key === 'overdue' && count > 0 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-500'}`}>{count}</span>}
            </button>
          );
        })}
      </div>
      <TicketList tickets={visible} loading={loading} showCustomer
        empty={tab === 'active' ? 'Nothing needs attention right now. Closed tickets are in the Closed tab.' : isSuper ? 'No tickets match this filter.' : `No tickets for ${scope} match this filter. You only see tickets raised for your own branch.`} />
    </div>
  );
}
