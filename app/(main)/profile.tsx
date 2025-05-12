import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { Camera, CreditCard, Edit2, LogOut, Settings, User } from 'lucide-react-native';
import ProfileTab from '@/components/profile-tab';
import PaymentsTab from '@/components/payments-tab';
import SettingsTab from '@/components/settings-tab';
import { Button } from '@/components/ui/buttons/Buttons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, UserProfile } from '@/api/profile';

export default function ProfileScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const [userData, setUserData] = useState<UserProfile>({
    id: '',
    name: '',
    username: '',
    phone_or_email: '',
    date_of_birth: '',
    avatar: '',
    role: '',
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userProfile = await getUserProfile();
      console.log(userProfile);
      setUserData(userProfile);
    };
    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = (updatedData: any) => {
    setUserData({...userData, ...updatedData});
    setIsEditing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab 
          {...userData}
          isEditing={isEditing} 
          onSave={handleSaveProfile} 
          onCancel={() => setIsEditing(false)}
        />;
      case 'payments':
        return <PaymentsTab user={userData} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileTab 
          {...userData}
          isEditing={isEditing} 
          onSave={handleSaveProfile} 
          onCancel={() => setIsEditing(false)}
        />;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      backgroundColor: colors.primary.main,
      paddingTop: spacing.xl,
      paddingBottom: spacing["2xl"],
      paddingHorizontal: spacing.lg,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary.accent,
    },
    userInfo: {
      flex: 1,
    },
    name: {
      color: colors.neutral.white,
      fontSize: typography.variants.heading.fontSize,
      fontWeight: 'bold',
      marginBottom: spacing.xs,
    },
    location: {
      color: colors.neutral.lightest,
      fontSize: typography.variants.caption.fontSize,
      marginBottom: spacing.sm,
    },
    editButton: {
      position: 'absolute',
      top: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.primary.accent,
      borderRadius: borderRadius.full,
      padding: spacing.xs,
    },
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.md,
      backgroundColor: colors.background.default,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.main,
    },
    tab: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary.main,
    },
    tabText: {
      color: colors.text.secondary,
      marginTop: spacing.xs,
      fontSize: typography.variants.caption.fontSize,
    },
    activeTabText: {
      color: colors.primary.main,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: userData.avatar || `https://avatar.iran.liara.run/public/43` }} 
              style={styles.avatar} 
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.location}>@{userData.username}</Text>
            {!isEditing && (
              <Button 
                title='Edit Profile'
                variant="secondary" 
                size="small" 
                disabled={true}
                onPress={handleEditToggle}
                icon={<Edit2 size={16} color={colors.secondary.main} />}
                iconPosition='left'
              />
            )}
          </View>
        </View>
        
      </View>

      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
          onPress={() => setActiveTab('profile')}
        >
          <User size={20} color={activeTab === 'profile' ? colors.primary.main : colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]} 
          onPress={() => setActiveTab('payments')}
        >
          <CreditCard size={20} color={activeTab === 'payments' ? colors.primary.main : colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>Payments</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? colors.primary.main : colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
