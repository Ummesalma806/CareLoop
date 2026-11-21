import { fmt, STATUS_LABEL } from '../lib/format.js';

const text = (h) => {
  switch (h.action) {
    case 'created': return 'Ticket created';
    case 'claimed': return `Claimed by ${h.to}`;
    case 'assigned': return `Assigned to ${h.to}`;
    case 'status_changed': return `Status: ${STATUS_LABEL[h.from] || h.from} → ${STATUS_LABEL[h.to] || h.to}`;
    case 'reopened': return 'Ticket reopened';
    case 'comment_added': return h.note === 'internal note' ? 'Internal note added' : 'Reply added';
    case 'rated': return `Customer rated ${h.to}`;
    default: return h.action;
  }
};

// Audit log: who did what, and when
export default function Timeline({ history }) {
  return (
    <ol className="relative ml-2 border-l-2 border-stone-200">
      {history.map((h, i) => (
        <li key={i} className="mb-4 ml-4">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand" />
          <p className="text-sm font-semibold">{text(h)}</p>
          <p className="text-xs text-stone-500">{h.by?.name} ({h.by?.role}) · {fmt(h.at)}</p>
        </li>
      ))}
    </ol>
  );
}
