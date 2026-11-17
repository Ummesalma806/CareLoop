import mongoose from 'mongoose';

const satisfactionSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true }, // one rating per ticket
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // copied so agent metrics are one query
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model('Satisfaction', satisfactionSchema);
