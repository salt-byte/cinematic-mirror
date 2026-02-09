import { Router, Request, Response } from 'express';
import { creditsService, CREDITS_CONFIG, CREDIT_PACKAGES } from '../services/creditsService';
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

// 验证购买并充值（iOS 内购回调）
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { productId, transactionId } = req.body;

        if (!productId || !transactionId) {
            return res.status(400).json({ success: false, error: '缺少购买信息' });
        }

        // 查找对应的积分包
        const creditPackage = CREDIT_PACKAGES.find(p => p.id === productId);
        if (!creditPackage) {
            return res.status(400).json({ success: false, error: '无效的产品ID' });
        }

        // TODO: 在生产环境中，这里应该验证 Apple 的购买收据
        // 目前简化处理，直接增加积分
        await creditsService.addCredits(userId, creditPackage.credits, productId);

        const { balance } = await creditsService.getBalance(userId);

        res.json({
            success: true,
            data: {
                creditsAdded: creditPackage.credits,
                newBalance: balance,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
