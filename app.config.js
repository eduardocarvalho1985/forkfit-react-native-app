const getBundleId = () => {
  const appName = process.env.APP_NAME || 'ForkFit';
  
  if (appName.includes('Dev')) {
    return 'forkfit.app.forkfitprod.dev';
  } else if (appName.includes('Preview')) {
    return 'forkfit.app.forkfitprod.preview';
  } else {
    return 'forkfit.app.forkfitprod';
  }
};

const getPackageName = () => {
  const appName = process.env.APP_NAME || 'ForkFit';
  
  if (appName.includes('Dev')) {
    return 'forkfit.app.forkfitprod.dev';
  } else if (appName.includes('Preview')) {
    return 'forkfit.app.forkfitprod.preview';
  } else {
    return 'forkfit.app.forkfitprod';
  }
};

export default {
  expo: {
    name: process.env.APP_NAME || 'ForkFit',
    slug: 'forkfitauthfixed',
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
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO'
      ]
    },
    platforms: ['ios', 'android'],
    plugins: [
      'expo-router',
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      'expo-camera',
      'expo-image-picker',
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
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: '52b9dc85-b309-42c5-b465-37d2f968ef10'
      }
    },
    owner: 'duvoice'
  }
};
