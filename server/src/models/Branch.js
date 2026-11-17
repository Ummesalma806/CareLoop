import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 5 }, // e.g. KHI
    city: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    ticketCounter: { type: Number, default: 0 }, // used to build keys like KHI-0042
  },
  { timestamps: true }
);

// Atomic increment, so two tickets never get the same key
branchSchema.statics.nextTicketKey = async function (branchId) {
  const b = await this.findByIdAndUpdate(branchId, { $inc: { ticketCounter: 1 } }, { new: true });
  return `${b.code}-${String(b.ticketCounter).padStart(4, '0')}`;
};

export default mongoose.model('Branch', branchSchema);
