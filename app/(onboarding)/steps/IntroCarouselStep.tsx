import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface IntroCarouselStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function IntroCarouselStep({ onSetLoading }: IntroCarouselStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Intro Carousel Step</Text>
        <Text style={styles.subtitle}>
          The initial hook - placeholder for carousel content
        </Text>
      </View>
      
      {/* Sign In button for returning users */}
      <Link href="/(auth)/login" asChild style={styles.signInButton}>
        <Pressable>
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      </Link>
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
  signInButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});
