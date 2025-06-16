
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e66958fa9ba547fb9bdfb09a8f38937f',
  appName: 'reel-realm-discoveries',
  webDir: 'dist',
  server: {
    url: "https://e66958fa-9ba5-47fb-9bdf-b09a8f38937f.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
