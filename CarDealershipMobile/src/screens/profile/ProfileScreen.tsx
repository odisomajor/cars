import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  const handlePaymentMethods = () => {
    // TODO: Navigate to payment methods screen
    console.log('Payment methods');
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings' as never);
  };

  const handlePrivacySettings = () => {
    // TODO: Navigate to privacy settings screen
    console.log('Privacy settings');
  };

  const handleHelpSupport = () => {
    // TODO: Navigate to help & support screen
    console.log('Help & support');
  };

  const handleAbout = () => {
    // TODO: Navigate to about screen
    console.log('About');
  };

  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      type: 'navigation',
      onPress: handleEditProfile,
    },
    {
      id: '2',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock-closed-outline',
      type: 'navigation',
      onPress: handleChangePassword,
    },
    {
      id: '3',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      icon: 'card-outline',
      type: 'navigation',
      onPress: handlePaymentMethods,
    },
  ];

  const notificationOptions: ProfileOption[] = [
    {
      id: '4',
      title: 'Push Notifications',
      subtitle: 'Receive app notifications',
      icon: 'notifications-outline',
      type: 'switch',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: '5',
      title: 'Location Services',
      subtitle: 'Allow location-based features',
      icon: 'location-outline',
      type: 'switch',
      value: locationEnabled,
      onToggle: setLocationEnabled,
    },
    {
      id: '6',
      title: 'Marketing Emails',
      subtitle: 'Receive promotional content',
      icon: 'mail-outline',
      type: 'switch',
      value: marketingEnabled,
      onToggle: setMarketingEnabled,
    },
  ];

  const supportOptions: ProfileOption[] = [
    {
      id: '7',
      title: 'Notification Settings',
      subtitle: 'Customize your notifications',
      icon: 'settings-outline',
      type: 'navigation',
      onPress: handleNotificationSettings,
    },
    {
      id: '8',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield-outline',
      type: 'navigation',
      onPress: handlePrivacySettings,
    },
    {
      id: '9',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      type: 'navigation',
      onPress: handleHelpSupport,
    },
    {
      id: '10',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      type: 'navigation',
      onPress: handleAbout,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionItem}
      onPress={option.onPress}
      disabled={option.type === 'switch'}
    >
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons name={option.icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          {option.subtitle && (
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.optionRight}>
        {option.type === 'switch' ? (
          <Switch
            value={option.value}
            onValueChange={option.onToggle}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={option.value ? '#fff' : '#f4f3f4'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, options: ProfileOption[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {options.map(renderProfileOption)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/100x100' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {user?.role === 'dealer' ? 'Car Dealer' : 'Car Buyer'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section (for dealers) */}
        {user?.role === 'dealer' && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
          </View>
        )}

        {/* Profile Options */}
        {renderSection('Account', profileOptions)}
        {renderSection('Preferences', notificationOptions)}
        {renderSection('Support', supportOptions)}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#dc3545" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
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
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  editProfileText: {
    color: '#007AFF',
    marginLeft: 4,
    fontSize: 16,
  },
  statsSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 20,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#fff',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  optionRight: {
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;