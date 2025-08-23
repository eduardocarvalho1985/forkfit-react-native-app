import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Dimensions, 
  Image,
  FlatList,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  shadows 
} from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface IntroCarouselStepProps {
  onSetLoading: (loading: boolean) => void;
}

interface CarouselItem {
  id: string;
  image: any;
  title: string;
  description: string;
}

// Carousel data - placeholder images for now
const carouselData: CarouselItem[] = [
  {
    id: '1',
    image: require('@/assets/images/react-logo.png'), // Placeholder - we'll replace with actual onboarding images
    title: 'Contar calorias nunca foi tão fácil',
    description: 'Apenas tire uma foto ou descreva sua refeição e a nossa IA faz o resto'
  },
  {
    id: '2', 
    image: require('@/assets/images/react-logo.png'), // Placeholder
    title: 'Entenda sua comida no detalhe',
    description: 'Te mantemos informado sobre as macros de sua refeição (proteínas, carboidratos e gorduras)'
  },
  {
    id: '3',
    image: require('@/assets/images/react-logo.png'), // Placeholder
    title: 'Atinja seus objetivos',
    description: 'Seja para perder peso, ganhar músculo ou manter o seu corpo. O melhor dia para começar é agora.'
  }
];

export default function IntroCarouselStep({ onSetLoading }: IntroCarouselStepProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSignIn = () => {
    console.log('IntroCarouselStep: Sign In button pressed, navigating to auth');
    router.push('/(auth)/login');
  };

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => {
    return (
      <View style={styles.carouselItem}>
        {/* Image Container - at the top */}
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.carouselImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Bottom White Panel with Text */}
        <View style={styles.textPanel}>
          <Text style={styles.carouselTitle}>{item.title}</Text>
          <Text style={styles.carouselDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDotIndicator = () => {
    return (
      <View style={styles.dotContainer}>
        {carouselData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    );
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Carousel Section */}
      <View style={styles.carouselSection}>
        <FlatList
          ref={flatListRef}
          data={carouselData}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          style={styles.carousel}
        />
        
        {/* Dot Indicators */}
        {renderDotIndicator()}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Sign In Button - Small, positioned on bottom right */}
        <Pressable style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  // Carousel Section
  carouselSection: {
    flex: 1,
    position: 'relative',
  } as ViewStyle,
  
  carousel: {
    flex: 1,
  } as ViewStyle,
  
  carouselItem: {
    width: screenWidth,
    height: '100%',
    position: 'relative',
  } as ViewStyle,
  
  // Image Container - at the top (40% of screen)
  imageContainer: {
    height: '40%', // Exactly 40% of screen height
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary, // Light gray background for image area
  } as ViewStyle,
  
  // Bottom White Panel with Text (60% of screen)
  textPanel: {
    height: '60%', // Exactly 60% of screen height
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  carouselImage: {
    width: screenWidth * 0.7, // 70% of screen width
    height: screenWidth * 0.7, // Square aspect ratio
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  } as ImageStyle,
  
  carouselTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  } as TextStyle,
  
  carouselDescription: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.6, // Using direct value instead of theme
    paddingHorizontal: spacing.md,
  } as TextStyle,
  
  // Dot Indicators
  dotContainer: {
    position: 'absolute',
    bottom: spacing.xxxl, // Position above the sign-in button
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.full,
  } as ViewStyle,
  
  activeDot: {
    backgroundColor: colors.primary,
    width: spacing.md,
  } as ViewStyle,
  
  inactiveDot: {
    backgroundColor: colors.textInverse,
    opacity: 0.5,
  } as ViewStyle,
  
  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.screenPadding,
    backgroundColor: 'transparent',
  } as ViewStyle,
  
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  } as ViewStyle,
  
  signInText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textInverse,
    textAlign: 'center',
  } as TextStyle,
});
