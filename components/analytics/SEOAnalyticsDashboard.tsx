'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Clock, 
  Zap, 
  Search, 
  Globe, 
  Smartphone, 
  Monitor,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
  description: string
}

interface SEOMetric {
  metric: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  target?: number
}

interface PagePerformance {
  url: string
  title: string
  views: number
  bounceRate: number
  avgTimeOnPage: number
  conversions: number
  seoScore: number
}

export default function SEOAnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [webVitals, setWebVitals] = useState<WebVital[]>([])
  const [seoMetrics, setSeoMetrics] = useState<SEOMetric[]>([])
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([])
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedDevice, setSelectedDevice] = useState('all')

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock Web Vitals data
      setWebVitals([
        {
          name: 'Largest Contentful Paint (LCP)',
          value: 2.1,
          rating: 'good',
          threshold: { good: 2.5, poor: 4.0 },
          description: 'Time until the largest content element is rendered'
        },
        {
          name: 'Interaction to Next Paint (INP)',
          value: 85,
          rating: 'good',
          threshold: { good: 200, poor: 500 },
          description: 'Time from user interaction to next paint'
        },
        {
          name: 'Cumulative Layout Shift (CLS)',
          value: 0.08,
          rating: 'needs-improvement',
          threshold: { good: 0.1, poor: 0.25 },
          description: 'Visual stability of the page during loading'
        },
        {
          name: 'First Contentful Paint (FCP)',
          value: 1.2,
          rating: 'good',
          threshold: { good: 1.8, poor: 3.0 },
          description: 'Time until first content is rendered'
        },
        {
          name: 'Time to First Byte (TTFB)',
          value: 0.6,
          rating: 'good',
          threshold: { good: 0.8, poor: 1.8 },
          description: 'Time until first byte is received from server'
        }
      ])
      
      // Mock SEO metrics
      setSeoMetrics([
        { metric: 'Organic Traffic', value: 12450, change: 15.2, trend: 'up' },
        { metric: 'Search Impressions', value: 89320, change: 8.7, trend: 'up' },
        { metric: 'Click-through Rate', value: '3.2%', change: -0.3, trend: 'down' },
        { metric: 'Average Position', value: 12.4, change: -2.1, trend: 'up', target: 10 },
        { metric: 'Indexed Pages', value: 1247, change: 5.8, trend: 'up' },
        { metric: 'Core Web Vitals Score', value: 85, change: 12.0, trend: 'up', target: 90 },
        { metric: 'Mobile Usability', value: 92, change: 3.2, trend: 'up', target: 95 },
        { metric: 'Page Speed Score', value: 78, change: 8.5, trend: 'up', target: 85 }
      ])
      
      // Mock page performance data
      setPagePerformance([
        {
          url: '/',
          title: 'Home Page',
          views: 5420,
          bounceRate: 32.1,
          avgTimeOnPage: 145,
          conversions: 89,
          seoScore: 92
        },
        {
          url: '/cars',
          title: 'Browse Cars',
          views: 3210,
          bounceRate: 28.5,
          avgTimeOnPage: 210,
          conversions: 156,
          seoScore: 88
        },
        {
          url: '/search',
          title: 'Search Results',
          views: 2890,
          bounceRate: 45.2,
          avgTimeOnPage: 95,
          conversions: 67,
          seoScore: 85
        },
        {
          url: '/hire',
          title: 'Car Rental',
          views: 1560,
          bounceRate: 38.7,
          avgTimeOnPage: 180,
          conversions: 45,
          seoScore: 90
        }
      ])
      
      setLoading(false)
    }
    
    fetchAnalytics()
  }, [timeRange, selectedDevice])

  const getVitalColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getVitalBadgeColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  const trafficData = [
    { date: '2024-01-01', organic: 1200, direct: 800, referral: 400, social: 200 },
    { date: '2024-01-02', organic: 1350, direct: 750, referral: 450, social: 180 },
    { date: '2024-01-03', organic: 1100, direct: 900, referral: 380, social: 220 },
    { date: '2024-01-04', organic: 1450, direct: 820, referral: 520, social: 250 },
    { date: '2024-01-05', organic: 1600, direct: 780, referral: 480, social: 190 },
    { date: '2024-01-06', organic: 1380, direct: 850, referral: 420, social: 210 },
    { date: '2024-01-07', organic: 1520, direct: 790, referral: 460, social: 240 }
  ]

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#3b82f6' },
    { name: 'Mobile', value: 42, color: '#10b981' },
    { name: 'Tablet', value: 13, color: '#f59e0b' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your website's search performance and user experience</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="seo">SEO Metrics</TabsTrigger>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seoMetrics.slice(0, 4).map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  {getTrendIcon(metric.trend, metric.change)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                  </p>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress to target</span>
                        <span>{Math.round((Number(metric.value) / metric.target) * 100)}%</span>
                      </div>
                      <Progress value={(Number(metric.value) / metric.target) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Website traffic breakdown by source</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="organic" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  <Area type="monotone" dataKey="direct" stackId="1" stroke="#10b981" fill="#10b981" />
                  <Area type="monotone" dataKey="referral" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  <Area type="monotone" dataKey="social" stackId="1" stroke="#ef4444" fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common SEO tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Submit Sitemap to Google
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Check Page Indexing Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Run Core Web Vitals Test
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Monitor className="w-4 h-4 mr-2" />
                  Analyze Competitor SEO
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>Key performance metrics that affect user experience and SEO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webVitals.map((vital, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{vital.name}</h3>
                      <Badge className={getVitalBadgeColor(vital.rating)}>
                        {vital.rating.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-2 ${getVitalColor(vital.rating)}`}>
                      {vital.value}{vital.name.includes('CLS') ? '' : vital.name.includes('INP') ? 'ms' : 's'}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{vital.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Good: &lt; {vital.threshold.good}</span>
                        <span>Poor: &gt; {vital.threshold.poor}</span>
                      </div>
                      <Progress 
                        value={Math.min((vital.value / vital.threshold.poor) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>Suggestions to improve your Core Web Vitals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Good LCP Performance</h4>
                    <p className="text-sm text-green-700">Your Largest Contentful Paint is within the good range. Keep optimizing images and server response times.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Improve Layout Stability</h4>
                    <p className="text-sm text-yellow-700">Your CLS score needs improvement. Consider setting dimensions for images and ads to prevent layout shifts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Optimize JavaScript</h4>
                    <p className="text-sm text-blue-700">Consider code splitting and lazy loading to improve First Input Delay and overall performance.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          {/* SEO Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seoMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  {getTrendIcon(metric.trend, metric.change)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                  </p>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Target: {metric.target}</span>
                        <span>{Math.round((Number(metric.value) / metric.target) * 100)}%</span>
                      </div>
                      <Progress value={(Number(metric.value) / metric.target) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          {/* Page Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Page Performance Analysis</CardTitle>
              <CardDescription>Detailed metrics for your top-performing pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Page</th>
                      <th className="text-right p-2">Views</th>
                      <th className="text-right p-2">Bounce Rate</th>
                      <th className="text-right p-2">Avg. Time</th>
                      <th className="text-right p-2">Conversions</th>
                      <th className="text-right p-2">SEO Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagePerformance.map((page, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-xs text-gray-500">{page.url}</div>
                          </div>
                        </td>
                        <td className="text-right p-2 font-medium">{page.views.toLocaleString()}</td>
                        <td className="text-right p-2">
                          <span className={page.bounceRate > 40 ? 'text-red-600' : 'text-green-600'}>
                            {page.bounceRate}%
                          </span>
                        </td>
                        <td className="text-right p-2">{Math.floor(page.avgTimeOnPage / 60)}m {page.avgTimeOnPage % 60}s</td>
                        <td className="text-right p-2 font-medium">{page.conversions}</td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className={page.seoScore >= 90 ? 'text-green-600' : page.seoScore >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                              {page.seoScore}
                            </span>
                            <div className="w-12">
                              <Progress value={page.seoScore} className="h-2" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}