import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.worldai.cinematicmirror',
  appName: '影中镜',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    scrollEnabled: true,
    preferredContentMode: 'mobile',
    backgroundColor: '#e8d5b5'
  },
  server: {
    iosScheme: 'capacitor'
  }
};

export default config;
