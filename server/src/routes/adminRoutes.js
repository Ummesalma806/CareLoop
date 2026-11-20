import { Router } from 'express';
import { getStats, listAgents } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/agents', listAgents);
export default router;
