const getBundleId = () => {
  // This function reads the build profile from eas.json and returns the correct bundle ID.

  // For 'development' builds (e.g., for Expo Go or internal testing builds)
  if (process.env.EAS_BUILD_PROFILE === 'development') {
    return 'forkfit.app.forkfitdev';
  }

  // For 'preview' builds (e.g., for TestFlight)
  if (process.env.EAS_BUILD_PROFILE === 'preview') {
    return 'forkfit.app.forkfitpreview';
  }

  // For 'production' builds (the final App Store version)
  // This also acts as the default.
  return 'forkfit.app.forkfitprod';
};

const getPackageName = () => {
  // This function reads the build profile from eas.json and returns the correct package name.

  // For 'development' builds (internal testing)
  if (process.env.EAS_BUILD_PROFILE === 'development') {
    return 'forkfit.app.forkfitdev';
  }

  // For 'preview' builds (internal testing builds)
  if (process.env.EAS_BUILD_PROFILE === 'preview') {
    return 'forkfit.app.forkfitpreview';
  }

  // For 'production' builds (Google Play Store version)
  // This also acts as the default.
  return 'forkfit.app.forkfitprod';
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
      }
    },
    owner: 'forkfit-app'
  }
};
