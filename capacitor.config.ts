import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yenimovie.app',
  appName: 'YENI MOVIE',
  webDir: 'dist',
  server: {
    url: "https://e66958fa-9ba5-47fb-9bdf-b09a8f38937f.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1a1a1a"
    }
  }
};

export default config;
