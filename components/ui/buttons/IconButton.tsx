"use client"

import type React from "react"
import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native"
import { useTheme } from "@/theme/theme-provider"

type IconButtonVariant = "primary" | "secondary" | "ghost"
type IconButtonSize = "small" | "medium" | "large"

interface IconButtonProps {
  icon: React.ReactNode
  onPress: () => void
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel: string
}

export const IconButton = ({
  icon,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  accessibilityLabel,
}: IconButtonProps) => {
  const { colors, spacing, borderRadius } = useTheme()

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
    if (disabled) return colors.border.disabled

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

  const getSize = () => {
    switch (size) {
      case "small":
        return spacing.lg
      case "medium":
        return spacing.xl
      case "large":
        return spacing["2xl"]
      default:
        return spacing.xl
    }
  }

  const buttonSize = getSize()

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === "secondary" ? 1 : 0,
      borderRadius: borderRadius.full,
      width: buttonSize,
      height: buttonSize,
    },
    style,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.iconContainer}>{icon}</View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
})

