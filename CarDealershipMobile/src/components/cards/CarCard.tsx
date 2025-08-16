import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { formatCurrency, formatNumber } from '../../utils';
import Card from '../common/Card';

interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  images: string[];
  isFavorite?: boolean;
  isPromoted?: boolean;
  dealerName?: string;
  views?: number;
  createdAt: string;
}

interface CarCardProps {
  car: CarListing;
  onPress: (car: CarListing) => void;
  onFavoritePress?: (car: CarListing) => void;
  onCallPress?: (car: CarListing) => void;
  onMessagePress?: (car: CarListing) => void;
  showActions?: boolean;
  style?: ViewStyle;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onPress,
  onFavoritePress,
  onCallPress,
  onMessagePress,
  showActions = true,
  style,
}) => {
  const renderImage = () => {
    const imageUri = car.images && car.images.length > 0 ? car.images[0] : null;

    return (
      <View style={styles.imageContainer}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : { uri: 'https://via.placeholder.com/300x200/F2F2F7/8E8E93?text=Car' }
          }
          style={styles.image}
          resizeMode="cover"
        />
        {car.isPromoted && (
          <View style={styles.promotedBadge}>
            <Text style={styles.promotedText}>PROMOTED</Text>
          </View>
        )}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(car)}
          >
            <Ionicons
              name={car.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={car.isFavorite ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        )}
        <View style={styles.imageOverlay}>
          <Text style={styles.priceText}>{formatCurrency(car.price)}</Text>
        </View>
      </View>
    );
  };

  const renderDetails = () => {
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.titleText} numberOfLines={2}>
          {car.title}
        </Text>
        <Text style={styles.subtitleText}>
          {car.year} {car.make} {car.model}
        </Text>
        
        <View style={styles.specsContainer}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={14} color={COLORS.gray} />
            <Text style={styles.specText}>{formatNumber(car.mileage)} km</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="car-outline" size={14} color={COLORS.gray} />
            <Text style={styles.specText}>{car.transmission}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="flash-outline" size={14} color={COLORS.gray} />
            <Text style={styles.specText}>{car.fuelType}</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={COLORS.gray} />
          <Text style={styles.locationText}>{car.location}</Text>
        </View>

        {car.dealerName && (
          <View style={styles.dealerContainer}>
            <Ionicons name="business-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dealerText}>{car.dealerName}</Text>
          </View>
        )}

        {car.views && (
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={12} color={COLORS.gray} />
            <Text style={styles.viewsText}>{formatNumber(car.views)} views</Text>
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionsContainer}>
        {onCallPress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => onCallPress(car)}
          >
            <Ionicons name="call" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        {onMessagePress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => onMessagePress(car)}
          >
            <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
            <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
              Message
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Card
      onPress={() => onPress(car)}
      style={[styles.container, style]}
      padding="none"
      shadow="medium"
    >
      {renderImage()}
      {renderDetails()}
      {renderActions()}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promotedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  promotedText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.overlayLight,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: SPACING.md,
  },
  priceText: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  detailsContainer: {
    padding: SPACING.md,
  },
  titleText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  dealerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dealerText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  callButton: {
    backgroundColor: COLORS.success,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  messageButton: {
    backgroundColor: COLORS.white,
    borderBottomRightRadius: BORDER_RADIUS.md,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
});

export default CarCard;