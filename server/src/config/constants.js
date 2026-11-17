export const ROLES = { CUSTOMER: 'customer', AGENT: 'agent', ADMIN: 'admin' };
export const ADMIN_LEVELS = { BRANCH: 'branch', SUPER: 'super' };

export const TICKET_STATUS = ['open', 'in_progress', 'resolved', 'closed'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// Hours allowed to resolve a ticket, by priority (SLA policy)
export const SLA_HOURS = { urgent: 4, high: 8, medium: 24, low: 48 };

export const HISTORY_ACTIONS = [
  'created', 'claimed', 'assigned', 'status_changed', 'priority_changed',
  'category_changed', 'transferred', 'comment_added', 'reopened', 'rated',
];
