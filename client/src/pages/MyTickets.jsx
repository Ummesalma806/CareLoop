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

  useEffect(() => {
    api.get('/tickets/me').then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="My tickets" subtitle="Everything you have raised with your branch">
        <Link to="/tickets/new" className="btn-primary"><Plus size={18} /> New ticket</Link>
      </PageHeader>
      <TicketList tickets={tickets} loading={loading} empty="You have not raised any tickets yet. Click “New ticket” to get help from your branch." />
    </div>
  );
}
