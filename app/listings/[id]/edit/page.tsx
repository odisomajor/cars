'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Car, 
  Upload, 
  X, 
  Save, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

interface EditListingPageProps {
  params: {
    id: string
  }
}

interface ListingData {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  location: string
  description: string
  condition: string
  fuelType: string
  transmission: string
  bodyType: string
  images: string[]
  features: string[]
  status: string
  listingType: string
  dailyRate?: number
  category?: string
  minRentalDays?: number
  maxRentalDays?: number
  availableFrom?: string
  availableTo?: string
}

const carMakes = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
  'Infiniti', 'Acura', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Ram',
  'Jeep', 'Chrysler', 'Dodge', 'Mitsubishi', 'Volvo', 'Jaguar', 'Land Rover',
  'Porsche', 'Tesla', 'Genesis', 'Alfa Romeo', 'Maserati', 'Bentley',
  'Rolls-Royce', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin'
]

const carFeatures = [
  'Air Conditioning', 'Heated Seats', 'Leather Seats', 'Sunroof', 'Navigation System',
  'Backup Camera', 'Bluetooth', 'Cruise Control', 'Keyless Entry', 'Remote Start',
  'Power Windows', 'Power Locks', 'Alloy Wheels', 'Fog Lights', 'Tinted Windows',
  'Premium Sound System', 'DVD Player', 'Third Row Seating', 'Roof Rack',
  'Tow Package', 'Sport Package', 'Cold Weather Package'
]

export default function EditListingPage({ params }: EditListingPageProps) {
  const { user, isAuthenticated, isLoading } = useAuth(true)
  const router = useRouter()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchListing()
    }
  }, [isAuthenticated, user, params.id])

  const fetchListing = async () => {
    try {
      // Try regular listings first
      let response = await fetch(`/api/listings/${params.id}`)
      let isRental = false
      
      if (!response.ok) {
        // Try rental listings
        response = await fetch(`/api/rental-listings/${params.id}`)
        isRental = true
      }
      
      if (response.ok) {
        const data = await response.json()
        
        // Check if user owns this listing
        if (data.listing.user.email !== user?.email) {
          router.push('/dashboard')
          return
        }
        
        setListing({
          ...data.listing,
          listingType: isRental ? 'RENTAL' : 'SALE'
        })
      } else {
        setError('Listing not found')
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setListing(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleFeatureToggle = (feature: string) => {
    if (!listing) return
    
    const updatedFeatures = listing.features.includes(feature)
      ? listing.features.filter(f => f !== feature)
      : [...listing.features, feature]
    
    handleInputChange('features', updatedFeatures)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prev => [...prev, ...files])
  }

  const removeExistingImage = (imageUrl: string) => {
    if (!listing) return
    
    setListing(prev => prev ? {
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    } : null)
    
    setImagesToRemove(prev => [...prev, imageUrl])
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing) return
    
    setSaving(true)
    setError('')
    
    try {
      const formData = new FormData()
      
      // Add listing data
      Object.entries(listing).forEach(([key, value]) => {
        if (key === 'features') {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'images') {
          // Don't append existing images, they'll be handled separately
        } else {
          formData.append(key, value?.toString() || '')
        }
      })
      
      // Add new images
      newImages.forEach(file => {
        formData.append('newImages', file)
      })
      
      // Add images to remove
      formData.append('imagesToRemove', JSON.stringify(imagesToRemove))
      
      const endpoint = listing.listingType === 'RENTAL' ? 'rental-listings' : 'listings'
      const response = await fetch(`/api/${endpoint}/${params.id}`, {
        method: 'PUT',
        body: formData
      })
      
      if (response.ok) {
        router.push('/my-listings')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error('Error updating listing:', error)
      setError('Failed to update listing')
    } finally {
      setSaving(false)
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
    return null
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/my-listings')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
              <p className="text-gray-600 mt-1">
                Update your {listing.listingType === 'RENTAL' ? 'rental' : 'sale'} listing
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={listing.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <select
                  value={listing.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Make</option>
                  {carMakes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  value={listing.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={listing.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {listing.listingType === 'RENTAL' ? 'Daily Rate' : 'Price'} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={listing.listingType === 'RENTAL' ? listing.dailyRate : listing.price}
                  onChange={(e) => handleInputChange(
                    listing.listingType === 'RENTAL' ? 'dailyRate' : 'price', 
                    parseFloat(e.target.value)
                  )}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mileage *
                </label>
                <input
                  type="number"
                  min="0"
                  value={listing.mileage}
                  onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={listing.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  value={listing.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="NEW">New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={listing.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  value={listing.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Fuel Type</option>
                  <option value="GASOLINE">Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="PLUG_IN_HYBRID">Plug-in Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  value={listing.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Transmission</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Type *
                </label>
                <select
                  value={listing.bodyType}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Body Type</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="COUPE">Coupe</option>
                  <option value="CONVERTIBLE">Convertible</option>
                  <option value="WAGON">Wagon</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="VAN">Van</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Features</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {carFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={listing.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
            
            {/* Existing Images */}
            {listing.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Listing image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">New Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload New Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Add more images to your listing</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Images</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}