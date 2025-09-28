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
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
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
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
      return false;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('❌ Restore purchases failed:', error);
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
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
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
      throw error;
    }
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User identified in RevenueCat:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
      throw error;
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Failed to log out user:', error);
      
      // Handle RevenueCat-specific errors gracefully
      this.handleRevenueCatError(error);
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

  /**
   * Handle RevenueCat-specific errors gracefully
   * This prevents RevenueCat errors from showing up as generic error messages to users
   */
  private handleRevenueCatError(error: any): void {
    try {
      const errorMessage = error?.message || error?.toString() || 'Unknown RevenueCat error';
      
      // Check for specific RevenueCat error types
      if (errorMessage.includes('flushing data') || errorMessage.includes('timeout')) {
        console.log('🔄 RevenueCat flushing/timeout error - this is normal and will retry automatically');
        console.log('ℹ️ RevenueCat will automatically retry syncing data in the background');
        return; // Don't show this error to users
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        console.log('🌐 RevenueCat network error - will retry when connection is restored');
        console.log('ℹ️ RevenueCat will automatically retry when network is available');
        return; // Don't show this error to users
      }
      
      if (errorMessage.includes('store') || errorMessage.includes('purchase')) {
        console.log('💳 RevenueCat store error - user can retry purchase manually');
        console.log('ℹ️ This error will be handled by the paywall UI');
        return; // Don't show this error to users
      }
      
      // For other RevenueCat errors, log them but don't show to users
      console.log('⚠️ RevenueCat error handled gracefully:', errorMessage);
      console.log('ℹ️ RevenueCat will automatically retry or handle this error');
      
    } catch (handlingError) {
      console.error('❌ Error in handleRevenueCatError:', handlingError);
    }
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;
