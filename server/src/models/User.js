import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ADMIN_LEVELS } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    adminLevel: { type: String, enum: [...Object.values(ADMIN_LEVELS), null], default: null },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null }, // null only for super admin
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Business rules: who must belong to a branch
userSchema.pre('validate', function (next) {
  const isSuper = this.role === ROLES.ADMIN && this.adminLevel === ADMIN_LEVELS.SUPER;
  if (this.role === ROLES.ADMIN && !this.adminLevel) this.invalidate('adminLevel', 'Admin needs an adminLevel');
  if (!isSuper && !this.branch) this.invalidate('branch', 'Branch is required for this role');
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
