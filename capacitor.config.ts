import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinematicmirror.app',
  appName: '影中镜',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  server: {
    iosScheme: 'capacitor'
  }
};

export default config;
