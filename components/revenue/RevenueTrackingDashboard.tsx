'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  BarChart3,
  LineChart,
  Users,
  Car,
  CreditCard,
  Percent,
  Target,
  Clock,
  MapPin,
  Star,
  Eye,
  MousePointer,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet,
  Building,
  UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface RevenueData {
  period: string
  totalRevenue: number
  listingRevenue: number
  adRevenue: number
  subscriptionRevenue: number
  commissionRevenue: number
  growth: number
  transactions: number
  averageOrderValue: number
}

interface RevenueSource {
  id: string
  name: string
  type: 'listing' | 'ad' | 'subscription' | 'commission'
  revenue: number
  percentage: number
  growth: number
  transactions: number
  color: string
}

interface RevenueMetrics {
  totalRevenue: number
  monthlyGrowth: number
  yearlyGrowth: number
  averageOrderValue: number
  conversionRate: number
  customerLifetimeValue: number
  monthlyRecurringRevenue: number
  churnRate: number
}

interface RevenueTrackingDashboardProps {
  className?: string
}

const REVENUE_SOURCES: RevenueSource[] = [
  {
    id: '1',
    name: 'Premium Listings',
    type: 'listing',
    revenue: 15420.50,
    percentage: 45.2,
    growth: 12.5,
    transactions: 234,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Advertisement Revenue',
    type: 'ad',
    revenue: 8930.25,
    percentage: 26.1,
    growth: 8.3,
    transactions: 156,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Subscription Plans',
    type: 'subscription',
    revenue: 6240.75,
    percentage: 18.3,
    growth: 15.7,
    transactions: 89,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    name: 'Rental Commissions',
    type: 'commission',
    revenue: 3580.00,
    percentage: 10.4,
    growth: -2.1,
    transactions: 67,
    color: 'bg-orange-500'
  }
]

const MONTHLY_DATA: RevenueData[] = [
  {
    period: 'Jan 2024',
    totalRevenue: 28450.30,
    listingRevenue: 12800.50,
    adRevenue: 7650.25,
    subscriptionRevenue: 5200.75,
    commissionRevenue: 2798.80,
    growth: 8.5,
    transactions: 456,
    averageOrderValue: 62.39
  },
  {
    period: 'Feb 2024',
    totalRevenue: 31250.75,
    listingRevenue: 14100.25,
    adRevenue: 8320.50,
    subscriptionRevenue: 5680.00,
    commissionRevenue: 3150.00,
    growth: 9.8,
    transactions: 523,
    averageOrderValue: 59.75
  },
  {
    period: 'Mar 2024',
    totalRevenue: 34171.50,
    listingRevenue: 15420.50,
    adRevenue: 8930.25,
    subscriptionRevenue: 6240.75,
    commissionRevenue: 3580.00,
    growth: 9.3,
    transactions: 546,
    averageOrderValue: 62.59
  }
]

export const RevenueTrackingDashboard: React.FC<RevenueTrackingDashboardProps> = ({
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedSource, setSelectedSource] = useState('all')
  const [loading, setLoading] = useState(false)
  const [revenueData, setRevenueData] = useState<RevenueData[]>(MONTHLY_DATA)
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 34171.50,
    monthlyGrowth: 9.3,
    yearlyGrowth: 24.7,
    averageOrderValue: 62.59,
    conversionRate: 3.2,
    customerLifetimeValue: 485.30,
    monthlyRecurringRevenue: 6240.75,
    churnRate: 2.1
  })

  const refreshData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Revenue data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Generate CSV data
    const csvData = [
      ['Period', 'Total Revenue', 'Listing Revenue', 'Ad Revenue', 'Subscription Revenue', 'Commission Revenue', 'Growth %', 'Transactions', 'AOV'],
      ...revenueData.map(data => [
        data.period,
        data.totalRevenue.toFixed(2),
        data.listingRevenue.toFixed(2),
        data.adRevenue.toFixed(2),
        data.subscriptionRevenue.toFixed(2),
        data.commissionRevenue.toFixed(2),
        data.growth.toFixed(1),
        data.transactions.toString(),
        data.averageOrderValue.toFixed(2)
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Revenue report exported')
  }

  const currentRevenue = revenueData[revenueData.length - 1]
  const previousRevenue = revenueData[revenueData.length - 2]
  const revenueGrowth = previousRevenue ? 
    ((currentRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue) * 100 : 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Tracking</h1>
          <p className="text-gray-600">Monitor and analyze your revenue streams</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">KES {metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              {revenueGrowth >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+{revenueGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-600">{revenueGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold">{metrics.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+2.1%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold">KES {metrics.averageOrderValue}</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR</p>
                <p className="text-2xl font-bold">KES {metrics.monthlyRecurringRevenue.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.7%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {REVENUE_SOURCES.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-4 h-4 rounded-full', source.color)} />
                    <div>
                      <h4 className="font-semibold">{source.name}</h4>
                      <p className="text-sm text-gray-600">{source.transactions} transactions</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">KES {source.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gray-600">{source.percentage}%</span>
                      {source.growth >= 0 ? (
                        <span className="text-green-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{source.growth}%
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          {source.growth}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Conversion Rate</h4>
                    <p className="text-sm text-gray-600">Visitors to customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{metrics.conversionRate}%</p>
                  <span className="text-green-600 text-sm">+0.3%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">Customer LTV</h4>
                    <p className="text-sm text-gray-600">Lifetime value</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KES {metrics.customerLifetimeValue}</p>
                  <span className="text-green-600 text-sm">+12.5%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold">Churn Rate</h4>
                    <p className="text-sm text-gray-600">Monthly churn</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{metrics.churnRate}%</p>
                  <span className="text-green-600 text-sm">-0.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.map((data, index) => {
              const isLatest = index === revenueData.length - 1
              return (
                <div key={data.period} className={cn(
                  'flex items-center justify-between p-4 border rounded-lg transition-colors',
                  isLatest ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                )}>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold">{data.period}</p>
                      {isLatest && (
                        <Badge variant="default" className="text-xs mt-1">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold ml-1">KES {data.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Listings:</span>
                        <span className="font-semibold ml-1">KES {data.listingRevenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ads:</span>
                        <span className="font-semibold ml-1">KES {data.adRevenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subs:</span>
                        <span className="font-semibold ml-1">KES {data.subscriptionRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {data.growth >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-semibold">+{data.growth}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-semibold">{data.growth}%</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{data.transactions} transactions</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Building className="w-6 h-6" />
              <span>Subscription Plans</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Zap className="w-6 h-6" />
              <span>Ad Campaigns</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Star className="w-6 h-6" />
              <span>Premium Features</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Percent className="w-6 h-6" />
              <span>Commission Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueTrackingDashboard