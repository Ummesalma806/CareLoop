import { z } from 'zod';
import Ticket from '../models/Ticket.js';
import Branch from '../models/Branch.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calcDueAt } from '../utils/sla.js';
import { ticketScope } from '../middleware/scope.js';
import { PRIORITIES, TICKET_STATUS } from '../config/constants.js';

const createSchema = z.object({
  subject: z.string().min(5).max(150),
  description: z.string().min(10),
  category: z.string().length(24, 'Invalid category'),
  priority: z.enum(PRIORITIES).default('medium'),
});

// POST /api/tickets  (customer only)
export const createTicket = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);

  const category = await Category.findOne({ _id: data.category, isActive: true });
  if (!category) throw new ApiError(400, 'Invalid category');

  // Branch and customer come from the logged-in user, never from the request body
  const key = await Branch.nextTicketKey(req.user.branch);
  const ticket = new Ticket({
    ...data,
    key,
    customer: req.user._id,
    branch: req.user.branch,
    sla: { dueAt: calcDueAt(data.priority) },
  });
  ticket.log('created', req.user._id, { to: 'open' });
  await ticket.save();

  res.status(201).json(ticket);
});

// GET /api/tickets/me  (customer: own tickets)
export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ customer: req.user._id })
    .populate('category', 'name')
    .populate('assignedTo', 'name')
    .sort('-createdAt');
  res.json(tickets);
});

// GET /api/tickets  (agent / admin: scoped by branch, with optional filters)
export const getTickets = asyncHandler(async (req, res) => {
  const filter = { ...ticketScope(req.user) };
  const { status, priority, unassigned } = req.query;
  if (status && TICKET_STATUS.includes(status)) filter.status = status;
  if (priority && PRIORITIES.includes(priority)) filter.priority = priority;
  if (unassigned === 'true') filter.assignedTo = null;

  const tickets = await Ticket.find(filter)
    .populate('customer', 'name')
    .populate('category', 'name')
    .populate('assignedTo', 'name')
    .populate('branch', 'name code')
    .sort('-createdAt');
  res.json(tickets);
});

// GET /api/tickets/:id  (anyone logged in, but only if the scope allows it)
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, ...ticketScope(req.user) })
    .populate('customer', 'name email')
    .populate('category', 'name')
    .populate('assignedTo', 'name')
    .populate('branch', 'name code')
    .populate('history.by', 'name role');
  // 404 (not 403) so we don't even reveal that the ticket exists
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  res.json(ticket);
});