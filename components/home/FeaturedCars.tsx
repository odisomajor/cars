'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Heart, MapPin, Fuel, Gauge, Calendar, Play, Pause } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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
  isFeatured: boolean
  isNew: boolean
}

export default function FeaturedCars() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with actual API data
  const featuredCars: Car[] = [
    {
      id: '1',
      title: '2022 Toyota Camry Hybrid',
      price: 4500000,
      location: 'Nairobi',
      year: 2022,
      mileage: '15,000 km',
      fuelType: 'Hybrid',
      transmission: 'Automatic',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: false
    },
    {
      id: '2',
      title: '2023 Honda CR-V',
      price: 5200000,
      location: 'Mombasa',
      year: 2023,
      mileage: '8,500 km',
      fuelType: 'Petrol',
      transmission: 'CVT',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: true
    },
    {
      id: '3',
      title: '2021 BMW X3 xDrive',
      price: 7800000,
      location: 'Kisumu',
      year: 2021,
      mileage: '22,000 km',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: false
    },
    {
      id: '4',
      title: '2022 Nissan X-Trail',
      price: 4200000,
      location: 'Nakuru',
      year: 2022,
      mileage: '18,000 km',
      fuelType: 'Petrol',
      transmission: 'CVT',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: false
    },
    {
      id: '5',
      title: '2023 Mazda CX-5',
      price: 4800000,
      location: 'Eldoret',
      year: 2023,
      mileage: '12,000 km',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: true
    },
    {
      id: '6',
      title: '2021 Subaru Forester',
      price: 4600000,
      location: 'Thika',
      year: 2021,
      mileage: '25,000 km',
      fuelType: 'Petrol',
      transmission: 'CVT',
      image: '/api/placeholder/400/300',
      isFeatured: true,
      isNew: false
    }
  ]

  const carsPerSlide = 3
  const totalSlides = Math.ceil(featuredCars.length / carsPerSlide)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

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
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Featured Cars
            </h2>
            <p className="text-secondary-600 text-lg">
              Handpicked premium vehicles from trusted dealers
            </p>
          </div>
          
          {/* Auto-play Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              title={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
            >
              {isAutoPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCars
                    .slice(slideIndex * carsPerSlide, (slideIndex + 1) * carsPerSlide)
                    .map((car) => (
                      <div
                        key={car.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                      >
                        {/* Loading State */}
                        {isLoading && (
                          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                            <LoadingSpinner size="sm" />
                          </div>
                        )}

                        {/* Car Image */}
                        <div className="relative h-48 overflow-hidden">
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
                            <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          </div>
                          
                          {/* Favorite Button */}
                          <button
                            onClick={() => toggleFavorite(car.id)}
                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.includes(car.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-secondary-600'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Car Details */}
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

                          {/* Price and CTA */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary-600">
                                {formatPrice(car.price)}
                              </p>
                              <p className="text-xs text-secondary-500">
                                {car.transmission}
                              </p>
                            </div>
                            <Link
                              href={`/cars/${car.id}`}
                              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-primary-600 w-8'
                  : 'bg-secondary-300 hover:bg-secondary-400'
              }`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/cars"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>View All Cars</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}