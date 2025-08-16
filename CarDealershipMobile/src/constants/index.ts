import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Colors
export const COLORS = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  
  // Secondary colors
  secondary: '#FF6B35',
  secondaryDark: '#E55A2B',
  secondaryLight: '#FF8A5C',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  darkGray: '#48484A',
  
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textLight: '#FFFFFF',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Border colors
  border: '#E5E5EA',
  separator: '#C6C6C8',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Transparent
  transparent: 'transparent',
  
  // Car status colors
  available: '#34C759',
  sold: '#FF3B30',
  pending: '#FF9500',
  draft: '#8E8E93',
  
  // Booking status colors
  confirmed: '#34C759',
  cancelled: '#FF3B30',
  completed: '#007AFF',
  upcoming: '#FF9500',
};

// Typography
export const FONTS = {
  // Font families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SEARCH_HISTORY: 'search_history',
  FAVORITES: 'favorites',
  SETTINGS: 'settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

// App configuration
export const APP_CONFIG = {
  NAME: 'Car Dealership',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@cardealership.com',
  PRIVACY_POLICY_URL: 'https://cardealership.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://cardealership.com/terms',
  APP_STORE_URL: 'https://apps.apple.com/app/car-dealership',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.cardealership',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Image configuration
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  THUMBNAIL_SIZE: 300,
};

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_REGION: {
    latitude: -1.2921, // Nairobi, Kenya
    longitude: 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  ZOOM_LEVELS: {
    CITY: 0.1,
    NEIGHBORHOOD: 0.01,
    STREET: 0.001,
  },
};

// Car makes and models
export const CAR_MAKES = [
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Subaru',
  'Mitsubishi',
  'Suzuki',
  'Isuzu',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volkswagen',
  'Ford',
  'Chevrolet',
  'Hyundai',
  'Kia',
  'Peugeot',
  'Renault',
  'Land Rover',
  'Jeep',
];

export const BODY_TYPES = [
  'Sedan',
  'Hatchback',
  'SUV',
  'Wagon',
  'Coupe',
  'Convertible',
  'Pickup',
  'Van',
  'Minivan',
  'Crossover',
];

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Hybrid',
  'Electric',
  'LPG',
];

export const TRANSMISSION_TYPES = [
  'Manual',
  'Automatic',
  'CVT',
];

export const DRIVE_TYPES = [
  'FWD', // Front Wheel Drive
  'RWD', // Rear Wheel Drive
  'AWD', // All Wheel Drive
  '4WD', // Four Wheel Drive
];

// Price ranges
export const PRICE_RANGES = [
  { label: 'Under KES 500K', min: 0, max: 500000 },
  { label: 'KES 500K - 1M', min: 500000, max: 1000000 },
  { label: 'KES 1M - 2M', min: 1000000, max: 2000000 },
  { label: 'KES 2M - 3M', min: 2000000, max: 3000000 },
  { label: 'KES 3M - 5M', min: 3000000, max: 5000000 },
  { label: 'Above KES 5M', min: 5000000, max: null },
];

// Year ranges
export const YEAR_RANGES = [
  { label: '2020 and newer', min: 2020, max: new Date().getFullYear() },
  { label: '2015 - 2019', min: 2015, max: 2019 },
  { label: '2010 - 2014', min: 2010, max: 2014 },
  { label: '2005 - 2009', min: 2005, max: 2009 },
  { label: 'Before 2005', min: 1990, max: 2004 },
];

// Mileage ranges
export const MILEAGE_RANGES = [
  { label: 'Under 50,000 km', min: 0, max: 50000 },
  { label: '50,000 - 100,000 km', min: 50000, max: 100000 },
  { label: '100,000 - 150,000 km', min: 100000, max: 150000 },
  { label: '150,000 - 200,000 km', min: 150000, max: 200000 },
  { label: 'Above 200,000 km', min: 200000, max: null },
];

// Kenyan counties for location filtering
export const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Kakamega',
  'Machakos',
  'Meru',
  'Nyeri',
  'Kericho',
  'Naivasha',
  'Nanyuki',
  'Voi',
  'Kilifi',
  'Lamu',
  'Isiolo',
];

// User roles
export const USER_ROLES = {
  BUYER: 'buyer',
  DEALER: 'dealer',
  ADMIN: 'admin',
} as const;

// Listing statuses
export const LISTING_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  EXPIRED: 'expired',
} as const;

// Booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  SYSTEM: 'system',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  MESSAGE: 'message',
  LISTING: 'listing',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
} as const;

// Sort options
export const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Year: Newest First', value: 'year_desc' },
  { label: 'Year: Oldest First', value: 'year_asc' },
  { label: 'Mileage: Low to High', value: 'mileage_asc' },
  { label: 'Mileage: High to Low', value: 'mileage_desc' },
  { label: 'Recently Added', value: 'created_desc' },
  { label: 'Most Popular', value: 'views_desc' },
];

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_CHAT: true,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_AR_VIEW: false,
  ENABLE_FINANCING: true,
  ENABLE_INSURANCE: true,
  ENABLE_TRADE_IN: true,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  LISTING_CREATED: 'Listing created successfully!',
  LISTING_UPDATED: 'Listing updated successfully!',
  LISTING_DELETED: 'Listing deleted successfully!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
};

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 1000,
  TITLE_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 500,
};

// Default values
export const DEFAULTS = {
  AVATAR_COLOR: '#007AFF',
  LISTING_IMAGES_LIMIT: 10,
  SEARCH_RESULTS_LIMIT: 20,
  RECENT_SEARCHES_LIMIT: 10,
  CONVERSATION_MESSAGES_LIMIT: 50,
  NOTIFICATIONS_LIMIT: 100,
  AUTO_LOGOUT_TIME: 30 * 60 * 1000, // 30 minutes
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
};

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_KE: /^(\+254|0)[17]\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};