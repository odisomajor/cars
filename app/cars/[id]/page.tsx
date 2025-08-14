'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Heart, Share2, MapPin, Calendar, Gauge, Fuel, Users, Cog, Phone, Mail, MessageCircle, Star, Shield, Award, X, Maximize2, Check, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdBanner from '@/components/ads/AdBanner'

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
  images: string[]
  isFeatured: boolean
  isNew: boolean
  dealer: {
    name: string
    rating: number
    reviewCount: number
    phone: string
    email: string
    verified: boolean
    location: string
  }
  description: string
  features: string[]
  specifications: {
    engine: string
    power: string
    torque: string
    acceleration: string
    topSpeed: string
    fuelConsumption: string
    co2Emissions: string
    drivetrain: string
    seatingCapacity: number
    doors: number
    bootSpace: string
    weight: string
    dimensions: {
      length: string
      width: string
      height: string
      wheelbase: string
    }
  }
  safety: string[]
  dateAdded: string
  views: number
  condition: 'New' | 'Used' | 'Certified Pre-owned'
}

export default function CarDetailPage() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features'>('overview')
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in this vehicle. Please contact me with more details.`
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Mock data - replace with actual API call
  const mockCar: Car = {
    id: '1',
    title: '2022 Toyota Camry Hybrid LE',
    price: 4500000,
    originalPrice: 4800000,
    location: 'Nairobi',
    year: 2022,
    mileage: '15,000 km',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    make: 'Toyota',
    model: 'Camry',
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    isFeatured: true,
    isNew: false,
    dealer: {
      name: 'Toyota Kenya',
      rating: 4.8,
      reviewCount: 156,
      phone: '+254 700 123 456',
      email: 'sales@toyotakenya.com',
      verified: true,
      location: 'Nairobi, Kenya'
    },
    description: 'This well-maintained 2022 Toyota Camry Hybrid offers exceptional fuel economy and reliability. The vehicle has been serviced regularly and comes with a comprehensive service history. Perfect for both city driving and long-distance travel with its comfortable interior and advanced safety features.',
    features: [
      'Leather Seats',
      'Sunroof',
      'Navigation System',
      'Backup Camera',
      'Bluetooth Connectivity',
      'Cruise Control',
      'Heated Seats',
      'Keyless Entry',
      'Push Button Start',
      'Dual Zone Climate Control',
      'Premium Audio System',
      'USB Ports'
    ],
    specifications: {
      engine: '2.5L 4-Cylinder Hybrid',
      power: '208 hp',
      torque: '221 Nm',
      acceleration: '7.5 seconds (0-100 km/h)',
      topSpeed: '180 km/h',
      fuelConsumption: '4.1L/100km',
      co2Emissions: '95 g/km',
      drivetrain: 'Front-wheel drive',
      seatingCapacity: 5,
      doors: 4,
      bootSpace: '524 liters',
      weight: '1,590 kg',
      dimensions: {
        length: '4,885 mm',
        width: '1,840 mm',
        height: '1,445 mm',
        wheelbase: '2,825 mm'
      }
    },
    safety: [
      'Toyota Safety Sense 2.0',
      'Pre-collision System',
      'Lane Departure Alert',
      'Automatic High Beams',
      'Dynamic Radar Cruise Control',
      '8 Airbags',
      'Vehicle Stability Control',
      'Anti-lock Braking System',
      'Electronic Brake Distribution',
      'Brake Assist'
    ],
    dateAdded: '2024-01-15',
    views: 1247,
    condition: 'Used'
  }

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setCar(mockCar)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextImage = () => {
    if (car) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
    }
  }

  const prevImage = () => {
    if (car) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!contactForm.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!contactForm.phone.trim()) {
      errors.phone = 'Phone number is required'
    }
    
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmittingContact(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingContact(false)
      setContactSubmitted(true)
      setShowContactForm(false)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setContactSubmitted(false)
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: `Hi, I'm interested in this vehicle. Please contact me with more details.`
        })
      }, 3000)
    }, 1500)
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const shareVehicle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: car?.title,
          text: `Check out this ${car?.title} for ${formatPrice(car?.price || 0)}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading car details..." />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Car Not Found</h1>
          <p className="text-secondary-600 mb-6">The car you're looking for doesn't exist.</p>
          <Link
            href="/cars"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Cars
          </Link>
        </div>
      </div>
    )
  }

  // Fullscreen Gallery Modal
  const FullscreenGallery = () => {
    if (!showFullscreenGallery || !car) return null

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <button
          onClick={() => setShowFullscreenGallery(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={car.images[currentImageIndex]}
            alt={`${car.title} - Image ${currentImageIndex + 1}`}
            fill
            className="object-contain"
          />
          
          {car.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {car.images.length}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <FullscreenGallery />
      <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-secondary-600 mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-primary-600 transition-colors whitespace-nowrap">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-secondary-400" />
          <Link href="/cars" className="hover:text-primary-600 transition-colors whitespace-nowrap">
            Cars
          </Link>
          <ChevronRight className="w-4 h-4 text-secondary-400" />
          <Link href={`/cars?make=${car.make}`} className="hover:text-primary-600 transition-colors whitespace-nowrap">
            {car.make}
          </Link>
          <ChevronRight className="w-4 h-4 text-secondary-400" />
          <span className="text-secondary-900 font-medium truncate max-w-xs">
            {car.model} {car.year}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mb-6">
              <div className="relative h-64 sm:h-80 lg:h-96 cursor-pointer" onClick={() => setShowFullscreenGallery(true)}>
                <Image
                  src={car.images[currentImageIndex]}
                  alt={car.title}
                  fill
                  className="object-cover"
                />
                
                {/* Navigation Arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  {car.isNew && (
                    <span className="bg-success-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </span>
                  )}
                  {car.isFeatured && (
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                  <span className="bg-secondary-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {car.condition}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFavorite(!isFavorite)
                    }}
                    className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-600'
                      }`}
                    />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      shareVehicle()
                    }}
                    className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-secondary-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullscreenGallery(true)
                    }}
                    className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    <Maximize2 className="w-5 h-5 text-secondary-600" />
                  </button>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {car.images.length}
                </div>
                
                {/* Fullscreen Hint */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-75">
                  Click to view fullscreen
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {car.images.length > 1 && (
                <div className="p-4 border-t border-secondary-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-primary-600'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${car.title} - Image ${index + 1}`}
                          width={80}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                    {car.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-secondary-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{car.location}</span>
                    </div>
                    <span>•</span>
                    <span>{car.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">
                    {formatPrice(car.price)}
                  </p>
                  {car.originalPrice && (
                    <p className="text-lg text-secondary-500 line-through">
                      {formatPrice(car.originalPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">Year</p>
                  <p className="font-semibold text-secondary-900">{car.year}</p>
                </div>
                <div className="text-center">
                  <Gauge className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">Mileage</p>
                  <p className="font-semibold text-secondary-900">{car.mileage}</p>
                </div>
                <div className="text-center">
                  <Fuel className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">Fuel Type</p>
                  <p className="font-semibold text-secondary-900">{car.fuelType}</p>
                </div>
                <div className="text-center">
                  <Cog className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">Transmission</p>
                  <p className="font-semibold text-secondary-900">{car.transmission}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-secondary-200 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'specifications', label: 'Specifications' },
                    { id: 'features', label: 'Features & Safety' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Description</h3>
                  <p className="text-secondary-700 leading-relaxed">{car.description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Engine & Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Engine:</span>
                          <span className="text-secondary-900">{car.specifications.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Power:</span>
                          <span className="text-secondary-900">{car.specifications.power}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Torque:</span>
                          <span className="text-secondary-900">{car.specifications.torque}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">0-100 km/h:</span>
                          <span className="text-secondary-900">{car.specifications.acceleration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Top Speed:</span>
                          <span className="text-secondary-900">{car.specifications.topSpeed}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Dimensions & Capacity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Length:</span>
                          <span className="text-secondary-900">{car.specifications.dimensions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Width:</span>
                          <span className="text-secondary-900">{car.specifications.dimensions.width}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Height:</span>
                          <span className="text-secondary-900">{car.specifications.dimensions.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Seating:</span>
                          <span className="text-secondary-900">{car.specifications.seatingCapacity} seats</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">Boot Space:</span>
                          <span className="text-secondary-900">{car.specifications.bootSpace}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Features & Comfort</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                            <span className="text-secondary-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-3">Safety Features</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {car.safety.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Shield className="w-4 h-4 text-success-600 mr-3" />
                            <span className="text-secondary-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ad Banner */}
            <div className="mb-6">
              <AdBanner 
                slot="car-detail-middle"
                format="horizontal"
                className="w-full h-24"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dealer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap sm:flex-nowrap gap-2">
                <h3 className="text-lg font-semibold text-secondary-900">Dealer Information</h3>
                {car.dealer.verified && (
                  <div className="flex items-center text-success-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-secondary-900 mb-1">{car.dealer.name}</h4>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(car.dealer.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-secondary-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-600 ml-2">
                    {car.dealer.rating} ({car.dealer.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center text-secondary-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{car.dealer.location}</span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                {contactSubmitted ? (
                  <div className="w-full bg-success-100 border border-success-200 text-success-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center">
                    <Check className="w-5 h-5 mr-2" />
                    Message Sent Successfully!
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {showContactForm ? 'Hide Contact Form' : 'Send Message'}
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${car.dealer.phone}`}
                    className="bg-secondary-100 hover:bg-secondary-200 text-secondary-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                  <a
                    href={`mailto:${car.dealer.email}`}
                    className="bg-secondary-100 hover:bg-secondary-200 text-secondary-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              {showContactForm && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.name 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-secondary-300 focus:ring-primary-500'
                        }`}
                      />
                      {formErrors.name && (
                        <div className="flex items-center mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {formErrors.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Your Email *"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-secondary-300 focus:ring-primary-500'
                        }`}
                      />
                      {formErrors.email && (
                        <div className="flex items-center mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {formErrors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Your Phone *"
                        value={contactForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                          formErrors.phone 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-secondary-300 focus:ring-primary-500'
                        }`}
                      />
                      {formErrors.phone && (
                        <div className="flex items-center mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {formErrors.phone}
                        </div>
                      )}
                    </div>
                    <div>
                      <textarea
                        placeholder="Your Message *"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors resize-none ${
                          formErrors.message 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-secondary-300 focus:ring-primary-500'
                        }`}
                      />
                      {formErrors.message && (
                        <div className="flex items-center mt-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {formErrors.message}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {isSubmittingContact ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                    <p className="text-xs text-secondary-500 text-center">
                      * Required fields
                    </p>
                  </form>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-secondary-100 hover:bg-secondary-200 text-secondary-900 py-2 px-4 rounded-lg font-medium transition-colors text-left">
                  Schedule Test Drive
                </button>
                <button className="w-full bg-secondary-100 hover:bg-secondary-200 text-secondary-900 py-2 px-4 rounded-lg font-medium transition-colors text-left">
                  Get Financing Quote
                </button>
                <button className="w-full bg-secondary-100 hover:bg-secondary-200 text-secondary-900 py-2 px-4 rounded-lg font-medium transition-colors text-left">
                  Trade-in Valuation
                </button>
              </div>
            </div>

            {/* Ad Banner */}
            <div className="mb-6">
              <AdBanner 
                slot="car-detail-sidebar"
                format="vertical"
                className="w-full h-64"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}