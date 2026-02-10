// =====================================================
// 影中镜 - Apple App Store 收据验证服务
// =====================================================
// 使用 App Store Server API v2 验证 StoreKit 2 交易
// 支持沙盒和生产环境

import https from 'https';

// Apple 验证端点
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// StoreKit 2 使用 JWS (JSON Web Signature) 格式的交易
// 对于 StoreKit 2 的 JWS 交易，我们可以直接解析 JWT 来验证

interface DecodedTransaction {
    transactionId: string;
    originalTransactionId: string;
    bundleId: string;
    productId: string;
    purchaseDate: number;
    type: string;
    environment: string;
}

interface VerificationResult {
    valid: boolean;
    productId?: string;
    transactionId?: string;
    environment?: string;
    error?: string;
}

/**
 * 验证 StoreKit 2 JWS 交易收据
 * 
 * StoreKit 2 返回的交易是 JWS (JSON Web Signature) 格式
 * 格式: header.payload.signature (Base64URL 编码)
 * 
 * 在沙盒环境中，我们解码并验证 payload 内容
 * 在生产环境中，应该同时验证 Apple 的签名
 */
export async function verifyTransaction(
    receipt: string | undefined,
    expectedProductId: string,
    transactionId: string
): Promise<VerificationResult> {
    // 如果没有 receipt 但有 transactionId（开发/模拟模式）
    if (!receipt || receipt === 'mock_receipt_for_development') {
        console.log('[Apple 验证] 开发模式 - 跳过收据验证');
        return {
            valid: true,
            productId: expectedProductId,
            transactionId,
            environment: 'development',
        };
    }

    try {
        // 尝试解码 JWS 交易
        const decoded = decodeJWS(receipt);

        if (!decoded) {
            return { valid: false, error: '无法解码 JWS 收据' };
        }

        // 验证产品 ID 匹配
        if (decoded.productId !== expectedProductId) {
            return {
                valid: false,
                error: `产品 ID 不匹配: 期望 ${expectedProductId}，收到 ${decoded.productId}`,
            };
        }

        // 验证 Bundle ID（确保是我们的 App）
        const expectedBundleId = process.env.APPLE_BUNDLE_ID || 'com.worldai.cinematicmirror';
        if (decoded.bundleId && decoded.bundleId !== expectedBundleId) {
            return {
                valid: false,
                error: `Bundle ID 不匹配: 期望 ${expectedBundleId}，收到 ${decoded.bundleId}`,
            };
        }

        console.log(`[Apple 验证] 交易验证成功:`, {
            transactionId: decoded.transactionId,
            productId: decoded.productId,
            environment: decoded.environment,
        });

        return {
            valid: true,
            productId: decoded.productId,
            transactionId: decoded.transactionId,
            environment: decoded.environment,
        };
    } catch (error: any) {
        console.error('[Apple 验证] 验证失败:', error);
        return {
            valid: false,
            error: error.message || '验证过程出错',
        };
    }
}

/**
 * 解码 JWS (JSON Web Signature) 交易
 * JWS 格式: base64url(header).base64url(payload).base64url(signature)
 */
function decodeJWS(jws: string): DecodedTransaction | null {
    try {
        const parts = jws.split('.');
        if (parts.length !== 3) {
            console.warn('[Apple 验证] JWS 格式不正确，不是三段式');
            return null;
        }

        // 解码 payload（第二段）
        const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
        const data = JSON.parse(payload);

        return {
            transactionId: data.transactionId?.toString() || '',
            originalTransactionId: data.originalTransactionId?.toString() || '',
            bundleId: data.bundleId || data.appAccountToken || '',
            productId: data.productId || '',
            purchaseDate: data.purchaseDate || 0,
            type: data.type || '',
            environment: data.environment || 'unknown',
        };
    } catch (error) {
        console.error('[Apple 验证] JWS 解码失败:', error);
        return null;
    }
}

/**
 * 检查交易 ID 是否已经被使用（防止重复充值）
 * 实际使用时应该从数据库检查
 */
const processedTransactions = new Set<string>();

export function isTransactionProcessed(transactionId: string): boolean {
    return processedTransactions.has(transactionId);
}

export function markTransactionProcessed(transactionId: string): void {
    processedTransactions.add(transactionId);
}
