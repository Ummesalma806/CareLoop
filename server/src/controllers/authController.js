import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES } from '../config/constants.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  branch: z.string().length(24, 'Invalid branch'),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, adminLevel: u.adminLevel, branch: u.branch });

// Public signup is ALWAYS a customer. Agents/admins are created by admins (never trust role from the client).
export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const branch = await Branch.findOne({ _id: data.branch, isActive: true });
  if (!branch) throw new ApiError(400, 'Selected branch is not available');
  const user = await User.create({ ...data, role: ROLES.CUSTOMER });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Account disabled');
  res.json({ token: sign(user._id), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  await req.user.populate('branch', 'name code city');
  res.json({ user: publicUser(req.user) });
});
