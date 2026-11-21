export const fmt = (d) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const STATUS_LABEL = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };

export const timeLeft = (due) => {
  const ms = new Date(due) - Date.now();
  const h = Math.max(1, Math.round(Math.abs(ms) / 3600000));
  const text = h >= 48 ? `${Math.round(h / 24)}d` : `${h}h`;
  return ms > 0 ? `Due in ${text}` : `${text} overdue`;
};

export const SLA_HOURS = { urgent: 4, high: 8, medium: 24, low: 48 };
