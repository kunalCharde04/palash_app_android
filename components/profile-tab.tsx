"use client"

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from "react-native"
import { useTheme } from "@/theme/theme-provider"
import { Camera, Mail, MapPin, Phone, User, Calendar, Globe, UserRound } from "lucide-react-native"
import { TextInput } from "@/components/ui/Inputs/input"
import { Button } from "@/components/ui/buttons/Buttons"
import * as ImagePicker from "expo-image-picker"
import { UserProfile } from "@/api/profile"

interface ProfileTabProps extends UserProfile {
  isEditing: boolean;
  onSave: (updatedData: any) => void;
  onCancel: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ isEditing, onSave, onCancel, ...userData }) => {
  const { colors, spacing, typography, borderRadius } = useTheme()
  const [formData, setFormData] = React.useState({ ...userData })
  const [tempAvatar, setTempAvatar] = React.useState(userData.avatar)

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    onSave({ ...formData, avatar: tempAvatar })
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempAvatar(result.assets[0].uri)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: 100,
      paddingTop: 20,
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
    infoContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    infoLabel: {
      width: 30,
      alignItems: "center",
      marginRight: spacing.md,
    },
    infoText: {
      flex: 1,
      fontSize: typography.variants.paragraph.fontSize,
      color: colors.secondary.main,
    },
    bioContainer: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.primary,
      padding: spacing.lg,
    },
    bioText: {
      fontSize: typography.variants.paragraph.fontSize,
      color: colors.text.primary,
      lineHeight: typography.variants.paragraph.lineHeight,
    },
    editAvatarContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: spacing.md,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.primary.accent,
    },
    cameraButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.full,
      padding: spacing.sm,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.xl,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
  })

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editAvatarContainer}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: tempAvatar || `https://avatar.iran.liara.run/public/43` }} style={styles.avatar} />
            <Pressable style={styles.cameraButton} onPress={pickImage}>
              <Camera size={20} color={colors.neutral.white} />
            </Pressable>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            rightIcon={<User size={20} color={colors.icon.input} />}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Username"
            value={formData.username || ''}
            onChangeText={(text) => handleChange("username", text)}
            rightIcon={<UserRound size={20} color={colors.icon.input} />}
          />
        </View>



        <View style={styles.inputContainer}>
          <TextInput
            label="Email or Phone Number"
            value={formData.phone_or_email}
            onChangeText={(text) => handleChange("phone_or_email", text)}
            rightIcon={<Mail size={20} color={colors.icon.input} />}
            keyboardType="email-address"
          />
        </View>


        <View style={styles.inputContainer}>
          <TextInput
            label="Date of Birth"
            value={formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Not provided'}
            disabled={true}
            onChangeText={(text) => handleChange("date_of_birth", text)}
            rightIcon={<Calendar size={20} color={colors.icon.input} />}
          />
        </View>

              <View style={styles.buttonContainer}>
          <Button variant="secondary" size="medium" onPress={onCancel} title="Cancel" />
          <Button variant="primary" size="medium" onPress={handleSave} title="Save Changes" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <User size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.infoText}>{userData.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Mail size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.infoText}>{userData.phone_or_email}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Calendar size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.infoText}>{userData.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString() : 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <UserRound size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.infoText}>{userData.role}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProfileTab
