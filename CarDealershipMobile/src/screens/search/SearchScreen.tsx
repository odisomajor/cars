import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  selected: boolean;
}

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: '1', label: 'Sedan', value: 'sedan', selected: false },
    { id: '2', label: 'SUV', value: 'suv', selected: false },
    { id: '3', label: 'Hatchback', value: 'hatchback', selected: false },
    { id: '4', label: 'Coupe', value: 'coupe', selected: false },
  ]);

  const priceRanges = [
    { id: '1', label: 'Under KES 1M', value: '0-1000000' },
    { id: '2', label: 'KES 1M - 3M', value: '1000000-3000000' },
    { id: '3', label: 'KES 3M - 5M', value: '3000000-5000000' },
    { id: '4', label: 'Above KES 5M', value: '5000000+' },
  ];

  const toggleFilter = (filterId: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, selected: !filter.selected }
        : filter
    ));
  };

  const handleSearch = () => {
    const selectedFilters = filters.filter(f => f.selected);
    console.log('Search query:', searchQuery);
    console.log('Selected filters:', selectedFilters);
    // TODO: Implement search functionality
  };

  const renderFilterChip = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      style={[styles.filterChip, item.selected && styles.filterChipSelected]}
      onPress={() => toggleFilter(item.id)}
    >
      <Text style={[styles.filterChipText, item.selected && styles.filterChipTextSelected]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderPriceRange = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.priceRangeItem}>
      <Text style={styles.priceRangeText}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search Cars</Text>
          <Text style={styles.subtitle}>Find your perfect vehicle</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by make, model, or keyword..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Type</Text>
          <FlatList
            data={filters}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceRangeContainer}>
            {priceRanges.map((range) => (
              <TouchableOpacity key={range.id} style={styles.priceRangeItem}>
                <Text style={styles.priceRangeText}>{range.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Filters</Text>
          <View style={styles.advancedFilters}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.filterButtonText}>Year</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
              <Text style={styles.filterButtonText}>Mileage</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="car-outline" size={20} color="#007AFF" />
              <Text style={styles.filterButtonText}>Fuel Type</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.filterButtonText}>Location</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Button */}
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.searchButtonText}>Search Cars</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.recentSearches}>
            <TouchableOpacity style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.recentSearchText}>BMW X5 2023</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.recentSearchText}>Toyota Camry Hybrid</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.recentSearchText}>Mercedes SUV</Text>
            </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  priceRangeContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  priceRangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceRangeText: {
    fontSize: 16,
    color: '#333',
  },
  advancedFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 4,
    minWidth: '45%',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    marginRight: 4,
    flex: 1,
  },
  searchButtonContainer: {
    padding: 20,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentSearches: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default SearchScreen;