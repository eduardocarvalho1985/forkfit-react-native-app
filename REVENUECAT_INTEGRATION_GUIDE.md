# RevenueCat Integration Guide - ForkFit

## Overview

This document provides comprehensive guidance for integrating and maintaining RevenueCat subscriptions in the ForkFit React Native app. RevenueCat handles in-app subscriptions, paywall presentation, and subscription management across iOS and Android platforms.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [SDK Installation](#sdk-installation)
4. [Configuration](#configuration)
5. [Implementation](#implementation)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

## Architecture Overview

### Multi-Environment Setup
- **Development**: Sandbox testing with development bundle ID
- **Preview**: TestFlight builds with preview bundle ID  
- **Production**: App Store builds with production bundle ID

### Key Components
- `RevenueCatService`: Core service for SDK interactions
- `SubscriptionContext`: React context for subscription state
- `PaywallStep`: Onboarding paywall presentation
- EAS secrets for API key management

## Environment Setup

### 1. RevenueCat Dashboard Configuration

#### Required Setup:
1. **Create App in RevenueCat**
   - iOS: Bundle ID must match your app's bundle identifier
   - Android: Package name must match your app's package name

2. **Configure Products in App Store Connect**
   - Create subscription products first in App Store Connect
   - Copy product IDs to RevenueCat dashboard
   - Ensure products are approved and active

3. **Create Offerings in RevenueCat**
   - Organize products into packages (monthly, yearly, etc.)
   - Create "default" offering for main paywall

4. **Design Paywall**
   - Use RevenueCat's paywall builder
   - Publish paywall for the offering
   - Ensure paywall is active and up-to-date

#### Bundle ID Mapping:
```
Development:  forkfit.app.forkfitdev
Preview:      forkfit.app.forkfitpreview  
Production:   forkfit.app.forkfitprod
```

### 2. EAS Configuration

#### Required EAS Secret:
```bash
eas secret:create --scope project --name REVENUECAT_IOS_API_KEY --value "your_api_key_here"
```

#### API Key Sources:
- **RevenueCat Dashboard** → Project Settings → API Keys
- **iOS API Key**: Used for iOS builds
- **Android API Key**: Used for Android builds (future implementation)

## SDK Installation

### Package Dependencies
```json
{
  "dependencies": {
    "react-native-purchases": "^8.11.3",
    "react-native-purchases-ui": "^8.11.3"
  }
}
```

### Installation Commands
```bash
npm install react-native-purchases react-native-purchases-ui
cd ios && pod install
```

### Platform-Specific Setup

#### iOS (ios/Podfile)
```ruby
pod 'Purchases', '~> 5.27.1'
pod 'RevenueCatUI', '~> 5.27.1'
```

#### Android (android/app/build.gradle)
```gradle
dependencies {
    implementation 'com.revenuecat.purchases:purchases:8.19.2'
}
```

#### Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

## Configuration

### App Configuration (app.config.js)

```javascript
// RevenueCat API key configuration
const getRevenueCatApiKey = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const apiKey = process.env.REVENUECAT_IOS_API_KEY;
  
  if (!apiKey) {
    console.log(`⚠️ RevenueCat API key missing - only available during EAS builds`);
    return undefined;
  }
  
  return apiKey;
};

// Export configuration
export default {
  extra: {
    revenueCatIosApiKey: getRevenueCatApiKey(),
    // ... other config
  }
};
```

### EAS Build Configuration (eas.json)

```json
{
  "build": {
    "development": {
      "env": {
        "REVENUECAT_IOS_API_KEY": "$REVENUECAT_IOS_API_KEY"
      }
    },
    "preview": {
      "env": {
        "REVENUECAT_IOS_API_KEY": "$REVENUECAT_IOS_API_KEY"
      }
    },
    "production": {
      "env": {
        "REVENUECAT_IOS_API_KEY": "$REVENUECAT_IOS_API_KEY"
      }
    }
  }
}
```

## Implementation

### 1. RevenueCat Service

```typescript
// services/revenueCat.ts
import Purchases, { 
  PurchasesOffering, 
  CustomerInfo, 
  PurchasesPackage,
  LOG_LEVEL 
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

class RevenueCatService {
  private initialized = false;

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey = Constants.expoConfig?.extra?.revenueCatIosApiKey;
      
      if (!apiKey) {
        console.log('⚠️ RevenueCat iOS API key not found');
        return;
      }
      
      // Enable debug logging for development
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      this.initialized = true;
      console.log('✅ RevenueCat initialized successfully');
      
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  }

  async presentPaywall(): Promise<boolean> {
    try {
      const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
      
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (error) {
      console.error('❌ Paywall presentation failed:', error);
      return false;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    return await Purchases.getCustomerInfo();
  }

  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    // Check for active entitlements
    return Object.keys(customerInfo.entitlements.active).length > 0;
  }

  async restorePurchases(): Promise<CustomerInfo> {
    return await Purchases.restorePurchases();
  }
}

export default new RevenueCatService();
```

### 2. Subscription Context

```typescript
// contexts/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import revenueCatService from '@/services/revenueCat';

interface SubscriptionContextType {
  isLoading: boolean;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      await revenueCatService.initialize();
      
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      setIsPremium(revenueCatService.hasActiveSubscription(info));
      
    } catch (error) {
      console.log('Subscription initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const presentPaywall = async (): Promise<boolean> => {
    return await revenueCatService.presentPaywall();
  };

  const restorePurchases = async (): Promise<void> => {
    try {
      const info = await revenueCatService.restorePurchases();
      setCustomerInfo(info);
      setIsPremium(revenueCatService.hasActiveSubscription(info));
    } catch (error) {
      console.error('Restore purchases failed:', error);
    }
  };

  const refreshSubscriptionStatus = async (): Promise<void> => {
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      setIsPremium(revenueCatService.hasActiveSubscription(info));
    } catch (error) {
      console.error('Refresh subscription status failed:', error);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading,
        isPremium,
        customerInfo,
        currentOffering,
        presentPaywall,
        restorePurchases,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
```

### 3. App Layout Integration

```typescript
// app/_layout.tsx
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ProgressProvider>
          <OnboardingProvider>
            <RootLayoutContent />
          </OnboardingProvider>
        </ProgressProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
```

### 4. Paywall Step Implementation

```typescript
// app/(onboarding)/steps/PaywallStep.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function PaywallStep({ onSetLoading }: PaywallStepProps) {
  const router = useRouter();
  const { getCurrentStepData } = useOnboarding();
  const { presentPaywall, isLoading: subscriptionLoading } = useSubscription();
  const [paywallPresented, setPaywallPresented] = useState(false);

  useEffect(() => {
    if (!paywallPresented && !subscriptionLoading) {
      setPaywallPresented(true);
      handleShowSubscription();
    }
  }, [subscriptionLoading, paywallPresented]);

  const handleShowSubscription = async () => {
    try {
      onSetLoading(true);
      
      const subscriptionSuccessful = await presentPaywall();
      
      if (subscriptionSuccessful) {
        handleCreateAccount(true);
      } else {
        setPaywallPresented(false);
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      setPaywallPresented(false);
    } finally {
      onSetLoading(false);
    }
  };

  const handleCreateAccount = (isPremiumUser: boolean = false) => {
    try {
      const onboardingData = getCurrentStepData();
      
      const dataWithSubscription = {
        ...onboardingData,
        isPremium: isPremiumUser,
        subscriptionStatus: isPremiumUser ? 'active' : 'free'
      };
      
      router.push({
        pathname: '/(auth)/register',
        params: { 
          onboardingData: JSON.stringify(dataWithSubscription)
        }
      });
      
    } catch (error) {
      console.error('Error preparing for account creation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carregando Planos... 🚀</Text>
      <ActivityIndicator color={colors.primary} size="large" />
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => setPaywallPresented(false)}
      >
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Testing

### TestFlight Testing (Recommended)

1. **Build for TestFlight**:
   ```bash
   eas build --profile preview --platform ios
   ```

2. **Upload to TestFlight**:
   - Use App Store Connect to upload the build
   - TestFlight uses sandbox environment automatically
   - No real charges for test purchases

### Local Development Testing

1. **Start Development Server**:
   ```bash
   npm start
   ```

2. **Test with Development Build**:
   - Use `expo run:ios` or development build
   - RevenueCat will be disabled (graceful fallback)
   - Test onboarding flow without paywall

### Debugging

#### Enable Verbose Logging
```typescript
import { LOG_LEVEL } from 'react-native-purchases';
Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
```

#### Common Log Messages
- `✅ RevenueCat initialized successfully`: SDK ready
- `❌ RevenueCat initialization failed`: Check API key
- `❌ Paywall presentation failed`: Check paywall configuration
- `Error fetching offerings`: Check App Store Connect products

## Troubleshooting

### Common Issues

#### 1. "Error fetching offerings"
**Cause**: Products not configured in App Store Connect
**Solution**: 
- Verify products exist in App Store Connect
- Ensure product IDs match RevenueCat dashboard
- Check products are approved and active

#### 2. "Paywall presentation failed: undefined is not a function"
**Cause**: Missing RevenueCatUI import or incorrect method call
**Solution**:
- Ensure `react-native-purchases-ui` is installed
- Import `RevenueCatUI` correctly
- Use `RevenueCatUI.presentPaywall()` method

#### 3. "RevenueCat SDK Configuration is not valid"
**Cause**: Bundle ID mismatch between app and RevenueCat dashboard
**Solution**:
- Verify bundle ID in RevenueCat dashboard matches app
- Check EAS build profile configuration
- Ensure correct API key for environment

#### 4. "Socket is not connected" / Network errors
**Cause**: Network connectivity issues
**Solution**:
- Check device internet connection
- Verify corporate WiFi doesn't block RevenueCat endpoints
- Try different network (mobile data vs WiFi)

### Debug Checklist

- [ ] RevenueCat dashboard app bundle ID matches
- [ ] Products configured in App Store Connect
- [ ] Products added to RevenueCat offering
- [ ] Paywall published and active
- [ ] EAS secret properly configured
- [ ] SDK versions meet minimum requirements
- [ ] Device has internet connection
- [ ] TestFlight build (not direct install for testing)

## Production Deployment

### Pre-Production Checklist

- [ ] All products approved in App Store Connect
- [ ] RevenueCat dashboard configured for production bundle ID
- [ ] Paywall tested and published
- [ ] EAS secrets configured
- [ ] Production build tested on TestFlight

### Build Commands

```bash
# Production build
eas build --profile production --platform ios

# Upload to App Store
eas submit --platform ios --profile production
```

### Post-Deployment Monitoring

1. **RevenueCat Dashboard**:
   - Monitor subscription metrics
   - Check for failed purchases
   - Review customer feedback

2. **App Store Connect**:
   - Monitor crash reports
   - Review user feedback
   - Track subscription performance

## Best Practices

### Development
- Always test on TestFlight before production
- Use sandbox environment for development
- Enable verbose logging for debugging
- Test with different subscription scenarios

### Production
- Monitor RevenueCat dashboard regularly
- Set up alerts for failed purchases
- Keep SDK versions updated
- Test subscription flows thoroughly

### Security
- Never commit API keys to repository
- Use EAS secrets for sensitive data
- Validate subscription status server-side
- Implement proper error handling

## Support Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [EAS Documentation](https://docs.expo.dev/build/introduction/)

## Version History

- **v1.0** - Initial RevenueCat integration
- **v1.1** - Added RevenueCatUI paywall support
- **v1.2** - Multi-environment configuration
- **v1.3** - Comprehensive error handling and debugging

---

*Last updated: January 2025*
*For questions or issues, refer to this guide or contact the development team.*
