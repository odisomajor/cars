"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FaHeart, FaRegHeart, FaEye, FaMapMarkerAlt, FaGasPump, FaCog, FaCalendarAlt, FaTachometerAlt } from "react-icons/fa"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"

interface Listing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  bodyType: string
  color?: string
  location: string
  images: string
  features: string
  listingType: string
  views: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ListingsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  // Filter states
  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  useEffect(() => {
    fetchListings()
    if (user) {
      fetchFavorites()
    }
  }, [currentPage, filters, user])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      })
      
      const response = await fetch(`/api/listings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch listings')
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast.error('Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = new Set(data.favorites.map((fav: any) => fav.listingId))
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      if (favorites.has(listingId)) {
        // Remove from favorites
        const response = await fetch(`/api/user/favorites/${listingId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev)
            newSet.delete(listingId)
            return newSet
          })
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId })
        })
        if (response.ok) {
          setFavorites(prev => new Set([...prev, listingId]))
          toast.success('Added to favorites')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat().format(mileage)
  }

  const parseImages = (images: string): string[] => {
    try {
      return JSON.parse(images)
    } catch {
      return []
    }
  }

  const parseFeatures = (features: string): string[] => {
    try {
      return JSON.parse(features)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Car Listings</h1>
            <p className="text-gray-600 mt-2">
              {pagination ? `${pagination.total} cars available` : 'Browse available cars'}
            </p>
          </div>
          <Link
            href="/sell"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sell Your Car
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
              <input
                type="text"
                value={filters.make}
                onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
                placeholder="e.g. Toyota"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. Camry"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Nairobi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
              <select
                value={filters.bodyType}
                onChange={(e) => setFilters(prev => ({ ...prev, bodyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Pickup">Pickup</option>
                <option value="Van">Van</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="10000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
              <select
                value={filters.transmission}
                onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest First</option>
                <option value="mileage-asc">Mileage: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found matching your criteria.</p>
            <Link
              href="/sell"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              List Your Car
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => {
              const images = parseImages(listing.images)
              const features = parseFeatures(listing.features)
              const isFavorite = favorites.has(listing.id)
              
              return (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-12 relative">
                      <Image
                        src={images[0] || '/api/placeholder/400/300'}
                        alt={listing.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    
                    {/* Listing Type Badge */}
                    {listing.listingType !== 'free' && (
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          listing.listingType === 'featured' ? 'bg-yellow-100 text-yellow-800' :
                          listing.listingType === 'premium' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.listingType.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      {isFavorite ? (
                        <FaHeart className="w-4 h-4 text-red-500" />
                      ) : (
                        <FaRegHeart className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-3">{formatPrice(listing.price)}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-1" />
                          <span>{listing.year}</span>
                        </div>
                        <div className="flex items-center">
                          <FaTachometerAlt className="w-4 h-4 mr-1" />
                          <span>{formatMileage(listing.mileage)} km</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaGasPump className="w-4 h-4 mr-1" />
                          <span>{listing.fuelType}</span>
                        </div>
                        <div className="flex items-center">
                          <FaCog className="w-4 h-4 mr-1" />
                          <span>{listing.transmission}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                        <span>{listing.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <FaEye className="w-3 h-3 mr-1" />
                          <span>{listing.views} views</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < pagination.pages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}