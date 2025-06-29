import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// This screen is now just a placeholder while the RootLayout determines
// where to send the user.
export default function Index() {
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