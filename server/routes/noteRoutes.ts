import { Router } from 'express';
import { updateNote, deleteNote } from '../controllers/noteController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.use(authMiddleware as any);

router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
