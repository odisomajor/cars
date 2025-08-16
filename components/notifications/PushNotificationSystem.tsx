'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  BellRing,
  BellOff,
  Send,
  Users,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Car,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Heart,
  Eye,
  Settings,
  Smartphone,
  Monitor,
  Globe,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Crown,
  Gift,
  Percent,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PushNotification {
  id: string
  title: string
  message: string
  type: 'premium_upgrade' | 'booking_confirmed' | 'payment_success' | 'listing_featured' | 'inquiry_received' | 'rental_reminder' | 'promotion' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  targetAudience: 'all' | 'premium_users' | 'basic_users' | 'rental_companies' | 'customers' | 'specific_users'
  targetUserIds?: string[]
  scheduledFor?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  deliveryStats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
  actionUrl?: string
  imageUrl?: string
  createdBy: string
  createdAt: Date
}

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  type: PushNotification['type']
  variables: string[]
  isActive: boolean
  createdAt: Date
}

interface NotificationSettings {
  userId: string
  preferences: {
    premium_upgrade: boolean
    booking_confirmed: boolean
    payment_success: boolean
    listing_featured: boolean
    inquiry_received: boolean
    rental_reminder: boolean
    promotion: boolean
    system: boolean
  }
  channels: {
    push: boolean
    email: boolean
    sms: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

interface PushNotificationSystemProps {
  className?: string
  userRole?: 'admin' | 'manager' | 'user'
  userId?: string
}

const MOCK_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif_001',
    title: 'Upgrade to Premium!',
    message: 'Get 50% more visibility for your listings with Premium features',
    type: 'premium_upgrade',
    priority: 'high',
    targetAudience: 'basic_users',
    status: 'sent',
    deliveryStats: {
      sent: 1250,
      delivered: 1180,
      opened: 420,
      clicked: 85
    },
    actionUrl: '/upgrade',
    imageUrl: '/images/premium-upgrade.jpg',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    sentAt: new Date('2024-01-15T10:00:00')
  },
  {
    id: 'notif_002',
    title: 'Booking Confirmed',
    message: 'Your BMW X5 rental has been confirmed for Jan 20-25',
    type: 'booking_confirmed',
    priority: 'normal',
    targetAudience: 'specific_users',
    targetUserIds: ['user_123'],
    status: 'sent',
    deliveryStats: {
      sent: 1,
      delivered: 1,
      opened: 1,
      clicked: 0
    },
    actionUrl: '/bookings/book_001',
    createdBy: 'system',
    createdAt: new Date('2024-01-18'),
    sentAt: new Date('2024-01-18T14:30:00')
  },
  {
    id: 'notif_003',
    title: 'New Year Special Offer',
    message: 'Get 30% off on all premium listings this month!',
    type: 'promotion',
    priority: 'normal',
    targetAudience: 'rental_companies',
    status: 'scheduled',
    scheduledFor: new Date('2024-01-20T09:00:00'),
    deliveryStats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    },
    actionUrl: '/promotions/new-year',
    imageUrl: '/images/new-year-promo.jpg',
    createdBy: 'admin',
    createdAt: new Date('2024-01-17')
  }
]

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'template_001',
    name: 'Premium Upgrade Reminder',
    title: 'Upgrade to {{plan_name}}!',
    message: 'Get {{benefit}} with {{plan_name}} features. Limited time offer!',
    type: 'premium_upgrade',
    variables: ['plan_name', 'benefit'],
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'template_002',
    name: 'Booking Confirmation',
    title: 'Booking Confirmed',
    message: 'Your {{vehicle_name}} rental has been confirmed for {{dates}}',
    type: 'booking_confirmed',
    variables: ['vehicle_name', 'dates'],
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'template_003',
    name: 'Payment Success',
    title: 'Payment Successful',
    message: 'Your payment of ${{amount}} has been processed successfully',
    type: 'payment_success',
    variables: ['amount'],
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
]

export const PushNotificationSystem: React.FC<PushNotificationSystemProps> = ({
  className = '',
  userRole = 'user',
  userId
}) => {
  const [notifications, setNotifications] = useState<PushNotification[]>(MOCK_NOTIFICATIONS)
  const [templates, setTemplates] = useState<NotificationTemplate[]>(NOTIFICATION_TEMPLATES)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'promotion' as PushNotification['type'],
    priority: 'normal' as PushNotification['priority'],
    targetAudience: 'all' as PushNotification['targetAudience'],
    scheduledFor: '',
    actionUrl: '',
    imageUrl: ''
  })

  // User notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    userId: userId || 'current_user',
    preferences: {
      premium_upgrade: true,
      booking_confirmed: true,
      payment_success: true,
      listing_featured: true,
      inquiry_received: true,
      rental_reminder: true,
      promotion: false,
      system: true
    },
    channels: {
      push: true,
      email: true,
      sms: false
    },
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    frequency: 'immediate'
  })

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in title and message')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const notification: PushNotification = {
        id: `notif_${Date.now()}`,
        ...newNotification,
        scheduledFor: newNotification.scheduledFor ? new Date(newNotification.scheduledFor) : undefined,
        status: newNotification.scheduledFor ? 'scheduled' : 'sent',
        deliveryStats: {
          sent: newNotification.scheduledFor ? 0 : Math.floor(Math.random() * 1000) + 500,
          delivered: 0,
          opened: 0,
          clicked: 0
        },
        createdBy: 'admin',
        createdAt: new Date(),
        sentAt: newNotification.scheduledFor ? undefined : new Date()
      }
      
      setNotifications(prev => [notification, ...prev])
      setNewNotification({
        title: '',
        message: '',
        type: 'promotion',
        priority: 'normal',
        targetAudience: 'all',
        scheduledFor: '',
        actionUrl: '',
        imageUrl: ''
      })
      
      toast.success(newNotification.scheduledFor ? 'Notification scheduled successfully' : 'Notification sent successfully')
    } catch (error) {
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification settings updated')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'premium_upgrade': return <Crown className="w-4 h-4" />
      case 'booking_confirmed': return <CheckCircle className="w-4 h-4" />
      case 'payment_success': return <CreditCard className="w-4 h-4" />
      case 'listing_featured': return <Star className="w-4 h-4" />
      case 'inquiry_received': return <MessageSquare className="w-4 h-4" />
      case 'rental_reminder': return <Clock className="w-4 h-4" />
      case 'promotion': return <Gift className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: PushNotification['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: PushNotification['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateEngagementRate = (stats: PushNotification['deliveryStats']) => {
    if (stats.sent === 0) return 0
    return Math.round((stats.opened / stats.sent) * 100)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Push Notifications
          </h1>
          <p className="text-gray-600">Manage push notifications for premium features and user engagement</p>
        </div>
        
        {userRole !== 'user' && (
          <Button onClick={() => setActiveTab('compose')}>
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold">{notifications.reduce((sum, n) => sum + n.deliveryStats.sent, 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold">{notifications.reduce((sum, n) => sum + n.deliveryStats.delivered, 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Opened</p>
                    <p className="text-2xl font-bold">{notifications.reduce((sum, n) => sum + n.deliveryStats.opened, 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        notifications.reduce((sum, n) => sum + calculateEngagementRate(n.deliveryStats), 0) / notifications.length
                      )}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="premium_upgrade">Premium Upgrade</SelectItem>
                    <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                    <SelectItem value="payment_success">Payment Success</SelectItem>
                    <SelectItem value="listing_featured">Listing Featured</SelectItem>
                    <SelectItem value="inquiry_received">Inquiry Received</SelectItem>
                    <SelectItem value="rental_reminder">Rental Reminder</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{notification.title}</h3>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              
                              <div className="flex items-center gap-2 mt-3">
                                <Badge className={cn('text-xs', getStatusColor(notification.status))}>
                                  {notification.status}
                                </Badge>
                                <Badge className={cn('text-xs', getPriorityColor(notification.priority))}>
                                  {notification.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {notification.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-gray-500">
                              <p>{notification.createdAt.toLocaleDateString()}</p>
                              {notification.sentAt && (
                                <p>Sent: {notification.sentAt.toLocaleTimeString()}</p>
                              )}
                              {notification.scheduledFor && (
                                <p>Scheduled: {notification.scheduledFor.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="lg:w-80">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Sent</p>
                          <p className="font-semibold">{notification.deliveryStats.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivered</p>
                          <p className="font-semibold">{notification.deliveryStats.delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Opened</p>
                          <p className="font-semibold">{notification.deliveryStats.opened.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Clicked</p>
                          <p className="font-semibold">{notification.deliveryStats.clicked.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Open Rate</span>
                          <span>{calculateEngagementRate(notification.deliveryStats)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${calculateEngagementRate(notification.deliveryStats)}%` }}
                          />
                        </div>
                      </div>
                      
                      {userRole !== 'user' && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter notification message"
                      rows={4}
                      value={newNotification.message}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as PushNotification['type'] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium_upgrade">Premium Upgrade</SelectItem>
                          <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                          <SelectItem value="payment_success">Payment Success</SelectItem>
                          <SelectItem value="listing_featured">Listing Featured</SelectItem>
                          <SelectItem value="inquiry_received">Inquiry Received</SelectItem>
                          <SelectItem value="rental_reminder">Rental Reminder</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newNotification.priority} onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value as PushNotification['priority'] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target">Target Audience</Label>
                    <Select value={newNotification.targetAudience} onValueChange={(value) => setNewNotification(prev => ({ ...prev, targetAudience: value as PushNotification['targetAudience'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="premium_users">Premium Users</SelectItem>
                        <SelectItem value="basic_users">Basic Users</SelectItem>
                        <SelectItem value="rental_companies">Rental Companies</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="specific_users">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduled">Schedule For (Optional)</Label>
                    <Input
                      id="scheduled"
                      type="datetime-local"
                      value={newNotification.scheduledFor}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                    <Input
                      id="actionUrl"
                      placeholder="https://example.com/action"
                      value={newNotification.actionUrl}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, actionUrl: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={newNotification.imageUrl}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={handleSendNotification} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {newNotification.scheduledFor ? 'Scheduling...' : 'Sending...'}
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {newNotification.scheduledFor ? 'Schedule Notification' : 'Send Now'}
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Notification Templates</h2>
              <p className="text-gray-600">Pre-configured templates for common notifications</p>
            </div>
            {userRole !== 'user' && (
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {template.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Title:</p>
                      <p className="text-sm">{template.title}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Message:</p>
                      <p className="text-sm">{template.message}</p>
                    </div>
                    
                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Variables:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {userRole !== 'user' && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-gray-600">Configure your notification settings and preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div>
                <h3 className="font-semibold mb-4">Notification Types</h3>
                <div className="space-y-3">
                  {Object.entries(notificationSettings.preferences).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(key as PushNotification['type'])}
                        <Label htmlFor={key} className="capitalize cursor-pointer">
                          {key.replace('_', ' ')}
                        </Label>
                      </div>
                      <Switch
                        id={key}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <h3 className="font-semibold mb-4">Delivery Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4" />
                      <Label htmlFor="push" className="cursor-pointer">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push"
                      checked={notificationSettings.channels.push}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, push: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email" className="cursor-pointer">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email"
                      checked={notificationSettings.channels.email}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, email: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4" />
                      <Label htmlFor="sms" className="cursor-pointer">SMS Notifications</Label>
                    </div>
                    <Switch
                      id="sms"
                      checked={notificationSettings.channels.sms}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, sms: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div>
                <h3 className="font-semibold mb-4">Quiet Hours</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quiet-hours" className="cursor-pointer">Enable Quiet Hours</Label>
                    <Switch
                      id="quiet-hours"
                      checked={notificationSettings.quietHours.enabled}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  
                  {notificationSettings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={notificationSettings.quietHours.startTime}
                          onChange={(e) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, startTime: e.target.value }
                            }))
                          }
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={notificationSettings.quietHours.endTime}
                          onChange={(e) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, endTime: e.target.value }
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <h3 className="font-semibold mb-4">Notification Frequency</h3>
                <Select 
                  value={notificationSettings.frequency} 
                  onValueChange={(value) => 
                    setNotificationSettings(prev => ({
                      ...prev,
                      frequency: value as NotificationSettings['frequency']
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleUpdateSettings} disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PushNotificationSystem