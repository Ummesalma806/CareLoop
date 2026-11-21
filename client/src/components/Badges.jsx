import { STATUS_LABEL, timeLeft } from '../lib/format.js';

const STATUS_CLS = {
  open: 'bg-orange-50 text-orange-700 ring-orange-200',
  in_progress: 'bg-lime-50 text-lime-800 ring-lime-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-stone-100 text-stone-600 ring-stone-200',
};
const PRIORITY_CLS = { low: 'text-stone-500', medium: 'text-yellow-600', high: 'text-orange-600', urgent: 'text-red-600' };

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_CLS[status]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" /> {STATUS_LABEL[status]}
  </span>
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
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ticket.isOverdue ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-white text-stone-600 ring-stone-200'}`}>
      {timeLeft(ticket.sla.dueAt)}
    </span>
  );
};
