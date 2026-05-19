import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atout.app',
  appName: 'Atout',
  webDir: 'dist',

  // En producción el web content se sirve desde los assets de la app
  // En desarrollo se puede apuntar a un server local con livereload
  server: {
    // Usar https:// en Android para que BrowserRouter funcione sin HashRouter
    androidScheme: 'https',
    // Descomentar para desarrollo con hot-reload:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#F8F6FF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinnerDuration: 0,
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      // Barra de estado transparente sobre el contenido
      style: 'LIGHT',
      backgroundColor: '#F8F6FF',
      overlaysWebView: false,
    },
  },

  // Android: configuración extra en AndroidManifest / build.gradle
  android: {
    // Permite que Supabase y la app web funcionen sin ajustes adicionales
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true solo en builds de desarrollo
  },

  // iOS: configuración extra en Info.plist
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    // Limitar la orientación en producción
    preferredContentMode: 'mobile',
  },
};

export default config;
