"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"
import { FaCar, FaUpload, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa"

interface ListingFormData {
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  transmission: string
  bodyType: string
  color: string
  location: string
  description: string
  condition: string
  engineSize: string
  features: string[]
  images: File[]
  listingType: 'free' | 'featured' | 'premium' | 'spotlight'
}

const KENYAN_LOCATIONS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale",
  "Garissa", "Kakamega", "Machakos", "Meru", "Nyeri", "Kericho", "Naivasha"
]

const CAR_MAKES = [
  "Toyota", "Nissan", "Honda", "Mazda", "Mitsubishi", "Subaru", "Volkswagen",
  "Mercedes-Benz", "BMW", "Audi", "Hyundai", "Kia", "Ford", "Chevrolet", "Peugeot"
]

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"]
const TRANSMISSIONS = ["Manual", "Automatic", "CVT"]
const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Wagon", "Coupe", "Convertible", "Pickup", "Van"]
const CONDITIONS = ["New", "Used - Excellent", "Used - Good", "Used - Fair"]

const COMMON_FEATURES = [
  "Air Conditioning", "Power Steering", "Electric Windows", "Central Locking",
  "ABS Brakes", "Airbags", "Alloy Wheels", "Sunroof", "Leather Seats",
  "Navigation System", "Bluetooth", "Reverse Camera", "Parking Sensors"
]

export default function SellCarPage() {
  const { user, loading } = useAuth(true)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: "",
    transmission: "",
    bodyType: "",
    color: "",
    location: "",
    description: "",
    condition: "",
    engineSize: "",
    features: [],
    images: [],
    listingType: "free"
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleInputChange = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.images.length > 10) {
      toast.error("Maximum 10 images allowed")
      return
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          value.forEach((file: File) => submitData.append('images', file))
        } else if (key === 'features') {
          submitData.append('features', JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      })

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        throw new Error('Failed to create listing')
      }

      const result = await response.json()
      toast.success('Listing created successfully!')
      router.push(`/cars/${result.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Failed to create listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaCar className="text-2xl" />
              Sell Your Car
            </h1>
            <p className="mt-2 text-blue-100">
              Create a listing to reach thousands of potential buyers
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Basic Info</span>
              <span>Details</span>
              <span>Features</span>
              <span>Images & Pricing</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., 2020 Toyota Camry - Excellent Condition"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make *
                    </label>
                    <select
                      required
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Make</option>
                      {CAR_MAKES.map(make => (
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
                      required
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g., Camry, Corolla, Prado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      required
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type *
                    </label>
                    <select
                      required
                      value={formData.bodyType}
                      onChange={(e) => handleInputChange('bodyType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Body Type</option>
                      {BODY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Location</option>
                      {KENYAN_LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage (KM) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type *
                    </label>
                    <select
                      required
                      value={formData.fuelType}
                      onChange={(e) => handleInputChange('fuelType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Fuel Type</option>
                      {FUEL_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission *
                    </label>
                    <select
                      required
                      value={formData.transmission}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Transmission</option>
                      {TRANSMISSIONS.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      required
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Condition</option>
                      {CONDITIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engine Size
                    </label>
                    <input
                      type="text"
                      value={formData.engineSize}
                      onChange={(e) => handleInputChange('engineSize', e.target.value)}
                      placeholder="e.g., 2.0L, 1800cc"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="e.g., White, Black, Silver"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your car's condition, history, and any additional details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Features */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Features & Equipment</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {COMMON_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Images & Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Images & Pricing</h2>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Max 10)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                      className="cursor-pointer text-blue-600 hover:text-blue-500"
                    >
                      Click to upload images
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                  
                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KSH) *
                  </label>
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                      placeholder="e.g., 1500000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Listing Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { type: 'free', name: 'Free', price: 'KSH 0', features: ['Basic listing', '5 photos', '30 days'] },
                      { type: 'featured', name: 'Featured', price: 'KSH 1,000', features: ['Priority search', '10 photos', '60 days'] },
                      { type: 'premium', name: 'Premium', price: 'KSH 2,500', features: ['Homepage carousel', 'Social promotion', '90 days'] },
                      { type: 'spotlight', name: 'Spotlight', price: 'KSH 5,000', features: ['Top placement', 'Featured badge', '120 days'] }
                    ].map(plan => (
                      <div
                        key={plan.type}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.listingType === plan.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('listingType', plan.type)}
                      >
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                          <p className="text-lg font-bold text-blue-600 mt-1">{plan.price}</p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            {plan.features.map(feature => (
                              <li key={feature}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}