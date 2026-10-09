import type { CapacitorConfig } from '@capacitor/cli';

// Android app shell around the same web build. Everything is bundled into the APK from dist/,
// so the app works fully offline from the first launch (no server.url, no remote content).
const config: CapacitorConfig = {
  appId: 'com.fluxogen.ease',
  appName: 'Ease',
  webDir: 'dist',
  android: {
    // Ship only HTTPS-local content; no cleartext traffic, no mixed content.
    allowMixedContent: false,
    // Unset = inspectable in debug builds only (chrome://inspect); release builds are never inspectable.
  },
  plugins: {
    SystemBars: {
      // The WebView is laid out between the status and navigation bars, so CSS insets are 0.
      insetsHandling: 'native',
      style: 'DEFAULT',
    },
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 0,
    },
  },
};

export default config;
