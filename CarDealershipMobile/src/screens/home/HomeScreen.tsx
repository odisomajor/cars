import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Store
import { useAuthStore } from '../../store/authStore';

// Types
interface FeaturedListing {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  year: number;
  mileage: number;
  fuelType: string;
  isPremium: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockFeaturedListings: FeaturedListing[] = [
    {
      id: '1',
      title: '2023 BMW X5 M Sport',
      price: 75000,
      image: 'https://via.placeholder.com/400x250/007AFF/FFFFFF?text=BMW+X5',
      location: 'Nairobi, Kenya',
      year: 2023,
      mileage: 15000,
      fuelType: 'Petrol',
      isPremium: true,
    },
    {
      id: '2',
      title: '2022 Toyota Camry Hybrid',
      price: 45000,
      image: 'https://via.placeholder.com/400x250/28A745/FFFFFF?text=Toyota+Camry',
      location: 'Mombasa, Kenya',
      year: 2022,
      mileage: 25000,
      fuelType: 'Hybrid',
      isPremium: false,
    },
    {
      id: '3',
      title: '2024 Mercedes-Benz C-Class',
      price: 85000,
      image: 'https://via.placeholder.com/400x250/DC3545/FFFFFF?text=Mercedes+C-Class',
      location: 'Kisumu, Kenya',
      year: 2024,
      mileage: 8000,
      fuelType: 'Petrol',
      isPremium: true,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Search Cars',
      icon: 'search',
      color: '#007AFF',
      onPress: () => navigation.navigate('Search' as never),
    },
    {
      id: '2',
      title: 'Sell Car',
      icon: 'add-circle',
      color: '#28A745',
      onPress: () => navigation.navigate('CreateListing' as never),
    },
    {
      id: '3',
      title: 'My Bookings',
      icon: 'calendar',
      color: '#FFC107',
      onPress: () => navigation.navigate('Bookings' as never),
    },
    {
      id: '4',
      title: 'Messages',
      icon: 'chatbubbles',
      color: '#17A2B8',
      onPress: () => {}, // TODO: Navigate to messages
    },
  ];

  useEffect(() => {
    loadFeaturedListings();
  }, []);

  const loadFeaturedListings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedListings(mockFeaturedListings);
    } catch (error) {
      console.error('Error loading featured listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedListings();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderFeaturedListing = ({ item }: { item: FeaturedListing }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('ListingDetails' as never, { listingId: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.featuredImage} />
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.featuredPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.featuredDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.mileage.toLocaleString()} km</Text>
          </View>
        </View>
        <View style={styles.featuredDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.year}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.fuelType}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={item.onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}!</Text>
            <Text style={styles.subGreeting}>Find your perfect car today</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.quickActionsGrid}
          />
        </View>

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cars</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading featured cars...</Text>
            </View>
          ) : (
            <FlatList
              data={featuredListings}
              renderItem={renderFeaturedListing}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={CARD_WIDTH + 15}
              decelerationRate="fast"
            />
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,234</Text>
              <Text style={styles.statLabel}>Cars Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>567</Text>
              <Text style={styles.statLabel}>Dealers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>New Today</Text>
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickActionsGrid: {
    paddingHorizontal: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  featuredList: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredContent: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  featuredDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;