'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import {
  Eye,
  Heart,
  MessageCircle,
  Phone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Calendar,
  MapPin,
  Star,
  Download,
  RefreshCw,
  Filter,
  Share2,
  Target,
  Users,
  Clock,
  Zap,
  Crown,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, subMonths } from 'date-fns'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalInquiries: number
    totalFavorites: number
    totalCalls: number
    conversionRate: number
    averageViewTime: number
    responseRate: number
    listingPerformance: number
  }
  trends: {
    views: Array<{ date: string; count: number }>
    inquiries: Array<{ date: string; count: number }>
    favorites: Array<{ date: string; count: number }>
  }
  listings: Array<{
    id: string
    title: string
    type: 'SALE' | 'RENTAL'
    listingType: 'BASIC' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
    views: number
    inquiries: number
    favorites: number
    calls: number
    price: number
    createdAt: Date
    status: 'ACTIVE' | 'SOLD' | 'RENTED' | 'EXPIRED'
    performance: {
      viewsPerDay: number
      inquiryRate: number
      favoriteRate: number
      callRate: number
    }
  }>
  demographics: {
    ageGroups: Array<{ range: string; count: number; percentage: number }>
    locations: Array<{ city: string; count: number; percentage: number }>
    interests: Array<{ category: string; count: number; percentage: number }>
  }
  revenue: {
    totalEarnings: number
    monthlyEarnings: Array<{ month: string; amount: number }>
    premiumSpending: number
    averageBookingValue: number
    commissionPaid: number
  }
}

interface SellerAnalyticsDashboardProps {
  userId: string
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const SellerAnalyticsDashboard: React.FC<SellerAnalyticsDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId, timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 12450,
          totalInquiries: 234,
          totalFavorites: 567,
          totalCalls: 89,
          conversionRate: 1.88,
          averageViewTime: 145,
          responseRate: 92,
          listingPerformance: 78
        },
        trends: {
          views: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), 'MMM dd'),
            count: Math.floor(Math.random() * 500) + 200
          })),
          inquiries: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), 'MMM dd'),
            count: Math.floor(Math.random() * 20) + 5
          })),
          favorites: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), 'MMM dd'),
            count: Math.floor(Math.random() * 30) + 10
          }))
        },
        listings: [
          {
            id: '1',
            title: '2023 Tesla Model 3',
            type: 'SALE',
            listingType: 'SPOTLIGHT',
            views: 2340,
            inquiries: 45,
            favorites: 123,
            calls: 18,
            price: 45000,
            createdAt: subDays(new Date(), 15),
            status: 'ACTIVE',
            performance: {
              viewsPerDay: 156,
              inquiryRate: 1.92,
              favoriteRate: 5.26,
              callRate: 0.77
            }
          },
          {
            id: '2',
            title: '2022 BMW X5 Rental',
            type: 'RENTAL',
            listingType: 'PREMIUM',
            views: 1890,
            inquiries: 67,
            favorites: 89,
            calls: 23,
            price: 120,
            createdAt: subDays(new Date(), 8),
            status: 'ACTIVE',
            performance: {
              viewsPerDay: 236,
              inquiryRate: 3.54,
              favoriteRate: 4.71,
              callRate: 1.22
            }
          }
        ],
        demographics: {
          ageGroups: [
            { range: '18-25', count: 145, percentage: 23 },
            { range: '26-35', count: 234, percentage: 37 },
            { range: '36-45', count: 156, percentage: 25 },
            { range: '46-55', count: 78, percentage: 12 },
            { range: '55+', count: 19, percentage: 3 }
          ],
          locations: [
            { city: 'New York', count: 234, percentage: 35 },
            { city: 'Los Angeles', count: 156, percentage: 23 },
            { city: 'Chicago', count: 123, percentage: 18 },
            { city: 'Houston', count: 89, percentage: 13 },
            { city: 'Phoenix', count: 67, percentage: 11 }
          ],
          interests: [
            { category: 'Luxury Cars', count: 345, percentage: 42 },
            { category: 'Electric Vehicles', count: 234, percentage: 28 },
            { category: 'SUVs', count: 156, percentage: 19 },
            { category: 'Sports Cars', count: 89, percentage: 11 }
          ]
        },
        revenue: {
          totalEarnings: 15670,
          monthlyEarnings: Array.from({ length: 6 }, (_, i) => ({
            month: format(subMonths(new Date(), 5 - i), 'MMM yyyy'),
            amount: Math.floor(Math.random() * 3000) + 1000
          })),
          premiumSpending: 450,
          averageBookingValue: 890,
          commissionPaid: 1234
        }
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  const exportData = () => {
    // Implement CSV export
    console.log('Exporting analytics data...')
  }

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your listing performance and insights</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalInquiries}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalFavorites}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.7%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600">-2.1%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.trends.views}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Rate</span>
                    <span className="font-semibold">{analyticsData.overview.responseRate}%</span>
                  </div>
                  <Progress value={analyticsData.overview.responseRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Listing Performance</span>
                    <span className="font-semibold">{analyticsData.overview.listingPerformance}%</span>
                  </div>
                  <Progress value={analyticsData.overview.listingPerformance} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average View Time</span>
                    <span className="font-semibold">{analyticsData.overview.averageViewTime}s</span>
                  </div>
                  <Progress value={(analyticsData.overview.averageViewTime / 300) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm">Total Calls</span>
                  </div>
                  <span className="font-semibold">{analyticsData.overview.totalCalls}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm">Avg. View Time</span>
                  </div>
                  <span className="font-semibold">{analyticsData.overview.averageViewTime}s</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-sm">Active Listings</span>
                  </div>
                  <span className="font-semibold">{analyticsData.listings.filter(l => l.status === 'ACTIVE').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.listings.map((listing) => {
                  const getListingTypeIcon = (type: string) => {
                    switch (type) {
                      case 'SPOTLIGHT': return <Crown className="w-4 h-4 text-purple-600" />
                      case 'PREMIUM': return <Zap className="w-4 h-4 text-blue-600" />
                      case 'FEATURED': return <Star className="w-4 h-4 text-green-600" />
                      default: return <Car className="w-4 h-4 text-gray-600" />
                    }
                  }

                  return (
                    <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getListingTypeIcon(listing.listingType)}
                            <h3 className="font-semibold">{listing.title}</h3>
                            <Badge variant={listing.type === 'SALE' ? 'default' : 'secondary'}>
                              {listing.type}
                            </Badge>
                            <Badge variant="outline">{listing.listingType}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Views:</span>
                              <span className="font-semibold ml-1">{listing.views.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Inquiries:</span>
                              <span className="font-semibold ml-1">{listing.inquiries}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Favorites:</span>
                              <span className="font-semibold ml-1">{listing.favorites}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Calls:</span>
                              <span className="font-semibold ml-1">{listing.calls}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${listing.price.toLocaleString()}
                            {listing.type === 'RENTAL' && <span className="text-sm font-normal">/day</span>}
                          </div>
                          <div className="text-sm text-gray-600">
                            {listing.performance.inquiryRate}% inquiry rate
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.demographics.ageGroups}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, percentage }) => `${range} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.demographics.ageGroups.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.demographics.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                        <span>{location.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{location.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${analyticsData.revenue.totalEarnings.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                    <p className="text-2xl font-bold">${analyticsData.revenue.averageBookingValue}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Premium Spending</p>
                    <p className="text-2xl font-bold">${analyticsData.revenue.premiumSpending}</p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.revenue.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">High Performing Listings</h4>
                      <p className="text-sm text-blue-700">Your Spotlight listings are getting 3x more views than basic listings.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <Star className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Great Response Rate</h4>
                      <p className="text-sm text-green-700">You're responding to 92% of inquiries within 24 hours. Keep it up!</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Optimization Opportunity</h4>
                      <p className="text-sm text-yellow-700">Consider upgrading more listings to Premium for better visibility.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Upgrade to Premium</span>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Share on Social Media</span>
                    </div>
                    <Button size="sm" variant="outline">Share</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Optimize Pricing</span>
                    </div>
                    <Button size="sm" variant="outline">Analyze</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SellerAnalyticsDashboard