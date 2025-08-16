// Ad Components
export { default as AdPlacementSystem } from './AdPlacementSystem'
export { default as MobileAdFormats } from './MobileAdFormats'

// Ad Types
export interface AdUnit {
  id: string
  name: string
  format: 'banner' | 'native' | 'interstitial' | 'rewarded' | 'video'
  placement: 'header' | 'sidebar' | 'footer' | 'inline' | 'overlay'
  size: string
  isActive: boolean
  impressions: number
  clicks: number
  revenue: number
  ctr: number
  cpm: number
  createdAt: Date
  updatedAt: Date
}

export interface AdContent {
  id: string
  title: string
  description: string
  imageUrl: string
  videoUrl?: string
  actionText: string
  actionUrl: string
  advertiser: string
  category: string
  targetAudience: string[]
  budget: number
  bidAmount: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

export interface AdPerformanceMetrics {
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  cpc: number
  conversionRate: number
  viewability: number
  completionRate?: number
}

export interface AdCampaign {
  id: string
  name: string
  description: string
  budget: number
  spent: number
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate: Date
  endDate: Date
  adUnits: string[]
  performance: AdPerformanceMetrics
  createdAt: Date
  updatedAt: Date
}

// Ad Constants
export const AD_FORMATS = {
  BANNER: 'banner',
  NATIVE: 'native',
  INTERSTITIAL: 'interstitial',
  REWARDED: 'rewarded',
  VIDEO: 'video'
} as const

export const AD_PLACEMENTS = {
  HEADER: 'header',
  SIDEBAR: 'sidebar',
  FOOTER: 'footer',
  INLINE: 'inline',
  OVERLAY: 'overlay'
} as const

export const AD_SIZES = {
  BANNER_320x50: '320x50',
  BANNER_728x90: '728x90',
  RECTANGLE_300x250: '300x250',
  SKYSCRAPER_160x600: '160x600',
  SQUARE_250x250: '250x250',
  FULLSCREEN: 'fullscreen'
} as const

export const AD_CATEGORIES = {
  AUTOMOTIVE: 'automotive',
  TECHNOLOGY: 'technology',
  FINANCE: 'finance',
  TRAVEL: 'travel',
  RETAIL: 'retail',
  ENTERTAINMENT: 'entertainment',
  HEALTH: 'health',
  EDUCATION: 'education'
} as const

// Utility Functions
export const formatAdRevenue = (revenue: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(revenue)
}

export const calculateCTR = (clicks: number, impressions: number): number => {
  return impressions > 0 ? (clicks / impressions) * 100 : 0
}

export const calculateCPM = (revenue: number, impressions: number): number => {
  return impressions > 0 ? (revenue / impressions) * 1000 : 0
}

export const calculateCPC = (revenue: number, clicks: number): number => {
  return clicks > 0 ? revenue / clicks : 0
}

export const calculateConversionRate = (conversions: number, clicks: number): number => {
  return clicks > 0 ? (conversions / clicks) * 100 : 0
}

export const getAdFormatColor = (format: string): string => {
  switch (format) {
    case 'banner':
      return 'bg-blue-100 text-blue-800'
    case 'native':
      return 'bg-green-100 text-green-800'
    case 'interstitial':
      return 'bg-purple-100 text-purple-800'
    case 'rewarded':
      return 'bg-yellow-100 text-yellow-800'
    case 'video':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getAdStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const generateMockAdUnit = (overrides: Partial<AdUnit> = {}): AdUnit => {
  const baseAdUnit: AdUnit = {
    id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Sample Ad Unit',
    format: 'banner',
    placement: 'header',
    size: '728x90',
    isActive: true,
    impressions: Math.floor(Math.random() * 10000) + 1000,
    clicks: Math.floor(Math.random() * 500) + 50,
    revenue: Math.floor(Math.random() * 1000) + 100,
    ctr: 0,
    cpm: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const adUnit = { ...baseAdUnit, ...overrides }
  adUnit.ctr = calculateCTR(adUnit.clicks, adUnit.impressions)
  adUnit.cpm = calculateCPM(adUnit.revenue, adUnit.impressions)

  return adUnit
}

export const generateMockAdCampaign = (overrides: Partial<AdCampaign> = {}): AdCampaign => {
  const impressions = Math.floor(Math.random() * 50000) + 10000
  const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01))
  const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02))
  const revenue = clicks * (Math.random() * 3 + 1)

  const baseCampaign: AdCampaign = {
    id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Sample Campaign',
    description: 'A sample advertising campaign',
    budget: 5000,
    spent: Math.floor(revenue),
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    adUnits: [],
    performance: {
      impressions,
      clicks,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      ctr: calculateCTR(clicks, impressions),
      cpm: calculateCPM(revenue, impressions),
      cpc: calculateCPC(revenue, clicks),
      conversionRate: calculateConversionRate(conversions, clicks),
      viewability: Math.random() * 20 + 80,
      completionRate: Math.random() * 30 + 70
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return { ...baseCampaign, ...overrides }
}