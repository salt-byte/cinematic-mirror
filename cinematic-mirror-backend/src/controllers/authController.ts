import type { Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  // 注册
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nickname } = req.body;

      if (!email || !password) {
        sendError(res, '请填写邮箱和密码', 400);
        return;
      }

      if (password.length < 6) {
        sendError(res, '密码长度至少6位', 400);
        return;
      }

      // 如果没有提供 nickname，使用邮箱前缀 + 随机数
      const finalNickname = nickname || `影迷${email.split('@')[0].slice(0, 4)}${Math.floor(Math.random() * 1000)}`;

      const result = await userService.register(email, password, finalNickname);
      sendSuccess(res, result, '注册成功', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  // 登录
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, '请填写邮箱和密码', 400);
        return;
      }

      const result = await userService.login(email, password);
      sendSuccess(res, result, '登录成功');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        sendError(res, '用户不存在', 404);
        return;
      }

      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 更新用户信息
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { nickname, avatar_url } = req.body;

      const updatedUser = await userService.updateUser(userId, {
        nickname,
        avatar_url
      });

      sendSuccess(res, updatedUser, '更新成功');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();
