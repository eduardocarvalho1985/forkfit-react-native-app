import { Platform } from 'react-native';

// Platform-specific Apple Authentication
let appleAuth: any = null;

if (Platform.OS === 'ios') {
  try {
    appleAuth = require('@invertase/react-native-apple-authentication').default;
  } catch (error) {
    console.warn('Apple Authentication package not available:', error);
  }
}

export { appleAuth };
