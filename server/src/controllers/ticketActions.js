import { z } from 'zod';
import Ticket from '../models/Ticket.js';
import TicketComment from '../models/TicketComment.js';
import Satisfaction from '../models/Satisfaction.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ticketScope } from '../middleware/scope.js';

// Every action starts by finding the ticket INSIDE the user's scope
const findScoped = async (req) => {
  const t = await Ticket.findOne({ _id: req.params.id, ...ticketScope(req.user) });
  if (!t) throw new ApiError(404, 'Ticket not found');
  return t;
};

// PATCH /api/tickets/:id/assign  (agent claims; admin assigns with { agentId })
export const assignTicket = asyncHandler(async (req, res) => {
  const ticket = await findScoped(req);
  if (ticket.status === 'closed') throw new ApiError(400, 'Ticket is closed');

  let agent = req.user;
  let action = 'claimed';
  if (req.user.role === 'admin') {
    if (!req.body.agentId) throw new ApiError(400, 'agentId is required');
    agent = await User.findOne({ _id: req.body.agentId, role: 'agent', branch: ticket.branch, isActive: true });
    if (!agent) throw new ApiError(400, 'Agent not found in this branch');
    action = 'assigned';
  } else if (ticket.assignedTo && String(ticket.assignedTo) !== String(req.user._id)) {
    throw new ApiError(409, 'Ticket already claimed by another agent');
  }

  ticket.assignedTo = agent._id;
  ticket.assignedAt = new Date();
  ticket.log(action, req.user._id, { to: agent.name });
  if (ticket.status === 'open') {
    ticket.status = 'in_progress';
    ticket.log('status_changed', req.user._id, { from: 'open', to: 'in_progress' });
  }
  await ticket.save();
  res.json(ticket);
});

const TRANSITIONS = { open: ['in_progress'], in_progress: ['resolved'], resolved: ['closed', 'in_progress'], closed: [] };

// PATCH /api/tickets/:id/status  (agent / admin)
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(['in_progress', 'resolved', 'closed']) }).parse(req.body);
  const ticket = await findScoped(req);
  if (req.user.role === 'agent' && String(ticket.assignedTo) !== String(req.user._id)) {
    throw new ApiError(403, 'Claim this ticket first');
  }
  if (!TRANSITIONS[ticket.status].includes(status)) {
    throw new ApiError(400, `Cannot change status from ${ticket.status} to ${status}`);
  }
  const from = ticket.status;
  ticket.status = status;
  if (status === 'resolved') ticket.sla.resolvedAt = new Date();
  if (status === 'closed') ticket.closedAt = new Date();
  if (from === 'resolved' && status === 'in_progress') {
    ticket.sla.resolvedAt = null;
    ticket.log('reopened', req.user._id, { from, to: status });
  } else {
    ticket.log('status_changed', req.user._id, { from, to: status });
  }
  await ticket.save();
  res.json(ticket);
});

// POST /api/tickets/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const { body, isInternal } = z.object({ body: z.string().min(1).max(3000), isInternal: z.boolean().optional() }).parse(req.body);
  const ticket = await findScoped(req);
  if (ticket.status === 'closed') throw new ApiError(400, 'Ticket is closed');

  const internal = req.user.role === 'customer' ? false : !!isInternal; // customers can never write internal notes
const comment = await TicketComment.create({ ticket: ticket._id, author: req.user._id, body, isInternal: internal, attachments: req.uploaded || [] });
 
if (req.user.role !== 'customer' && !internal && !ticket.sla.firstResponseAt) ticket.sla.firstResponseAt = new Date();
  ticket.log('comment_added', req.user._id, { note: internal ? 'internal note' : 'reply' });
  await ticket.save();

  await comment.populate('author', 'name role');
  res.status(201).json(comment);
});

// GET /api/tickets/:id/comments
export const getComments = asyncHandler(async (req, res) => {
  const ticket = await findScoped(req);
  const filter = { ticket: ticket._id };
  if (req.user.role === 'customer') filter.isInternal = false;
  res.json(await TicketComment.find(filter).populate('author', 'name role').sort('createdAt'));
});

// POST /api/tickets/:id/satisfaction  (customer rates a resolved ticket; this also closes it)
export const rateTicket = asyncHandler(async (req, res) => {
  const { rating, comment } = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(500).optional() }).parse(req.body);
  const ticket = await findScoped(req);
  if (!['resolved', 'closed'].includes(ticket.status)) throw new ApiError(400, 'You can rate a ticket after it is resolved');
  if (ticket.isRated) throw new ApiError(409, 'Ticket already rated');
  if (!ticket.assignedTo) throw new ApiError(400, 'Ticket has no agent');

  const survey = await Satisfaction.create({
    ticket: ticket._id, customer: req.user._id, agent: ticket.assignedTo, branch: ticket.branch, rating, comment,
  });
  ticket.isRated = true;
  if (ticket.status !== 'closed') {
    ticket.log('status_changed', req.user._id, { from: ticket.status, to: 'closed' });
    ticket.status = 'closed';
    ticket.closedAt = new Date();
  }
  ticket.log('rated', req.user._id, { to: `${rating}/5` });
  await ticket.save();
  res.status(201).json(survey);
});
