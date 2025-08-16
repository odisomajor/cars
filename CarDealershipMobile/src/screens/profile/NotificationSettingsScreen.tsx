import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  newListings: boolean;
  priceDrops: boolean;
  bookingUpdates: boolean;
  messages: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
}

interface SettingItem {
  key: keyof NotificationSettings;
  title: string;
  description: string;
  category: 'push' | 'email' | 'content' | 'security';
}

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newListings: true,
    priceDrops: true,
    bookingUpdates: true,
    messages: true,
    marketingEmails: false,
    weeklyDigest: true,
    securityAlerts: true,
  });

  const settingItems: SettingItem[] = [
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      category: 'push'
    },
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      category: 'email'
    },
    {
      key: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      category: 'email'
    },
    {
      key: 'newListings',
      title: 'New Listings',
      description: 'Get notified about new car listings',
      category: 'content'
    },
    {
      key: 'priceDrops',
      title: 'Price Drops',
      description: 'Get notified when prices drop on saved cars',
      category: 'content'
    },
    {
      key: 'bookingUpdates',
      title: 'Booking Updates',
      description: 'Updates about your bookings and appointments',
      category: 'content'
    },
    {
      key: 'messages',
      title: 'Messages',
      description: 'New messages from dealers and buyers',
      category: 'content'
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Emails',
      description: 'Promotional offers and deals',
      category: 'email'
    },
    {
      key: 'weeklyDigest',
      title: 'Weekly Digest',
      description: 'Weekly summary of activity and recommendations',
      category: 'email'
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      category: 'security'
    },
  ];

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.getNotificationSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiService.updateNotificationSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Notification settings updated successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to update settings');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'push': return 'Push Notifications';
      case 'email': return 'Email & SMS';
      case 'content': return 'Content Notifications';
      case 'security': return 'Security';
      default: return 'Other';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'push': return 'notifications-outline';
      case 'email': return 'mail-outline';
      case 'content': return 'car-outline';
      case 'security': return 'shield-checkmark-outline';
      default: return 'settings-outline';
    }
  };

  const groupedSettings = settingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SettingItem[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading settings...</Text>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedSettings).map(([category, items]) => (
          <View key={category} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={20}
                color="#666"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>{getCategoryTitle(category)}</Text>
            </View>
            
            <View style={styles.sectionContent}>
              {items.map((item, index) => (
                <View key={item.key} style={[
                  styles.settingItem,
                  index === items.length - 1 && styles.lastItem
                ]}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={(value) => handleToggle(item.key, value)}
                    trackColor={{ false: '#e9ecef', true: '#007AFF' }}
                    thumbColor={settings[item.key] ? '#fff' : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoTitle}>About Notifications</Text>
          </View>
          <Text style={styles.infoText}>
            You can customize which notifications you receive. Security alerts cannot be disabled for your account safety.
          </Text>
          <Text style={styles.infoText}>
            Push notifications require permission from your device settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionContent: {
    backgroundColor: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default NotificationSettingsScreen;