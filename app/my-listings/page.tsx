'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Car, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Filter,
  Search
} from 'lucide-react'

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

export default function MyListingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchListings()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    filterListings()
  }, [listings, searchTerm, statusFilter, typeFilter])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/user/listings')
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const filterListings = () => {
    let filtered = listings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(listing => listing.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(listing => listing.listingType === typeFilter)
    }

    setFilteredListings(filtered)
  }

  const handleDeleteListing = async (listingId: string, listingType: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    
    try {
      const endpoint = listingType === 'RENTAL' ? 'rental-listings' : 'listings'
      const response = await fetch(`/api/${endpoint}/${listingId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId))
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'SOLD':
        return 'bg-gray-100 text-gray-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    if (!expiresAt) return false
    const expiry = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              Manage your car listings and track their performance
            </p>
          </div>
          <Link
            href="/create-listing"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Listing</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {listings.filter(l => l.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-3xl font-bold text-gray-600">
                  {listings.filter(l => l.status === 'SOLD').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-primary-600">
                  {listings.reduce((sum, l) => sum + l.views, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING">Pending</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="SALE">For Sale</option>
              <option value="RENTAL">For Rent</option>
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Showing {filteredListings.length} of {listings.length} listings
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading your listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {listings.length === 0 ? 'No listings yet' : 'No listings match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {listings.length === 0 
                  ? 'Start selling by creating your first car listing'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {listings.length === 0 && (
                <Link
                  href="/create-listing"
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Listing</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {listing.year} {listing.make} {listing.model}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${listing.price.toLocaleString()}
                              {listing.listingType === 'RENTAL' && '/day'}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {listing.views} views
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {listing.location}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(listing.status)}`}>
                              {listing.status.toLowerCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              listing.listingType === 'SALE' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {listing.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                            </span>
                            {isExpiringSoon(listing.expiresAt) && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Expires soon
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Link
                              href={`/listings/${listing.id}`}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="View listing"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/listings/${listing.id}/edit`}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Edit listing"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(listing.id, listing.listingType)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}