import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// This screen automatically redirects to the tabs
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tabs immediately
    router.replace('/(app)/(tabs)');
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF725E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});