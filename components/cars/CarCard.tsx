'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Calendar, Gauge, Fuel, Star, BarChart3 } from 'lucide-react'

interface Car {
  id: string
  title: string
  price: number
  originalPrice?: number
  location: string
  year: number
  mileage: string
  fuelType: string
  transmission: string
  bodyType: string
  make: string
  model: string
  image: string
  images: string[]
  isFeatured: boolean
  isNew: boolean
  dealer: {
    name: string
    rating: number
    verified: boolean
  }
  description: string
  features: string[]
  dateAdded: string
  views: number
  condition: string
}

type ViewMode = 'grid' | 'list'

interface CarCardProps {
  car: Car
  viewMode: ViewMode
  isFavorite: boolean
  onToggleFavorite: () => void
  formatPrice: (price: number) => string
  isInComparison?: boolean
  onToggleCompare?: () => void
}

export function CarCard({ car, viewMode, isFavorite, onToggleFavorite, formatPrice, isInComparison = false, onToggleCompare }: CarCardProps) {

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          <div className="w-64 h-48 relative flex-shrink-0">
            <Image
              src={car.image}
              alt={car.title}
              fill
              className="object-cover"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex space-x-2">
              {car.isNew && (
                <span className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  New
                </span>
              )}
              {car.isFeatured && (
                <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={onToggleFavorite}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-600'
                  }`}
                />
              </button>
              {onToggleCompare && (
                <button
                  onClick={onToggleCompare}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                >
                  <BarChart3
                    className={`w-4 h-4 ${
                      isInComparison ? 'text-primary-600' : 'text-secondary-600'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl text-secondary-900 mb-2">
                  {car.title}
                </h3>
                <div className="flex items-center text-secondary-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{car.location}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(car.price)}
                </p>
                {car.originalPrice && (
                  <p className="text-sm text-secondary-500 line-through">
                    {formatPrice(car.originalPrice)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Car Specs */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-secondary-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">{car.year}</span>
              </div>
              <div className="flex items-center text-secondary-600">
                <Gauge className="w-4 h-4 mr-2" />
                <span className="text-sm">{car.mileage}</span>
              </div>
              <div className="flex items-center text-secondary-600">
                <Fuel className="w-4 h-4 mr-2" />
                <span className="text-sm">{car.fuelType}</span>
              </div>
              <div className="text-sm text-secondary-600">
                {car.transmission}
              </div>
            </div>
            
            <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
              {car.description}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-secondary-500">
                <span>by {car.dealer.name}</span>
                {car.dealer.verified && (
                  <span className="ml-2 text-green-600">✓ Verified</span>
                )}
                <div className="flex items-center ml-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="ml-1">{car.dealer.rating}</span>
                </div>
              </div>
              <Link
                href={`/cars/${car.id}`}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48">
        <Image
          src={car.image}
          alt={car.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {car.isNew && (
            <span className="bg-success-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              New
            </span>
          )}
          {car.isFeatured && (
            <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={onToggleFavorite}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-600'
              }`}
            />
          </button>
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-all"
            >
              <BarChart3
                className={`w-4 h-4 ${
                  isInComparison ? 'text-primary-600' : 'text-secondary-600'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
          {car.title}
        </h3>
        
        <div className="flex items-center text-secondary-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{car.location}</span>
        </div>

        {/* Car Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div className="flex items-center text-secondary-600">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center text-secondary-600">
            <Gauge className="w-3 h-3 mr-1" />
            <span>{car.mileage}</span>
          </div>
          <div className="flex items-center text-secondary-600">
            <Fuel className="w-3 h-3 mr-1" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        {/* Dealer Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-xs text-secondary-500">
            <span>by {car.dealer.name}</span>
            {car.dealer.verified && (
              <span className="ml-1 text-green-600">✓</span>
            )}
          </div>
          <div className="flex items-center text-xs text-secondary-500">
            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
            <span>{car.dealer.rating}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary-600">
              {formatPrice(car.price)}
            </p>
            {car.originalPrice && (
              <p className="text-xs text-secondary-500 line-through">
                {formatPrice(car.originalPrice)}
              </p>
            )}
          </div>
          <Link
            href={`/cars/${car.id}`}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}