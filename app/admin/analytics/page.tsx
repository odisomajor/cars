"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts"
import {
  TrendingUp,
  Users,
  Car,
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  Clock,
  Activity
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalPageViews: number
    uniqueVisitors: number
    averageSessionDuration: number
    bounceRate: number
    conversionRate: number
    totalRevenue: number
  }
  userGrowth: Array<{
    date: string
    users: number
    listings: number
  }>
  topPages: Array<{
    page: string
    views: number
    uniqueViews: number
  }>
  deviceBreakdown: Array<{
    device: string
    users: number
    percentage: number
  }>
  webVitals: {
    cls: number
    fcp: number
    lcp: number
    ttfb: number
    inp: number
  }
  revenueData: Array<{
    month: string
    revenue: number
    commissions: number
    subscriptions: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/")
      toast.error("Access denied. Admin privileges required.")
    }
  }, [user, authLoading, router])

  // Fetch analytics data
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast.error("Failed to load analytics data")
      }
    } catch (error) {
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor platform performance and user behavior</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.totalPageViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.uniqueVisitors.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MousePointer className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.overview.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User & Listing Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
                    <Line type="monotone" dataKey="listings" stroke="#82ca9d" name="Listings" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {analytics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="commissions" stackId="a" fill="#8884d8" name="Commissions" />
                    <Bar dataKey="subscriptions" stackId="a" fill="#82ca9d" name="Subscriptions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                <div className="space-y-4">
                  {analytics.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{page.page}</p>
                        <p className="text-xs text-gray-500">{page.uniqueViews} unique views</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{page.views}</p>
                        <p className="text-xs text-gray-500">total views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Web Vitals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.webVitals.cls.toFixed(3)}</div>
                  <div className="text-sm text-gray-600">CLS</div>
                  <div className={`text-xs mt-1 ${
                    analytics.webVitals.cls <= 0.1 ? 'text-green-600' : 
                    analytics.webVitals.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.webVitals.cls <= 0.1 ? 'Good' : 
                     analytics.webVitals.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.webVitals.fcp}ms</div>
                  <div className="text-sm text-gray-600">FCP</div>
                  <div className={`text-xs mt-1 ${
                    analytics.webVitals.fcp <= 1800 ? 'text-green-600' : 
                    analytics.webVitals.fcp <= 3000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.webVitals.fcp <= 1800 ? 'Good' : 
                     analytics.webVitals.fcp <= 3000 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.webVitals.lcp}ms</div>
                  <div className="text-sm text-gray-600">LCP</div>
                  <div className={`text-xs mt-1 ${
                    analytics.webVitals.lcp <= 2500 ? 'text-green-600' : 
                    analytics.webVitals.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.webVitals.lcp <= 2500 ? 'Good' : 
                     analytics.webVitals.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.webVitals.ttfb}ms</div>
                  <div className="text-sm text-gray-600">TTFB</div>
                  <div className={`text-xs mt-1 ${
                    analytics.webVitals.ttfb <= 800 ? 'text-green-600' : 
                    analytics.webVitals.ttfb <= 1800 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.webVitals.ttfb <= 800 ? 'Good' : 
                     analytics.webVitals.ttfb <= 1800 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.webVitals.inp}ms</div>
                  <div className="text-sm text-gray-600">INP</div>
                  <div className={`text-xs mt-1 ${
                    analytics.webVitals.inp <= 200 ? 'text-green-600' : 
                    analytics.webVitals.inp <= 500 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.webVitals.inp <= 200 ? 'Good' : 
                     analytics.webVitals.inp <= 500 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}</div>
      </div>
      </div>
    </div>
  )
}