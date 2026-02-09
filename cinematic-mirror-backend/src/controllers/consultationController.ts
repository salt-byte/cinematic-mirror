import type { Request, Response } from 'express';
import { consultationService } from '../services/consultationService';
import { interviewService } from '../services/interviewService';
import { sendSuccess, sendError } from '../utils/response';
import type { PersonalityProfile } from '../types/index';

export class ConsultationController {
  // 开始咨询会话
  async startConsultation(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, language, userName } = req.body;

      if (!profileId) {
        sendError(res, '请提供档案ID', 400);
        return;
      }

      // 获取档案
      const profile = await interviewService.getProfile(profileId);

      if (!profile) {
        sendError(res, '档案不存在', 404);
        return;
      }

      const result = await consultationService.startConsultation(profile, language || 'zh', userName);
      sendSuccess(res, result, '咨询开始');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 发送咨询消息
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message) {
        sendError(res, '消息内容不能为空', 400);
        return;
      }

      const response = await consultationService.sendMessage(sessionId, message);
      sendSuccess(res, response);
    } catch (error: any) {
      if (error.message.includes('会话不存在')) {
        sendError(res, error.message, 404);
      } else {
        sendError(res, error.message, 500);
      }
    }
  }

  // 结束咨询会话
  async endConsultation(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      consultationService.endConsultation(sessionId);
      sendSuccess(res, null, '咨询结束');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 获取会话历史
  async getSessionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const history = consultationService.getSessionHistory(sessionId);
      sendSuccess(res, history);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  // 视频聊天
  async videoChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, imageData, profileId, language } = req.body;

      if (!message || !profileId) {
        sendError(res, '请提供消息和档案ID', 400);
        return;
      }

      // 获取档案
      const profile = await interviewService.getProfile(profileId);

      if (!profile) {
        sendError(res, '档案不存在', 404);
        return;
      }

      const response = await consultationService.videoChat(message, imageData || '', profile, language || 'zh');
      sendSuccess(res, { response });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const consultationController = new ConsultationController();
