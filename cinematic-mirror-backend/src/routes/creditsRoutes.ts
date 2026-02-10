import { Router, Request, Response } from 'express';
import { creditsService, CREDITS_CONFIG, CREDIT_PACKAGES, MEMBERSHIP_CONFIG } from '../services/creditsService';
import { verifyTransaction, isTransactionProcessed, markTransactionProcessed } from '../services/appleVerifyService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 获取积分余额
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { balance, totalInterviews } = await creditsService.getBalance(userId);

        res.json({
            success: true,
            data: {
                balance,
                totalInterviews,
                freeInterviewsRemaining: Math.max(0, CREDITS_CONFIG.FREE_INTERVIEWS - totalInterviews),
                config: CREDITS_CONFIG,
                packages: CREDIT_PACKAGES,
                membership: MEMBERSHIP_CONFIG,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取积分变动历史
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const limit = parseInt(req.query.limit as string) || 20;
        const history = await creditsService.getTransactionHistory(userId, limit);

        res.json({
            success: true,
            data: history,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 检查是否可以开始试镜
router.get('/check/interview', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const result = await creditsService.canStartInterview(userId);

        res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 检查是否可以开始咨询
router.get('/check/consultation', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const result = await creditsService.canStartConsultation(userId);

        res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 验证 Apple 内购并充值积分
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { productId, transactionId, receipt } = req.body;

        if (!productId || !transactionId) {
            return res.status(400).json({ success: false, error: '缺少购买信息' });
        }

        // 1. 查找对应的积分包
        const creditPackage = CREDIT_PACKAGES.find(p => p.id === productId);
        if (!creditPackage) {
            return res.status(400).json({ success: false, error: '无效的产品ID' });
        }

        // 2. 检查交易是否已处理（防止重复充值）
        if (isTransactionProcessed(transactionId)) {
            console.warn(`[积分验证] 交易已处理，拒绝重复请求: ${transactionId}`);
            return res.status(409).json({ success: false, error: '该交易已处理' });
        }

        // 3. 验证 Apple 收据
        const verification = await verifyTransaction(receipt, productId, transactionId);

        if (!verification.valid) {
            console.error(`[积分验证] Apple 收据验证失败:`, verification.error);
            return res.status(403).json({
                success: false,
                error: verification.error || '购买验证失败',
            });
        }

        console.log(`[积分验证] 验证通过 - 用户: ${userId}, 产品: ${productId}, 环境: ${verification.environment}`);

        // 4. 标记交易为已处理
        markTransactionProcessed(transactionId);

        // 5. 增加积分
        await creditsService.addCredits(userId, creditPackage.credits, productId);

        const { balance } = await creditsService.getBalance(userId);

        res.json({
            success: true,
            data: {
                creditsAdded: creditPackage.credits,
                newBalance: balance,
                environment: verification.environment,
            },
        });
    } catch (error: any) {
        console.error('[积分验证] 处理失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
