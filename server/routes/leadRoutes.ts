import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadController.ts';
import { getNotesByLeadId, createNote } from '../controllers/noteController.ts';
import { createFollowUpForLead } from '../controllers/followUpController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

// Protect lead endpoints with auth middleware
router.use(authMiddleware as any);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Nested routes for lead notes
router.get('/:id/notes', getNotesByLeadId);
router.post('/:id/notes', createNote as any);

// Nested routes for lead follow-ups
router.post('/:id/followups', createFollowUpForLead);

export default router;
