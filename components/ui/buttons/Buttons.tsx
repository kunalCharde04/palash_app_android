"use client"

import type React from "react"
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { useTheme } from "@/theme/theme-provider"

type ButtonVariant = "primary" | "secondary" | "ghost"
type ButtonSize = "small" | "medium" | "large"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) => {
  const { colors, spacing, borderRadius, typography } = useTheme()

  const getBackgroundColor = () => {
    if (disabled) return colors.background.disabled

    switch (variant) {
      case "primary":
        return colors.primary.main
      case "secondary":
        return "transparent"
      case "ghost":
        return "transparent"
      default:
        return colors.primary.main
    }
  }

  const getBorderColor = () => {
    if (disabled) return colors.background.disabled

    switch (variant) {
      case "primary":
        return colors.primary.main
      case "secondary":
        return colors.secondary.main
      case "ghost":
        return "transparent"
      default:
        return colors.primary.main
    }
  }

  const getTextColor = () => {
    if (disabled) return colors.text.disabled

    switch (variant) {
      case "primary":
        return colors.text.inverse
      case "secondary":
        return colors.secondary.main
      case "ghost":
        return colors.primary.main
      default:
        return colors.text.inverse
    }
  }

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md }
      case "medium":
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }
      case "large":
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl }
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }
    }
  }

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === "secondary" ? 1 : 0,
      borderRadius: borderRadius.full,
      ...getPadding(),
      width: fullWidth ? "100%" : undefined,
    } as ViewStyle,
    style,
  ]

  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontFamily: 'manropeMedium',
      fontSize: size === "small" ? 14 : size === "large" ? 18 : 16,
    },
    textStyle,
  ]

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} size="small" />
    }

    if (!icon) {
      return <Text style={textStyles}>{title}</Text>
    }

    return (
      <View style={styles.contentContainer}>
        {iconPosition === "left" && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={textStyles}>{title}</Text>
        {iconPosition === "right" && <View style={styles.iconContainer}>{icon}</View>}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
    >
      {renderContent()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginHorizontal: 8,
  },
})

