import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.thekada.app',
  appName: 'Kada Ledger',
  // Point WKWebView to the live production server (Next.js SSR)
  server: {
    url: 'https://thekada.in',
    cleartext: false,
    androidScheme: 'https',
  },
  ios: {
    // Allow WKWebView to scroll content under the status bar
    contentInset: 'always',
    // Scroll view config
    scrollEnabled: true,
    // Minimum iOS version: 16.0
    deploymentTarget: '16.0',
    // Liminal background colour matches app dark bg
    backgroundColor: '#0F172A',
    // Preferred colour scheme follows system
    preferredContentMode: 'mobile',
    // Override back-button with swipe gesture
    allowsBackForwardNavigationGestures: true,
    // Build settings
    scheme: 'Kada Ledger',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
