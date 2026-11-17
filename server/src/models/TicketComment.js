import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    isInternal: { type: Boolean, default: false }, // internal notes are hidden from customers
    attachments: [{ url: String, name: String, mimeType: String, size: Number, _id: false }],
  },
  { timestamps: true }
);

export default mongoose.model('TicketComment', commentSchema);
