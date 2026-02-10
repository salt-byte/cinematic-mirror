import Foundation
import Capacitor
import StoreKit

@available(iOS 15.0, *)
@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
    ]
    
    // MARK: - 检查 StoreKit 是否可用
    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": true])
    }
    
    // MARK: - 获取商品信息
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("缺少 productIds 参数")
            return
        }
        
        Task {
            do {
                let products = try await Product.products(for: Set(productIds))
                
                let productList = products.map { product -> [String: Any] in
                    return [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "price": NSDecimalNumber(decimal: product.price).doubleValue,
                        "displayPrice": product.displayPrice,
                        "type": self.productTypeString(product.type),
                    ]
                }
                
                call.resolve(["products": productList])
            } catch {
                call.reject("获取商品失败: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - 购买商品
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("缺少 productId 参数")
            return
        }
        
        Task {
            do {
                // 1. 获取商品
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("未找到商品: \(productId)")
                    return
                }
                
                // 2. 发起购买
                let result = try await product.purchase()
                
                switch result {
                case .success(let verification):
                    // 3. 验证交易
                    switch verification {
                    case .verified(let transaction):
                        // 获取 JWS 收据用于服务端验证
                        let jwsRepresentation = verification.jwsRepresentation
                        
                        // 返回购买结果（先不 finish，等后端验证后再 finish）
                        call.resolve([
                            "success": true,
                            "transactionId": String(transaction.id),
                            "originalTransactionId": String(transaction.originalID),
                            "productId": transaction.productID,
                            "purchaseDate": ISO8601DateFormatter().string(from: transaction.purchaseDate),
                            "receipt": jwsRepresentation,
                            "environment": self.environmentString(transaction),
                        ])
                        
                        // 对于消耗型商品，完成交易
                        await transaction.finish()
                        
                    case .unverified(_, let error):
                        call.reject("交易验证失败: \(error.localizedDescription)")
                    }
                    
                case .pending:
                    call.reject("交易等待审核中（Ask to Buy）")
                    
                case .userCancelled:
                    call.resolve([
                        "success": false,
                        "cancelled": true,
                    ])
                    
                @unknown default:
                    call.reject("未知的购买结果")
                }
            } catch {
                call.reject("购买失败: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - 恢复购买
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                // StoreKit 2 会自动同步所有交易
                try await AppStore.sync()
                
                var restoredTransactions: [[String: Any]] = []
                
                // 遍历所有当前有效的交易
                for await verification in Transaction.currentEntitlements {
                    if case .verified(let transaction) = verification {
                        restoredTransactions.append([
                            "transactionId": String(transaction.id),
                            "productId": transaction.productID,
                            "purchaseDate": ISO8601DateFormatter().string(from: transaction.purchaseDate),
                        ])
                    }
                }
                
                call.resolve([
                    "success": true,
                    "transactions": restoredTransactions,
                ])
            } catch {
                call.reject("恢复购买失败: \(error.localizedDescription)")
            }
        }
    }
    
    // MARK: - 辅助方法
    
    private func productTypeString(_ type: Product.ProductType) -> String {
        switch type {
        case .consumable: return "consumable"
        case .nonConsumable: return "nonConsumable"
        case .autoRenewable: return "autoRenewable"
        case .nonRenewable: return "nonRenewable"
        default: return "unknown"
        }
    }
    
    private func environmentString(_ transaction: Transaction) -> String {
        if #available(iOS 16.0, *) {
            switch transaction.environment {
            case .sandbox: return "sandbox"
            case .production: return "production"
            case .xcode: return "xcode"
            default: return "unknown"
            }
        } else {
            return "unknown"
        }
    }
}
