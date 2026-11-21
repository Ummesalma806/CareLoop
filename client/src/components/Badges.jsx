import { STATUS_LABEL, timeLeft } from '../lib/format.js';

const STATUS_CLS = {
  open: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-lime-100 text-lime-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-stone-200 text-stone-700',
};
const PRIORITY_CLS = { low: 'text-stone-500', medium: 'text-yellow-600', high: 'text-orange-600', urgent: 'text-red-600' };

export const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[status]}`}>{STATUS_LABEL[status]}</span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`flex items-center gap-1 text-xs font-semibold capitalize ${PRIORITY_CLS[priority]}`}>
    <span className="h-2 w-2 rounded-full bg-current" /> {priority}
  </span>
);

// Shows only while the ticket is still active
export const SlaBadge = ({ ticket }) => {
  if (!ticket.sla?.dueAt || ['resolved', 'closed'].includes(ticket.status)) return null;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ticket.isOverdue ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
      {timeLeft(ticket.sla.dueAt)}
    </span>
  );
};
