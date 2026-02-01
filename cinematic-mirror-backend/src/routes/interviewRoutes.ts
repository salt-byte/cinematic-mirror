import { Router } from 'express';
import { interviewController } from '../controllers/interviewController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有试镜路由都需要认证
router.use(authMiddleware);

// 开始试镜
router.post('/start', (req, res) => interviewController.startInterview(req, res));

// 发送消息
router.post('/session/:sessionId/message', (req, res) => interviewController.sendMessage(req, res));

// 生成人格档案
router.post('/session/:sessionId/generate', (req, res) => interviewController.generateProfile(req, res));

// 获取用户所有档案
router.get('/profiles', (req, res) => interviewController.getUserProfiles(req, res));

// 获取单个档案
router.get('/profiles/:profileId', (req, res) => interviewController.getProfile(req, res));

export default router;
