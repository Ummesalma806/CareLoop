import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { StatusBadge, PriorityBadge, SlaBadge } from './Badges.jsx';
import { fmt } from '../lib/format.js';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const STRIP = { low: 'border-l-stone-300', medium: 'border-l-yellow-400', high: 'border-l-orange-500', urgent: 'border-l-red-500' };

export default function TicketList({ tickets, loading, showCustomer, empty = 'No tickets here yet' }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200/80" />)}</div>;
  }
  if (!tickets.length) {
    return (
      <div className="card flex flex-col items-center py-16 text-center text-stone-500">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Inbox size={26} /></span>
        <p className="max-w-sm">{empty}</p>
      </div>
    );
  }
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {tickets.map((t) => (
        <motion.div key={t._id} variants={item}>
          <Link to={`/tickets/${t._id}`} className={`card block border-l-4 !py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${STRIP[t.priority]}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-stone-400">{t.key}</span>
              <div className="flex items-center gap-2"><SlaBadge ticket={t} /><StatusBadge status={t.status} /></div>
            </div>
            <h3 className="mt-1 text-[15px] font-semibold">{t.subject}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
              <PriorityBadge priority={t.priority} />
              <span>{t.category?.name}</span>
              {showCustomer && <span>By {t.customer?.name}</span>}
              <span>{t.assignedTo ? `Agent: ${t.assignedTo.name}` : 'Unassigned'}</span>
              <span>{fmt(t.createdAt)}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
