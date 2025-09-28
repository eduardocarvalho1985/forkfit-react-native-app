import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSubscription } from '../contexts/SubscriptionContext';

// Design system constants
const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';
const OFF_WHITE = '#FFF8F6';

export interface SubscriptionBottomSheetProps {}

export const SubscriptionBottomSheet = forwardRef<BottomSheetModal, SubscriptionBottomSheetProps>(
  (props, ref) => {
    const { isPremium, customerInfo, subscriptionLoading, presentPaywall, refreshCustomerInfo } = useSubscription();
    const [isPresentingPaywall, setIsPresentingPaywall] = useState(false);

    // The heights the sheet can snap to
    const snapPoints = useMemo(() => ['50%'], []);

    // Handle paywall presentation
    const handlePresentPaywall = async () => {
      if (isPresentingPaywall) return;
      
      try {
        setIsPresentingPaywall(true);
        console.log('🎯 SubscriptionBottomSheet: Presenting paywall...');
        
        const success = await presentPaywall();
        console.log('🎯 SubscriptionBottomSheet: Paywall result:', success);
        
        if (success) {
          console.log('✅ SubscriptionBottomSheet: Subscription successful, refreshing data...');
          
          // Add a small delay to ensure RevenueCat has processed the purchase
          setTimeout(async () => {
            try {
              console.log('🔄 SubscriptionBottomSheet: Refreshing customer info...');
              await refreshCustomerInfo();
              console.log('✅ SubscriptionBottomSheet: Customer info refreshed successfully');
              
              // Close the bottom sheet
              (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
            } catch (refreshError) {
              console.error('❌ SubscriptionBottomSheet: Failed to refresh customer info:', refreshError);
              // Still close the sheet even if refresh fails
              (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
            }
          }, 1000);
        } else {
          console.log('❌ SubscriptionBottomSheet: Subscription cancelled or failed');
        }
      } catch (error) {
        console.error('❌ SubscriptionBottomSheet: Paywall error:', error);
        Alert.alert('Erro', 'Não foi possível abrir a tela de assinatura. Tente novamente.');
      } finally {
        setIsPresentingPaywall(false);
      }
    };

    // Get current subscription plan (only one card)
    const getCurrentSubscriptionPlan = () => {
      console.log('🔍 SubscriptionBottomSheet: getCurrentSubscriptionPlan called');
      console.log('🔍 subscriptionLoading:', subscriptionLoading);
      console.log('🔍 customerInfo:', customerInfo);
      console.log('🔍 isPremium:', isPremium);
      
      if (subscriptionLoading) {
        console.log('🔄 Returning loading state');
        return {
          title: 'Carregando...',
          badge: 'CARREGANDO',
          description: 'Verificando status da assinatura...',
          isActive: false,
          isClickable: false,
          isLoading: true
        };
      }

      // If no customer info, show free plan
      if (!customerInfo) {
        console.log('❌ No customer info, showing free plan');
        return {
          title: 'Sem Plano',
          badge: 'ASSINAR AGORA',
          description: 'Acesse recursos premium para maximizar seus resultados',
          isActive: false,
          isClickable: true,
          isLoading: false
        };
      }

      // Check for active subscriptions
      const activeSubscriptions = customerInfo.activeSubscriptions;
      console.log('🔍 activeSubscriptions:', activeSubscriptions);
      
      // Active yearly plan
      if (activeSubscriptions.includes('forkfit_yearly_dev') || activeSubscriptions.includes('forkfit_yearly')) {
        const expirationDate = customerInfo.latestExpirationDate;
        const formattedDate = expirationDate ? new Date(expirationDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '';
        
        console.log('✅ Found yearly subscription, showing annual plan');
        return {
          title: 'Plano Anual',
          badge: 'ATIVO',
          description: `Válido até: ${formattedDate}`,
          isActive: true,
          isClickable: false,
          isLoading: false
        };
      }
      
      // Active monthly plan
      if (activeSubscriptions.includes('forkfit_monthly_dev') || activeSubscriptions.includes('forkfit_monthly')) {
        const expirationDate = customerInfo.latestExpirationDate;
        const formattedDate = expirationDate ? new Date(expirationDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '';
        
        console.log('✅ Found monthly subscription, showing monthly plan');
        return {
          title: 'Plano Mensal',
          badge: 'ATIVO',
          description: `Válido até: ${formattedDate}`,
          isActive: true,
          isClickable: false,
          isLoading: false
        };
      }
      
      // No active subscription - show free plan
      console.log('❌ No active subscription found, showing free plan');
      return {
        title: 'Sem Plano',
        badge: 'ASSINAR AGORA',
        description: 'Acesse recursos premium para maximizar seus resultados',
        isActive: false,
        isClickable: true,
        isLoading: false
      };
    };

    const currentPlan = getCurrentSubscriptionPlan();

    // Debug effect to log changes in subscription state
    useEffect(() => {
      console.log('🔄 SubscriptionBottomSheet: Subscription state changed');
      console.log('🔄 subscriptionLoading:', subscriptionLoading);
      console.log('🔄 isPremium:', isPremium);
      console.log('🔄 customerInfo:', customerInfo ? {
        activeSubscriptions: customerInfo.activeSubscriptions,
        latestExpirationDate: customerInfo.latestExpirationDate,
        entitlementsActive: Object.keys(customerInfo.entitlements.active)
      } : null);
    }, [subscriptionLoading, isPremium, customerInfo]);

    const handleClose = () => {
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: BORDER_LIGHT }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Gerenciar Assinatura</Text>
              <Text style={styles.subtitle}>Plano atual</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {/* Plan Card */}
          <TouchableOpacity
            style={[
              styles.planCard,
              currentPlan.isClickable && styles.clickableCard
            ]}
            onPress={currentPlan.isClickable ? handlePresentPaywall : undefined}
            disabled={!currentPlan.isClickable || isPresentingPaywall}
          >
            <View style={styles.planContent}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{currentPlan.title}</Text>
                <View style={[
                  styles.planBadge,
                  currentPlan.isActive ? styles.activeBadge : 
                  currentPlan.badge === 'ASSINAR AGORA' ? styles.signupBadge :
                  styles.loadingBadge
                ]}>
                  <Text style={styles.planBadgeText}>{currentPlan.badge}</Text>
                </View>
              </View>
              <Text style={styles.planDescription}>
                {currentPlan.description}
              </Text>
              {currentPlan.isActive && (
                <View style={styles.planFooter}>
                  <Text style={styles.planFooterText}>
                    Renovação automática
                  </Text>
                </View>
              )}
              {currentPlan.isClickable && (
                <View style={styles.planFooter}>
                  <Text style={styles.planFooterText}>
                    {isPresentingPaywall ? 'Abrindo...' : 'Toque para assinar'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_LIGHT,
  },
  planCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
  },
  clickableCard: {
    backgroundColor: '#ffffff',
    borderColor: CORAL,
    borderWidth: 2,
    shadowColor: CORAL,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planContent: {
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 12,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#10b981',
  },
  signupBadge: {
    backgroundColor: CORAL,
  },
  loadingBadge: {
    backgroundColor: '#6b7280',
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  planDescription: {
    fontSize: 14,
    color: TEXT_LIGHT,
    lineHeight: 20,
    marginBottom: 12,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planFooterText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

SubscriptionBottomSheet.displayName = 'SubscriptionBottomSheet';
