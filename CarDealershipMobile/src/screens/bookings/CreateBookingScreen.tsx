import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCreateBooking } from '../../hooks/useApi';

interface RouteParams {
  listingId: string;
  carTitle: string;
  dealerName: string;
  dealerPhone: string;
}

interface BookingData {
  type: 'viewing' | 'test_drive';
  scheduledDate: Date;
  scheduledTime: Date;
  notes: string;
}

const CreateBookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listingId, carTitle, dealerName, dealerPhone } = route.params as RouteParams;
  const createBookingMutation = useCreateBooking();

  const [bookingData, setBookingData] = useState<BookingData>({
    type: 'viewing',
    scheduledDate: new Date(),
    scheduledTime: new Date(),
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBookingData(prev => ({ ...prev, scheduledDate: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBookingData(prev => ({ ...prev, scheduledTime: selectedTime }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async () => {
    // Validation
    const now = new Date();
    const selectedDateTime = new Date(
      bookingData.scheduledDate.getFullYear(),
      bookingData.scheduledDate.getMonth(),
      bookingData.scheduledDate.getDate(),
      bookingData.scheduledTime.getHours(),
      bookingData.scheduledTime.getMinutes()
    );

    if (selectedDateTime <= now) {
      Alert.alert('Invalid Date/Time', 'Please select a future date and time.');
      return;
    }

    // Check if it's within business hours (9 AM - 6 PM)
    const hour = bookingData.scheduledTime.getHours();
    if (hour < 9 || hour >= 18) {
      Alert.alert('Invalid Time', 'Please select a time between 9:00 AM and 6:00 PM.');
      return;
    }

    // Check if it's not a weekend
    const dayOfWeek = bookingData.scheduledDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      Alert.alert('Invalid Date', 'Bookings are only available on weekdays.');
      return;
    }

    const bookingPayload = {
      listingId,
      type: bookingData.type,
      scheduledDate: bookingData.scheduledDate.toISOString().split('T')[0],
      scheduledTime: formatTime(bookingData.scheduledTime),
      notes: bookingData.notes.trim() || undefined,
    };

    createBookingMutation.mutate(bookingPayload, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Info */}
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>{carTitle}</Text>
          <View style={styles.dealerInfo}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.dealerName}>{dealerName}</Text>
          </View>
          <View style={styles.dealerInfo}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.dealerPhone}>{dealerPhone}</Text>
          </View>
        </View>

        {/* Booking Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingData.type === 'viewing' && styles.typeButtonActive,
              ]}
              onPress={() => setBookingData(prev => ({ ...prev, type: 'viewing' }))}
            >
              <Ionicons
                name="eye-outline"
                size={20}
                color={bookingData.type === 'viewing' ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  bookingData.type === 'viewing' && styles.typeButtonTextActive,
                ]}
              >
                Viewing
              </Text>
              <Text style={styles.typeDescription}>Inspect the vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                bookingData.type === 'test_drive' && styles.typeButtonActive,
              ]}
              onPress={() => setBookingData(prev => ({ ...prev, type: 'test_drive' }))}
            >
              <Ionicons
                name="car-outline"
                size={20}
                color={bookingData.type === 'test_drive' ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  bookingData.type === 'test_drive' && styles.typeButtonTextActive,
                ]}
              >
                Test Drive
              </Text>
              <Text style={styles.typeDescription}>Drive the vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.dateTimeText}>{formatDate(bookingData.scheduledDate)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.dateTimeText}>{formatTime(bookingData.scheduledTime)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <Text style={styles.businessHours}>Business hours: 9:00 AM - 6:00 PM (Weekdays only)</Text>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={bookingData.notes}
            onChangeText={(text) => setBookingData(prev => ({ ...prev, notes: text }))}
            placeholder="Any specific requirements or questions?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, createBookingMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createBookingMutation.isPending}
        >
          {createBookingMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Book Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={bookingData.scheduledDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={bookingData.scheduledTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
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
  content: {
    flex: 1,
  },
  carInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dealerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dealerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  dealerPhone: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  typeButtonTextActive: {
    color: '#007AFF',
  },
  typeDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  businessHours: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default CreateBookingScreen;