'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, MapPin, Calendar, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface FeaturedListing {
  id: string
  title: string
  price: number
  currency: string
  images: string[]
  location: string
  year: number
  mileage: number
  fuelType: string
  transmission: string
  listingType: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
  category: 'SALE' | 'RENTAL'
  views: number
  createdAt: string
  user: {
    name: string
    avatar?: string
    isVerified: boolean
  }
}

interface FeaturedCarouselProps {
  listings: FeaturedListing[]
  category?: 'SALE' | 'RENTAL' | 'ALL'
  autoPlay?: boolean
  showControls?: boolean
  itemsPerView?: number
  className?: string
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  listings,
  category = 'ALL',
  autoPlay = true,
  showControls = true,
  itemsPerView = 3,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)

  // Filter listings by category
  const filteredListings = category === 'ALL' 
    ? (listings || []) 
    : (listings || []).filter(listing => listing.category === category)

  // Sort by listing type priority (SPOTLIGHT > PREMIUM > FEATURED)
  const sortedListings = filteredListings.sort((a, b) => {
    const priority = { SPOTLIGHT: 3, PREMIUM: 2, FEATURED: 1 }
    return priority[b.listingType] - priority[a.listingType]
  })

  const totalSlides = Math.ceil(sortedListings.length / itemsPerView)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalSlides])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'SPOTLIGHT': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'PREMIUM': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'FEATURED': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case 'SPOTLIGHT': return '🌟'
      case 'PREMIUM': return '💎'
      case 'FEATURED': return '⭐'
      default: return '📌'
    }
  }

  if (sortedListings.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No featured listings available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category === 'RENTAL' ? 'Featured Rentals' : 
             category === 'SALE' ? 'Featured Cars' : 'Featured Listings'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Premium listings from verified sellers
          </p>
        </div>
        
        {/* Auto-play toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="hidden md:flex"
          >
            {isAutoPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className={`grid gap-6 ${
                itemsPerView === 1 ? 'grid-cols-1' :
                itemsPerView === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {sortedListings
                  .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                  .map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={listing.images[0] || '/placeholder-car.jpg'}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Premium Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className={`${getListingTypeColor(listing.listingType)} font-semibold shadow-lg`}>
                            <span className="mr-1">{getListingTypeIcon(listing.listingType)}</span>
                            {listing.listingType}
                          </Badge>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-black/70 text-white">
                            {listing.category === 'RENTAL' ? 'For Rent' : 'For Sale'}
                          </Badge>
                        </div>

                        {/* Views Counter */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {listing.views}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Price */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(listing.price, listing.currency)}
                            {listing.category === 'RENTAL' && (
                              <span className="text-sm font-normal text-gray-500">/day</span>
                            )}
                          </div>
                          {listing.user.isVerified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {listing.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.location}</span>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {listing.year}
                          </div>
                          <div>{listing.mileage.toLocaleString()} km</div>
                          <div>{listing.fuelType}</div>
                          <div>{listing.transmission}</div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {listing.user.avatar ? (
                              <Image
                                src={listing.user.avatar}
                                alt={listing.user.name}
                                width={24}
                                height={24}
                                className="rounded-full mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {listing.user.name}
                            </span>
                          </div>
                          
                          <Link href={`/${listing.category === 'RENTAL' ? 'hire' : 'cars'}/${listing.id}`}>
                            <Button size="sm" className="group-hover:bg-blue-600 transition-colors">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && totalSlides > 1 && (
        <>
          {/* Arrow Controls */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default FeaturedCarousel