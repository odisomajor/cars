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

interface CarListing {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  location: string;
  images: string[];
  status: 'active' | 'pending' | 'sold' | 'draft';
  views: number;
  inquiries: number;
  createdAt: string;
}

const MyListingsScreen = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'draft'>('all');

  // Mock data - replace with actual API call
  const mockListings: CarListing[] = [
    {
      id: '1',
      title: '2023 BMW X5 xDrive40i',
      price: 8500000,
      year: 2023,
      mileage: 15000,
      location: 'Nairobi, Kenya',
      images: ['https://via.placeholder.com/300x200'],
      status: 'active',
      views: 245,
      inquiries: 12,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: '2022 Toyota Camry Hybrid',
      price: 4200000,
      year: 2022,
      mileage: 28000,
      location: 'Mombasa, Kenya',
      images: ['https://via.placeholder.com/300x200'],
      status: 'pending',
      views: 189,
      inquiries: 8,
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      title: '2021 Mercedes-Benz C-Class',
      price: 6800000,
      year: 2021,
      mileage: 35000,
      location: 'Kisumu, Kenya',
      images: ['https://via.placeholder.com/300x200'],
      status: 'sold',
      views: 156,
      inquiries: 15,
      createdAt: '2024-01-05',
    },
    {
      id: '4',
      title: '2024 Audi Q7 Premium',
      price: 12000000,
      year: 2024,
      mileage: 5000,
      location: 'Nairobi, Kenya',
      images: ['https://via.placeholder.com/300x200'],
      status: 'draft',
      views: 0,
      inquiries: 0,
      createdAt: '2024-01-20',
    },
  ];

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      // TODO: Replace with actual API call
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'pending': return '#ffc107';
      case 'sold': return '#6c757d';
      case 'draft': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Review';
      case 'sold': return 'Sold';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  const handleEditListing = (listing: CarListing) => {
    // TODO: Navigate to edit listing screen
    console.log('Edit listing:', listing.id);
  };

  const handleDeleteListing = (listing: CarListing) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setListings(listings.filter(l => l.id !== listing.id));
          },
        },
      ]
    );
  };

  const handlePromoteListing = (listing: CarListing) => {
    Alert.alert(
      'Promote Listing',
      'Boost your listing visibility with premium promotion.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Promote', onPress: () => console.log('Promote listing:', listing.id) },
      ]
    );
  };

  const filteredListings = filter === 'all' 
    ? listings 
    : listings.filter(listing => listing.status === filter);

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

  const renderListingItem = ({ item }: { item: CarListing }) => (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listingPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.listingDetails}>
            {item.year} • {item.mileage.toLocaleString()} km
          </Text>
          <Text style={styles.listingLocation}>{item.location}</Text>
        </View>
      </View>
      
      <View style={styles.listingStats}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.views} views</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.inquiries} inquiries</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.listingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditListing(item)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handlePromoteListing(item)}
        >
          <Ionicons name="trending-up-outline" size={20} color="#28a745" />
          <Text style={[styles.actionButtonText, { color: '#28a745' }]}>Promote</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteListing(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
          <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('sold', 'Sold')}
        {renderFilterButton('draft', 'Draft')}
      </View>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Start by creating your first car listing'
                : `No ${filter} listings at the moment`
              }
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Listing</Text>
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  listingCard: {
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
  listingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  listingImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  listingDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  listingLocation: {
    fontSize: 14,
    color: '#666',
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  listingActions: {
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
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyListingsScreen;