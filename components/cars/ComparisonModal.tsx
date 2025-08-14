'use client'

import { useState } from 'react'
import { X, Plus, Minus, Check, Star, MapPin, Calendar, Gauge, Fuel, Users, Cog } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  dealer: {
    name: string
    rating: number
    verified: boolean
  }
  specifications: {
    engine: string
    power: string
    torque: string
    fuelConsumption: string
    seatingCapacity: number
    doors: number
    bootSpace: string
  }
  features: string[]
  condition: 'New' | 'Used' | 'Certified Pre-owned'
}

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  cars: Car[]
  onRemoveCar: (carId: string) => void
  onAddCar: () => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function ComparisonModal({ isOpen, onClose, cars, onRemoveCar, onAddCar }: ComparisonModalProps) {
  if (!isOpen) return null

  const maxCars = 3
  const canAddMore = cars.length < maxCars

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-2xl font-bold text-secondary-900">Compare Cars</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {cars.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">No cars to compare</h3>
              <p className="text-secondary-600 mb-4">Add cars from the listings to start comparing</p>
              <button
                onClick={onAddCar}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Browse Cars
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Car Cards */}
              {cars.map((car) => (
                <div key={car.id} className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
                  {/* Car Image */}
                  <div className="relative h-48">
                    <Image
                      src={car.image}
                      alt={car.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => onRemoveCar(car.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2">
                      <span className="bg-secondary-900 text-white px-2 py-1 rounded text-xs font-medium">
                        {car.condition}
                      </span>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-secondary-900 mb-2">{car.title}</h3>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary-600">{formatPrice(car.price)}</p>
                      {car.originalPrice && (
                        <p className="text-sm text-secondary-500 line-through">
                          {formatPrice(car.originalPrice)}
                        </p>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-secondary-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{car.location}</span>
                      </div>
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
                      <div className="flex items-center text-secondary-600">
                        <Cog className="w-4 h-4 mr-2" />
                        <span className="text-sm">{car.transmission}</span>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="border-t border-secondary-200 pt-4 mb-4">
                      <h4 className="font-semibold text-secondary-900 mb-2">Specifications</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Engine:</span>
                          <span className="text-secondary-900">{car.specifications.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Power:</span>
                          <span className="text-secondary-900">{car.specifications.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Fuel Economy:</span>
                          <span className="text-secondary-900">{car.specifications.fuelConsumption}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Seats:</span>
                          <span className="text-secondary-900">{car.specifications.seatingCapacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Boot Space:</span>
                          <span className="text-secondary-900">{car.specifications.bootSpace}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="border-t border-secondary-200 pt-4 mb-4">
                      <h4 className="font-semibold text-secondary-900 mb-2">Key Features</h4>
                      <div className="space-y-1">
                        {car.features.slice(0, 5).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="w-3 h-3 text-success-500 mr-2" />
                            <span className="text-secondary-700">{feature}</span>
                          </div>
                        ))}
                        {car.features.length > 5 && (
                          <p className="text-xs text-secondary-500">+{car.features.length - 5} more features</p>
                        )}
                      </div>
                    </div>

                    {/* Dealer Info */}
                    <div className="border-t border-secondary-200 pt-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-secondary-900">{car.dealer.name}</p>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-secondary-600">{car.dealer.rating}</span>
                            {car.dealer.verified && (
                              <span className="ml-2 text-xs bg-success-100 text-success-700 px-2 py-1 rounded">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link
                      href={`/cars/${car.id}`}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add More Card */}
              {canAddMore && (
                <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-secondary-500" />
                    </div>
                    <p className="text-secondary-600 mb-3">Add another car to compare</p>
                    <button
                      onClick={onAddCar}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Browse Cars
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Compare up to {maxCars} cars • {cars.length} of {maxCars} selected
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Close
              </button>
              {cars.length > 0 && (
                <button
                  onClick={() => {
                    // Print or export comparison
                    window.print()
                  }}
                  className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors"
                >
                  Print Comparison
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonModal