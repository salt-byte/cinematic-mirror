import UIKit
import Capacitor
import StoreKit
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var transactionUpdateTask: Task<Void, Never>?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 配置音频会话：允许麦克风录音 + 从扬声器外放（视频咨询功能需要）
        configureAudioSession()

        // 监听音频路由变化：WKWebView 内 getUserMedia 会重置路由为听筒，需要强制改回扬声器
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioRouteChange(_:)),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )

        // 启动时监听 StoreKit 2 交易更新，防止丢失购买
        if #available(iOS 15.0, *) {
            transactionUpdateTask = Task {
                for await result in Transaction.updates {
                    if case .verified(let transaction) = result {
                        print("[StoreKit] 收到交易更新: \(transaction.productID)")
                        await transaction.finish()
                    }
                }
            }
        }
        return true
    }

    // 统一配置音频会话
    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playAndRecord,
                options: [.defaultToSpeaker, .allowBluetooth]
            )
            try AVAudioSession.sharedInstance().setActive(true)
            // 强制输出到扬声器（覆盖系统默认的听筒路由）
            try AVAudioSession.sharedInstance().overrideOutputAudioPort(.speaker)
        } catch {
            print("[Audio] 音频会话配置失败: \(error)")
        }
    }

    // getUserMedia 激活麦克风后 iOS 会把输出路由改为听筒，在此强制改回扬声器
    @objc private func handleAudioRouteChange(_ notification: Notification) {
        guard let reasonValue = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else { return }

        print("[Audio] 路由变化: \(reason.rawValue)")

        // 新设备接入或旧设备移除时（包括 WKWebView 激活麦克风触发的路由变化）
        switch reason {
        case .newDeviceAvailable, .oldDeviceUnavailable, .categoryChange, .override, .wakeFromSleep, .unknown:
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                do {
                    try AVAudioSession.sharedInstance().overrideOutputAudioPort(.speaker)
                    print("[Audio] 已强制路由到扬声器")
                } catch {
                    print("[Audio] 强制扬声器失败: \(error)")
                }
            }
        default:
            break
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // 从后台回来时重新确保扬声器输出
        configureAudioSession()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
        transactionUpdateTask?.cancel()
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
