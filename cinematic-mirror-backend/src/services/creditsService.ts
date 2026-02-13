// =====================================================
// 影中镜 - 积分服务
// =====================================================

import supabase from '../config/supabase';

// 积分配置
export const CREDITS_CONFIG = {
    INITIAL_CREDITS: 100,           // 新用户初始积分
    FREE_INTERVIEWS: 3,             // 免费试镜次数
    INTERVIEW_COST: 30,             // 试镜消耗积分（第4次起）
    CONSULTATION_COST: 20,          // 导演咨询消耗积分
};

// 积分套餐（双语 + 双币种）
export const CREDIT_PACKAGES = [
    { id: 'credits_small', credits: 50, priceCNY: 6, priceUSD: 0.99, label: '体验装', labelEn: 'Starter' },
    { id: 'credits_medium', credits: 200, priceCNY: 18, priceUSD: 2.99, label: '进阶装', labelEn: 'Pro' },
    { id: 'credits_large', credits: 400, priceCNY: 30, priceUSD: 3.99, label: '大师装', labelEn: 'Master' },
];

// 月会员配置
export const MEMBERSHIP_CONFIG = {
    productId: 'pro_monthly',
    priceCNY: 30,
    priceUSD: 3.99,
    label: '月度会员',
    labelEn: 'Monthly Pro',
    benefits: {
        monthlyInterviews: 5,         // 每月免费试镜次数
        monthlyConsultations: 10,      // 每月免费导演咨询次数
        monthlyBonusCredits: 100,      // 每月赠送积分
    },
    benefitLabels: {
        zh: [
            '每月 5 次免费试镜',
            '每月 10 次免费导演咨询',
            '每月赠送 100 积分',
            '会员专属标识',
        ],
        en: [
            '5 free auditions per month',
            '10 free director consultations per month',
            '100 bonus credits monthly',
            'Exclusive member badge',
        ],
    },
};

export interface UserCredits {
    id: string;
    user_id: string;
    balance: number;
    total_interviews: number;
    created_at: string;
    updated_at: string;
}

export interface CreditTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'purchase' | 'consume_interview' | 'consume_consultation' | 'bonus' | 'initial' | 'membership_bonus';
    description: string;
    created_at: string;
}

export class CreditsService {
    // 获取用户积分余额 + 会员状态
    async getBalance(userId: string): Promise<{ balance: number; totalInterviews: number; isMember: boolean; memberExpiry: string | null }> {
        const { data, error } = await supabase
            .from('user_credits')
            .select('balance, total_interviews')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // 如果不存在，创建初始记录
            await this.initializeCredits(userId);
            return { balance: CREDITS_CONFIG.INITIAL_CREDITS, totalInterviews: 0, isMember: false, memberExpiry: null };
        }

        // 检查会员状态：查看最近30天内是否有 membership_bonus 交易
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: memberTx } = await supabase
            .from('credit_transactions')
            .select('created_at')
            .eq('user_id', userId)
            .eq('type', 'membership_bonus')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        let isMember = false;
        let memberExpiry: string | null = null;

        if (memberTx && memberTx.length > 0) {
            isMember = true;
            const purchaseDate = new Date(memberTx[0].created_at);
            purchaseDate.setDate(purchaseDate.getDate() + 30);
            memberExpiry = purchaseDate.toISOString();
        }

        return { balance: data.balance, totalInterviews: data.total_interviews, isMember, memberExpiry };
    }

    // 为新用户初始化积分
    async initializeCredits(userId: string): Promise<void> {
        const { error: creditsError } = await supabase
            .from('user_credits')
            .insert({
                user_id: userId,
                balance: CREDITS_CONFIG.INITIAL_CREDITS,
                total_interviews: 0,
            });

        if (creditsError && !creditsError.message.includes('duplicate')) {
            console.error('Failed to initialize credits:', creditsError);
        }

        // 记录初始积分交易
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            amount: CREDITS_CONFIG.INITIAL_CREDITS,
            type: 'initial',
            description: '新用户注册奖励',
        });
    }

    // 检查是否可以开始试镜
    async canStartInterview(userId: string): Promise<{ allowed: boolean; reason?: string; cost: number }> {
        const { balance, totalInterviews } = await this.getBalance(userId);

        // 前3次免费
        if (totalInterviews < CREDITS_CONFIG.FREE_INTERVIEWS) {
            return { allowed: true, cost: 0 };
        }

        // 第4次起需要积分
        if (balance >= CREDITS_CONFIG.INTERVIEW_COST) {
            return { allowed: true, cost: CREDITS_CONFIG.INTERVIEW_COST };
        }

        return {
            allowed: false,
            reason: `积分不足，需要 ${CREDITS_CONFIG.INTERVIEW_COST} 积分，当前余额 ${balance}`,
            cost: CREDITS_CONFIG.INTERVIEW_COST,
        };
    }

    // 检查是否可以开始咨询
    async canStartConsultation(userId: string): Promise<{ allowed: boolean; reason?: string; cost: number }> {
        const { balance } = await this.getBalance(userId);

        if (balance >= CREDITS_CONFIG.CONSULTATION_COST) {
            return { allowed: true, cost: CREDITS_CONFIG.CONSULTATION_COST };
        }

        return {
            allowed: false,
            reason: `积分不足，需要 ${CREDITS_CONFIG.CONSULTATION_COST} 积分，当前余额 ${balance}`,
            cost: CREDITS_CONFIG.CONSULTATION_COST,
        };
    }

    // 扣除积分（试镜）
    async deductInterviewCredits(userId: string): Promise<void> {
        const { balance, totalInterviews } = await this.getBalance(userId);

        // 更新总试镜次数
        const newInterviewCount = totalInterviews + 1;

        // 前3次免费不扣积分
        if (totalInterviews < CREDITS_CONFIG.FREE_INTERVIEWS) {
            await supabase
                .from('user_credits')
                .update({
                    total_interviews: newInterviewCount,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
            return;
        }

        // 第4次起扣除积分
        const newBalance = balance - CREDITS_CONFIG.INTERVIEW_COST;

        await supabase
            .from('user_credits')
            .update({
                balance: newBalance,
                total_interviews: newInterviewCount,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        // 记录交易
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            amount: -CREDITS_CONFIG.INTERVIEW_COST,
            type: 'consume_interview',
            description: `试镜消耗（第${newInterviewCount}次）`,
        });
    }

    // 扣除积分（咨询）
    async deductConsultationCredits(userId: string): Promise<void> {
        const { balance } = await this.getBalance(userId);
        const newBalance = balance - CREDITS_CONFIG.CONSULTATION_COST;

        await supabase
            .from('user_credits')
            .update({
                balance: newBalance,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        // 记录交易
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            amount: -CREDITS_CONFIG.CONSULTATION_COST,
            type: 'consume_consultation',
            description: '导演咨询消耗',
        });
    }

    // 充值积分
    async addCredits(userId: string, amount: number, productId: string, txType: 'purchase' | 'membership_bonus' = 'purchase'): Promise<void> {
        const { balance } = await this.getBalance(userId);
        const newBalance = balance + amount;

        await supabase
            .from('user_credits')
            .update({
                balance: newBalance,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        // 记录交易
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            amount,
            type: txType,
            description: txType === 'membership_bonus' ? '月度会员赠送积分' : `购买积分包: ${productId}`,
        });
    }

    // 获取积分变动历史
    async getTransactionHistory(userId: string, limit = 20): Promise<CreditTransaction[]> {
        const { data, error } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Failed to get transaction history:', error);
            return [];
        }

        return data || [];
    }
}

export const creditsService = new CreditsService();
