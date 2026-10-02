import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.use(authMiddleware as any);

router.get('/stats', getDashboardStats);

export default router;
