import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { StatusBadge, PriorityBadge, SlaBadge } from './Badges.jsx';
import { fmt } from '../lib/format.js';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function TicketList({ tickets, loading, showCustomer }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />)}</div>;
  }
  if (!tickets.length) {
    return (
      <div className="card flex flex-col items-center py-14 text-stone-500">
        <Inbox size={36} className="mb-2" /> No tickets here yet
      </div>
    );
  }
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {tickets.map((t) => (
        <motion.div key={t._id} variants={item}>
          <Link to={`/tickets/${t._id}`} className="card block transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-stone-500">{t.key}</span>
              <div className="flex items-center gap-2"><SlaBadge ticket={t} /><StatusBadge status={t.status} /></div>
            </div>
            <h3 className="mt-1 font-semibold">{t.subject}</h3>
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
