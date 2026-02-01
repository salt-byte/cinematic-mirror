import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import type { JwtPayload } from '../types/index.js';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, '未提供认证令牌', 401);
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const payload = verifyToken(token);

  if (!payload) {
    sendError(res, '无效或过期的令牌', 401);
    return;
  }

  req.user = payload;
  next();
}

// 可选认证中间件 - 不强制要求登录，但会解析 token
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
