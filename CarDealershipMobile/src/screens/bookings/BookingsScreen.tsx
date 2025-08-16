import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBookings } from '../../hooks/useApi';

interface Booking {
  id: string;
  carTitle: string;
  carImage: string;
  dealerName: string;
  dealerPhone: string;
  bookingType: 'viewing' | 'test_drive';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  notes?: string;
  createdAt: string;
}

const BookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const { data: apiBookings = [], isLoading, refetch } = useBookings();

  // Mock data - replace with actual API call when backend is ready
  const mockBookings: Booking[] = [
    {
      id: '1',
      carTitle: '2023 BMW X5 xDrive40i',
      carImage: 'https://via.placeholder.com/300x200',
      dealerName: 'Premium Motors',
      dealerPhone: '+254712345678',
      bookingType: 'test_drive',
      status: 'confirmed',
      scheduledDate: '2024-01-25',
      scheduledTime: '14:00',
      location: 'Westlands, Nairobi',
      notes: 'Interested in financing options',
      createdAt: '2024-01-20',
    },
    {
      id: '2',
      carTitle: '2022 Toyota Camry Hybrid',
      carImage: 'https://via.placeholder.com/300x200',
      dealerName: 'City Auto Sales',
      dealerPhone: '+254723456789',
      bookingType: 'viewing',
      status: 'pending',
      scheduledDate: '2024-01-28',
      scheduledTime: '10:30',
      location: 'Mombasa Road, Nairobi',
      createdAt: '2024-01-22',
    },
    {
      id: '3',
      carTitle: '2021 Mercedes-Benz C-Class',
      carImage: 'https://via.placeholder.com/300x200',
      dealerName: 'Luxury Cars Kenya',
      dealerPhone: '+254734567890',
      bookingType: 'test_drive',
      status: 'completed',
      scheduledDate: '2024-01-15',
      scheduledTime: '16:00',
      location: 'Karen, Nairobi',
      notes: 'Completed purchase',
      createdAt: '2024-01-10',
    },
    {
      id: '4',
      carTitle: '2024 Audi Q7 Premium',
      carImage: 'https://via.placeholder.com/300x200',
      dealerName: 'Elite Motors',
      dealerPhone: '+254745678901',
      bookingType: 'viewing',
      status: 'cancelled',
      scheduledDate: '2024-01-18',
      scheduledTime: '11:00',
      location: 'Kilimani, Nairobi',
      notes: 'Customer cancelled',
      createdAt: '2024-01-16',
    },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // TODO: Replace with actual API call
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'completed': return '#007AFF';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getBookingTypeText = (type: string) => {
    return type === 'test_drive' ? 'Test Drive' : 'Viewing';
  };

  const getBookingTypeIcon = (type: string) => {
    return type === 'test_drive' ? 'car-sport-outline' : 'eye-outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${getBookingTypeText(booking.bookingType).toLowerCase()} for "${booking.carTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setBookings(bookings.map(b => 
              b.id === booking.id 
                ? { ...b, status: 'cancelled' as const }
                : b
            ));
          },
        },
      ]
    );
  };

  const handleRescheduleBooking = (booking: Booking) => {
    // TODO: Navigate to reschedule screen
    console.log('Reschedule booking:', booking.id);
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

  const getFilteredBookings = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          (b.status === 'confirmed' || b.status === 'pending') && 
          b.scheduledDate >= today
        );
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image source={{ uri: item.carImage }} style={styles.carImage} />
        <View style={styles.bookingInfo}>
          <Text style={styles.carTitle} numberOfLines={2}>{item.carTitle}</Text>
          <Text style={styles.dealerName}>{item.dealerName}</Text>
          <View style={styles.bookingTypeContainer}>
            <Ionicons 
              name={getBookingTypeIcon(item.bookingType)} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.bookingType}>
              {getBookingTypeText(item.bookingType)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.scheduledDate)} at {formatTime(item.scheduledTime)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
      </View>
      
      {(item.status === 'confirmed' || item.status === 'pending') && (
        <View style={styles.bookingActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCallDealer(item.dealerPhone)}
          >
            <Ionicons name="call-outline" size={20} color="#28a745" />
            <Text style={[styles.actionButtonText, { color: '#28a745' }]}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleRescheduleBooking(item)}
          >
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCancelBooking(item)}
          >
            <Ionicons name="close-outline" size={20} color="#dc3545" />
            <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => navigation.navigate('BookingManagement' as never)}
          >
            <Ionicons name="settings-outline" size={20} color="#007AFF" />
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('upcoming', 'Upcoming')}
        {renderFilterButton('completed', 'Completed')}
        {renderFilterButton('cancelled', 'Cancelled')}
        {renderFilterButton('all', 'All')}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'upcoming' 
                ? 'You have no upcoming appointments'
                : `No ${filter} bookings at the moment`
              }
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Cars</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
  },
  manageButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  calendarButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dealerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingType: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
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
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingsScreen;