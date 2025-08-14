'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Heart, Car, MapPin, Calendar, DollarSign, Trash2, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FavoriteCar {
  id: string
  listing: {
    id: string
    title: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    location: string
    images: string
    condition: string
    fuelType: string
    transmission: string
    createdAt: string
  }
  createdAt: string
}

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true) // Require authentication
  const [favorites, setFavorites] = useState<FavoriteCar[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      } else {
        toast.error('Failed to load favorites')
      }
    } catch (error) {
      toast.error('An error occurred while loading favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    setRemovingId(favoriteId)
    try {
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
        toast.success('Removed from favorites')
      } else {
        toast.error('Failed to remove from favorites')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setRemovingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage)
  }

  const getImageUrl = (images: string) => {
    try {
      const imageArray = JSON.parse(images)
      return imageArray[0] || '/images/car-placeholder.jpg'
    } catch {
      return '/images/car-placeholder.jpg'
    }
  }

  if (isLoading || loading) {
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                  <p className="text-gray-600">
                    {favorites.length} saved {favorites.length === 1 ? 'car' : 'cars'}
                  </p>
                </div>
              </div>
              <Link
                href="/cars"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Browse Cars
              </Link>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Start browsing cars and save your favorites to see them here
              </p>
              <Link
                href="/cars"
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Car className="w-5 h-5" />
                <span>Browse Cars</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const { listing } = favorite
              return (
                <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Car Image */}
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(listing.images)}
                      alt={`${listing.year} ${listing.make} ${listing.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        disabled={removingId === favorite.id}
                        className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        {removingId === favorite.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Heart className="w-4 h-4 text-red-600 fill-current" />
                        )}
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded">
                        {listing.condition}
                      </span>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {listing.year} {listing.make} {listing.model}
                      </h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(listing.price)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatMileage(listing.mileage)} miles</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{listing.fuelType}</span>
                        <span>•</span>
                        <span>{listing.transmission}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Saved {new Date(favorite.createdAt).toLocaleDateString()}
                      </div>
                      <Link
                        href={`/cars/${listing.id}`}
                        className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {favorites.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Favorites Summary</h3>
                <p className="text-gray-600">
                  You have {favorites.length} saved {favorites.length === 1 ? 'car' : 'cars'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Average Price</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatPrice(
                    favorites.reduce((sum, fav) => sum + fav.listing.price, 0) / favorites.length
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}