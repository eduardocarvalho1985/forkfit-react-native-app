// Simple analytics service using basic Firebase
// This will work with the Firebase Analytics that's already enabled in your config files

export const AnalyticsService = {
  // Track user events - using console.log for now since we don't have the analytics package
  trackEvent: async (eventName: string, parameters?: { [key: string]: any }) => {
    try {
      // For now, just log the event - Firebase Analytics will automatically track basic events
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
      
      // TODO: Once Firebase Analytics is properly set up, we can add actual tracking here
      // await analytics().logEvent(eventName, parameters);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  },

  // Track screen views
  trackScreenView: async (screenName: string, screenClass?: string) => {
    try {
      console.log(`📊 Screen View: ${screenName}`);
      
      // TODO: Once Firebase Analytics is properly set up, we can add actual tracking here
      // await analytics().logScreenView({
      //   screen_name: screenName,
      //   screen_class: screenClass || screenName,
      // });
    } catch (error) {
      console.error('Analytics screen tracking error:', error);
    }
  },

  // Set user properties
  setUserProperty: async (name: string, value: string) => {
    try {
      console.log(`📊 User Property Set: ${name} = ${value}`);
      
      // TODO: Once Firebase Analytics is properly set up, we can add actual tracking here
      // await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error('Analytics user property error:', error);
    }
  },

  // Track onboarding events
  trackOnboardingStep: async (step: string, stepNumber: number, timeSpent?: number) => {
    await AnalyticsService.trackEvent('onboarding_step_completed', {
      step_name: step,
      step_number: stepNumber,
      time_spent: timeSpent,
    });
  },

  // Track subscription events
  trackSubscription: async (planType: string, action: 'started' | 'completed' | 'cancelled') => {
    await AnalyticsService.trackEvent('subscription_action', {
      plan_type: planType,
      action: action,
    });
  },

  // Track food logging events
  trackFoodLogging: async (action: 'added' | 'updated' | 'deleted', foodType?: string) => {
    await AnalyticsService.trackEvent('food_logging', {
      action: action,
      food_type: foodType,
    });
  },

  // Track weight logging
  trackWeightLogging: async (action: 'added' | 'updated', weight?: number) => {
    await AnalyticsService.trackEvent('weight_logging', {
      action: action,
      weight: weight,
    });
  },

  // Track app usage
  trackAppOpened: async () => {
    await AnalyticsService.trackEvent('app_opened', {
      timestamp: new Date().toISOString(),
    });
  },
};
