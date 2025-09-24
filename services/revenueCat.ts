import Purchases, { PurchasesOffering, CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Constants from 'expo-constants';

class RevenueCatService {
  // ✅ Removed initialization logic - now handled in app/_layout.tsx following best practices

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      console.log('🔍 Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      
      console.log('📦 Offerings response:', {
        current: offerings.current ? 'Present' : 'Missing',
        allOfferingsCount: Object.keys(offerings.all).length,
        allOfferingsKeys: Object.keys(offerings.all)
      });
      
      if (offerings.current) {
        console.log('✅ Current offering found:', {
          identifier: offerings.current.identifier,
          serverDescription: offerings.current.serverDescription,
          packagesCount: offerings.current.availablePackages.length,
          packages: offerings.current.availablePackages.map(pkg => ({
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            product: {
              identifier: pkg.product.identifier,
              price: pkg.product.priceString,
              title: pkg.product.title
            }
          }))
        });
      } else {
        console.log('❌ No current offering found');
        console.log('📋 Available offerings:', Object.keys(offerings.all));
      }
      
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  }

  async presentPaywall(): Promise<boolean> {
    try {
      console.log('🎯 Attempting to present paywall...');
      
      // First, check if we have offerings
      const offerings = await this.getOfferings();
      if (!offerings) {
        console.log('❌ Cannot present paywall - no offerings available');
        return false;
      }
      
      console.log('🎯 Presenting RevenueCat paywall...');
      const result: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
      
      console.log('🎯 Paywall result:', result);
      
      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          console.log('✅ Paywall result: PURCHASED');
          return true;
        case PAYWALL_RESULT.RESTORED:
          console.log('✅ Paywall result: RESTORED');
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
          console.log('❌ Paywall result: NOT_PRESENTED');
          return false;
        case PAYWALL_RESULT.ERROR:
          console.log('❌ Paywall result: ERROR');
          return false;
        case PAYWALL_RESULT.CANCELLED:
          console.log('ℹ️ Paywall result: CANCELLED');
          return false;
        default:
          console.log('❓ Paywall result: UNKNOWN -', result);
          return false;
      }
    } catch (error) {
      console.error('❌ Paywall presentation failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return false;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('❌ Restore purchases failed:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      console.log('👤 Fetching customer info...');
      const customerInfo = await Purchases.getCustomerInfo();
      
      console.log('👤 Customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
        entitlementsActive: Object.keys(customerInfo.entitlements.active),
        entitlementsAll: Object.keys(customerInfo.entitlements.all),
        latestExpirationDate: customerInfo.latestExpirationDate,
        firstSeen: customerInfo.firstSeen
      });
      
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User identified in RevenueCat:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
      throw error;
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Failed to log out user:', error);
      throw error;
    }
  }

  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    if (!customerInfo || !customerInfo.entitlements) {
      console.log('⚠️ CustomerInfo or entitlements is undefined');
      return false;
    }
    
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    console.log('🔍 Checking active entitlements:', activeEntitlements);
    
    // Check for any active entitlement (not just 'ForkFit Premium')
    const hasActiveEntitlement = activeEntitlements.length > 0;
    console.log('✅ Has active subscription:', hasActiveEntitlement);
    
    return hasActiveEntitlement;
  }

  isProductionEnvironment(): boolean {
    const buildProfile = Constants.expoConfig?.extra?.BUILD_PROFILE;
    return buildProfile === 'production';
  }

  getCurrentEnvironment(): 'sandbox' | 'production' {
    return this.isProductionEnvironment() ? 'production' : 'sandbox';
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;
