import { Router } from 'express';
import { plazaController } from '../controllers/plazaController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

// 获取帖子列表（可选认证，用于显示是否点赞）
router.get('/posts', optionalAuthMiddleware, (req, res) => plazaController.getPosts(req, res));

// 获取单个帖子（可选认证）
router.get('/posts/:postId', optionalAuthMiddleware, (req, res) => plazaController.getPost(req, res));

// 获取帖子评论
router.get('/posts/:postId/comments', (req, res) => plazaController.getComments(req, res));

// 需要认证的路由
router.post('/posts', authMiddleware, (req, res) => plazaController.createPost(req, res));
router.delete('/posts/:postId', authMiddleware, (req, res) => plazaController.deletePost(req, res));

// 点赞相关
router.post('/posts/:postId/like', authMiddleware, (req, res) => plazaController.likePost(req, res));
router.delete('/posts/:postId/like', authMiddleware, (req, res) => plazaController.unlikePost(req, res));

// 评论相关
router.post('/posts/:postId/comments', authMiddleware, (req, res) => plazaController.addComment(req, res));
router.delete('/comments/:commentId', authMiddleware, (req, res) => plazaController.deleteComment(req, res));

export default router;
