import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        if #available(iOS 15.0, *) {
            bridge?.registerPluginInstance(StoreKitPlugin())
        }
    }
}
