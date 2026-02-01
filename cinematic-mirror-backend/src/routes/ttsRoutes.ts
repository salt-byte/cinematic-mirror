import { Router, Request, Response } from 'express';
import { synthesizeSpeech, isAzureTtsConfigured } from '../config/azureTts.js';

const router = Router();

// POST /api/tts/synthesize - 文字转语音
router.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ success: false, error: '请提供文本内容' });
      return;
    }

    if (!isAzureTtsConfigured()) {
      res.status(503).json({ success: false, error: 'TTS 服务未配置' });
      return;
    }

    // 限制文本长度（Azure 单次最大约 10000 字符）
    const trimmedText = text.slice(0, 2000);

    const audioBuffer = await synthesizeSpeech(trimmedText);

    if (!audioBuffer) {
      res.status(500).json({ success: false, error: '语音合成失败' });
      return;
    }

    // 返回音频文件
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'Cache-Control': 'no-cache'
    });
    res.send(audioBuffer);

  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ success: false, error: error.message || '语音合成失败' });
  }
});

// GET /api/tts/status - 检查 TTS 服务状态
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    configured: isAzureTtsConfigured(),
    message: isAzureTtsConfigured() ? 'Azure TTS 已配置' : 'Azure TTS 未配置，请设置 AZURE_TTS_KEY'
  });
});

export default router;
