import mongoose from 'mongoose';
import { TICKET_STATUS, PRIORITIES, HISTORY_ACTIONS } from '../config/constants.js';

const attachmentSchema = new mongoose.Schema(
  { url: String, publicId: String, name: String, mimeType: String, size: Number },
  { _id: false }
);

// Append-only audit log: who did what, when, and what changed
const historySchema = new mongoose.Schema(
  {
    action: { type: String, enum: HISTORY_ACTIONS, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String },
    to: { type: String },
    note: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true }, // KHI-0042
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: TICKET_STATUS, default: 'open' },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedAt: { type: Date, default: null },

    attachments: [attachmentSchema],

    sla: {
      dueAt: { type: Date },
      firstResponseAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
    },
    closedAt: { type: Date, default: null },
    isRated: { type: Boolean, default: false },

    history: [historySchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Overdue = deadline passed and ticket not yet resolved/closed
ticketSchema.virtual('isOverdue').get(function () {
  return !!this.sla?.dueAt && !['resolved', 'closed'].includes(this.status) && this.sla.dueAt < new Date();
});

// Helper to push an audit entry:  ticket.log('claimed', userId, { to: agentName })
ticketSchema.methods.log = function (action, by, extra = {}) {
  this.history.push({ action, by, ...extra });
};

ticketSchema.index({ branch: 1, status: 1 });
ticketSchema.index({ customer: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model('Ticket', ticketSchema);
