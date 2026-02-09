import React, { useState, useEffect } from 'react';
import { getCreditsBalance, verifyPurchase, CreditsBalance } from '../apiService';

interface CreditsProps {
    onClose: () => void;
    language?: 'zh' | 'en';
}

export default function Credits({ onClose, language = 'zh' }: CreditsProps) {
    const [credits, setCredits] = useState<CreditsBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const t = (zh: string, en: string) => language === 'en' ? en : zh;

    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            setLoading(true);
            const data = await getCreditsBalance();
            setCredits(data);
        } catch (err: any) {
            setError(err.message || t('加载失败', 'Failed to load'));
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        setPurchasing(packageId);
        setError(null);

        try {
            // TODO: 集成真实的 iOS 内购
            // 目前使用模拟的交易 ID
            const mockTransactionId = `mock_${Date.now()}`;

            const result = await verifyPurchase(packageId, mockTransactionId);

            // 更新余额显示
            if (credits) {
                setCredits({
                    ...credits,
                    balance: result.newBalance,
                });
            }

            alert(t(
                `购买成功！获得 ${result.creditsAdded} 积分`,
                `Purchase successful! Received ${result.creditsAdded} credits`
            ));
        } catch (err: any) {
            setError(err.message || t('购买失败', 'Purchase failed'));
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
        }}>
            {/* 头部 */}
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '8px 16px',
                    }}
                >
                    ← {t('返回', 'Back')}
                </button>
                <h1 style={{
                    color: '#fff',
                    fontSize: '18px',
                    margin: 0,
                    fontWeight: 600,
                }}>
                    {t('积分中心', 'Credits Center')}
                </h1>
                <div style={{ width: 60 }} />
            </div>

            {loading ? (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                }}>
                    {t('加载中...', 'Loading...')}
                </div>
            ) : error && !credits ? (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff6b6b',
                }}>
                    {error}
                </div>
            ) : credits && (
                <div style={{ padding: '20px', flex: 1 }}>
                    {/* 余额卡片 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
                            {t('当前积分', 'Current Credits')}
                        </div>
                        <div style={{ color: '#fff', fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>
                            {credits.balance}
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.9)',
                        }}>
                            <div>
                                {t('免费试镜剩余', 'Free Interviews')}：
                                <strong>{credits.freeInterviewsRemaining}</strong>
                                {t('次', '')}
                            </div>
                            <div>
                                {t('已完成试镜', 'Total Interviews')}：
                                <strong>{credits.totalInterviews}</strong>
                                {t('次', '')}
                            </div>
                        </div>
                    </div>

                    {/* 消耗说明 */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                    }}>
                        <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
                            {t('积分消耗说明', 'Credit Usage')}
                        </h3>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.8 }}>
                            <div>• {t('新人生剧本', 'New Profile')}：{t('前3次免费，之后每次', 'First 3 free, then')} <strong style={{ color: '#ffd700' }}>{credits.config.INTERVIEW_COST}</strong> {t('积分', 'credits')}</div>
                            <div>• {t('导演咨询', 'Director Consultation')}：{t('每次', 'Each')} <strong style={{ color: '#ffd700' }}>{credits.config.CONSULTATION_COST}</strong> {t('积分', 'credits')}</div>
                        </div>
                    </div>

                    {/* 套餐列表 */}
                    <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                        {t('积分套餐', 'Credit Packages')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {credits.packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <div>
                                    <div style={{ color: '#ffd700', fontSize: '24px', fontWeight: 700 }}>
                                        {pkg.credits} <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>{t('积分', 'credits')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePurchase(pkg.id)}
                                    disabled={purchasing !== null}
                                    style={{
                                        background: purchasing === pkg.id
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '10px 24px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: purchasing !== null ? 'not-allowed' : 'pointer',
                                        opacity: purchasing !== null && purchasing !== pkg.id ? 0.5 : 1,
                                    }}
                                >
                                    {purchasing === pkg.id ? t('处理中...', 'Processing...') : `¥${pkg.price}`}
                                </button>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: 'rgba(255,107,107,0.2)',
                            borderRadius: '8px',
                            color: '#ff6b6b',
                            fontSize: '13px',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* 底部说明 */}
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px',
                        lineHeight: 1.6,
                    }}>
                        {t(
                            '提示：购买后积分立即到账，如遇问题请联系客服。',
                            'Note: Credits will be added immediately after purchase. Contact support if you have any issues.'
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
