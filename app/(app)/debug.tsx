import React from 'react';
import { View, StyleSheet } from 'react-native';
import DebugScreen from '../../components/DebugScreen';

export default function DebugRoute() {
  return (
    <View style={styles.container}>
      <DebugScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
