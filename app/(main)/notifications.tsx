import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { colors } from '@/theme/coloring';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { Bell, User, Shield, MessageSquare, Settings, AlertCircle, Clock, Trash2, Check, Calendar } from 'lucide-react-native';
import { fetchNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead, Notification as ApiNotification } from '@/api/notifications';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PopupNotification from '@/components/Notification';

interface Notification extends ApiNotification {
  // Additional UI-specific properties can be added here if needed
}

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
      return Calendar;
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return Settings;
    case 'REVIEW_CREATED':
      return MessageSquare;
    case 'SERVICE_UPDATED':
    case 'SERVICE_CREATED':
      return Settings;
    case 'ADMIN_ANNOUNCEMENT':
      return AlertCircle;
    case 'SYSTEM_NOTIFICATION':
      return Settings;
    default:
      return Bell;
  }
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useSelector((state: RootState) => state.authReducer);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    visible: boolean;
  }>({
    type: 'info',
    message: '',
    visible: false,
  });

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const hideNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  // Load notifications
  const loadNotifications = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await fetchNotifications(pageNum, 20);
      
      if (isRefresh || pageNum === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.pagination.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showNotification('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'READ' as const }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showNotification('error', 'Failed to mark notification as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      showNotification('success', 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showNotification('error', 'Failed to delete notification');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'READ' as const }))
      );
      showNotification('success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showNotification('error', 'Failed to mark all as read');
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(page + 1, false);
    }
  };

  // Refresh notifications
  const onRefresh = () => {
    loadNotifications(1, true);
  };

  // Load notifications on component mount
  useEffect(() => {
    if (user?.id) {
      loadNotifications(1, false);
    }
  }, [user?.id]);

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const isRead = notification.status === 'READ';
    
    return (
      <Pressable
        style={[
          styles.notificationCard,
          {
            backgroundColor: isRead ? colors.background.paper : colors.background.subtle,
            borderLeftColor: isRead ? colors.border.main : colors.primary.main,
          },
        ]}
        onPress={() => !isRead && handleMarkAsRead(notification.id)}
      >
        <View style={styles.notificationIconContainer}>
          <Icon
            size={24}
            color={isRead ? colors.text.secondary : colors.primary.main}
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
              {formatTime(notification.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.notificationActions}>
          {!isRead && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsRead(notification.id)}
            >
              <Check size={16} color={colors.primary.main} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteNotification(notification.id)}
          >
            <Trash2 size={16} color={colors.feedback.error.main} />
          </TouchableOpacity>
        </View>
        {!isRead && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {notifications.some(n => n.status === 'UNREAD') && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMore && !loading) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={colors.text.disabled} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              No notifications
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.text.secondary }]}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        )}
        
        {loading && notifications.length > 0 && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={[styles.loadingMoreText, { color: colors.text.secondary }]}>
              Loading more...
            </Text>
          </View>
        )}
      </ScrollView>

      <PopupNotification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={hideNotification}
      />
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
  markAllButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  markAllText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
  },
}); 