// Payment Components
export { default as PaymentForm } from './PaymentForm'
export { default as PaymentModal } from './PaymentModal'
export { default as PaymentHistory } from './PaymentHistory'
export { default as PaymentDashboard } from './PaymentDashboard'
export { default as PaymentButton, CompactPaymentButton, PremiumBadge as PaymentPremiumBadge, UpgradeSuggestion as PaymentUpgradeSuggestion } from './PaymentButton'

// Types
export interface PaymentIntent {
  id: string
  clientSecret?: string
  checkoutRequestID?: string
  amount: number
  currency: string
  provider: 'stripe' | 'mpesa'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  checkoutRequestID?: string
  error?: string
}

export interface CreatePaymentRequest {
  listingType: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT' | 'FEATURED_RENTAL' | 'PREMIUM_FLEET' | 'SPOTLIGHT_RENTAL'
  listingId?: string
  provider: 'stripe' | 'mpesa'
  phoneNumber?: string
}

export interface Payment {
  id: string
  paymentIntentId?: string
  merchantRequestID?: string
  userId: string
  listingId?: string
  amount: number
  currency: string
  provider: 'stripe' | 'mpesa'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  listingType: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  listing?: {
    id: string
    title: string
    make: string
    model: string
  }
}

export interface PaymentSummary {
  total: number
  succeeded: number
  pending: number
  failed: number
  totalAmount: number
}

export interface PaymentStats {
  thisMonth: {
    amount: number
    count: number
  }
  lastMonth: {
    amount: number
    count: number
  }
  growth: {
    amount: number
    count: number
  }
  trends: Array<{
    month: string
    amount: number
    count: number
  }>
  paymentMethods: Array<{
    provider: string
    amount: number
    count: number
  }>
  listingTypes: Array<{
    listingType: string
    amount: number
    count: number
  }>
}

// Utility functions
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export const formatListingType = (listingType: string) => {
  return listingType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const getPaymentStatusColor = (status: Payment['status']) => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-100',
    succeeded: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    canceled: 'text-gray-600 bg-gray-100',
  }
  return colors[status] || colors.pending
}

export const getProviderName = (provider: 'stripe' | 'mpesa') => {
  return provider === 'stripe' ? 'Credit Card' : 'M-Pesa'
}

// Constants
export const LISTING_TYPES = {
  FEATURED: 'Featured Listing',
  PREMIUM: 'Premium Listing',
  SPOTLIGHT: 'Spotlight Listing',
  FEATURED_RENTAL: 'Featured Rental',
  PREMIUM_FLEET: 'Premium Fleet',
  SPOTLIGHT_RENTAL: 'Spotlight Rental',
} as const

export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  MPESA: 'mpesa',
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
} as const