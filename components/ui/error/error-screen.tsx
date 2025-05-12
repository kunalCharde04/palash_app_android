import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { ErrorIllustration } from '@/components/ui/error/ErrorIllustration';
import { useRouter } from 'expo-router';

type ErrorScreenProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  illustration?: React.ReactNode;
  errorCode?: string | number;
};

export const AnimatedErrorScreen: React.FC<ErrorScreenProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  showRetry = true,
  illustration = <ErrorIllustration />,
  errorCode,
}) => {
  const theme = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const router = useRouter()

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { backgroundColor: theme.colors.background.default }
      ]}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {illustration ? (
          <View style={styles.illustrationContainer}>
            {illustration} 
          </View>
        ) : (
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: theme.colors.neutral.lightest,
              borderColor: theme.colors.feedback.error.main,
              borderWidth: 2,
            }
          ]}>
            <Text style={[
              styles.errorIcon, 
              { color: theme.colors.feedback.error.main }
            ]}>!</Text>
          </View>
        )}
        
        <Text style={[
          styles.title, 
          { 
            color: theme.colors.text.primary,
            fontSize: theme.typography.variants.heading.fontSize,
            lineHeight: theme.typography.variants.heading.lineHeight,
            fontFamily: theme.typography.fontFamily.sansSerif.manropeMedium,
          }
        ]}>
          {title}
        </Text>
        
        <Text style={[
          styles.message, 
          { 
            color: theme.colors.text.secondary,
            fontSize: theme.typography.variants.paragraph.fontSize,
            lineHeight: theme.typography.variants.paragraph.lineHeight,
            fontFamily: theme.typography.fontFamily.sansSerif.manropeMedium,
            marginBottom: errorCode ? theme.spacing.md : theme.spacing.xl,
          }
        ]}>
          {message}
        </Text>
        
        {errorCode && (
          <View style={styles.errorCodeContainer}>
            <Text style={[
              styles.errorCode,
              {
                color: theme.colors.text.disabled,
                fontSize: theme.typography.variants.caption.fontSize,
                fontFamily: theme.typography.fontFamily.sansSerif.manropeMedium,
              }
            ]}>
              Error Code: {errorCode}
            </Text>
          </View>
        )}
        
        {showRetry && onRetry && (
          <TouchableOpacity 
            onPress={onRetry}
            style={[
              styles.button, 
              { 
                backgroundColor: theme.colors.button.main,
                borderRadius: theme.borderRadius.primary,
                marginTop: theme.spacing.xl,
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText, 
              { 
                color: theme.colors.text.inverse,
                fontSize: theme.typography.variants.baseTextStyles.button.fontSize,
                fontFamily: theme.typography.fontFamily.sansSerif.manropeMedium,
              }
            ]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => router.push('/')}
          style={[
            styles.secondaryButton,
            {
              marginTop: theme.spacing.md,
            }
          ]}
        >
          <Text style={[
            styles.secondaryButtonText,
            {
              color: theme.colors.button.main,
              fontSize: theme.typography.variants.baseTextStyles.button.fontSize,
              fontFamily: theme.typography.fontFamily.sansSerif.manropeMedium,
            }
          ]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  errorCodeContainer: {
    marginVertical: 8,
  },
  errorCode: {
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontWeight: '500',
  }
});