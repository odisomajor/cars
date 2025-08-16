import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../constants';
import { EmptyState, Button } from '../../components';
import { formatDate } from '../../utils';

interface Notification {
  id: string;
  type: 'message' | 'booking' | 'listing' | 'system' | 'promotion';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionData?: {
    carId?: string;
    bookingId?: string;
    conversationId?: string;
  };
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      description: 'Premium Motors sent you a message about Toyota Camry',
      timestamp: '2024-01-15T10:37:00Z',
      isRead: false,
      actionData: { conversationId: 'conv-1' },
    },
    {
      id: '2',
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'Your test drive for BMW X5 has been confirmed for tomorrow at 2:00 PM',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false,
      actionData: { bookingId: 'booking-1', carId: 'car-2' },
    },
    {
      id: '3',
      type: 'listing',
      title: 'Price Drop Alert',
      description: 'Honda Civic Type R price dropped by KSh 200,000',
      timestamp: '2024-01-14T16:22:00Z',
      isRead: true,
      actionData: { carId: 'car-3' },
    },
    {
      id: '4',
      type: 'system',
      title: 'Profile Updated',
      description: 'Your profile information has been successfully updated',
      timestamp: '2024-01-14T14:45:00Z',
      isRead: true,
    },
    {
      id: '5',
      type: 'promotion',
      title: 'Special Offer',
      description: 'Get 20% off on premium listing upgrades this week!',
      timestamp: '2024-01-14T10:30:00Z',
      isRead: false,
    },
    {
      id: '6',
      type: 'booking',
      title: 'Booking Reminder',
      description: 'Don\'t forget your test drive appointment tomorrow at 2:00 PM',
      timestamp: '2024-01-13T18:00:00Z',
      isRead: true,
      actionData: { bookingId: 'booking-1', carId: 'car-2' },
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'chatbubble';
      case 'booking':
        return 'calendar';
      case 'listing':
        return 'car';
      case 'system':
        return 'settings';
      case 'promotion':
        return 'gift';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return COLORS.primary;
      case 'booking':
        return COLORS.success;
      case 'listing':
        return COLORS.warning;
      case 'system':
        return COLORS.gray;
      case 'promotion':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'message':
        if (notification.actionData?.conversationId) {
          // Navigate to chat screen
          Alert.alert('Navigate', 'Opening conversation...');
        }
        break;
      case 'booking':
        if (notification.actionData?.bookingId) {
          // Navigate to booking details
          Alert.alert('Navigate', 'Opening booking details...');
        }
        break;
      case 'listing':
        if (notification.actionData?.carId) {
          // Navigate to car details
          Alert.alert('Navigate', 'Opening car details...');
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getNotificationColor(item.type) + '20' },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>

          <View style={styles.notificationDetails}>
            <View style={styles.notificationHeader}>
              <Text
                style={[
                  styles.notificationTitle,
                  !item.isRead && styles.unreadTitle,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={styles.notificationTime}>
                {formatDate(item.timestamp, 'MMM dd, HH:mm')}
              </Text>
            </View>

            <Text
              style={[
                styles.notificationDescription,
                !item.isRead && styles.unreadDescription,
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterTabs = () => {
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.activeFilterTabText,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && styles.activeFilterTab,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'unread' && styles.activeFilterTabText,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    const title = filter === 'unread' ? 'No Unread Notifications' : 'No Notifications';
    const description = filter === 'unread'
      ? 'All your notifications have been read.'
      : 'You\'ll see notifications about messages, bookings, and updates here.';

    return (
      <EmptyState
        icon="notifications-outline"
        title={title}
        description={description}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilterTabs()}

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={[
          styles.notificationsContent,
          filteredNotifications.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  activeFilterTabText: {
    color: COLORS.white,
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  markAllText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadTitle: {
    fontFamily: FONTS.medium,
  },
  notificationTime: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  notificationDescription: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 18,
  },
  unreadDescription: {
    color: COLORS.text,
  },
  unreadDot: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationsScreen;