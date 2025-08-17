const getBundleId = () => {
  // Use different bundle IDs for different build types to avoid conflicts
  // if (process.env.EAS_BUILD_PROFILE === 'development') {
  //   return 'forkfit.app.forkfitdev';
  // }
  // Both preview and production use the same bundle ID
  return 'forkfit.app.forkfitprod';
};

const getPackageName = () => {
  // Use different package names for different build types to avoid conflicts
  // if (process.env.EAS_BUILD_PROFILE === 'development') {
  //   return 'forkfit.app.forkfitdev';
  // }
  // Both preview and production use the same package name
  return 'forkfit.app.forkfitprod';
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
      googleServicesFile: './GoogleService-Info.plist',
      bundleIdentifier: getBundleId(),
      buildNumber: '1',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      usesAppleSignIn: true
    },
    android: {
      googleServicesFile: './google-services.json',
      package: getPackageName(),
      versionCode: 1,
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
