import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          href: null // Disable this route to prevent conflicts
        }}
      />
    </Stack>
  );
}
