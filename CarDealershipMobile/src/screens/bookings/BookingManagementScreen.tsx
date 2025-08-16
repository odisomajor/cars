import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useBookings, useCancelBooking } from '../../hooks/useApi';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
type BookingType = 'viewing' | 'test_drive';

interface Booking {
  id: string;
  listingId: string;
  carTitle: string;
  dealerName: string;
  dealerPhone: string;
  type: BookingType;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const BookingManagementScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: bookings = [], isLoading, refetch } = useBookings();
  const cancelBookingMutation = useCancelBooking();

  const filteredBookings = bookings.filter(booking => 
    selectedFilter === 'ALL' || booking.status === selectedFilter
  );

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return '#FFA500';
      case 'CONFIRMED': return '#007AFF';
      case 'ACTIVE': return '#34C759';
      case 'COMPLETED': return '#8E8E93';
      case 'CANCELLED': return '#FF3B30';
      case 'REJECTED': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'CONFIRMED': return 'checkmark-circle-outline';
      case 'ACTIVE': return 'play-circle-outline';
      case 'COMPLETED': return 'checkmark-done-outline';
      case 'CANCELLED': return 'close-circle-outline';
      case 'REJECTED': return 'ban-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTypeIcon = (type: BookingType) => {
    return type === 'viewing' ? 'eye-outline' : 'car-outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} at ${timeString}`;
  };

  const canCancelBooking = (booking: Booking) => {
    return ['PENDING', 'CONFIRMED'].includes(booking.status);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            cancelBookingMutation.mutate(bookingId);
          },
        },
      ]
    );
  };

  const handleCallDealer = (phone: string) => {
    Alert.alert(
      'Call Dealer',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling:', phone) },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const renderBookingItem = ({ item: booking }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('BookingDetails' as never, { bookingId: booking.id } as never)}
    >
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTypeContainer}>
          <Ionicons
            name={getTypeIcon(booking.type)}
            size={16}
            color="#007AFF"
          />
          <Text style={styles.bookingType}>
            {booking.type === 'viewing' ? 'Viewing' : 'Test Drive'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Ionicons
            name={getStatusIcon(booking.status)}
            size={12}
            color="#fff"
          />
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      {/* Car Info */}
      <Text style={styles.carTitle}>{booking.carTitle}</Text>
      <View style={styles.dealerInfo}>
        <Ionicons name="business-outline" size={14} color="#666" />
        <Text style={styles.dealerName}>{booking.dealerName}</Text>
      </View>

      {/* Date & Time */}
      <View style={styles.dateTimeContainer}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.dateTimeText}>
          {formatDateTime(booking.scheduledDate, booking.scheduledTime)}
        </Text>
      </View>

      {/* Notes */}
      {booking.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={14} color="#666" />
          <Text style={styles.notesText} numberOfLines={2}>
            {booking.notes}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCallDealer(booking.dealerPhone)}
        >
          <Ionicons name="call-outline" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        {canCancelBooking(booking) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(booking.id)}
            disabled={cancellingBookingId === booking.id}
          >
            {cancellingBookingId === booking.id ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <>
                <Ionicons name="close-outline" size={16} color="#FF3B30" />
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      </TouchableOpacity>
    );

  const renderFilterButton = (filter: BookingStatus | 'ALL', label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'ALL', label: 'All' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'ACTIVE', label: 'Active' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ]}
          renderItem={({ item }) => renderFilterButton(item.key as BookingStatus | 'ALL', item.label)}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'ALL'
              ? "You haven't made any bookings yet."
              : `No ${selectedFilter.toLowerCase()} bookings found.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterList: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  cancelButton: {
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BookingManagementScreen;