import type { Request, Response } from 'express';
import { interviewService } from '../services/interviewService';
import { sendSuccess, sendError } from '../utils/response';

export class InterviewController {
  // 开始试镜
  async startInterview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const { userName, userGender, language } = req.body;

      const result = await interviewService.startInterview(userId, userName, userGender, language || 'zh');
      sendSuccess(res, result, language === 'en' ? 'Audition started' : '试镜开始');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 发送消息
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message) {
        sendError(res, '消息内容不能为空', 400);
        return;
      }

      const result = await interviewService.sendMessage(sessionId, message);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error.message.includes('会话不存在')) {
        sendError(res, error.message, 404);
      } else {
        sendError(res, error.message, 500);
      }
    }
  }

  // 生成人格档案
  async generateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const profile = await interviewService.generateProfile(sessionId);
      sendSuccess(res, profile, '档案生成成功');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 获取用户所有档案
  async getUserProfiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const profiles = await interviewService.getUserProfiles(userId);
      sendSuccess(res, profiles);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 获取单个档案
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { profileId } = req.params;

      const profile = await interviewService.getProfile(profileId);

      if (!profile) {
        sendError(res, '档案不存在', 404);
        return;
      }

      sendSuccess(res, profile);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const interviewController = new InterviewController();
