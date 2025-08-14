"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FaHeart, FaRegHeart, FaEye, FaMapMarkerAlt, FaGasPump, FaCog, FaCalendarAlt, FaTachometerAlt, FaPhone, FaEnvelope, FaUser, FaArrowLeft, FaShare, FaCheck } from "react-icons/fa"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"

interface Listing {
  id: string
  title: string
  description: string
  make: string
  model: string
  year: number
  price: number
  dailyRate?: number
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  bodyType: string
  color?: string
  location: string
  engineSize?: string
  images: string[]
  features: string[]
  listingType: string
  status: string
  views: number
  contactCount: number
  createdAt: string
  expiresAt: string
  category?: string
  minRentalDays?: number
  maxRentalDays?: number
  availableFrom?: string
  availableTo?: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    phone?: string
    profile?: {
      avatar?: string
      bio?: string
    }
  }
  _count?: {
    favorites: number
    reviews: number
  }
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactInfo, setShowContactInfo] = useState(false)

  useEffect(() => {
    if (id) {
      fetchListing()
      checkFavoriteStatus()
    }
  }, [id, user])

  const fetchListing = async () => {
    try {
      setLoading(true)
      // Try regular listings first
      let response = await fetch(`/api/listings/${id}`)
      let isRental = false
      
      if (!response.ok) {
        // Try rental listings
        response = await fetch(`/api/rental-listings/${id}`)
        isRental = true
      }
      
      if (response.ok) {
        const data = await response.json()
        setListing({
          ...data.listing,
          listingType: isRental ? 'RENTAL' : 'SALE'
        })
      } else {
        toast.error('Listing not found')
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
      toast.error('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    if (!user || !listing) return
    
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        const favorited = data.favorites.some((fav: any) => 
          fav.listingId === listing.id || fav.rentalListingId === listing.id
        )
        setIsFavorite(favorited)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !listing) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const body = {
        listingId: listing.listingType === 'SALE' ? listing.id : null,
        rentalListingId: listing.listingType === 'RENTAL' ? listing.id : null
      }
      
      const response = await fetch('/api/user/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        setIsFavorite(!isFavorite)
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const handleContactSeller = async () => {
    if (!user) {
      toast.error('Please sign in to contact seller')
      return
    }

    try {
      await fetch(`/api/listings/${id}/contact`, { method: 'POST' })
      setShowContactInfo(true)
    } catch (error) {
      console.error('Error recording contact:', error)
    }
  }

  const shareListing = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Check out this ${listing?.year} ${listing?.make} ${listing?.model}`,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat().format(mileage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600 mb-8">The listing you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/listings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images = listing.images || []
  const features = listing.features || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-12 relative">
                  <Image
                    src={images[currentImageIndex] || '/api/placeholder/800/600'}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Listing Type Badge */}
                {listing.listingType !== 'free' && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${
                      listing.listingType === 'featured' ? 'bg-yellow-100 text-yellow-800' :
                      listing.listingType === 'premium' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {listing.listingType.toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={shareListing}
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <FaShare className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    {isFavorite ? (
                      <FaHeart className="w-4 h-4 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
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

            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="mb-6">
                <p className="text-4xl font-bold text-blue-600">
                  {listing.listingType === 'RENTAL' 
                    ? `${formatPrice(listing.dailyRate || 0)}/day`
                    : formatPrice(listing.price)
                  }
                </p>
                {listing.listingType === 'RENTAL' && (
                  <p className="text-sm text-gray-600 mt-1">Daily rental rate</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-semibold">{listing.year}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaTachometerAlt className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-semibold">{formatMileage(listing.mileage)} miles</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaGasPump className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Fuel</p>
                  <p className="font-semibold">{listing.fuelType}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaCog className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-semibold">{listing.transmission}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Make:</span>
                    <span className="font-medium">{listing.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{listing.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Body Type:</span>
                    <span className="font-medium">{listing.bodyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{listing.condition}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {listing.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{listing.color}</span>
                    </div>
                  )}
                  {listing.engineSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine Size:</span>
                      <span className="font-medium">{listing.engineSize}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                      {listing.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium flex items-center">
                      <FaEye className="w-3 h-3 mr-1" />
                      {listing.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <FaCheck className="w-3 h-3 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Specific Info */}
            {listing.listingType === 'RENTAL' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rental Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.category && (
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium ml-2">{listing.category}</span>
                    </div>
                  )}
                  
                  {listing.minRentalDays && (
                    <div>
                      <span className="text-gray-600">Minimum Rental:</span>
                      <span className="font-medium ml-2">{listing.minRentalDays} days</span>
                    </div>
                  )}
                  
                  {listing.maxRentalDays && (
                    <div>
                      <span className="text-gray-600">Maximum Rental:</span>
                      <span className="font-medium ml-2">{listing.maxRentalDays} days</span>
                    </div>
                  )}
                  
                  {listing.availableFrom && (
                    <div>
                      <span className="text-gray-600">Available From:</span>
                      <span className="font-medium ml-2">{formatDate(listing.availableFrom)}</span>
                    </div>
                  )}
                  
                  {listing.availableTo && (
                    <div>
                      <span className="text-gray-600">Available Until:</span>
                      <span className="font-medium ml-2">{formatDate(listing.availableTo)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="flex items-center mb-4">
                {listing.user.profile?.avatar || listing.user.image ? (
                  <Image
                    src={listing.user.profile?.avatar || listing.user.image || ''}
                    alt={listing.user.name || 'Seller'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{listing.user.name || 'Anonymous Seller'}</p>
                  <p className="text-sm text-gray-600">Member since {new Date(listing.createdAt).getFullYear()}</p>
                  {listing._count && (
                    <p className="text-sm text-gray-600">{listing._count.reviews} reviews</p>
                  )}
                </div>
              </div>
              
              {listing.user.profile?.bio && (
                <p className="text-gray-700 mb-4">{listing.user.profile.bio}</p>
              )}
              
              {!showContactInfo ? (
                <button
                  onClick={handleContactSeller}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-3"
                >
                  Show Contact Info
                </button>
              ) : (
                <div className="space-y-3 mb-3">
                  {listing.user.phone && (
                    <a
                      href={`tel:${listing.user.phone}`}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaPhone className="w-4 h-4 mr-2" />
                      Call Seller
                    </a>
                  )}
                  <a
                    href={`mailto:${listing.user.email}?subject=Inquiry about ${listing.title}`}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Listed on {new Date(listing.createdAt).toLocaleDateString()}</p>
                <p>Expires on {new Date(listing.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">Safety Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Meet in a public place</li>
                <li>• Inspect the vehicle thoroughly</li>
                <li>• Verify ownership documents</li>
                <li>• Don't send money in advance</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}