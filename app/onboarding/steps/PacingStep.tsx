import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface PacingStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PacingStep({ onSetLoading }: PacingStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Weekly Goal Pacing Slider</Text>
        <Text style={styles.subtitle}>
          Allow the user to choose their own pace if they don&apos;t have a specific event
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
