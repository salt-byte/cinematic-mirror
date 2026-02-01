import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试'
  }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'AI 服务请求过于频繁，请稍后再试'
  }
});

app.use('/api', limiter);
app.use('/api/interview', aiLimiter);
app.use('/api/consultation', aiLimiter);

// API 路由
app.use('/api', routes);

// 静态文件服务 - 前端构建文件
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// 所有非 API 路由都返回前端页面 (SPA 支持)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: '接口不存在' });
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎬 影中镜 Cinematic Mirror                               ║
║                                                            ║
║   应用地址: http://localhost:${PORT}                         ║
║   API 地址: http://localhost:${PORT}/api                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
