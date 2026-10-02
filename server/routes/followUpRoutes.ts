import { Router } from 'express';
import { getFollowUps, updateFollowUp, deleteFollowUp } from '../controllers/followUpController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getFollowUps);
router.put('/:id', updateFollowUp);
router.delete('/:id', deleteFollowUp);

export default router;
