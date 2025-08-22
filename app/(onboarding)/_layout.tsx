import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Onboarding ForkFit',
          headerStyle: { backgroundColor: '#FF725E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' }
        }}
      />
    </Stack>
  );
} 