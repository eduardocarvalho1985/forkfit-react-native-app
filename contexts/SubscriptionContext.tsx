import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import revenueCatService from '@/services/revenueCat';

interface SubscriptionContextData {
  isLoading: boolean;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextData>({} as SubscriptionContextData);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
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
      
      // ✅ RevenueCat is now initialized in app/_layout.tsx following best practices
      // Just fetch initial data here
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        setCustomerInfo(customerInfo);
        setIsPremium(revenueCatService.hasActiveSubscription(customerInfo));
        
        const offering = await revenueCatService.getOfferings();
        setCurrentOffering(offering);
        
        console.log('✅ Subscription context initialized successfully');
      } catch (rcError) {
        console.log('ℹ️ RevenueCat not available - subscription features disabled for local development');
        console.log('📝 This is expected during local development with "expo start"');
        // Set default values for local development
        setCustomerInfo(null);
        setIsPremium(false);
        setCurrentOffering(null);
      }
      
    } catch (error) {
      console.log('ℹ️ Subscription context initialization failed:', error);
      // Set default values
      setCustomerInfo(null);
      setIsPremium(false);
      setCurrentOffering(null);
    } finally {
      setIsLoading(false);
    }
  };

  const presentPaywall = async (): Promise<boolean> => {
    try {
      console.log('🎯 SubscriptionContext: Starting paywall presentation...');
      setIsLoading(true);
      
      const success = await revenueCatService.presentPaywall();
      console.log('🎯 SubscriptionContext: Paywall result:', success);
      
      if (success) {
        // Refresh customer info after successful purchase
        try {
          const updatedCustomerInfo = await revenueCatService.getCustomerInfo();
          setCustomerInfo(updatedCustomerInfo);
          const hasSubscription = revenueCatService.hasActiveSubscription(updatedCustomerInfo);
          setIsPremium(hasSubscription);
          console.log('✅ SubscriptionContext: Updated subscription status:', hasSubscription);
          return hasSubscription;
        } catch (infoError) {
          console.error('⚠️ SubscriptionContext: Failed to refresh customer info after purchase:', infoError);
          return true; // Still return true since paywall was successful
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ SubscriptionContext: Paywall presentation failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const customerInfo = await revenueCatService.restorePurchases();
      setCustomerInfo(customerInfo);
      setIsPremium(revenueCatService.hasActiveSubscription(customerInfo));
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCustomerInfo = async (): Promise<void> => {
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      setCustomerInfo(customerInfo);
      setIsPremium(revenueCatService.hasActiveSubscription(customerInfo));
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
      throw error;
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
        refreshCustomerInfo,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
