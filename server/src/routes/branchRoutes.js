import { Router } from 'express';
import Branch from '../models/Branch.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
// Public: the signup form needs the branch list for its dropdown
router.get('/', asyncHandler(async (req, res) => {
  res.json(await Branch.find({ isActive: true }).select('name code city').sort('name'));
}));
export default router;
