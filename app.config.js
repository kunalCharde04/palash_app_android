export default ({ config }) => ({
  ...config,
  name: 'Palash App',
  slug: 'palash-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    // Add the package name here
    package: 'com.priyanshukun.palashapp'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    EXPO_PUBLIC_RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
    EXPO_PUBLIC_RAZORPAY_KEY_SECRET: process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    // Keep the EAS project ID
    eas: {
      projectId: '856d9555-6c3a-4c88-86e9-3e54c1770dd8'
    }
  },
});