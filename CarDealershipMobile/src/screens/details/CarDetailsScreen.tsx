import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../constants';
import { Button, Card } from '../../components';
import { formatCurrency, formatNumber } from '../../utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.3;

interface CarDetails {
  id: string;
  title: string;
  price: number;
  images: string[];
  year: number;
  make: string;
  model: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  engineSize: string;
  driveType: string;
  condition: string;
  location: string;
  description: string;
  features: string[];
  dealer: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    email: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  promoted: boolean;
  createdAt: string;
}

type CarDetailsScreenRouteProp = RouteProp<
  { CarDetails: { carId: string } },
  'CarDetails'
>;

const CarDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CarDetailsScreenRouteProp>();
  const { carId } = route.params;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Mock data - replace with API call
  const carDetails: CarDetails = {
    id: carId,
    title: '2020 Toyota Camry Hybrid LE',
    price: 2800000,
    images: [
      'https://via.placeholder.com/400x300/F2F2F7/8E8E93?text=Car+1',
      'https://via.placeholder.com/400x300/F2F2F7/8E8E93?text=Car+2',
      'https://via.placeholder.com/400x300/F2F2F7/8E8E93?text=Car+3',
      'https://via.placeholder.com/400x300/F2F2F7/8E8E93?text=Car+4',
    ],
    year: 2020,
    make: 'Toyota',
    model: 'Camry',
    mileage: 45000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: 'Silver',
    engineSize: '2.5L',
    driveType: 'FWD',
    condition: 'Excellent',
    location: 'Nairobi, Kenya',
    description: 'This 2020 Toyota Camry Hybrid is in excellent condition with low mileage. It has been well-maintained and comes with a full service history. The car features advanced safety systems, comfortable interior, and excellent fuel economy.',
    features: [
      'Backup Camera',
      'Bluetooth',
      'Cruise Control',
      'Keyless Entry',
      'Power Windows',
      'Air Conditioning',
      'ABS Brakes',
      'Airbags',
      'Power Steering',
      'Alloy Wheels',
    ],
    dealer: {
      id: '1',
      name: 'Premium Motors',
      phone: '+254712345678',
      email: 'info@premiummotors.co.ke',
      rating: 4.8,
      reviewCount: 156,
      verified: true,
    },
    promoted: true,
    createdAt: '2024-01-15T10:30:00Z',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${carDetails.dealer.phone}`);
  };

  const handleMessage = () => {
    // Navigate to chat screen or open messaging app
    Alert.alert('Message', 'Opening chat with dealer...');
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing car details...');
  };

  const handleBookViewing = () => {
    Alert.alert('Book Viewing', 'Booking a viewing appointment...');
  };

  const renderImageCarousel = () => {
    return (
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={carDetails.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {carDetails.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
        
        {/* Header buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleFavorite}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? COLORS.error : COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {carDetails.promoted && (
          <View style={styles.promotedBadge}>
            <Ionicons name="star" size={16} color={COLORS.white} />
            <Text style={styles.promotedText}>PROMOTED</Text>
          </View>
        )}
      </View>
    );
  };

  const renderBasicInfo = () => {
    return (
      <Card style={styles.section}>
        <Text style={styles.carTitle}>{carDetails.title}</Text>
        <Text style={styles.carPrice}>{formatCurrency(carDetails.price)}</Text>
        
        <View style={styles.basicInfoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{carDetails.year}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="speedometer-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Mileage</Text>
            <Text style={styles.infoValue}>{formatNumber(carDetails.mileage)} km</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="car-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Fuel</Text>
            <Text style={styles.infoValue}>{carDetails.fuelType}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="settings-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoLabel}>Transmission</Text>
            <Text style={styles.infoValue}>{carDetails.transmission}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderSpecifications = () => {
    const specs = [
      { label: 'Make', value: carDetails.make },
      { label: 'Model', value: carDetails.model },
      { label: 'Body Type', value: carDetails.bodyType },
      { label: 'Color', value: carDetails.color },
      { label: 'Engine Size', value: carDetails.engineSize },
      { label: 'Drive Type', value: carDetails.driveType },
      { label: 'Condition', value: carDetails.condition },
      { label: 'Location', value: carDetails.location },
    ];

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        
        {specs.map((spec, index) => (
          <View key={index} style={styles.specRow}>
            <Text style={styles.specLabel}>{spec.label}</Text>
            <Text style={styles.specValue}>{spec.value}</Text>
          </View>
        ))}
      </Card>
    );
  };

  const renderFeatures = () => {
    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.featuresGrid}>
          {carDetails.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderDescription = () => {
    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{carDetails.description}</Text>
      </Card>
    );
  };

  const renderDealerInfo = () => {
    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dealer Information</Text>
        
        <View style={styles.dealerContainer}>
          <View style={styles.dealerAvatar}>
            <Text style={styles.dealerInitials}>
              {carDetails.dealer.name.charAt(0)}
            </Text>
          </View>
          
          <View style={styles.dealerInfo}>
            <View style={styles.dealerNameContainer}>
              <Text style={styles.dealerName}>{carDetails.dealer.name}</Text>
              {carDetails.dealer.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              )}
            </View>
            
            <View style={styles.dealerRating}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.ratingText}>
                {carDetails.dealer.rating} ({carDetails.dealer.reviewCount} reviews)
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <Button
          title="Book Viewing"
          onPress={handleBookViewing}
          variant="primary"
          style={styles.bookButton}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageCarousel()}
        {renderBasicInfo()}
        {renderSpecifications()}
        {renderFeatures()}
        {renderDescription()}
        {renderDealerInfo()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  carImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  promotedBadge: {
    position: 'absolute',
    top: 100,
    right: SPACING.lg,
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  promotedText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: 4,
  },
  section: {
    margin: SPACING.lg,
    marginBottom: 0,
  },
  carTitle: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  carPrice: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  basicInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  specLabel: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  specValue: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 24,
  },
  dealerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  dealerInitials: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  dealerInfo: {
    flex: 1,
  },
  dealerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dealerName: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  dealerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.small,
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  messageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bookButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default CarDetailsScreen;