import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jacobhammers.recoverylog',
  appName: 'RecoveryLog',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'recoverylog'
  }
};

export default config;
