// Analytics Components
export { default as SellerAnalyticsDashboard } from './SellerAnalyticsDashboard'

// Analytics Types
export interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  period: string
  format: 'number' | 'percentage' | 'currency' | 'duration'
  icon?: string
  color?: string
}

export interface AnalyticsData {
  overview: {
    totalViews: number
    totalInquiries: number
    totalFavorites: number
    conversionRate: number
    viewsChange: number
    inquiriesChange: number
    favoritesChange: number
    conversionChange: number
  }
  trends: {
    date: string
    views: number
    inquiries: number
    favorites: number
  }[]
  listings: {
    id: string
    title: string
    views: number
    inquiries: number
    favorites: number
    conversionRate: number
    revenue: number
    type: string
  }[]
  demographics: {
    age: { range: string; percentage: number }[]
    location: { city: string; percentage: number }[]
    interests: { category: string; percentage: number }[]
  }
  revenue: {
    total: number
    monthly: number
    growth: number
    sources: { name: string; amount: number; percentage: number }[]
  }
}

export interface RecommendationItem {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  category: string
  actionUrl?: string
}

// Analytics Constants
export const ANALYTICS_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year'
} as const

export const METRIC_FORMATS = {
  NUMBER: 'number',
  PERCENTAGE: 'percentage',
  CURRENCY: 'currency',
  DURATION: 'duration'
} as const

export const CHANGE_TYPES = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  NEUTRAL: 'neutral'
} as const

// Utility Functions
export const formatMetricValue = (value: number, format: string): string => {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'duration':
      const hours = Math.floor(value / 3600)
      const minutes = Math.floor((value % 3600) / 60)
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const getChangeType = (change: number): 'increase' | 'decrease' | 'neutral' => {
  if (change > 0) return 'increase'
  if (change < 0) return 'decrease'
  return 'neutral'
}

export const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral'): string => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600'
    case 'decrease':
      return 'text-red-600'
    case 'neutral':
    default:
      return 'text-gray-600'
  }
}

export const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral'): string => {
  switch (changeType) {
    case 'increase':
      return '↗'
    case 'decrease':
      return '↘'
    case 'neutral':
    default:
      return '→'
  }
}

export const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getEffortColor = (effort: 'high' | 'medium' | 'low'): string => {
  switch (effort) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const generateMockAnalyticsData = (): AnalyticsData => {
  const today = new Date()
  const trends = []
  
  // Generate 30 days of trend data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    trends.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 500) + 100,
      inquiries: Math.floor(Math.random() * 50) + 10,
      favorites: Math.floor(Math.random() * 30) + 5
    })
  }
  
  return {
    overview: {
      totalViews: 12547,
      totalInquiries: 1834,
      totalFavorites: 892,
      conversionRate: 14.6,
      viewsChange: 12.5,
      inquiriesChange: -3.2,
      favoritesChange: 8.7,
      conversionChange: 2.1
    },
    trends,
    listings: [
      {
        id: '1',
        title: '2023 Tesla Model 3',
        views: 2847,
        inquiries: 342,
        favorites: 156,
        conversionRate: 12.0,
        revenue: 1250,
        type: 'premium'
      },
      {
        id: '2',
        title: '2022 BMW X5',
        views: 1923,
        inquiries: 287,
        favorites: 134,
        conversionRate: 14.9,
        revenue: 980,
        type: 'featured'
      },
      {
        id: '3',
        title: '2021 Audi A4',
        views: 1456,
        inquiries: 198,
        favorites: 89,
        conversionRate: 13.6,
        revenue: 750,
        type: 'basic'
      }
    ],
    demographics: {
      age: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 28 },
        { range: '45-54', percentage: 15 },
        { range: '55+', percentage: 7 }
      ],
      location: [
        { city: 'New York', percentage: 25 },
        { city: 'Los Angeles', percentage: 20 },
        { city: 'Chicago', percentage: 15 },
        { city: 'Houston', percentage: 12 },
        { city: 'Phoenix', percentage: 10 },
        { city: 'Other', percentage: 18 }
      ],
      interests: [
        { category: 'Luxury Cars', percentage: 35 },
        { category: 'Electric Vehicles', percentage: 28 },
        { category: 'SUVs', percentage: 22 },
        { category: 'Sports Cars', percentage: 15 }
      ]
    },
    revenue: {
      total: 15750,
      monthly: 2980,
      growth: 18.5,
      sources: [
        { name: 'Premium Listings', amount: 8500, percentage: 54 },
        { name: 'Featured Listings', amount: 4200, percentage: 27 },
        { name: 'Commissions', amount: 2050, percentage: 13 },
        { name: 'Other', amount: 1000, percentage: 6 }
      ]
    }
  }
}