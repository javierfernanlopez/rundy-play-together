import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.playtogether.rundy',
  appName: 'Rundy',
  webDir: 'dist',
  // 👇 AÑADE ESTA PARTE AQUÍ 👇
//  server: {
//    url: 'https://rundy-play-together.lovable.app/',
//    cleartext: true
//  }
};

export default config;