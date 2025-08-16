// Premium Components
export * from './premium'

// Analytics Components
export * from './analytics'
export { default as SellerAnalyticsDashboard } from './analytics/SellerAnalyticsDashboard'
export { default as AnalyticsChart } from './analytics/AnalyticsChart'
export { default as MetricsCard } from './analytics/MetricsCard'
export { default as RevenueChart } from './analytics/RevenueChart'

// Ad Components
export * from './ads'

// Revenue Components
export * from './revenue'
export { default as RevenueTrackingDashboard } from './revenue/RevenueTrackingDashboard'
export { default as RevenueBreakdown } from './revenue/RevenueBreakdown'
export { default as PayoutSchedule } from './revenue/PayoutSchedule'

// Subscription Components
export * from './subscriptions'
export { default as RentalSubscriptionPlans } from './subscriptions/RentalSubscriptionPlans'
export { default as SubscriptionManager } from './subscriptions/SubscriptionManager'
export { default as BillingHistory } from './subscriptions/BillingHistory'

// Commission Components
export * from './commissions'
export { default as CommissionSystem } from './commissions/CommissionSystem'
export { default as CommissionTracker } from './commissions/CommissionTracker'
export { default as PayoutHistory } from './commissions/PayoutHistory'

// Notification Components
export * from './notifications'
export { default as PushNotificationSystem } from './notifications/PushNotificationSystem'
export { default as NotificationCenter } from './notifications/NotificationCenter'
export { default as EmailTemplates } from './notifications/EmailTemplates'

// Mobile Components
export * from './mobile'

// Payment Components (from previous implementation)
export * from './payments'

// UI Components
export * from './ui'

// Common Types and Interfaces
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

export interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  period: string
  format: 'number' | 'percentage' | 'currency' | 'duration'
}

export interface RevenueSource {
  id: string
  name: string
  amount: number
  percentage: number
  change: number
  color: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  limits: {
    listings: number
    photos: number
    videos: number
    support: string
  }
  popular?: boolean
  recommended?: boolean
}

export interface Commission {
  id: string
  bookingId: string
  amount: number
  rate: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  createdAt: Date
  paidAt?: Date
  description: string
  metadata?: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  type: 'push' | 'email' | 'sms' | 'in_app'
  category: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Utility Functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
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

export const getListingTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'basic':
      return 'bg-gray-100 text-gray-800'
    case 'featured':
      return 'bg-blue-100 text-blue-800'
    case 'premium':
      return 'bg-purple-100 text-purple-800'
    case 'spotlight':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'completed':
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'pending':
    case 'processing':
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'inactive':
    case 'paused':
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Constants
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

export const NOTIFICATION_TYPES = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app'
} as const

export const COMMISSION_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed'
} as const

export const SUBSCRIPTION_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const

export const REVENUE_SOURCES = {
  PREMIUM_LISTINGS: 'premium_listings',
  ADVERTISEMENTS: 'advertisements',
  SUBSCRIPTIONS: 'subscriptions',
  COMMISSIONS: 'commissions',
  FEATURED_PLACEMENTS: 'featured_placements'
} as const

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