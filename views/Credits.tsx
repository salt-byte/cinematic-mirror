import React, { useState, useEffect } from 'react';
import { getCreditsBalance, verifyPurchase, CreditsBalance } from '../apiService';
import { purchaseProduct, isNativePlatform, isStoreKitAvailable, restorePurchases, PurchaseResult } from '../services/storeKitService';
import { useLanguage } from '../i18n/LanguageContext';
import { ParchmentCard, Tape } from '../components/ParchmentCard';

interface CreditsProps {
    onClose: () => void;
    language?: 'zh' | 'en';
}

export default function Credits({ onClose }: CreditsProps) {
    const { language } = useLanguage();
    const [credits, setCredits] = useState<CreditsBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [storeKitReady, setStoreKitReady] = useState(false);

    const isEn = language === 'en';
    const txt = (zh: string, en: string) => isEn ? en : zh;
    const price = (cny: number, usd: number) => isEn ? `$${usd}` : `¥${cny}`;

    useEffect(() => {
        loadCredits();
        checkStoreKit();
    }, []);

    const checkStoreKit = async () => {
        const available = await isStoreKitAvailable();
        setStoreKitReady(available);
    };

    const loadCredits = async () => {
        try {
            setLoading(true);
            const data = await getCreditsBalance();
            setCredits(data);
        } catch (err: any) {
            setError(err.message || txt('加载失败', 'Failed to load'));
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        if (!isNativePlatform()) {
            setError(txt(
                '网页版暂不支持购买，请在 iOS App 内购买',
                'Purchases are only available in the iOS app.'
            ));
            setTimeout(() => setError(null), 3000);
            return;
        }

        setPurchasing(packageId);
        setError(null);
        setSuccessMessage(null);

        try {
            const result: PurchaseResult = await purchaseProduct(packageId);
            if (!result.success) {
                if (result.cancelled) return;
                throw new Error(txt('购买失败', 'Purchase failed'));
            }

            const verifyResult = await verifyPurchase(
                packageId,
                result.transactionId || '',
                result.receipt || ''
            );

            if (credits) {
                setCredits({ ...credits, balance: verifyResult.newBalance });
            }

            setSuccessMessage(txt(
                `购买成功！获得 ${verifyResult.creditsAdded} 积分`,
                `Success! +${verifyResult.creditsAdded} credits`
            ));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || txt('购买失败', 'Purchase failed'));
        } finally {
            setPurchasing(null);
        }
    };

    const handleSubscribe = async () => {
        if (!isNativePlatform()) {
            setError(txt(
                '订阅仅在 iOS App 内可用',
                'Subscriptions are only available in the iOS app.'
            ));
            setTimeout(() => setError(null), 3000);
            return;
        }

        const membershipId = credits?.membership?.productId || 'membership_monthly';
        setPurchasing(membershipId);
        setError(null);

        try {
            const result: PurchaseResult = await purchaseProduct(membershipId);
            if (!result.success) {
                if (result.cancelled) return;
                throw new Error(txt('订阅失败', 'Subscription failed'));
            }

            const verifyResult = await verifyPurchase(
                membershipId,
                result.transactionId || '',
                result.receipt || ''
            );

            if (credits) {
                setCredits({ ...credits, balance: verifyResult.newBalance });
            }

            setSuccessMessage(txt('订阅成功！会员权益已生效', 'Subscribed! Benefits are now active'));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || txt('订阅失败', 'Subscription failed'));
        } finally {
            setPurchasing(null);
        }
    };

    const handleRestore = async () => {
        if (!isNativePlatform()) {
            setError(txt('恢复购买仅在 iOS App 内可用', 'Restore is only available in the iOS app.'));
            setTimeout(() => setError(null), 3000);
            return;
        }
        setRestoring(true);
        setError(null);
        try {
            const transactions = await restorePurchases();
            setSuccessMessage(transactions.length === 0
                ? txt('没有可恢复的购买记录', 'No purchases to restore')
                : txt(`已恢复 ${transactions.length} 笔交易`, `Restored ${transactions.length} transactions`)
            );
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || txt('恢复失败', 'Restore failed'));
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-parchment-base min-h-screen pb-24 overflow-y-auto no-scrollbar">
            {/* 头部 */}
            <header className="px-6 pt-6 pb-4 flex items-center gap-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1 px-3 py-1.5 bg-walnut/10 hover:bg-walnut/20 rounded-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px] text-walnut/60">arrow_back</span>
                    <span className="text-[10px] font-bold text-walnut/60 tracking-wider uppercase">
                        {txt('返回', 'Back')}
                    </span>
                </button>
                <div className="flex-1 text-center">
                    <div className="text-[8px] font-mono tracking-[0.6em] text-walnut/30 uppercase">
                        {txt('影中镜 · 积分中心', 'CINEMATIC MIRROR · CREDITS')}
                    </div>
                    <h2 className="text-lg font-retro font-black text-walnut tracking-[0.15em]">
                        {txt('积分中心', 'Credits Center')}
                    </h2>
                </div>
                <div className="w-[60px]" />
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-walnut/40 font-serif italic text-sm">{txt('加载中...', 'Loading...')}</span>
                </div>
            ) : error && !credits ? (
                <div className="flex-1 flex flex-col items-center justify-center px-8 gap-3">
                    <span className="material-symbols-outlined text-3xl text-walnut/20">error_outline</span>
                    <p className="text-walnut/50 text-sm">{error}</p>
                    <button onClick={loadCredits} className="text-vintageRed text-xs font-bold tracking-wider uppercase">
                        {txt('重试', 'Retry')}
                    </button>
                </div>
            ) : credits && (
                <div className="px-6 space-y-6">
                    {/* 余额卡片 */}
                    <ParchmentCard rotation="" className="p-6 shadow-stack relative overflow-hidden">
                        <Tape className="-top-3 -right-5 w-16 rotate-[25deg] opacity-40" />
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-[9px] font-mono text-walnut/40 uppercase tracking-wider mb-1">
                                    {txt('当前积分', 'Current Credits')}
                                </div>
                                <div className="text-5xl font-retro font-black text-walnut leading-none">
                                    {credits.balance}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="text-[10px] text-walnut/50 font-serif">
                                    {txt('已完成试镜', 'Interviews')}: <strong className="text-walnut">{credits.totalInterviews}</strong>
                                </div>
                                {credits.freeInterviewsRemaining > 0 && (
                                    <div className="text-[10px] text-vintageRed font-serif font-bold">
                                        {txt(`剩余 ${credits.freeInterviewsRemaining} 次免费`, `${credits.freeInterviewsRemaining} free left`)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-walnut/10 grid grid-cols-2 gap-3">
                            <div className="text-[10px] text-walnut/50 font-serif flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-vintageRed/50">theater_comedy</span>
                                {txt('试镜', 'Interview')}: <strong className="text-walnut">{credits.config.INTERVIEW_COST}</strong>{txt('积分/次', '/each')}
                            </div>
                            <div className="text-[10px] text-walnut/50 font-serif flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-vintageRed/50">videocam</span>
                                {txt('咨询', 'Consult')}: <strong className="text-walnut">{credits.config.CONSULTATION_COST}</strong>{txt('积分/次', '/each')}
                            </div>
                        </div>
                    </ParchmentCard>

                    {/* 成功/错误消息 */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 p-3 text-center text-green-700 text-sm font-serif">
                            ✓ {successMessage}
                        </div>
                    )}
                    {error && credits && (
                        <div className="bg-red-50 border border-red-200 p-3 text-center text-red-600 text-sm font-serif">
                            {error}
                        </div>
                    )}

                    {/* ========== 月会员卡片 ========== */}
                    {credits.membership && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="h-[1px] flex-1 bg-walnut/10" />
                                <h3 className="text-[10px] font-retro font-black text-walnut/50 tracking-[0.4em] uppercase">
                                    {txt('月度会员', 'Monthly Pro')}
                                </h3>
                                <div className="h-[1px] flex-1 bg-walnut/10" />
                            </div>

                            <div className="relative bg-gradient-to-br from-walnut/[0.06] to-vintageRed/[0.04] border-2 border-vintageRed/20 p-6 shadow-md overflow-hidden">
                                {/* 角标 */}
                                <div className="absolute top-0 right-0 bg-vintageRed text-parchment-base text-[7px] font-bold tracking-widest uppercase px-4 py-1">
                                    {txt('推荐', 'RECOMMENDED')}
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-3xl">👑</div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-retro font-black text-walnut tracking-wider">
                                            {txt(credits.membership.label, credits.membership.labelEn)}
                                        </h4>
                                        <div className="text-vintageRed text-xl font-black mt-1">
                                            {price(credits.membership.priceCNY, credits.membership.priceUSD)}
                                            <span className="text-[11px] text-walnut/40 font-normal ml-1">
                                                /{txt('月', 'mo')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 权益列表 */}
                                <div className="space-y-2.5 mb-5">
                                    {(isEn ? credits.membership.benefitLabels.en : credits.membership.benefitLabels.zh).map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-[12px] text-walnut/70 font-serif">
                                            <span className="text-vintageRed text-[10px]">✦</span>
                                            {benefit}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubscribe}
                                    disabled={purchasing !== null || restoring}
                                    className={`w-full py-3.5 font-retro font-black text-sm tracking-[0.2em] uppercase transition-all ${purchasing === credits.membership.productId
                                            ? 'bg-walnut/20 text-walnut/50'
                                            : 'bg-vintageRed text-parchment-base shadow-lg hover:shadow-xl active:translate-y-0.5'
                                        } ${purchasing !== null && purchasing !== credits.membership.productId ? 'opacity-40' : ''}`}
                                >
                                    {purchasing === credits.membership.productId
                                        ? txt('处理中...', 'Processing...')
                                        : txt('立即订阅', 'Subscribe Now')}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ========== 积分套餐 ========== */}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-[1px] flex-1 bg-walnut/10" />
                        <h3 className="text-[10px] font-retro font-black text-walnut/50 tracking-[0.4em] uppercase">
                            {txt('积分套餐', 'Credit Packages')}
                        </h3>
                        <div className="h-[1px] flex-1 bg-walnut/10" />
                    </div>

                    {/* 非原生平台提示 */}
                    {!isNativePlatform() && (
                        <div className="bg-walnut/5 border border-walnut/10 p-4 text-center">
                            <span className="material-symbols-outlined text-walnut/30 text-xl mb-2 block">phone_iphone</span>
                            <p className="text-[11px] text-walnut/50 font-serif">
                                {txt('购买功能仅在 iOS App 内可用', 'Purchases are only available in the iOS app')}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {credits.packages.map((pkg, idx) => {
                            const isBest = idx === 1;
                            return (
                                <div
                                    key={pkg.id}
                                    className={`relative bg-white border p-5 transition-all active:scale-[0.98] ${isBest ? 'border-vintageRed/30 shadow-md' : 'border-walnut/10 shadow-sm'
                                        }`}
                                >
                                    {isBest && (
                                        <div className="absolute -top-2 right-4 bg-walnut text-parchment-base text-[8px] font-bold tracking-widest uppercase px-3 py-0.5">
                                            {txt('超值', 'BEST VALUE')}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-retro font-black text-walnut tracking-wider">
                                                {txt(pkg.label, pkg.labelEn)}
                                            </div>
                                            <div className="text-[11px] text-walnut/50 font-serif mt-0.5">
                                                <span className="text-vintageRed font-bold text-lg">{pkg.credits}</span>
                                                <span className="ml-1">{txt('积分', 'credits')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePurchase(pkg.id)}
                                            disabled={purchasing !== null || restoring}
                                            className={`px-5 py-2.5 font-black text-xs tracking-wider uppercase transition-all ${purchasing === pkg.id
                                                    ? 'bg-walnut/20 text-walnut/50'
                                                    : 'bg-walnut text-parchment-base shadow-md hover:shadow-lg active:translate-y-0.5'
                                                } ${(purchasing !== null && purchasing !== pkg.id) || restoring ? 'opacity-40' : ''}`}
                                        >
                                            {purchasing === pkg.id
                                                ? txt('处理中...', 'Processing...')
                                                : price(pkg.priceCNY, pkg.priceUSD)}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 恢复购买 */}
                    {isNativePlatform() && (
                        <div className="text-center pt-2">
                            <button
                                onClick={handleRestore}
                                disabled={restoring || purchasing !== null}
                                className={`text-[11px] text-walnut/40 font-serif underline underline-offset-4 decoration-walnut/20 hover:text-walnut/60 transition-colors ${restoring || purchasing !== null ? 'opacity-40 cursor-not-allowed' : ''
                                    }`}
                            >
                                {restoring ? txt('恢复中...', 'Restoring...') : txt('恢复购买', 'Restore Purchases')}
                            </button>
                        </div>
                    )}

                    {/* 底部说明 */}
                    <div className="text-[9px] text-walnut/30 font-serif text-center leading-relaxed pb-4 space-y-1">
                        <p>{txt(
                            '购买后积分立即到账 · 订阅可随时取消 · 由 Apple 安全处理',
                            'Credits added instantly · Cancel subscription anytime · Secured by Apple'
                        )}</p>
                        {!storeKitReady && isNativePlatform() && (
                            <p className="text-orange-400">
                                ⚠ {txt('StoreKit 未就绪，请检查网络', 'StoreKit not ready, check connection')}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
