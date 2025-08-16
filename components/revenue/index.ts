// Revenue Components
export { default as RevenueTrackingDashboard } from './RevenueTrackingDashboard'

// Revenue Types
export interface RevenueMetrics {
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  monthlyRecurringRevenue: number
  revenueGrowth: number
  monthlyGrowth: number
  aovGrowth: number
  mrrGrowth: number
}

export interface RevenueSource {
  id: string
  name: string
  amount: number
  percentage: number
  change: number
  color: string
  description?: string
}

export interface RevenuePerformance {
  conversionRate: number
  customerLifetimeValue: number
  churnRate: number
  conversionChange: number
  clvChange: number
  churnChange: number
}

export interface RevenueTrend {
  date: string
  revenue: number
  orders: number
  averageOrderValue: number
  newCustomers: number
  returningCustomers: number
}

export interface RevenueReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  period: {
    start: Date
    end: Date
  }
  metrics: RevenueMetrics
  sources: RevenueSource[]
  performance: RevenuePerformance
  trends: RevenueTrend[]
  generatedAt: Date
}

// Revenue Constants
export const REVENUE_SOURCES = {
  PREMIUM_LISTINGS: 'premium_listings',
  ADVERTISEMENTS: 'advertisements',
  SUBSCRIPTIONS: 'subscriptions',
  COMMISSIONS: 'commissions',
  FEATURED_PLACEMENTS: 'featured_placements',
  TRANSACTION_FEES: 'transaction_fees',
  MEMBERSHIP_FEES: 'membership_fees'
} as const

export const REVENUE_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
} as const

export const REVENUE_COLORS = {
  PREMIUM_LISTINGS: '#8B5CF6',
  ADVERTISEMENTS: '#10B981',
  SUBSCRIPTIONS: '#F59E0B',
  COMMISSIONS: '#EF4444',
  FEATURED_PLACEMENTS: '#3B82F6',
  TRANSACTION_FEES: '#6366F1',
  MEMBERSHIP_FEES: '#EC4899'
} as const

// Utility Functions
export const formatRevenue = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatRevenueDetailed = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const calculateRevenueGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const calculateAverageOrderValue = (totalRevenue: number, totalOrders: number): number => {
  return totalOrders > 0 ? totalRevenue / totalOrders : 0
}

export const calculateCustomerLifetimeValue = (
  averageOrderValue: number,
  purchaseFrequency: number,
  customerLifespan: number
): number => {
  return averageOrderValue * purchaseFrequency * customerLifespan
}

export const calculateChurnRate = (customersLost: number, totalCustomers: number): number => {
  return totalCustomers > 0 ? (customersLost / totalCustomers) * 100 : 0
}

export const getRevenueSourceColor = (source: string): string => {
  switch (source.toLowerCase()) {
    case 'premium_listings':
      return REVENUE_COLORS.PREMIUM_LISTINGS
    case 'advertisements':
      return REVENUE_COLORS.ADVERTISEMENTS
    case 'subscriptions':
      return REVENUE_COLORS.SUBSCRIPTIONS
    case 'commissions':
      return REVENUE_COLORS.COMMISSIONS
    case 'featured_placements':
      return REVENUE_COLORS.FEATURED_PLACEMENTS
    case 'transaction_fees':
      return REVENUE_COLORS.TRANSACTION_FEES
    case 'membership_fees':
      return REVENUE_COLORS.MEMBERSHIP_FEES
    default:
      return '#6B7280'
  }
}

export const generateMockRevenueData = (): {
  metrics: RevenueMetrics
  sources: RevenueSource[]
  performance: RevenuePerformance
  trends: RevenueTrend[]
} => {
  const today = new Date()
  const trends: RevenueTrend[] = []
  
  // Generate 30 days of trend data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const orders = Math.floor(Math.random() * 50) + 20
    const revenue = orders * (Math.random() * 100 + 50)
    
    trends.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(revenue * 100) / 100,
      orders,
      averageOrderValue: Math.round((revenue / orders) * 100) / 100,
      newCustomers: Math.floor(Math.random() * 20) + 5,
      returningCustomers: Math.floor(Math.random() * 30) + 10
    })
  }
  
  const totalRevenue = trends.reduce((sum, trend) => sum + trend.revenue, 0)
  const totalOrders = trends.reduce((sum, trend) => sum + trend.orders, 0)
  const averageOrderValue = calculateAverageOrderValue(totalRevenue, totalOrders)
  
  return {
    metrics: {
      totalRevenue: 125750,
      monthlyRevenue: 28500,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      monthlyRecurringRevenue: 15200,
      revenueGrowth: 18.5,
      monthlyGrowth: 12.3,
      aovGrowth: 5.7,
      mrrGrowth: 22.1
    },
    sources: [
      {
        id: '1',
        name: 'Premium Listings',
        amount: 45250,
        percentage: 36,
        change: 15.2,
        color: REVENUE_COLORS.PREMIUM_LISTINGS,
        description: 'Revenue from premium listing upgrades'
      },
      {
        id: '2',
        name: 'Advertisements',
        amount: 32100,
        percentage: 26,
        change: 8.7,
        color: REVENUE_COLORS.ADVERTISEMENTS,
        description: 'Revenue from ad placements and campaigns'
      },
      {
        id: '3',
        name: 'Subscriptions',
        amount: 25200,
        percentage: 20,
        change: 25.3,
        color: REVENUE_COLORS.SUBSCRIPTIONS,
        description: 'Monthly and yearly subscription fees'
      },
      {
        id: '4',
        name: 'Commissions',
        amount: 15750,
        percentage: 12,
        change: -2.1,
        color: REVENUE_COLORS.COMMISSIONS,
        description: 'Commission from successful bookings'
      },
      {
        id: '5',
        name: 'Transaction Fees',
        amount: 7450,
        percentage: 6,
        change: 12.8,
        color: REVENUE_COLORS.TRANSACTION_FEES,
        description: 'Processing fees from transactions'
      }
    ],
    performance: {
      conversionRate: 3.2,
      customerLifetimeValue: 485,
      churnRate: 5.8,
      conversionChange: 0.5,
      clvChange: 12.3,
      churnChange: -1.2
    },
    trends
  }
}

export const exportRevenueReport = (report: RevenueReport, format: 'csv' | 'pdf' | 'excel' = 'csv'): void => {
  // This would typically integrate with a reporting service
  console.log(`Exporting revenue report in ${format} format:`, report)
  
  if (format === 'csv') {
    const csvData = [
      ['Date', 'Revenue', 'Orders', 'AOV', 'New Customers', 'Returning Customers'],
      ...report.trends.map(trend => [
        trend.date,
        trend.revenue.toString(),
        trend.orders.toString(),
        trend.averageOrderValue.toString(),
        trend.newCustomers.toString(),
        trend.returningCustomers.toString()
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `revenue-report-${report.id}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }
}