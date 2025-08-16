'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Car,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Settings,
  User,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalListings: number
  activeListings: number
  totalViews: number
  totalFavorites: number
  totalMessages: number
  averageRating: number
  totalReviews: number
  monthlyRevenue: number
  pendingActions: number
}

interface Listing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  location: string
  images: string[]
  status: 'active' | 'draft' | 'expired' | 'sold'
  views: number
  favorites: number
  messages: number
  createdAt: string
  expiresAt: string
  isRental: boolean
  rentalDailyRate?: number
}

interface Notification {
  id: string
  type: 'message' | 'favorite' | 'view' | 'booking' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  listingId?: string
}

interface MobileDashboardProps {
  onCreateListing?: () => void
  onEditListing?: (listingId: string) => void
  onViewListing?: (listingId: string) => void
}

export function MobileDashboard({
  onCreateListing,
  onEditListing,
  onViewListing
}: MobileDashboardProps) {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalMessages: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyRevenue: 0,
    pendingActions: 0
  })
  
  const [listings, setListings] = useState<Listing[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncData()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
    if (isOnline) {
      syncData()
    }
  }, [])

  const loadCachedData = () => {
    try {
      const cachedStats = localStorage.getItem('mobile_dashboard_stats')
      const cachedListings = localStorage.getItem('mobile_dashboard_listings')
      const cachedNotifications = localStorage.getItem('mobile_dashboard_notifications')
      const cachedSync = localStorage.getItem('mobile_dashboard_last_sync')

      if (cachedStats) setStats(JSON.parse(cachedStats))
      if (cachedListings) setListings(JSON.parse(cachedListings))
      if (cachedNotifications) setNotifications(JSON.parse(cachedNotifications))
      if (cachedSync) setLastSync(new Date(cachedSync))
    } catch (error) {
      console.error('Error loading cached data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncData = async () => {
    if (!isOnline) return

    setIsRefreshing(true)
    try {
      // Fetch dashboard data from API
      const [statsResponse, listingsResponse, notificationsResponse] = await Promise.all([
        fetch('/api/mobile/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mobile_token')}`
          }
        }),
        fetch('/api/mobile/listings?limit=50', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mobile_token')}`
          }
        }),
        fetch('/api/mobile/notifications?limit=20', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('mobile_token')}`
          }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
        localStorage.setItem('mobile_dashboard_stats', JSON.stringify(statsData))
      }

      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setListings(listingsData.listings || [])
        localStorage.setItem('mobile_dashboard_listings', JSON.stringify(listingsData.listings || []))
      }

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
        localStorage.setItem('mobile_dashboard_notifications', JSON.stringify(notificationsData.notifications || []))
      }

      const now = new Date()
      setLastSync(now)
      localStorage.setItem('mobile_dashboard_last_sync', now.toISOString())
    } catch (error) {
      console.error('Error syncing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleListingAction = async (listingId: string, action: 'edit' | 'delete' | 'share' | 'extend') => {
    switch (action) {
      case 'edit':
        onEditListing?.(listingId)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this listing?')) {
          // Handle delete
          try {
            const response = await fetch(`/api/mobile/listings/${listingId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('mobile_token')}`
              }
            })
            if (response.ok) {
              setListings(prev => prev.filter(l => l.id !== listingId))
            }
          } catch (error) {
            console.error('Error deleting listing:', error)
          }
        }
        break
      case 'share':
        if (navigator.share) {
          const listing = listings.find(l => l.id === listingId)
          if (listing) {
            navigator.share({
              title: listing.title,
              text: `Check out this ${listing.year} ${listing.make} ${listing.model}`,
              url: `${window.location.origin}/listings/${listingId}`
            })
          }
        }
        break
      case 'extend':
        // Handle extend listing
        try {
          const response = await fetch(`/api/listings/${listingId}/extend`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('mobile_token')}`
            }
          })
          if (response.ok) {
            syncData()
          }
        } catch (error) {
          console.error('Error extending listing:', error)
        }
        break
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         `${listing.make} ${listing.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || listing.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'sold': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'draft': return Clock
      case 'expired': return XCircle
      case 'sold': return CheckCircle
      default: return AlertCircle
    }
  }

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
                <p className="text-sm text-gray-600">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Average Rating</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-600">({stats.totalReviews})</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Monthly Revenue</span>
            <span className="font-medium text-green-600">
              KES {stats.monthlyRevenue.toLocaleString()}
            </span>
          </div>

          {stats.pendingActions > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {stats.pendingActions} pending action{stats.pendingActions > 1 ? 's' : ''} requiring attention.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={onCreateListing} className="h-12">
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('listings')} className="h-12">
              <Car className="h-4 w-4 mr-2" />
              My Listings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderListings = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'active', 'draft', 'expired', 'sold'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="whitespace-nowrap"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {filteredListings.map(listing => {
          const StatusIcon = getStatusIcon(listing.status)
          return (
            <Card key={listing.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                        <p className="text-xs text-gray-600">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          KES {listing.price.toLocaleString()}
                        </p>
                        {listing.isRental && listing.rentalDailyRate && (
                          <p className="text-xs text-blue-600">
                            Rental: KES {listing.rentalDailyRate}/day
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={cn('text-xs', getStatusColor(listing.status))}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {listing.status}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Show action menu
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{listing.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{listing.favorites}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{listing.messages}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewListing?.(listing.id)}
                        className="flex-1 text-xs"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'edit')}
                        className="flex-1 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'share')}
                        className="text-xs"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredListings.length === 0 && (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all' 
                ? 'No listings match your criteria' 
                : 'No listings yet'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={onCreateListing} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-3">
      {notifications.map(notification => {
        const getNotificationIcon = (type: string) => {
          switch (type) {
            case 'message': return MessageSquare
            case 'favorite': return Heart
            case 'view': return Eye
            case 'booking': return Calendar
            default: return Bell
          }
        }

        const Icon = getNotificationIcon(notification.type)
        
        return (
          <Card key={notification.id} className={cn(
            "cursor-pointer transition-colors",
            !notification.read ? "bg-blue-50 border-blue-200" : ""
          )}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  notification.type === 'message' ? "bg-purple-100" :
                  notification.type === 'favorite' ? "bg-red-100" :
                  notification.type === 'view' ? "bg-green-100" :
                  notification.type === 'booking' ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    notification.type === 'message' ? "text-purple-600" :
                    notification.type === 'favorite' ? "text-red-600" :
                    notification.type === 'view' ? "text-green-600" :
                    notification.type === 'booking' ? "text-blue-600" : "text-gray-600"
                  )} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </p>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {notifications.length === 0 && (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications yet</p>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={syncData}
              disabled={!isOnline || isRefreshing}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isRefreshing ? "animate-spin" : ""
              )} />
            </Button>
          </div>
        </div>

        {lastSync && (
          <p className="text-xs text-gray-500">
            Last updated: {lastSync.toLocaleTimeString()}
          </p>
        )}

        {!isOnline && (
          <Alert className="mt-2">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="p-4 pb-20">
          <TabsContent value="overview" className="mt-0">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="listings" className="mt-0">
            {renderListings()}
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            {renderNotifications()}
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating Action Button */}
      <Button
        onClick={onCreateListing}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="lg"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}