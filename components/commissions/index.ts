// Commission Components
export { default as CommissionSystem } from './CommissionSystem'

// Commission Types
export interface Commission {
  id: string
  bookingId: string
  sellerId: string
  buyerId: string
  vehicleId: string
  amount: number
  rate: number
  baseAmount: number
  currency: string
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'disputed' | 'refunded'
  type: 'rental' | 'sale' | 'subscription' | 'premium_listing' | 'advertisement'
  createdAt: Date
  processedAt?: Date
  paidAt?: Date
  dueDate: Date
  description: string
  metadata?: {
    vehicleTitle?: string
    rentalDuration?: number
    bookingReference?: string
    paymentMethod?: string
    [key: string]: any
  }
}

export interface CommissionStats {
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
  failedCommissions: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  averageCommission: number
  commissionRate: number
  monthlyGrowth: number
  conversionRate: number
}

export interface CommissionRule {
  id: string
  name: string
  type: 'rental' | 'sale' | 'subscription' | 'premium_listing' | 'advertisement'
  rate: number
  minAmount?: number
  maxAmount?: number
  conditions?: {
    vehicleType?: string[]
    rentalDuration?: {
      min?: number
      max?: number
    }
    sellerTier?: string[]
    location?: string[]
    [key: string]: any
  }
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
  description?: string
}

export interface CommissionTrend {
  date: string
  commissions: number
  amount: number
  averageCommission: number
  conversionRate: number
}

export interface CommissionCalculation {
  baseAmount: number
  rate: number
  commissionAmount: number
  fees?: {
    processing: number
    platform: number
    total: number
  }
  netAmount: number
  currency: string
  appliedRules: string[]
}

export interface CommissionPayout {
  id: string
  sellerId: string
  commissionIds: string[]
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'check'
  scheduledDate: Date
  processedDate?: Date
  reference?: string
  fees: number
  netAmount: number
}

// Commission Constants
export const COMMISSION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  DISPUTED: 'disputed',
  REFUNDED: 'refunded'
} as const

export const COMMISSION_TYPES = {
  RENTAL: 'rental',
  SALE: 'sale',
  SUBSCRIPTION: 'subscription',
  PREMIUM_LISTING: 'premium_listing',
  ADVERTISEMENT: 'advertisement'
} as const

export const PAYOUT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  CHECK: 'check'
} as const

export const DEFAULT_COMMISSION_RATES = {
  RENTAL: 0.15, // 15%
  SALE: 0.05, // 5%
  SUBSCRIPTION: 0.20, // 20%
  PREMIUM_LISTING: 0.30, // 30%
  ADVERTISEMENT: 0.25 // 25%
} as const

export const COMMISSION_STATUS_COLORS = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  paid: '#10B981',
  failed: '#EF4444',
  disputed: '#8B5CF6',
  refunded: '#6B7280'
} as const

// Utility Functions
export const formatCommissionAmount = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatCommissionRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}

export const calculateCommission = (
  baseAmount: number,
  rate: number,
  fees: { processing?: number; platform?: number } = {}
): CommissionCalculation => {
  const commissionAmount = baseAmount * rate
  const processingFee = fees.processing || 0
  const platformFee = fees.platform || 0
  const totalFees = processingFee + platformFee
  const netAmount = commissionAmount - totalFees
  
  return {
    baseAmount,
    rate,
    commissionAmount,
    fees: {
      processing: processingFee,
      platform: platformFee,
      total: totalFees
    },
    netAmount: Math.max(0, netAmount),
    currency: 'USD',
    appliedRules: []
  }
}

export const getCommissionStatusColor = (status: string): string => {
  return COMMISSION_STATUS_COLORS[status as keyof typeof COMMISSION_STATUS_COLORS] || '#6B7280'
}

export const getCommissionStatusIcon = (status: string): string => {
  switch (status) {
    case 'pending':
      return '⏳'
    case 'processing':
      return '⚡'
    case 'paid':
      return '✅'
    case 'failed':
      return '❌'
    case 'disputed':
      return '⚠️'
    case 'refunded':
      return '↩️'
    default:
      return '❓'
  }
}

export const calculateCommissionGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const calculateAverageCommission = (commissions: Commission[]): number => {
  if (commissions.length === 0) return 0
  const total = commissions.reduce((sum, commission) => sum + commission.amount, 0)
  return total / commissions.length
}

export const calculateCommissionConversionRate = (paidCommissions: number, totalCommissions: number): number => {
  if (totalCommissions === 0) return 0
  return (paidCommissions / totalCommissions) * 100
}

export const filterCommissionsByStatus = (commissions: Commission[], status: string): Commission[] => {
  return commissions.filter(commission => commission.status === status)
}

export const filterCommissionsByType = (commissions: Commission[], type: string): Commission[] => {
  return commissions.filter(commission => commission.type === type)
}

export const filterCommissionsByDateRange = (
  commissions: Commission[],
  startDate: Date,
  endDate: Date
): Commission[] => {
  return commissions.filter(commission => {
    const commissionDate = new Date(commission.createdAt)
    return commissionDate >= startDate && commissionDate <= endDate
  })
}

export const groupCommissionsByMonth = (commissions: Commission[]): { [key: string]: Commission[] } => {
  return commissions.reduce((groups, commission) => {
    const date = new Date(commission.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!groups[monthKey]) {
      groups[monthKey] = []
    }
    
    groups[monthKey].push(commission)
    return groups
  }, {} as { [key: string]: Commission[] })
}

export const generateCommissionReport = (
  commissions: Commission[],
  period: { start: Date; end: Date }
): {
  summary: CommissionStats
  breakdown: { [key: string]: { count: number; amount: number } }
  trends: CommissionTrend[]
} => {
  const filteredCommissions = filterCommissionsByDateRange(commissions, period.start, period.end)
  const paidCommissions = filterCommissionsByStatus(filteredCommissions, 'paid')
  const pendingCommissions = filterCommissionsByStatus(filteredCommissions, 'pending')
  const failedCommissions = filterCommissionsByStatus(filteredCommissions, 'failed')
  
  const totalAmount = filteredCommissions.reduce((sum, c) => sum + c.amount, 0)
  const paidAmount = paidCommissions.reduce((sum, c) => sum + c.amount, 0)
  const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)
  
  const summary: CommissionStats = {
    totalCommissions: filteredCommissions.length,
    pendingCommissions: pendingCommissions.length,
    paidCommissions: paidCommissions.length,
    failedCommissions: failedCommissions.length,
    totalAmount,
    pendingAmount,
    paidAmount,
    averageCommission: calculateAverageCommission(filteredCommissions),
    commissionRate: filteredCommissions.length > 0 ? totalAmount / filteredCommissions.reduce((sum, c) => sum + c.baseAmount, 0) : 0,
    monthlyGrowth: 0, // Would need historical data
    conversionRate: calculateCommissionConversionRate(paidCommissions.length, filteredCommissions.length)
  }
  
  const breakdown = Object.values(COMMISSION_TYPES).reduce((acc, type) => {
    const typeCommissions = filterCommissionsByType(filteredCommissions, type)
    acc[type] = {
      count: typeCommissions.length,
      amount: typeCommissions.reduce((sum, c) => sum + c.amount, 0)
    }
    return acc
  }, {} as { [key: string]: { count: number; amount: number } })
  
  // Generate daily trends for the period
  const trends: CommissionTrend[] = []
  const currentDate = new Date(period.start)
  
  while (currentDate <= period.end) {
    const dayCommissions = filteredCommissions.filter(c => {
      const commissionDate = new Date(c.createdAt)
      return commissionDate.toDateString() === currentDate.toDateString()
    })
    
    const dayAmount = dayCommissions.reduce((sum, c) => sum + c.amount, 0)
    const dayPaid = dayCommissions.filter(c => c.status === 'paid').length
    
    trends.push({
      date: currentDate.toISOString().split('T')[0],
      commissions: dayCommissions.length,
      amount: dayAmount,
      averageCommission: dayCommissions.length > 0 ? dayAmount / dayCommissions.length : 0,
      conversionRate: dayCommissions.length > 0 ? (dayPaid / dayCommissions.length) * 100 : 0
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return { summary, breakdown, trends }
}

export const generateMockCommissions = (count: number = 50): Commission[] => {
  const commissions: Commission[] = []
  const statuses = Object.values(COMMISSION_STATUS)
  const types = Object.values(COMMISSION_TYPES)
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const baseAmount = Math.random() * 1000 + 100
    const rate = DEFAULT_COMMISSION_RATES[type as keyof typeof DEFAULT_COMMISSION_RATES]
    const amount = baseAmount * rate
    
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90))
    
    const dueDate = new Date(createdAt)
    dueDate.setDate(dueDate.getDate() + 30)
    
    commissions.push({
      id: `comm_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: `booking_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: `seller_${Math.random().toString(36).substr(2, 9)}`,
      buyerId: `buyer_${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: `vehicle_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100) / 100,
      rate,
      baseAmount: Math.round(baseAmount * 100) / 100,
      currency: 'USD',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type,
      createdAt,
      dueDate,
      description: `Commission for ${type.replace('_', ' ')} transaction`,
      metadata: {
        vehicleTitle: `${['Toyota', 'Honda', 'BMW', 'Mercedes'][Math.floor(Math.random() * 4)]} ${['Camry', 'Civic', 'X5', 'C-Class'][Math.floor(Math.random() * 4)]}`,
        rentalDuration: type === 'rental' ? Math.floor(Math.random() * 30) + 1 : undefined,
        bookingReference: `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }
    })
  }
  
  return commissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const generateMockCommissionRules = (): CommissionRule[] => {
  return [
    {
      id: 'rule_rental_standard',
      name: 'Standard Rental Commission',
      type: 'rental',
      rate: 0.15,
      conditions: {
        rentalDuration: { min: 1, max: 30 }
      },
      active: true,
      priority: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      description: 'Standard commission rate for rental bookings'
    },
    {
      id: 'rule_rental_longterm',
      name: 'Long-term Rental Commission',
      type: 'rental',
      rate: 0.12,
      conditions: {
        rentalDuration: { min: 31 }
      },
      active: true,
      priority: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      description: 'Reduced commission rate for long-term rentals'
    },
    {
      id: 'rule_sale_standard',
      name: 'Vehicle Sale Commission',
      type: 'sale',
      rate: 0.05,
      minAmount: 1000,
      active: true,
      priority: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      description: 'Commission rate for vehicle sales'
    },
    {
      id: 'rule_premium_listing',
      name: 'Premium Listing Commission',
      type: 'premium_listing',
      rate: 0.30,
      active: true,
      priority: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      description: 'Commission rate for premium listing upgrades'
    }
  ]
}