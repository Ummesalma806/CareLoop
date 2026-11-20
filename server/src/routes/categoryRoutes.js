import { Router } from 'express';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(async (req, res) => {
  res.json(await Category.find({ isActive: true }).select('name description').sort('name'));
}));
export default router;