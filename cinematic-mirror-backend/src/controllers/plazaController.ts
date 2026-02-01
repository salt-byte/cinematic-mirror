import type { Request, Response } from 'express';
import { plazaService } from '../services/plazaService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class PlazaController {
  // 获取帖子列表
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const currentUserId = req.user?.userId;

      const result = await plazaService.getPosts(page, limit, currentUserId);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 获取单个帖子
  async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.userId;

      const post = await plazaService.getPost(postId, currentUserId);

      if (!post) {
        sendError(res, '帖子不存在', 404);
        return;
      }

      sendSuccess(res, post);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 创建帖子
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { content, image_urls, inspiration_tags, location } = req.body;

      if (!content) {
        sendError(res, '帖子内容不能为空', 400);
        return;
      }

      const post = await plazaService.createPost(
        userId,
        content,
        image_urls || [],
        inspiration_tags || [],
        location
      );

      sendSuccess(res, post, '发布成功', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // 删除帖子
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { postId } = req.params;

      await plazaService.deletePost(postId, userId);
      sendSuccess(res, null, '删除成功');
    } catch (error: any) {
      if (error.message.includes('无权')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message, 400);
      }
    }
  }

  // 点赞帖子
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { postId } = req.params;

      await plazaService.likePost(postId, userId);
      sendSuccess(res, null, '点赞成功');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // 取消点赞
  async unlikePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { postId } = req.params;

      await plazaService.unlikePost(postId, userId);
      sendSuccess(res, null, '取消点赞成功');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // 获取帖子评论
  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const comments = await plazaService.getComments(postId);
      sendSuccess(res, comments);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 添加评论
  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { postId } = req.params;
      const { content } = req.body;

      if (!content) {
        sendError(res, '评论内容不能为空', 400);
        return;
      }

      const comment = await plazaService.addComment(postId, userId, content);
      sendSuccess(res, comment, '评论成功', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // 删除评论
  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { commentId } = req.params;

      await plazaService.deleteComment(commentId, userId);
      sendSuccess(res, null, '删除成功');
    } catch (error: any) {
      if (error.message.includes('无权')) {
        sendError(res, error.message, 403);
      } else {
        sendError(res, error.message, 400);
      }
    }
  }
}

export const plazaController = new PlazaController();
