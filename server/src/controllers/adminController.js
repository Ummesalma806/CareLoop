import Ticket from '../models/Ticket.js';
import Satisfaction from '../models/Satisfaction.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ticketScope } from '../middleware/scope.js';

// SLA breached = resolved after deadline, or still open past the deadline
const BREACHED = {
  $or: [
    { $and: [{ $ne: ['$sla.resolvedAt', null] }, { $gt: ['$sla.resolvedAt', '$sla.dueAt'] }] },
    { $and: [{ $eq: ['$sla.resolvedAt', null] }, { $lt: ['$sla.dueAt', '$$NOW'] }] },
  ],
};

// GET /api/admin/stats   (branch admin: own branch, super admin: everything + branch comparison)
export const getStats = asyncHandler(async (req, res) => {
  const match = ticketScope(req.user);
  const isSuper = req.user.adminLevel === 'super';

  const [byStatus, byPriority, overdue, ratingAgg] = await Promise.all([
    Ticket.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Ticket.countDocuments({ ...match, status: { $in: ['open', 'in_progress'] }, 'sla.dueAt': { $lt: new Date() } }),
    Satisfaction.aggregate([{ $match: isSuper ? {} : { branch: req.user.branch } }, { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
  ]);

  const toMap = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));
  const total = byStatus.reduce((s, x) => s + x.count, 0);

  // Agent metrics
  const agentTickets = await Ticket.aggregate([
    { $match: { ...match, assignedTo: { $ne: null } } },
    { $group: {
      _id: '$assignedTo',
      assigned: { $sum: 1 },
      resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
      breaches: { $sum: { $cond: [BREACHED, 1, 0] } },
      avgResolutionMs: { $avg: { $cond: [{ $ne: ['$sla.resolvedAt', null] }, { $subtract: ['$sla.resolvedAt', '$createdAt'] }, null] } },
    } },
  ]);
  const agentRatings = await Satisfaction.aggregate([
    { $match: isSuper ? {} : { branch: req.user.branch } },
    { $group: { _id: '$agent', avgRating: { $avg: '$rating' }, ratings: { $sum: 1 } } },
  ]);
  const ratingByAgent = Object.fromEntries(agentRatings.map((r) => [String(r._id), r]));
  const agents = await User.find({ _id: { $in: agentTickets.map((a) => a._id) } }).select('name branch').populate('branch', 'code');
  const agentName = Object.fromEntries(agents.map((a) => [String(a._id), a]));

  const agentMetrics = agentTickets.map((a) => ({
    agentId: a._id,
    name: agentName[String(a._id)]?.name,
    branch: agentName[String(a._id)]?.branch?.code,
    assigned: a.assigned,
    resolved: a.resolved,
    breaches: a.breaches,
    avgResolutionHours: a.avgResolutionMs ? +(a.avgResolutionMs / 3600000).toFixed(1) : null,
    avgRating: ratingByAgent[String(a._id)] ? +ratingByAgent[String(a._id)].avgRating.toFixed(2) : null,
  })).sort((x, y) => y.resolved - x.resolved);

  // Branch comparison (super admin only)
  let branchComparison = null;
  if (isSuper) {
    const [bt, br, branches] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: '$branch', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } }, breaches: { $sum: { $cond: [BREACHED, 1, 0] } } } }]),
      Satisfaction.aggregate([{ $group: { _id: '$branch', avgRating: { $avg: '$rating' } } }]),
      Branch.find(),
    ]);
    const rb = Object.fromEntries(br.map((r) => [String(r._id), r.avgRating]));
    branchComparison = branches.map((b) => {
      const t = bt.find((x) => String(x._id) === String(b._id)) || { total: 0, resolved: 0, breaches: 0 };
      return { branch: b.name, code: b.code, total: t.total, resolved: t.resolved, breaches: t.breaches, avgRating: rb[String(b._id)] ? +rb[String(b._id)].toFixed(2) : null };
    });
  }

  res.json({
    totals: { tickets: total, overdue, avgRating: ratingAgg[0] ? +ratingAgg[0].avg.toFixed(2) : null, ratings: ratingAgg[0]?.count || 0 },
    byStatus: toMap(byStatus),
    byPriority: toMap(byPriority),
    agentMetrics,
    branchComparison,
  });
});

// GET /api/admin/agents  (for the "assign to agent" dropdown)
export const listAgents = asyncHandler(async (req, res) => {
  const filter = { role: 'agent', isActive: true };
  if (req.user.adminLevel !== 'super') filter.branch = req.user.branch;
  res.json(await User.find(filter).select('name email branch').populate('branch', 'name code').sort('name'));
});
