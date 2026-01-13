import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.signalry.app',
  appName: 'Signalry',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
