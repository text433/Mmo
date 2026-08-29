import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.text433.darkfallrpgio',
  appName: 'Darkfall RPG.io',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
