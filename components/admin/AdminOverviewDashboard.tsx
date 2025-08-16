"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  FileText,
  Settings,
  ArrowRight,
  Activity,
  Target,
  Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AdminOverviewStats {
  users: {
    total: number
    newThisMonth: number
    growth: number
    byRole: {
      BUYER: number
      SELLER: number
      RENTAL_COMPANY: number
      ADMIN: number
    }
  }
  listings: {
    total: number
    pending: number
    approved: number
    rejected: number
    newThisMonth: number
    growth: number
  }
  bookings: {
    total: number
    thisMonth: number
    growth: number
    revenue: number
  }
  moderation: {
    pendingReviews: number
    flaggedContent: number
    reportsToday: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
    commissions: number
    subscriptions: number
  }
  analytics: {
    pageViews: number
    uniqueVisitors: number
    conversionRate: number
    bounceRate: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'listing_created' | 'booking_made' | 'report_filed' | 'payment_received'
  description: string
  timestamp: string
  user?: {
    name: string
    email: string
  }
  metadata?: any
}

interface AdminOverviewDashboardProps {
  className?: string
}

export default function AdminOverviewDashboard({ className = "" }: AdminOverviewDashboardProps) {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/overview/stats'),
        fetch('/api/admin/overview/activity')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />
    if (growth < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'listing_created':
        return <Car className="h-4 w-4 text-green-500" />
      case 'booking_made':
        return <Calendar className="h-4 w-4 text-purple-500" />
      case 'report_filed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load dashboard data</p>
        <Button onClick={fetchOverviewData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(stats.users.growth)}`}>
              {getGrowthIcon(stats.users.growth)}
              <span className="ml-1">
                {stats.users.growth > 0 ? '+' : ''}{stats.users.growth.toFixed(1)}% from last month
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              +{stats.users.newThisMonth} new this month
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.listings.total)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(stats.listings.growth)}`}>
              {getGrowthIcon(stats.listings.growth)}
              <span className="ml-1">
                {stats.listings.growth > 0 ? '+' : ''}{stats.listings.growth.toFixed(1)}% from last month
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.listings.pending} pending review
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.thisMonth)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(stats.revenue.growth)}`}>
              {getGrowthIcon(stats.revenue.growth)}
              <span className="ml-1">
                {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}% from last month
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(stats.revenue.total)}
            </div>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.bookings.thisMonth)}</div>
            <div className={`flex items-center text-xs ${getGrowthColor(stats.bookings.growth)}`}>
              {getGrowthIcon(stats.bookings.growth)}
              <span className="ml-1">
                {stats.bookings.growth > 0 ? '+' : ''}{stats.bookings.growth.toFixed(1)}% from last month
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Revenue: {formatCurrency(stats.bookings.revenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.analytics.pageViews)}</div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(stats.analytics.uniqueVisitors)} unique visitors
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.analytics.conversionRate.toFixed(1)}% conversion rate
            </div>
          </CardContent>
        </Card>

        {/* Moderation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moderation.pendingReviews}</div>
            <div className="text-xs text-muted-foreground">
              {stats.moderation.flaggedContent} flagged items
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.moderation.reportsToday} reports today
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Types</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Buyers</span>
                <span>{stats.users.byRole.BUYER}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Sellers</span>
                <span>{stats.users.byRole.SELLER}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rental Companies</span>
                <span>{stats.users.byRole.RENTAL_COMPANY}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Uptime</span>
                <Badge variant="outline" className="text-green-600">99.9%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Response Time</span>
                <Badge variant="outline">120ms</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Error Rate</span>
                <Badge variant="outline" className="text-green-600">0.1%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/moderation">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Review Content
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Content
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
              <div className="pt-2">
                <Link href="/admin/activity">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Activity
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}