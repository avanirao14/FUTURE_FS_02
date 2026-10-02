import { Router } from 'express';
import { login, getMe, logout } from '../controllers/authController.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware as any, getMe as any);

export default router;
