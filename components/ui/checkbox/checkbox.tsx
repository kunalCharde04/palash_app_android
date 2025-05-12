"use client"
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text, type StyleProp, type ViewStyle, type TextStyle } from "react-native"
import { CheckIcon as Check } from 'lucide-react-native';
import { useTheme } from "@/theme/theme-provider"

// Note: You would need to import your check icon here
// This is a placeholder for the icon component
const CheckIcon = () => <Check />

interface CheckboxProps {
  checked: boolean
  onToggle: () => void
  label?: string
  disabled?: boolean
  error?: string
  style?: StyleProp<ViewStyle>
  checkboxStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  errorStyle?: StyleProp<TextStyle>
  testID?: string
}

export const Checkbox = ({
  checked,
  onToggle,
  label,
  disabled = false,
  error,
  style,
  checkboxStyle,
  labelStyle,
  errorStyle,
  testID,
}: CheckboxProps) => {
  const { colors, spacing, borderRadius } = useTheme()

  const getCheckboxBorderColor = () => {
    if (error) return colors.feedback.error.main
    if (disabled) return colors.border.main
    if (checked) return colors.primary.main
    return colors.border.main
  }

  const getCheckboxBackgroundColor = () => {
    if (disabled) return colors.background.disabled
    if (checked) return colors.button.accent
    return "transparent"
  }

  const containerStyles = [styles.container, style]

  const checkboxStyles = [
    styles.checkbox,
    {
      borderColor: getCheckboxBorderColor(),
      backgroundColor: getCheckboxBackgroundColor(),
      borderRadius: borderRadius.checkbox,
      width: spacing.lg,
      height: spacing.lg,
    },
    checkboxStyle,
  ]

  const labelTextStyles = [
    styles.label,
    {
      color: disabled ? colors.text.disabled : colors.text.primary,
      marginLeft: spacing.sm,
    },
    labelStyle,
  ]

  const errorTextStyles = [
    styles.error,
    {
      color: colors.feedback.error.main,
      marginTop: spacing.xs,
    },
    errorStyle,
  ]

  return (
    <View style={containerStyles}>
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        style={styles.touchable}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        testID={testID}
      >
        <View style={checkboxStyles}>{checked && <Check color={colors.secondary.main} size={16} />}</View>
        {label && <Text style={labelTextStyles}>{label}</Text>}
      </TouchableOpacity>
      {error && <Text style={errorTextStyles}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  label: {
    flex: 1,
  },
  error: {
    fontSize: 12,
    marginLeft: 24,
  },
})

