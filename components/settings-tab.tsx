"use client"

import { View, Text, StyleSheet, Pressable } from "react-native"
import { useTheme } from "@/theme/theme-provider"
import { HelpCircle, LogOut } from "lucide-react-native"
import { logout } from "@/features/auth/auth-slice"
import { clearAuthData } from "@/utils/token"
import { useDispatch } from "react-redux"
import { useRouter } from "expo-router"

export default function SettingsTab() {
  const { colors, spacing, typography, borderRadius } = useTheme()
  const dispatch = useDispatch()
  const router = useRouter()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.variants.subHeading.fontSize,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    settingContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.primary,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    settingIcon: {
      marginRight: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.subtle,
      alignItems: "center",
      justifyContent: "center",
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: typography.variants.paragraph.fontSize,
      color: colors.text.primary,
      fontWeight: "500",
      marginBottom: spacing.xs,
    },
    settingDescription: {
      fontSize: typography.variants.caption.fontSize,
      color: colors.text.secondary,
    },
    logoutButton: {
      marginTop: spacing.xl,
    },
    logoutButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    logoutText: {
      marginLeft: spacing.sm,
      color: colors.feedback.error.main,
      fontWeight: "600",
    },
  })

  const handleLogout = async () => {
        try {
            await clearAuthData(); // Clear stored tokens
            dispatch(logout()); // Clear auth state
            router.replace('/(auth)'); // Redirect to auth
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.settingContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <HelpCircle size={20} color={colors.primary.main} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingDescription}>Get help and contact support</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <View style={styles.logoutButtonContent}>
          <LogOut size={20} color={colors.feedback.error.main} />
          <Text style={styles.logoutText}>Log Out</Text>
        </View>
      </Pressable>
    </View>
  )
}
