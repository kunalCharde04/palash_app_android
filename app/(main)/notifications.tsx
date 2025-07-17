import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { colors } from '@/theme/coloring';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Bell, User, Shield, MessageSquare, Settings, AlertCircle, Clock } from 'lucide-react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'message' | 'alert' | 'system' | 'security';
}

// Dummy data for notifications
const dummyNotifications: { admin: Notification[]; user: Notification[] } = {
  admin: [
    {
      id: '1',
      title: 'New Booking Request',
      message: 'Sarah Johnson has booked a Deep Tissue Massage for tomorrow at 3:00 PM',
      time: '15 minutes ago',
      read: false,
      type: 'system',
    },
    {
      id: '2',
      title: 'Membership Renewal',
      message: 'Premium member Alex Chen has renewed their monthly membership',
      time: '1 hour ago',
      read: false,
      type: 'system',
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment of $120 received for Aromatherapy Session booking',
      time: '2 hours ago',
      read: true,
      type: 'system',
    },
    {
      id: '4',
      title: 'Service Cancellation',
      message: 'Mike Rodriguez cancelled his Hot Stone Therapy appointment',
      time: '3 hours ago',
      read: true,
      type: 'alert',
    },
    {
      id: '5',
      title: 'New User Registration',
      message: 'Emma Davis has registered and completed profile setup',
      time: '5 hours ago',
      read: true,
      type: 'system',
    },
    {
      id: '6',
      title: 'Staff Schedule Update',
      message: 'Therapist availability updated for next week',
      time: '1 day ago',
      read: true,
      type: 'system',
    },
    {
      id: '7',
      title: 'Low Inventory Alert',
      message: 'Essential oils stock running low for aromatherapy services',
      time: '2 days ago',
      read: false,
      type: 'alert',
    },
    {
      id: '8',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected for admin account',
      time: '3 days ago',
      read: true,
      type: 'security',
    },
    {
      id: '9',
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed successfully',
      time: '4 days ago',
      read: true,
      type: 'system',
    },
    {
      id: '10',
      title: 'New Review Received',
      message: 'Lisa Park left a 5-star review for Swedish Massage service',
      time: '5 days ago',
      read: true,
      type: 'message',
    },
  ],
  user: [
    {
      id: '11',
      title: 'Booking Confirmed',
      message: 'Your Deep Tissue Massage appointment is confirmed for tomorrow at 3:00 PM',
      time: '30 minutes ago',
      read: false,
      type: 'system',
    },
    {
      id: '12',
      title: 'Reminder: Upcoming Session',
      message: 'Your Aromatherapy session starts in 2 hours. Please arrive 15 minutes early.',
      time: '1 hour ago',
      read: false,
      type: 'alert',
    },
    {
      id: '13',
      title: 'Payment Successful',
      message: 'Payment of $85 processed successfully for your Hot Stone Therapy',
      time: '2 hours ago',
      read: true,
      type: 'system',
    },
    {
      id: '14',
      title: 'Membership Expiring Soon',
      message: 'Your Premium membership expires in 3 days. Renew now to continue enjoying benefits.',
      time: '3 hours ago',
      read: false,
      type: 'alert',
    },
    {
      id: '15',
      title: 'New Service Available',
      message: 'Try our new Himalayan Salt Stone Therapy - now available for booking!',
      time: '1 day ago',
      read: true,
      type: 'message',
    },
    {
      id: '16',
      title: 'Session Completed',
      message: 'How was your Swedish Massage experience? Please leave a review.',
      time: '2 days ago',
      read: true,
      type: 'message',
    },
    {
      id: '17',
      title: 'Special Offer',
      message: '20% off on all reflexology services this weekend. Book now!',
      time: '3 days ago',
      read: true,
      type: 'message',
    },
    {
      id: '18',
      title: 'Profile Update',
      message: 'Your health preferences have been successfully updated',
      time: '4 days ago',
      read: true,
      type: 'system',
    },
    {
      id: '19',
      title: 'Booking Rescheduled',
      message: 'Your Cupping Therapy session has been moved to Friday 2:00 PM due to therapist availability',
      time: '5 days ago',
      read: true,
      type: 'alert',
    },
    {
      id: '20',
      title: 'Welcome Gift',
      message: 'Welcome to Palash! Enjoy a complimentary consultation with your first booking.',
      time: '1 week ago',
      read: true,
      type: 'message',
    },
    {
      id: '21',
      title: 'Account Security',
      message: 'Your password was changed successfully',
      time: '1 week ago',
      read: true,
      type: 'security',
    },
  ],
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'alert':
      return AlertCircle;
    case 'system':
      return Settings;
    case 'security':
      return Shield;
    default:
      return Bell;
  }
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('user');

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    
    return (
      <Pressable
        style={[
          styles.notificationCard,
          {
            backgroundColor: notification.read ? colors.background.paper : colors.background.subtle,
            borderLeftColor: notification.read ? colors.border.main : colors.primary.main,
          },
        ]}
      >
        <View style={styles.notificationIconContainer}>
          <Icon
            size={24}
            color={notification.read ? colors.text.secondary : colors.primary.main}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text.primary }]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: colors.text.secondary }]}>
            {notification.message}
          </Text>
          <View style={styles.notificationFooter}>
            <Clock size={14} color={colors.text.disabled} />
            <Text style={[styles.notificationTime, { color: colors.text.disabled }]}>
              {notification.time}
            </Text>
          </View>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Notifications</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'user' && { borderBottomColor: colors.primary.main },
          ]}
          onPress={() => setActiveTab('user')}
        >
          <User
            size={20}
            color={activeTab === 'user' ? colors.primary.main : colors.text.secondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'user' ? colors.primary.main : colors.text.secondary },
            ]}
          >
            User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'admin' && { borderBottomColor: colors.primary.main },
          ]}
          onPress={() => setActiveTab('admin')}
        >
          <Shield
            size={20}
            color={activeTab === 'admin' ? colors.primary.main : colors.text.secondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'admin' ? colors.primary.main : colors.text.secondary },
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationsList}>
        {dummyNotifications[activeTab].map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8e3',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: typography.variants.paragraph.fontSize,
    fontFamily: typography.fontFamily.sansSerif.manropeMedium,
  },
  notificationsList: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.variants.paragraph.fontSize,
    fontFamily: typography.fontFamily.sansSerif.manropeMedium,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: typography.variants.cardParagraph.fontSize,
    lineHeight: typography.variants.cardParagraph.lineHeight,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: typography.variants.caption.fontSize,
    lineHeight: typography.variants.caption.lineHeight,
    marginLeft: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginLeft: 8,
    alignSelf: 'center',
  },
}); 