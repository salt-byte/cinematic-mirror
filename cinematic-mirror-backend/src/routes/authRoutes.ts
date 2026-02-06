import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

// 需要认证的路由
router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
router.put('/me', authMiddleware, (req, res) => authController.updateProfile(req, res));

export default router;
