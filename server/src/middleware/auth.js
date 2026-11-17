import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// 1) Is the user logged in?
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Please log in');
  const { id } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or disabled');
  req.user = user;
  next();
});

// 2) Does the user have the right role?   router.get('/', protect, authorize('agent','admin'), ...)
export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, 'You are not allowed to do this'));
