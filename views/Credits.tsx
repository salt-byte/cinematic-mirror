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
    const { t, language } = useLanguage();
    const [credits, setCredits] = useState<CreditsBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [storeKitReady, setStoreKitReady] = useState(false);

    const txt = (zh: string, en: string) => language === 'en' ? en : zh;

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
                '网页版暂不支持购买，请在 iOS App 内购买积分',
                'Web purchases are not yet supported. Please purchase credits in the iOS app.'
            ));
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
                setCredits({
                    ...credits,
                    balance: verifyResult.newBalance,
                });
            }

            setSuccessMessage(txt(
                `购买成功！获得 ${verifyResult.creditsAdded} 积分`,
                `Success! Received ${verifyResult.creditsAdded} credits`
            ));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || txt('购买失败', 'Purchase failed'));
        } finally {
            setPurchasing(null);
        }
    };

    const handleRestore = async () => {
        if (!isNativePlatform()) {
            setError(txt(
                '恢复购买仅在 iOS App 内可用',
                'Restore purchases is only available in the iOS app.'
            ));
            return;
        }

        setRestoring(true);
        setError(null);

        try {
            const transactions = await restorePurchases();
            if (transactions.length === 0) {
                setSuccessMessage(txt('没有可恢复的购买记录', 'No purchases to restore'));
            } else {
                setSuccessMessage(txt(
                    `已恢复 ${transactions.length} 笔交易`,
                    `Restored ${transactions.length} transactions`
                ));
            }
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || txt('恢复失败', 'Restore failed'));
        } finally {
            setRestoring(false);
        }
    };

    // 套餐展示信息
    const packageLabels: Record<string, { emoji: string; label: string; labelEn: string; popular?: boolean }> = {
        credits_small: { emoji: '🎬', label: '体验装', labelEn: 'Starter' },
        credits_medium: { emoji: '🎥', label: '进阶装', labelEn: 'Pro', popular: true },
        credits_large: { emoji: '🏆', label: '大师装', labelEn: 'Master' },
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
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="text-center space-y-3">
                        <span className="material-symbols-outlined text-3xl text-walnut/20">error_outline</span>
                        <p className="text-walnut/50 text-sm">{error}</p>
                        <button onClick={loadCredits} className="text-vintageRed text-xs font-bold tracking-wider uppercase">
                            {txt('重试', 'Retry')}
                        </button>
                    </div>
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

                        {/* 消耗说明 */}
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

                    {/* 套餐标题 */}
                    <div className="flex items-center gap-3">
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

                    {/* 套餐列表 */}
                    <div className="space-y-3">
                        {credits.packages.map((pkg) => {
                            const info = packageLabels[pkg.id] || { emoji: '🎬', label: pkg.id, labelEn: pkg.id };
                            return (
                                <div
                                    key={pkg.id}
                                    className={`relative bg-white border p-5 transition-all active:scale-[0.98] ${info.popular
                                            ? 'border-vintageRed/30 shadow-md'
                                            : 'border-walnut/10 shadow-sm'
                                        }`}
                                >
                                    {info.popular && (
                                        <div className="absolute -top-2 right-4 bg-vintageRed text-parchment-base text-[8px] font-bold tracking-widest uppercase px-3 py-0.5">
                                            {txt('推荐', 'BEST')}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">{info.emoji}</div>
                                            <div>
                                                <div className="text-sm font-retro font-black text-walnut tracking-wider">
                                                    {txt(info.label, info.labelEn)}
                                                </div>
                                                <div className="text-[11px] text-walnut/50 font-serif mt-0.5">
                                                    <span className="text-vintageRed font-bold text-lg">{pkg.credits}</span>
                                                    <span className="ml-1">{txt('积分', 'credits')}</span>
                                                </div>
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
                                                : `¥${pkg.price}`}
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
                            '购买后积分立即到账 · 内购由 Apple 安全处理',
                            'Credits added instantly · Payments securely handled by Apple'
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
