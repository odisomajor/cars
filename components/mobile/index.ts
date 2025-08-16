// Mobile Ad Integration Components
export {
  MobileAdIntegration,
  MobileBannerAd,
  MobileNativeAd,
  MobileInterstitialAd,
  MobileRewardedAd
} from './MobileAdIntegration'

// Default export for MobileAdIntegration
export { default as MobileAdIntegrationDefault } from './MobileAdIntegration'

// Mobile Ad Integration Types
export interface MobileAd {
  id: string
  title: string
  description: string
  imageUrl: string
  videoUrl?: string
  actionText: string
  actionUrl: string
  advertiser: string
  category: string
  format: 'banner' | 'native' | 'interstitial' | 'rewarded' | 'video'
  placement: 'top' | 'bottom' | 'inline' | 'fullscreen' | 'overlay'
  targetAudience: string[]
  budget: number
  bidAmount: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  isActive: boolean
  startDate: Date
  endDate: Date
  createdAt: Date
}

export interface AdPerformance {
  adId: string
  date: string
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  viewability: number
  completionRate?: number
}

export interface MobileAdIntegrationProps {
  className?: string
  placement?: 'top' | 'bottom' | 'inline' | 'fullscreen' | 'overlay'
  format?: 'banner' | 'native' | 'interstitial' | 'rewarded' | 'video'
  showControls?: boolean
  autoPlay?: boolean
  muted?: boolean
  onAdClick?: (ad: MobileAd) => void
  onAdImpression?: (ad: MobileAd) => void
  onAdComplete?: (ad: MobileAd) => void
}

// Mobile Ad Format Constants
export const MOBILE_AD_FORMATS = {
  BANNER: 'banner',
  NATIVE: 'native',
  INTERSTITIAL: 'interstitial',
  REWARDED: 'rewarded',
  VIDEO: 'video'
} as const

export const MOBILE_AD_PLACEMENTS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  INLINE: 'inline',
  FULLSCREEN: 'fullscreen',
  OVERLAY: 'overlay'
} as const

export const MOBILE_AD_CATEGORIES = {
  AUTOMOTIVE: 'Automotive',
  MOBILE_APP: 'Mobile App',
  CONTEST: 'Contest',
  RETAIL: 'Retail',
  FINANCE: 'Finance',
  TRAVEL: 'Travel',
  FOOD: 'Food',
  ENTERTAINMENT: 'Entertainment',
  TECHNOLOGY: 'Technology',
  HEALTH: 'Health'
} as const

// Utility Functions
export const formatMobileAdRevenue = (revenue: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(revenue)
}

export const formatAdMetric = (value: number, type: 'number' | 'percentage' | 'currency' = 'number'): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(2)}%`
    case 'currency':
      return formatAdRevenue(value)
    case 'number':
    default:
      return value.toLocaleString()
  }
}

export const calculateMobileCTR = (clicks: number, impressions: number): number => {
  return impressions > 0 ? (clicks / impressions) * 100 : 0
}

export const calculateMobileCPM = (revenue: number, impressions: number): number => {
  return impressions > 0 ? (revenue / impressions) * 1000 : 0
}

export const calculateMobileConversionRate = (conversions: number, clicks: number): number => {
  return clicks > 0 ? (conversions / clicks) * 100 : 0
}

export const getMobileAdFormatColor = (format: string): string => {
  switch (format) {
    case 'banner':
      return 'bg-blue-500'
    case 'native':
      return 'bg-green-500'
    case 'interstitial':
      return 'bg-purple-500'
    case 'rewarded':
      return 'bg-yellow-500'
    case 'video':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export const getAdPlacementIcon = (placement: string) => {
  switch (placement) {
    case 'top':
      return '↑'
    case 'bottom':
      return '↓'
    case 'inline':
      return '→'
    case 'fullscreen':
      return '⛶'
    case 'overlay':
      return '⧉'
    default:
      return '•'
  }
}

// Mock Data Generators
export const generateMockAd = (overrides: Partial<MobileAd> = {}): MobileAd => {
  const baseAd: MobileAd = {
    id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Sample Ad Title',
    description: 'This is a sample ad description that showcases the product or service.',
    imageUrl: '/images/ads/sample-ad.jpg',
    actionText: 'Learn More',
    actionUrl: '/sample-ad',
    advertiser: 'Sample Advertiser',
    category: 'Automotive',
    format: 'native',
    placement: 'inline',
    targetAudience: ['all_users'],
    budget: 1000,
    bidAmount: 2.00,
    impressions: 5000,
    clicks: 150,
    conversions: 15,
    revenue: 300,
    ctr: 3.0,
    cpm: 60,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  }

  return { ...baseAd, ...overrides }
}

export const generateMockAdPerformance = (adId: string, days: number = 7): AdPerformance[] => {
  const performance: AdPerformance[] = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const impressions = Math.floor(Math.random() * 2000) + 500
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)) // 1-6% CTR
    const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)) // 2-12% conversion rate
    const ctr = (clicks / impressions) * 100
    const revenue = clicks * (Math.random() * 3 + 1) // $1-4 per click
    const cpm = (revenue / impressions) * 1000
    
    performance.push({
      adId,
      date: date.toISOString().split('T')[0],
      impressions,
      clicks,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      viewability: Math.random() * 20 + 80, // 80-100% viewability
      completionRate: Math.random() * 30 + 70 // 70-100% completion rate
    })
  }
  
  return performance.reverse() // Most recent first
}