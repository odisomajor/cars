"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { FaSearch, FaFilter, FaMapMarkerAlt, FaEye, FaHeart, FaRegHeart, FaCar, FaGasPump, FaCog, FaCalendarAlt } from "react-icons/fa"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"

interface RentalListing {
  id: string
  title: string
  make: string
  model: string
  year: number
  dailyRate: number
  mileage: number
  fuelType: string
  transmission: string
  bodyType: string
  location: string
  images: string[]
  status: string
  views: number
  category: string
  minRentalDays: number
  maxRentalDays: number
  availableFrom: string
  availableTo: string
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

interface Filters {
  search: string
  make: string
  bodyType: string
  fuelType: string
  transmission: string
  category: string
  location: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

export default function RentalListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<RentalListing[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalListings, setTotalListings] = useState(0)
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    make: '',
    bodyType: '',
    fuelType: '',
    transmission: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  })

  const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia']
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van']
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
  const transmissions = ['Manual', 'Automatic']
  const categories = ['Economy', 'Compact', 'Mid-size', 'Full-size', 'Premium', 'Luxury', 'SUV', 'Van']
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']

  useEffect(() => {
    fetchListings()
  }, [currentPage, filters])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

      const response = await fetch(`/api/rental-listings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings)
        setTotalPages(data.totalPages)
        setTotalListings(data.total)
      } else {
        toast.error('Failed to load rental listings')
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast.error('Failed to load rental listings')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = data.favorites
          .filter((fav: any) => fav.rentalListingId)
          .map((fav: any) => fav.rentalListingId)
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
      const isFavorite = favorites.includes(listingId)
      const method = isFavorite ? 'DELETE' : 'POST'
      const body = {
        rentalListingId: listingId
      }

      const response = await fetch('/api/user/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        if (isFavorite) {
          setFavorites(favorites.filter(id => id !== listingId))
          toast.success('Removed from favorites')
        } else {
          setFavorites([...favorites, listingId])
          toast.success('Added to favorites')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      bodyType: '',
      fuelType: '',
      transmission: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    })
    setCurrentPage(1)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Car Rentals</h1>
              <p className="text-gray-600 mt-1">
                {totalListings} rental cars available
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/create-rental-listing"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <FaCar className="w-4 h-4 mr-2" />
                List Your Car for Rent
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make, model, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaFilter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Makes</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filters.bodyType}
                  onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Body Types</option>
                  {bodyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>

                <select
                  value={filters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Fuel Types</option>
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>

                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Transmissions</option>
                  {transmissions.map(trans => (
                    <option key={trans} value={trans}>{trans}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min Price/day"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Max Price/day"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 md:mb-0"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="mileage_low">Mileage: Low to High</option>
                  <option value="mileage_high">Mileage: High to Low</option>
                  <option value="most_viewed">Most Viewed</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <FaCar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No rental cars found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <Link href={`/listings/${listing.id}`}>
                      <div className="h-48 relative">
                        {listing.images.length > 0 ? (
                          <Image
                            src={listing.images[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full bg-gray-200 flex items-center justify-center">
                            <FaCar className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      {favorites.includes(listing.id) ? (
                        <FaHeart className="w-4 h-4 text-red-500" />
                      ) : (
                        <FaRegHeart className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {listing.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link href={`/listings/${listing.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>
                    </Link>
                    
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {formatPrice(listing.dailyRate)}/day
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-3 h-3 mr-1" />
                        <span>{listing.year}</span>
                      </div>
                      <div className="flex items-center">
                        <FaGasPump className="w-3 h-3 mr-1" />
                        <span>{listing.fuelType}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCog className="w-3 h-3 mr-1" />
                        <span>{listing.transmission}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaEye className="w-3 h-3 mr-1" />
                        <span>{listing.views} views</span>
                      </div>
                      <span>{formatMileage(listing.mileage)} miles</span>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Available: {formatDate(listing.availableFrom)} - {formatDate(listing.availableTo)}</p>
                      <p>Min: {listing.minRentalDays} days, Max: {listing.maxRentalDays} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const page = index + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}