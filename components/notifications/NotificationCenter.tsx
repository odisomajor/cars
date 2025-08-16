'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellRing, 
  Settings, 
  Check,
  X,
  Mail,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  MarkAsUnreadIcon,
  Filter,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'message'
  category: 'system' | 'sales' | 'commission' | 'payment' | 'marketing' | 'support'
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  categories: {
    system: boolean
    sales: boolean
    commission: boolean
    payment: boolean
    marketing: boolean
    support: boolean
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  settings: NotificationSettings
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onDeleteNotification?: (notificationId: string) => void
  onClearAll?: () => void
  onUpdateSettings?: (settings: NotificationSettings) => void
  onNotificationAction?: (notification: Notification) => void
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  settings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onUpdateSettings,
  onNotificationAction,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-blue-100 text-blue-800'
      case 'sales':
        return 'bg-green-100 text-green-800'
      case 'commission':
        return 'bg-purple-100 text-purple-800'
      case 'payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'marketing':
        return 'bg-pink-100 text-pink-800'
      case 'support':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filterNotifications = () => {
    return notifications.filter(notification => {
      const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory
      const matchesType = selectedType === 'all' || notification.type === selectedType
      const matchesReadStatus = !showUnreadOnly || !notification.read
      
      return matchesCategory && matchesType && matchesReadStatus
    })
  }

  const filteredNotifications = filterNotifications()
  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  const handleSettingsChange = (key: string, value: any) => {
    const updatedSettings = { ...localSettings, [key]: value }
    setLocalSettings(updatedSettings)
    onUpdateSettings?.(updatedSettings)
  }

  const handleCategorySettingChange = (category: string, enabled: boolean) => {
    const updatedSettings = {
      ...localSettings,
      categories: {
        ...localSettings.categories,
        [category]: enabled
      }
    }
    setLocalSettings(updatedSettings)
    onUpdateSettings?.(updatedSettings)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage your notifications and preferences
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && onClearAll && (
              <Button variant="outline" size="sm" onClick={onClearAll}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Unread</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {unreadCount}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Urgent</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {urgentCount}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="unread-only"
                  checked={showUnreadOnly}
                  onCheckedChange={setShowUnreadOnly}
                />
                <Label htmlFor="unread-only" className="text-sm">
                  Unread only
                </Label>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {showUnreadOnly ? 'No unread notifications' : 'No notifications found'}
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={cn(
                    'transition-all hover:shadow-md',
                    !notification.read && 'border-l-4 border-l-blue-500 bg-blue-50/30'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                'font-medium',
                                !notification.read && 'font-semibold'
                              )}>
                                {notification.title}
                              </h4>
                              <Badge className={cn('text-xs', getCategoryColor(notification.category))}>
                                {notification.category}
                              </Badge>
                              {notification.priority !== 'low' && (
                                <Badge className={cn('text-xs', getPriorityColor(notification.priority))}>
                                  {notification.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{formatTimestamp(notification.timestamp)}</span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {notification.actionUrl && notification.actionLabel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNotificationAction?.(notification)}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                          {!notification.read && onMarkAsRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          {onDeleteNotification && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Notification Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Methods</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={localSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={localSettings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={localSettings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingsChange('smsNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Categories</CardTitle>
                <CardDescription>
                  Control which types of notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(localSettings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label htmlFor={`category-${category}`} className="capitalize">
                      {category} Notifications
                    </Label>
                    <Switch
                      id={`category-${category}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleCategorySettingChange(category, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Frequency</CardTitle>
                <CardDescription>
                  How often you want to receive notification summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={localSettings.frequency}
                  onValueChange={(value) => handleSettingsChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Summary</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiet Hours</CardTitle>
                <CardDescription>
                  Set times when you don't want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={localSettings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      handleSettingsChange('quietHours', { ...localSettings.quietHours, enabled: checked })
                    }
                  />
                </div>
                
                {localSettings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Select
                        value={localSettings.quietHours.start}
                        onValueChange={(value) => 
                          handleSettingsChange('quietHours', { ...localSettings.quietHours, start: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Select
                        value={localSettings.quietHours.end}
                        onValueChange={(value) => 
                          handleSettingsChange('quietHours', { ...localSettings.quietHours, end: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default NotificationCenter