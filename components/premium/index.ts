// Premium Components
export { default as FeaturedCarousel } from './FeaturedCarousel'
export { PremiumBadge, PremiumFeatures, PremiumHighlight, PremiumListingCard, PremiumStatus, UpgradeSuggestion, listingTypeConfigs } from './PremiumBadges'
export type { ListingType as PremiumListingType, BadgeVariant, ListingTypeConfig } from './PremiumBadges'
export { InstantBooking, PriorityPlacement, PremiumRentalSummary } from './PremiumRentalFeatures'
export type { RentalListing, BookingRequest } from './PremiumRentalFeatures'

// Premium Types
export interface ListingType {
  BASIC: 'basic'
  FEATURED: 'featured'
  PREMIUM: 'premium'
  SPOTLIGHT: 'spotlight'
}

export interface BadgeVariant {
  DEFAULT: 'default'
  COMPACT: 'compact'
  DETAILED: 'detailed'
  ANIMATED: 'animated'
}

export interface PremiumListing {
  id: string
  title: string
  price: number
  originalPrice?: number
  images: string[]
  location: string
  type: 'basic' | 'featured' | 'premium' | 'spotlight'
  category: string
  seller: {
    name: string
    avatar: string
    rating: number
    verified: boolean
  }
  features: string[]
  isInstantBooking?: boolean
  priority: number
  createdAt: Date
  expiresAt?: Date
}

export interface PremiumFeature {
  id: string
  name: string
  description: string
  icon: string
  included: boolean
  highlight?: boolean
}

// Premium Constants
export const LISTING_TYPES = {
  BASIC: 'basic',
  FEATURED: 'featured',
  PREMIUM: 'premium',
  SPOTLIGHT: 'spotlight'
} as const

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  DETAILED: 'detailed',
  ANIMATED: 'animated'
} as const

export const PREMIUM_FEATURES = {
  INSTANT_BOOKING: 'instant_booking',
  PRIORITY_PLACEMENT: 'priority_placement',
  FEATURED_BADGE: 'featured_badge',
  PREMIUM_SUPPORT: 'premium_support',
  ANALYTICS_DASHBOARD: 'analytics_dashboard',
  MULTIPLE_PHOTOS: 'multiple_photos',
  VIDEO_UPLOAD: 'video_upload',
  SOCIAL_SHARING: 'social_sharing'
} as const

// Utility Functions
export const getListingTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'basic':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'featured':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'premium':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'spotlight':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getListingTypePriority = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'spotlight':
      return 4
    case 'premium':
      return 3
    case 'featured':
      return 2
    case 'basic':
    default:
      return 1
  }
}

export const getListingTypePrice = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'featured':
      return 29.99
    case 'premium':
      return 59.99
    case 'spotlight':
      return 99.99
    case 'basic':
    default:
      return 0
  }
}

export const getListingTypeFeatures = (type: string): string[] => {
  switch (type.toLowerCase()) {
    case 'basic':
      return ['Basic listing', 'Up to 3 photos', 'Standard support']
    case 'featured':
      return [
        'Featured badge',
        'Priority in search',
        'Up to 10 photos',
        'Basic analytics',
        'Email support'
      ]
    case 'premium':
      return [
        'Premium badge',
        'Top search placement',
        'Unlimited photos',
        'Video upload',
        'Advanced analytics',
        'Priority support',
        'Social media sharing'
      ]
    case 'spotlight':
      return [
        'Spotlight badge',
        'Homepage featured',
        'Unlimited photos & videos',
        'Instant booking',
        'Full analytics suite',
        'Dedicated support',
        'Marketing boost',
        'Premium placement'
      ]
    default:
      return []
  }
}

export const sortListingsByPriority = (listings: PremiumListing[]): PremiumListing[] => {
  return listings.sort((a, b) => {
    const priorityA = getListingTypePriority(a.type)
    const priorityB = getListingTypePriority(b.type)
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA // Higher priority first
    }
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export const filterListingsByType = (listings: PremiumListing[], type: string): PremiumListing[] => {
  return listings.filter(listing => listing.type === type)
}

export const getNextUpgradeType = (currentType: string): string | null => {
  switch (currentType.toLowerCase()) {
    case 'basic':
      return 'featured'
    case 'featured':
      return 'premium'
    case 'premium':
      return 'spotlight'
    case 'spotlight':
    default:
      return null
  }
}