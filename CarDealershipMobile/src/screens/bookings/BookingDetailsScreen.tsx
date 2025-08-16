import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBooking, useCancelBooking, useUpdateBooking } from '../../hooks/useApi';

type BookingDetailsRouteProp = RouteProp<
  { BookingDetails: { bookingId: string } },
  'BookingDetails'
>;

const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;

  const { data: booking, isLoading, error } = useBooking(bookingId);
  const cancelBookingMutation = useCancelBooking();
  const updateBookingMutation = useUpdateBooking();

  const handleCallDealer = () => {
    if (booking?.dealerPhone) {
      Linking.openURL(`tel:${booking.dealerPhone}`);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            cancelBookingMutation.mutate(bookingId, {
              onSuccess: () => {
                navigation.goBack();
              },
            });
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    // Navigate to reschedule screen or show date picker
    Alert.alert(
      'Reschedule Booking',
      'Please contact the dealer to reschedule your appointment.',
      [
        { text: 'OK' },
        {
          text: 'Call Dealer',
          onPress: handleCallDealer,
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'active':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'active':
        return 'play-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'rejected':
        return 'ban-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const canCancelBooking = () => {
    return booking?.status === 'PENDING' || booking?.status === 'CONFIRMED';
  };

  const canReschedule = () => {
    return booking?.status === 'PENDING' || booking?.status === 'CONFIRMED';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load booking details</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={getStatusIcon(booking.status) as any}
              size={24}
              color={getStatusColor(booking.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(booking.status) },
              ]}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
            </Text>
          </View>
          <Text style={styles.bookingId}>Booking ID: {booking.id.slice(-8)}</Text>
        </View>

        {/* Car Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle</Text>
          <View style={styles.carInfo}>
            <Ionicons name="car-outline" size={24} color="#666" />
            <Text style={styles.carTitle}>{booking.carTitle}</Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{booking.scheduledTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="eye-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {booking.type === 'viewing' ? 'Vehicle Viewing' : 'Test Drive'}
            </Text>
          </View>
        </View>

        {/* Dealer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dealer Information</Text>
          <View style={styles.dealerInfo}>
            <View style={styles.dealerDetails}>
              <Text style={styles.dealerName}>{booking.dealerName}</Text>
              {booking.dealerPhone && (
                <Text style={styles.dealerPhone}>{booking.dealerPhone}</Text>
              )}
            </View>
            {booking.dealerPhone && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDealer}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {/* Booking Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <Ionicons name="add-circle-outline" size={16} color="#10b981" />
            <Text style={styles.timelineText}>
              Created: {new Date(booking.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.timelineItem}>
            <Ionicons name="refresh-outline" size={16} color="#3b82f6" />
            <Text style={styles.timelineText}>
              Last Updated: {new Date(booking.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {canReschedule() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={handleReschedule}
          >
            <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        )}
        {canCancelBooking() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelBooking}
            disabled={cancelBookingMutation.isPending}
          >
            <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.cancelButtonText}>
              {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  dealerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealerDetails: {
    flex: 1,
  },
  dealerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dealerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  callButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  rescheduleButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  rescheduleButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default BookingDetailsScreen;