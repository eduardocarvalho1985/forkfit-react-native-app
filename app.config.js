const getBundleId = () => {
  // This function reads the build profile from eas.json and returns the correct bundle ID.
  const profile = process.env.EAS_BUILD_PROFILE;
  console.log(`🔍 getBundleId: EAS_BUILD_PROFILE = "${profile}"`);

  // For 'development' builds (e.g., for Expo Go or internal testing builds)
  if (profile === 'development') {
    return 'forkfit.app.forkfitdev';
  }

  // For 'preview' builds (e.g., for TestFlight)
  if (profile === 'preview') {
    return 'forkfit.app.forkfitpreview';
  }

  // For 'production' builds (the final App Store version)
  if (profile === 'production') {
    return 'forkfit.app.forkfitprod';
  }

  // Default case - if no profile is set, assume development for local builds
  console.log(`⚠️ No EAS_BUILD_PROFILE set, defaulting to development bundle ID`);
  return 'forkfit.app.forkfitdev';
};

const getPackageName = () => {
  // This function reads the build profile from eas.json and returns the correct package name.
  const profile = process.env.EAS_BUILD_PROFILE;
  console.log(`🔍 getPackageName: EAS_BUILD_PROFILE = "${profile}"`);

  // For 'development' builds (internal testing)
  if (profile === 'development') {
    return 'forkfit.app.forkfitdev';
  }

  // For 'preview' builds (internal testing builds)
  if (profile === 'preview') {
    return 'forkfit.app.forkfitpreview';
  }

  // For 'production' builds (Google Play Store version)
  if (profile === 'production') {
    return 'forkfit.app.forkfitprod';
  }

  // Default case - if no profile is set, assume development for local builds
  console.log(`⚠️ No EAS_BUILD_PROFILE set, defaulting to development package name`);
  return 'forkfit.app.forkfitdev';
};

// ✅ ADD: Validation function for iOS
const validateBundleId = () => {
  const bundleId = getBundleId();
  console.log(`🔧 Building for profile: ${process.env.EAS_BUILD_PROFILE || 'default'}`);
  console.log(`📱 Using bundle ID: ${bundleId}`);
  return bundleId;
};

// ✅ ADD: Validation function for Android
const validatePackageName = () => {
  const packageName = getPackageName();
  console.log(`🔧 Building for profile: ${process.env.EAS_BUILD_PROFILE || 'default'}`);
  console.log(`🤖 Using package name: ${packageName}`);
  return packageName;
};

// ✅ ADD: Dynamic API URL configuration function
const getApiUrl = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  let apiUrl;
  
  if (profile === 'development') {
    // Use dev API URL from EAS secret
    apiUrl = process.env.API_URL_DEV || 'https://api.dev.forkfit.app/api';
  } else if (profile === 'preview') {
    // Preview uses dev environment for testing
    apiUrl = process.env.API_URL_DEV || 'https://api.dev.forkfit.app/api';
  } else if (profile === 'production') {
    // Production uses prod API URL from EAS secret
    apiUrl = process.env.API_URL_PROD || 'https://api.forkfit.app/api';
  } else {
    // Default case - use dev API for local development
    console.log(`⚠️ No EAS_BUILD_PROFILE set, defaulting to dev API URL`);
    apiUrl = process.env.API_URL_DEV || 'https://api.dev.forkfit.app/api';
  }
  
  console.log(`🌐 API URL for ${profile || 'default'} profile: ${apiUrl}`);
  return apiUrl;
};

// ✅ ADD: RevenueCat API key configuration
const getRevenueCatApiKey = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  
  // For EAS builds, use environment variable
  if (process.env.REVENUECAT_IOS_API_KEY) {
    console.log(`💰 RevenueCat API key for ${profile || 'default'} profile: configured from EAS secret`);
    console.log(`🏗️ RevenueCat will use ${profile === 'production' ? 'PRODUCTION' : 'SANDBOX'} mode based on app signing`);
    return process.env.REVENUECAT_IOS_API_KEY;
  }
  
  // For local development builds, use hardcoded development API key
  if (profile === 'development' || !profile) {
    console.log(`💰 RevenueCat API key for development: using hardcoded dev key`);
    console.log(`🏗️ RevenueCat will use SANDBOX mode for development`);
    return 'appl_LJonjokkwRzzWYOjFsByehjGJil';
  }
  
  // For other profiles without EAS secret, return undefined
  console.log(`⚠️ RevenueCat API key missing for ${profile} profile`);
  console.log(`📝 To test RevenueCat: Use eas build --profile ${profile} --platform ios`);
  console.log(`🏗️ RevenueCat will use ${profile === 'production' ? 'PRODUCTION' : 'SANDBOX'} mode based on app signing`);
  return undefined;
};

// ✅ ADD: Dynamic Firebase configuration functions
const getFirebaseConfig = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  let config;
  
  if (profile === 'development') {
    config = {
      ios: './firebase-ios-config/dev/GoogleService-Info.plist',
      android: './android/app/src/development/google-services.json'
    };
  } else if (profile === 'preview') {
    config = {
      ios: './firebase-ios-config/preview/GoogleService-Info.plist',
      android: './android/app/src/preview/google-services.json'
    };
  } else {
    // Default to production
    config = {
      ios: './firebase-ios-config/prod/GoogleService-Info.plist',
      android: './android/app/src/production/google-services.json'
    };
  }
  
  console.log(`🔥 Firebase config for ${profile || 'default'} profile:`);
  console.log(`   iOS: ${config.ios}`);
  console.log(`   Android: ${config.android}`);
  
  return config;
};

export default {
  expo: {
    name: process.env.APP_NAME || 'ForkFit',
    slug: 'forkfit',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'forkfit',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    packagerOpts: {
      dev: true,
      strict: false,
      minify: false
    },
    ios: {
      supportsTablet: true,
      googleServicesFile: getFirebaseConfig().ios,
      bundleIdentifier: validateBundleId(),  // ✅ Updated to use validation
      // buildNumber: '1', // Remove this - will be managed remotely
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      usesAppleSignIn: true,
      entitlements: {
        'com.apple.developer.applesignin': ['Default']
      }
    },
    android: {
      googleServicesFile: getFirebaseConfig().android,
      package: validatePackageName(),  // ✅ Updated to use validation
      // versionCode: 1, // Remove this - will be managed remotely
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ff725e'
      },
      edgeToEdgeEnabled: true,
      useNextNotificationsApi: true,
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.POST_NOTIFICATIONS'
      ]
    },
    platforms: ['ios', 'android'],
    plugins: [
      'expo-router',
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      'expo-secure-store',
      // Apple authentication plugin removed to fix Android build issues
      // The library is still available for use in code, but not as a config plugin
      'expo-camera',
      [
        'expo-image-picker',
        {
          photosPermission: 'O ForkFit acessa suas fotos para permitir a análise de alimentos com IA.',
          cameraPermission: 'O ForkFit acessa sua câmera para tirar fotos de alimentos para análise com IA.',
          microphonePermission: false
        }
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        }
      ],
      'expo-web-browser',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static'
          }
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#FF725E'
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: 'b02a1a41-6a08-4170-aaf0-e48a411490b9'
      },
      // ✅ ADD: Dynamic API URL and build profile for runtime access
      API_URL: getApiUrl(),
      BUILD_PROFILE: process.env.EAS_BUILD_PROFILE || 'unknown',
      // ✅ ADD: RevenueCat API key with environment management
      revenueCatIosApiKey: getRevenueCatApiKey(),
    },
    owner: 'forkfit-app'
  }
};
