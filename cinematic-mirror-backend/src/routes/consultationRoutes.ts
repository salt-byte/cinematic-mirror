import { Router } from 'express';
import { consultationController } from '../controllers/consultationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有咨询路由都需要认证
router.use(authMiddleware);

// 开始咨询会话
router.post('/start', (req, res) => consultationController.startConsultation(req, res));

// 发送咨询消息
router.post('/session/:sessionId/message', (req, res) => consultationController.sendMessage(req, res));

// 结束咨询会话
router.delete('/session/:sessionId', (req, res) => consultationController.endConsultation(req, res));

// 获取会话历史
router.get('/session/:sessionId/history', (req, res) => consultationController.getSessionHistory(req, res));

// 视频聊天
router.post('/video-chat', (req, res) => consultationController.videoChat(req, res));

export default router;
