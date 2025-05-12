"use client"

import type React from "react"
import { useState } from "react"
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
} from "react-native"
import { useTheme } from "@/theme/theme-provider"

interface TextInputProps {
  value: any
  onChangeText: (text: string) => void
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  secureTextEntry?: boolean
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoCorrect?: boolean
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
  hintStyle?: StyleProp<TextStyle>
  errorStyle?: StyleProp<TextStyle>
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
  testID?: string
  inputType?: "email" | "phone" | "dob" | "text"
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export const validateDOB = (dob: string) => {
  const dobRegex = /^\d{2}-\d{2}-\d{4}$/
  if (!dobRegex.test(dob)) return false
  
  const [day, month, year] = dob.split('-').map(Number)
  
  // Validate day, month, and year ranges
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  
  // Check for valid days in each month
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return false
  
  const date = new Date(year, month - 1, day)
  const today = new Date()
  
  // Ensure the date is valid and not in the future
  return date <= today && 
         date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day
}

export const TextInput = ({
  value,
  onChangeText,
  label,
  placeholder,
  hint,
  error,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  style,
  inputStyle,
  labelStyle,
  hintStyle,
  errorStyle,
  rightIcon,
  onRightIconPress,
  testID,
  inputType = "text",
}: TextInputProps) => {
  const { colors, spacing, borderRadius, typography } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [validationError, setValidationError] = useState<string>("")

  const handleTextChange = (text: string) => {
    let errorMessage = ""
    
    if (inputType === "email" && text && !validateEmail(text)) {
      errorMessage = "Please enter a valid email address"
    } else if (inputType === "phone" && text && !validatePhone(text)) {
      errorMessage = "Please enter a valid Indian ph. number starting with +91"
    } else if (inputType === "dob" && text && !validateDOB(text)) {
      errorMessage = "Please enter a valid date of birth (DD-MM-YYYY)"
    }
    
    setValidationError(errorMessage)
    onChangeText(text)
  }

  const getKeyboardType = () => {
    switch (inputType) {
      case "email":
        return "email-address"
      case "phone":
        return "phone-pad"
      case "dob":
        return "numeric"
      default:
        return keyboardType
    }
  }

  const getPlaceholder = () => {
    switch (inputType) {
      case "email":
        return "eg. jhon_doe@mail.com"
      case "phone":
        return "+91-8888888888"
      case "dob":
        return "DD-MM-YYYY"
      default:
        return placeholder
    }
  }

  const getBorderColor = () => {
    if (error) return colors.feedback.error.main
    if (isFocused) return colors.primary.main
    if (disabled) return colors.border.disabled
    return colors.border.main
  }

  const getBackgroundColor = () => {
    if (disabled) return colors.background.disabled
    return colors.background.default
  }

  const containerStyles = [
    styles.container,
    {
      borderColor: getBorderColor(),
      borderRadius: borderRadius.input,
      backgroundColor: getBackgroundColor(),
      paddingHorizontal: spacing.md,
      paddingVertical: multiline ? spacing.sm : 0,
    },
    style,
  ]

  const textInputStyles = [
    styles.input,
    {
      color: disabled ? colors.text.disabled : colors.text.primary,
      height: multiline ? undefined : spacing.xl + spacing.md,
      textAlignVertical: multiline ? "top" as const : "center" as const,
      fontFamily: typography.fontFamily.sansSerif.manropeMedium,
    },
    inputStyle,
  ]

  const labelTextStyles = [
    styles.label,
    {
      color: error ? colors.feedback.error.main : colors.text.secondary,
      marginBottom: spacing.xs,
    },
    labelStyle,
  ]

  const hintTextStyles = [
    styles.hint,
    {
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    hintStyle,
  ]

  const errorTextStyles = [
    styles.error,
    {
      color: colors.feedback.error.main,
      marginLeft: spacing.md,
      marginBottom: spacing.md
    },
    errorStyle,
  ]

  return (
    <View>
      {label && <Text style={labelTextStyles}>{label}</Text>}
      <View style={containerStyles}>
        <RNTextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={getPlaceholder()}
          placeholderTextColor={colors.text.disabled}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          keyboardType={getKeyboardType()}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          style={textInputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
            accessibilityRole="button"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {hint && !error && !validationError && <Text style={hintTextStyles}>{hint}</Text>}
      {(error || validationError) && <Text style={errorTextStyles}>{error || validationError}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  label: {
    fontWeight: "500",
  },
  hint: {
    fontSize: 12,
  },
  error: {
    fontSize: 12,
  },
  rightIcon: {
    marginLeft: 8,
  },
})

