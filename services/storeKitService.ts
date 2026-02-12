// =====================================================
// 影中镜 - StoreKit 内购服务
// =====================================================
// 封装 Capacitor StoreKit 原生插件调用
// 自动检测运行环境：iOS 原生 vs 浏览器

import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

// StoreKit 原生插件接口
interface StoreKitPluginInterface {
    isAvailable(): Promise<{ available: boolean }>;
    getProducts(options: { productIds: string[] }): Promise<{ products: StoreProduct[] }>;
    purchase(options: { productId: string }): Promise<PurchaseResult>;
    restorePurchases(): Promise<{ success: boolean; transactions: RestoredTransaction[] }>;
}

// 商品信息
export interface StoreProduct {
    id: string;
    displayName: string;
    description: string;
    price: number;
    displayPrice: string;
    type: string;
}

// 购买结果
export interface PurchaseResult {
    success: boolean;
    cancelled?: boolean;
    transactionId?: string;
    originalTransactionId?: string;
    productId?: string;
    purchaseDate?: string;
    receipt?: string;          // JWS 签名的收据，用于服务端验证
    environment?: string;      // sandbox / production / xcode
}

// 恢复的交易
export interface RestoredTransaction {
    transactionId: string;
    productId: string;
    purchaseDate: string;
}

// 所有可购买的产品 ID（与后端 CREDIT_PACKAGES + MEMBERSHIP_CONFIG 一致）
export const PRODUCT_IDS = [
    'credits_small',       // 50 积分 - ¥6
    'credits_medium',      // 200 积分 - ¥18
    'credits_large',       // 400 积分 - ¥30
    'membership_monthly',  // 月度会员 - ¥30/月
];

// 注册原生插件
const StoreKitNative = registerPlugin<StoreKitPluginInterface>('StoreKit');

// =====================================================
// 公共 API
// =====================================================

/**
 * 检查是否在原生 iOS 环境中运行
 */
export function isNativePlatform(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * 检查 StoreKit 是否可用
 */
export async function isStoreKitAvailable(): Promise<boolean> {
    if (!isNativePlatform()) {
        console.log('[StoreKit] 非 iOS 原生环境，使用模拟模式');
        return false;
    }

    try {
        const result = await StoreKitNative.isAvailable();
        return result.available;
    } catch (error) {
        console.warn('[StoreKit] 检查可用性失败:', error);
        return false;
    }
}

/**
 * 获取商品列表
 * 在原生环境中从 App Store 获取，否则返回本地模拟数据
 */
export async function getProducts(): Promise<StoreProduct[]> {
    if (!isNativePlatform()) {
        return getMockProducts();
    }

    try {
        const result = await StoreKitNative.getProducts({ productIds: PRODUCT_IDS });
        return result.products;
    } catch (error) {
        console.warn('[StoreKit] 获取商品失败，回退到本地数据:', error);
        return getMockProducts();
    }
}

/**
 * 购买商品
 * 在原生环境中调用 StoreKit 2，否则使用模拟购买
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!isNativePlatform()) {
        return mockPurchase(productId);
    }

    try {
        const result = await StoreKitNative.purchase({ productId });
        return result;
    } catch (error: any) {
        console.error('[StoreKit] 购买失败:', error);
        throw new Error(error.message || '购买失败，请稍后重试');
    }
}

/**
 * 恢复购买
 */
export async function restorePurchases(): Promise<RestoredTransaction[]> {
    if (!isNativePlatform()) {
        return [];
    }

    try {
        const result = await StoreKitNative.restorePurchases();
        return result.transactions;
    } catch (error: any) {
        console.error('[StoreKit] 恢复购买失败:', error);
        throw new Error(error.message || '恢复购买失败');
    }
}

// =====================================================
// 模拟数据（浏览器环境 & 开发调试用）
// =====================================================

function getMockProducts(): StoreProduct[] {
    return [
        {
            id: 'credits_small',
            displayName: '50 积分',
            description: '获得50积分，可用于试镜和导演咨询',
            price: 6,
            displayPrice: '¥6.00',
            type: 'consumable',
        },
        {
            id: 'credits_medium',
            displayName: '200 积分',
            description: '获得200积分，超值选择',
            price: 18,
            displayPrice: '¥18.00',
            type: 'consumable',
        },
        {
            id: 'credits_large',
            displayName: '400 积分',
            description: '获得400积分，最划算的选择',
            price: 30,
            displayPrice: '¥30.00',
            type: 'consumable',
        },
    ];
}

function mockPurchase(productId: string): PurchaseResult {
    console.log(`[StoreKit] 模拟购买: ${productId}`);
    return {
        success: true,
        transactionId: `mock_${Date.now()}`,
        originalTransactionId: `mock_orig_${Date.now()}`,
        productId,
        purchaseDate: new Date().toISOString(),
        receipt: 'mock_receipt_for_development',
        environment: 'xcode',
    };
}
