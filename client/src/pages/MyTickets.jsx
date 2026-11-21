import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api.js';
import TicketList from '../components/TicketList.jsx';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/me').then((r) => setTickets(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My tickets</h1>
        <Link to="/tickets/new" className="btn-primary"><Plus size={18} /> New ticket</Link>
      </div>
      <TicketList tickets={tickets} loading={loading} />
    </div>
  );
}
