import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/theme-provider';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  style?: object;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  icon,
  variant = 'default',
  size = 'medium',
  rounded = false,
  style,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  
  // Determine background and text colors based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary.main,
          textColor: colors.neutral.lightest,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary.main,
          textColor: colors.neutral.lightest,
        };
      case 'success':
        return {
          backgroundColor: colors.feedback.success.main,
          textColor: colors.neutral.lightest,
        };
      case 'warning':
        return {
          backgroundColor: colors.feedback.warning.main,
          textColor: colors.neutral.lightest,
        };
      case 'error':
        return {
          backgroundColor: colors.feedback.error.main,
          textColor: colors.neutral.lightest,
        };
      case 'info':
        return {
          backgroundColor: colors.feedback.info.main,
          textColor: colors.neutral.lightest,
        };
      default:
        return {
          backgroundColor: colors.neutral.lightest,
          textColor: colors.text.primary,
        };
    }
  };
  
  // Determine size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm / 2,
          paddingHorizontal: spacing.md,
          fontSize: 10,
          iconSize: 12,
        };
      case 'large':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: 14,
          iconSize: 18,
        };
      default: // medium
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: 12,
          iconSize: 14,
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  
  const styles = StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: variantStyles.backgroundColor,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: rounded ? borderRadius.full : borderRadius.input,
      alignSelf: 'flex-start',
      marginRight: spacing.xs,
    },
    text: {
      color: variantStyles.textColor,
      fontSize: sizeStyles.fontSize,
      fontWeight: '600',
    },
    iconContainer: {
      marginRight: spacing.xs,
    },
  });
  
  return (
    <View style={[styles.badge, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};
