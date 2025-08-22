import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface PaywallStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PaywallStep({ onSetLoading }: PaywallStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Subscription Options / Paywall</Text>
        <Text style={styles.subtitle}>
          Convert the user to a paid subscriber
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120, // Extra padding for fixed footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});
