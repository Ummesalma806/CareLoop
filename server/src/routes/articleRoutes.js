import { Router } from 'express';
import { listArticles, getArticle, createArticle, updateArticle, deleteArticle, voteArticle } from '../controllers/articleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/:id/vote', voteArticle);
router.post('/', protect, authorize('agent', 'admin'), createArticle);
router.patch('/:id', protect, authorize('agent', 'admin'), updateArticle);
router.delete('/:id', protect, authorize('agent', 'admin'), deleteArticle);
export default router;
