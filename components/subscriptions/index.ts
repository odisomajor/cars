// Subscription Components
export { default as RentalSubscriptionPlans } from './RentalSubscriptionPlans'

// Subscription Types
export interface SubscriptionPlan {
  id: string
  name: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  limits: {
    listings: number
    photos: number
    videoMinutes: number
    prioritySupport: boolean
    analytics: boolean
    customBranding: boolean
    apiAccess: boolean
  }
  popular?: boolean
  recommended?: boolean
  color: string
  description: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'suspended'
  billingCycle: 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  nextBillingDate: Date
  amount: number
  currency: string
  autoRenew: boolean
  usage: {
    listings: number
    photos: number
    videoMinutes: number
  }
  paymentMethod?: {
    type: 'card' | 'paypal' | 'bank'
    last4?: string
    brand?: string
  }
}

export interface SubscriptionUsage {
  planId: string
  period: {
    start: Date
    end: Date
  }
  usage: {
    listings: {
      used: number
      limit: number
      percentage: number
    }
    photos: {
      used: number
      limit: number
      percentage: number
    }
    videoMinutes: {
      used: number
      limit: number
      percentage: number
    }
  }
  overageCharges?: {
    listings: number
    photos: number
    videoMinutes: number
    total: number
  }
}

export interface SubscriptionInvoice {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  dueDate: Date
  paidDate?: Date
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  tax?: number
  discount?: number
  total: number
}

// Subscription Constants
export const SUBSCRIPTION_PLANS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
} as const

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const

export const PLAN_COLORS = {
  STARTER: '#10B981',
  PROFESSIONAL: '#3B82F6',
  ENTERPRISE: '#8B5CF6'
} as const

// Default Plans
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: {
      monthly: 29,
      yearly: 290
    },
    features: [
      'Up to 10 active listings',
      '20 photos per listing',
      '5 minutes of video per listing',
      'Basic analytics',
      'Email support',
      'Mobile app access'
    ],
    limits: {
      listings: 10,
      photos: 20,
      videoMinutes: 5,
      prioritySupport: false,
      analytics: true,
      customBranding: false,
      apiAccess: false
    },
    color: PLAN_COLORS.STARTER,
    description: 'Perfect for individual car owners and small dealers'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: {
      monthly: 79,
      yearly: 790
    },
    features: [
      'Up to 50 active listings',
      'Unlimited photos per listing',
      '15 minutes of video per listing',
      'Advanced analytics & insights',
      'Priority support',
      'Featured listing placement',
      'Custom branding options',
      'Lead management tools'
    ],
    limits: {
      listings: 50,
      photos: -1, // unlimited
      videoMinutes: 15,
      prioritySupport: true,
      analytics: true,
      customBranding: true,
      apiAccess: false
    },
    popular: true,
    color: PLAN_COLORS.PROFESSIONAL,
    description: 'Ideal for growing dealerships and rental companies'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 199,
      yearly: 1990
    },
    features: [
      'Unlimited active listings',
      'Unlimited photos per listing',
      'Unlimited video content',
      'Premium analytics & reporting',
      'Dedicated account manager',
      'Priority listing placement',
      'Full custom branding',
      'API access & integrations',
      'Multi-location management',
      'White-label solutions'
    ],
    limits: {
      listings: -1, // unlimited
      photos: -1, // unlimited
      videoMinutes: -1, // unlimited
      prioritySupport: true,
      analytics: true,
      customBranding: true,
      apiAccess: true
    },
    recommended: true,
    color: PLAN_COLORS.ENTERPRISE,
    description: 'Complete solution for large dealerships and enterprises'
  }
]

// Utility Functions
export const formatSubscriptionPrice = (price: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyFromMonthly = monthlyPrice * 12
  return yearlyFromMonthly - yearlyPrice
}

export const calculateSavingsPercentage = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyFromMonthly = monthlyPrice * 12
  const savings = yearlyFromMonthly - yearlyPrice
  return Math.round((savings / yearlyFromMonthly) * 100)
}

export const getPlanColor = (planId: string): string => {
  switch (planId.toLowerCase()) {
    case 'starter':
      return PLAN_COLORS.STARTER
    case 'professional':
      return PLAN_COLORS.PROFESSIONAL
    case 'enterprise':
      return PLAN_COLORS.ENTERPRISE
    default:
      return '#6B7280'
  }
}

export const getSubscriptionStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return '#10B981'
    case 'cancelled':
      return '#F59E0B'
    case 'expired':
      return '#EF4444'
    case 'pending':
      return '#6366F1'
    case 'suspended':
      return '#EF4444'
    default:
      return '#6B7280'
  }
}

export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0 // unlimited
  return Math.min((used / limit) * 100, 100)
}

export const isUsageNearLimit = (used: number, limit: number, threshold: number = 80): boolean => {
  if (limit === -1) return false // unlimited
  return calculateUsagePercentage(used, limit) >= threshold
}

export const isUsageOverLimit = (used: number, limit: number): boolean => {
  if (limit === -1) return false // unlimited
  return used > limit
}

export const calculateOverageCharges = (
  usage: { listings: number; photos: number; videoMinutes: number },
  limits: { listings: number; photos: number; videoMinutes: number },
  rates: { listings: number; photos: number; videoMinutes: number } = { listings: 5, photos: 0.1, videoMinutes: 2 }
): { listings: number; photos: number; videoMinutes: number; total: number } => {
  const overages = {
    listings: Math.max(0, limits.listings === -1 ? 0 : usage.listings - limits.listings),
    photos: Math.max(0, limits.photos === -1 ? 0 : usage.photos - limits.photos),
    videoMinutes: Math.max(0, limits.videoMinutes === -1 ? 0 : usage.videoMinutes - limits.videoMinutes)
  }
  
  const charges = {
    listings: overages.listings * rates.listings,
    photos: overages.photos * rates.photos,
    videoMinutes: overages.videoMinutes * rates.videoMinutes,
    total: 0
  }
  
  charges.total = charges.listings + charges.photos + charges.videoMinutes
  
  return charges
}

export const generateMockSubscription = (planId: string = 'professional'): UserSubscription => {
  const plan = DEFAULT_PLANS.find(p => p.id === planId) || DEFAULT_PLANS[1]
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 2)
  
  const endDate = new Date(startDate)
  endDate.setFullYear(endDate.getFullYear() + 1)
  
  const nextBillingDate = new Date()
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
  
  return {
    id: `sub_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    planId: plan.id,
    status: 'active',
    billingCycle: 'yearly',
    startDate,
    endDate,
    nextBillingDate,
    amount: plan.price.yearly,
    currency: 'KES',
    autoRenew: true,
    usage: {
      listings: Math.floor(Math.random() * (plan.limits.listings === -1 ? 30 : plan.limits.listings)),
      photos: Math.floor(Math.random() * (plan.limits.photos === -1 ? 200 : plan.limits.photos)),
      videoMinutes: Math.floor(Math.random() * (plan.limits.videoMinutes === -1 ? 60 : plan.limits.videoMinutes))
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa'
    }
  }
}

export const generateMockUsage = (subscription: UserSubscription): SubscriptionUsage => {
  const plan = DEFAULT_PLANS.find(p => p.id === subscription.planId) || DEFAULT_PLANS[1]
  
  return {
    planId: subscription.planId,
    period: {
      start: new Date(subscription.startDate),
      end: new Date(subscription.endDate)
    },
    usage: {
      listings: {
        used: subscription.usage.listings,
        limit: plan.limits.listings,
        percentage: calculateUsagePercentage(subscription.usage.listings, plan.limits.listings)
      },
      photos: {
        used: subscription.usage.photos,
        limit: plan.limits.photos,
        percentage: calculateUsagePercentage(subscription.usage.photos, plan.limits.photos)
      },
      videoMinutes: {
        used: subscription.usage.videoMinutes,
        limit: plan.limits.videoMinutes,
        percentage: calculateUsagePercentage(subscription.usage.videoMinutes, plan.limits.videoMinutes)
      }
    },
    overageCharges: calculateOverageCharges(
      subscription.usage,
      plan.limits
    )
  }
}