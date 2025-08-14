'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, MapPin, Calendar, Fuel, Gauge, Heart, Eye } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface Car {
  id: string
  title: string
  price: number
  location: string
  year: number
  mileage: string
  fuelType: string
  transmission: string
  image: string
  dealer: string
  isVerified: boolean
  isFeatured: boolean
}

interface SearchResultsPreviewProps {
  query: string
  isVisible: boolean
  onClose: () => void
}

// Mock search results data
const mockSearchResults: Car[] = [
  {
    id: '1',
    title: 'Toyota Camry 2020',
    price: 2800000,
    location: 'Nairobi',
    year: 2020,
    mileage: '45,000 km',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    image: '/api/placeholder/300/200',
    dealer: 'Premium Motors',
    isVerified: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Honda Civic 2019',
    price: 2200000,
    location: 'Mombasa',
    year: 2019,
    mileage: '62,000 km',
    fuelType: 'Petrol',
    transmission: 'Manual',
    image: '/api/placeholder/300/200',
    dealer: 'City Cars',
    isVerified: true,
    isFeatured: false
  },
  {
    id: '3',
    title: 'Nissan X-Trail 2021',
    price: 3500000,
    location: 'Kisumu',
    year: 2021,
    mileage: '28,000 km',
    fuelType: 'Petrol',
    transmission: 'CVT',
    image: '/api/placeholder/300/200',
    dealer: 'Lake Motors',
    isVerified: true,
    isFeatured: true
  }
]

export function SearchResultsPreview({ query, isVisible, onClose }: SearchResultsPreviewProps) {
  const [results, setResults] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true)
      // Simulate API call
      const timer = setTimeout(() => {
        const filteredResults = mockSearchResults.filter(car =>
          car.title.toLowerCase().includes(query.toLowerCase()) ||
          car.location.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filteredResults)
        setIsLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const toggleFavorite = (carId: string) => {
    setFavorites(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isVisible || query.length <= 2) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-large border border-secondary-200 z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-6 text-center">
          <LoadingSpinner size="sm" text="Searching cars..." />
        </div>
      ) : results.length > 0 ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">
              Search Results ({results.length})
            </h3>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              onClick={onClose}
            >
              View All Results
            </Link>
          </div>
          
          <div className="space-y-3">
            {results.slice(0, 3).map((car) => (
              <div
                key={car.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors group"
              >
                <div className="relative w-16 h-12 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                  <Car className="w-8 h-8 text-secondary-400 absolute inset-0 m-auto" />
                  {car.isFeatured && (
                    <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/cars/${car.id}`}
                    className="block"
                    onClick={onClose}
                  >
                    <h4 className="font-medium text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                      {car.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                      <span className="font-semibold text-primary-600">
                        {formatPrice(car.price)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{car.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{car.year}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(car.id)}
                    className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(car.id) ? 'fill-current text-primary-600' : ''
                      }`}
                    />
                  </button>
                  <Link
                    href={`/cars/${car.id}`}
                    className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                    onClick={onClose}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {results.length > 3 && (
            <div className="mt-4 pt-3 border-t border-secondary-200">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="block text-center text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors"
                onClick={onClose}
              >
                View {results.length - 3} More Results
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <Car className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-600 mb-2">No cars found for "{query}"</p>
          <p className="text-sm text-secondary-500">
            Try searching with different keywords or check your spelling
          </p>
          <Link
            href="/cars"
            className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium"
            onClick={onClose}
          >
            Browse All Cars
          </Link>
        </div>
      )}
    </div>
  )
}