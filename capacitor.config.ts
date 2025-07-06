import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.playtogether.rundy',
  appName: 'Rundy',
  webDir: 'dist',
  // Si usas servidor externo, descomenta y ajusta esto:
  // server: {
  //   url: 'https://rundy-play-together.lovable.app/',
  //   cleartext: true
  // },
  plugins: {
    StatusBar: {
      overlaysWebView: false,          // <--- Esto evita que el contenido quede debajo de la status bar
      style: "DARK",                   // Cambia a "LIGHT" si tu status bar es oscura
      backgroundColor: "#ffffffff"     // Ajusta el color según tu diseño
    }
  }
};

export default config;
