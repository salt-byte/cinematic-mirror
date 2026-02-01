import { Router } from 'express';
import authRoutes from './authRoutes';
import interviewRoutes from './interviewRoutes';
import consultationRoutes from './consultationRoutes';
import plazaRoutes from './plazaRoutes';
import ttsRoutes from './ttsRoutes';

const router = Router();

// API 路由
router.use('/auth', authRoutes);
router.use('/interview', interviewRoutes);
router.use('/consultation', consultationRoutes);
router.use('/plaza', plazaRoutes);
router.use('/tts', ttsRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '影中镜 Cinematic Mirror API 运行正常',
    timestamp: new Date().toISOString()
  });
});

export default router;
