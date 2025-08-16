'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  User, 
  Car, 
  Heart, 
  Star, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react'
import ExpirationManager from '@/components/listings/ExpirationManager'

interface Listing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  location: string
  images: string[]
  status: string
  listingType: string
  views: number
  createdAt: string
  expiresAt: string
}

interface DashboardStats {
  activeListings: number
  totalListings: number
  rentalListings: number
  totalViews: number
  savedCars: number
  totalBookings: number
  reviews: number
  averageRating: number
  monthlyRevenue: number
}

interface RecentListing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  status: string
  listingType: string
  views: number
  createdAt: string
}

interface RecentBooking {
  id: string
  startDate: string
  endDate: string
  totalAmount: number
  status: string
  rentalListing: {
    title: string
    make: string
    model: string
    year: number
  }
}

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    emailVerified: boolean
    phoneVerified: boolean
    isVerified: boolean
  }
  stats: DashboardStats
  recentListings: RecentListing[]
  recentRentalListings: RecentListing[]
  recentBookings: RecentBooking[]
  listingsByStatus: {
    ACTIVE: number
    PENDING: number
    SOLD: number
    EXPIRED: number
  }
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true) // Require authentication
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData()
    }
  }, [isAuthenticated, user])

  const fetchUserData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/user/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh dashboard data after deletion
        await fetchUserData()
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // useAuth hook will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your listings, favorites, and account settings
                </p>
                {dashboardData && !dashboardData.user.isVerified && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Account verification needed:</strong> Please verify your email
                      {!dashboardData.user.phoneVerified && ' and phone'} to unlock all features.
                      <Link href="/profile" className="ml-2 text-yellow-900 underline hover:no-underline">
                        Complete verification →
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchUserData}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.stats.activeListings || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/create-listing"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create new listing →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.stats.totalViews || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">On your listings</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${dashboardData?.stats.monthlyRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">This month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData?.stats.reviews || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Average: {dashboardData?.stats.averageRating ? 
                    `${dashboardData.stats.averageRating.toFixed(1)}/5` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats Row */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Cars</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.stats.savedCars}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/favorites"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View favorites →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rental Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.stats.totalBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/bookings"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View bookings →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rental Listings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.stats.rentalListings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/create-listing?type=rental"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create rental →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Listing Expiration Management */}
        {dashboardData && (
          <div className="mb-8">
            <ExpirationManager userId={dashboardData.user.id} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/create-listing"
                  className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Create Listing</p>
                    <p className="text-sm text-gray-600">Sell or rent your car</p>
                  </div>
                </Link>

                <Link
                  href="/rent"
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rent a Car</p>
                    <p className="text-sm text-gray-600">Browse rental options</p>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Edit Profile</p>
                    <p className="text-sm text-gray-600">Update your information</p>
                  </div>
                </Link>

                <Link
                  href="/cars"
                  className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Cars</p>
                    <p className="text-sm text-gray-600">Find your next car</p>
                  </div>
                </Link>

                {user?.role === 'DEALER' || user?.role === 'RENTAL_COMPANY' ? (
                  <Link
                    href="/dashboard/fleet"
                    className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Fleet Management</p>
                      <p className="text-sm text-gray-600">Manage rental fleet</p>
                    </div>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Recent Activity & Listings */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Listings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
                <div className="flex space-x-4">
                  <Link
                    href="/create-listing"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium"
                  >
                    Create Listing
                  </Link>
                  <Link
                    href="/my-listings"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loadingData ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading your listings...</p>
                  </div>
                ) : !dashboardData || dashboardData.recentListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start selling by creating your first car listing
                    </p>
                    <Link
                      href="/create-listing"
                      className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Listing</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentListings.map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{listing.title}</h4>
                          <p className="text-sm text-gray-600">
                            {listing.year} {listing.make} {listing.model}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm font-medium text-primary-600">
                              ${listing.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {listing.views} views
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              listing.listingType === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {listing.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            listing.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : listing.status === 'SOLD'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {listing.status.toLowerCase()}
                          </span>
                          <Link
                            href={`/listings/${listing.id}/edit`}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {dashboardData.stats.totalListings > dashboardData.recentListings.length && (
                      <div className="text-center pt-4">
                        <Link
                          href="/my-listings"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all {dashboardData.stats.totalListings} listings →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              </div>
              <div className="p-6">
                {!dashboardData || dashboardData.recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent bookings</h3>
                    <p className="text-gray-600">
                      Your rental bookings will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {booking.rentalListing.year} {booking.rentalListing.make} {booking.rentalListing.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm font-medium text-primary-600">
                              ${booking.totalAmount.toLocaleString()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dashboardData.stats.totalBookings > dashboardData.recentBookings.length && (
                      <div className="text-center pt-4">
                        <Link
                          href="/bookings"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all {dashboardData.stats.totalBookings} bookings →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Account Active</h3>
                  <p className="text-sm text-gray-600">
                    Member since {dashboardData?.user.createdAt ? new Date(dashboardData.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    }) : user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    }) : 'Unknown'}
                  </p>
                  {dashboardData && (
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        dashboardData.user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Email {dashboardData.user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        dashboardData.user.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Phone {dashboardData.user.phoneVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-right space-y-2">
                  <span className="inline-block px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    {(dashboardData?.user.role || user.role)?.toLowerCase().replace('_', ' ')}
                  </span>
                  {dashboardData && (
                    <div className="text-sm text-gray-600">
                      <div>Total Listings: {dashboardData.stats.totalListings}</div>
                      <div>Active: {dashboardData.listingsByStatus.ACTIVE} | Sold: {dashboardData.listingsByStatus.SOLD}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}