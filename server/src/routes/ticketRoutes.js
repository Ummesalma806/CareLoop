import { Router } from 'express';
import { createTicket, getMyTickets, getTickets, getTicket } from '../controllers/ticketController.js';
import { assignTicket, updateStatus, addComment, getComments, rateTicket } from '../controllers/ticketActions.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect); // every ticket route needs login

router.post('/', authorize('customer'), createTicket);
router.get('/me', authorize('customer'), getMyTickets);
router.get('/', authorize('agent', 'admin'), getTickets);

router.get('/:id', getTicket);
router.patch('/:id/assign', authorize('agent', 'admin'), assignTicket);
router.patch('/:id/status', authorize('agent', 'admin'), updateStatus);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);
router.post('/:id/satisfaction', authorize('customer'), rateTicket);

export default router;
