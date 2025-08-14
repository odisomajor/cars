'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Users, 
  Car, 
  Star,
  Shield,
  Clock,
  Fuel,
  Settings,
  Check,
  X,
  Phone,
  Mail,
  MessageCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Info
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdBanner from '@/components/ads/AdBanner'
import ReviewSystem from '@/components/ReviewSystem'
import CompanyVerificationBadge from '@/components/CompanyVerificationBadge'

interface RentalCar {
  id: string
  title: string
  brand: string
  model: string
  year: number
  category: string
  pricePerDay: number
  pricePerWeek: number
  pricePerMonth: number
  image: string
  images: string[]
  features: string[]
  specifications: {
    seats: number
    transmission: string
    fuelType: string
    airConditioning: boolean
    gps: boolean
    doors: number
    luggage: number
    engine: string
  }
  location: string
  rating: number
  reviewCount: number
  availability: boolean
  isPopular: boolean
  isFeatured: boolean
  rentalCompany: {
    id: string
    name: string
    rating: number
    verified: boolean
    phone: string
    email: string
    address: string
  }
  policies: {
    minimumAge: number
    drivingLicense: string
    deposit: number
    fuelPolicy: string
    cancellation: string
    insurance: string
  }
  includedFeatures: string[]
  additionalServices: {
    name: string
    price: number
    description: string
  }[]
}

interface BookingForm {
  pickupDate: string
  returnDate: string
  pickupTime: string
  returnTime: string
  pickupLocation: string
  returnLocation: string
  driverAge: string
  additionalServices: string[]
  firstName: string
  lastName: string
  email: string
  phone: string
  drivingLicense: string
  specialRequests: string
}

export default function CarHireDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<RentalCar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('overview')

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    pickupDate: '',
    returnDate: '',
    pickupTime: '10:00',
    returnTime: '10:00',
    pickupLocation: '',
    returnLocation: '',
    driverAge: '',
    additionalServices: [],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    drivingLicense: '',
    specialRequests: ''
  })

  // Mock rental car data
  const mockRentalCar: RentalCar = {
    id: params.id,
    title: 'Toyota RAV4 2023',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2023,
    category: 'SUV',
    pricePerDay: 6500,
    pricePerWeek: 39000,
    pricePerMonth: 150000,
    image: '/api/placeholder/600/400',
    images: [
      '/api/placeholder/600/400',
      '/api/placeholder/600/401',
      '/api/placeholder/600/402',
      '/api/placeholder/600/403',
      '/api/placeholder/600/404'
    ],
    features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
    specifications: {
      seats: 7,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      airConditioning: true,
      gps: true,
      doors: 5,
      luggage: 3,
      engine: '2.5L 4-Cylinder'
    },
    location: 'Westlands, Nairobi',
    rating: 4.7,
    reviewCount: 89,
    availability: true,
    isPopular: false,
    isFeatured: true,
    rentalCompany: {
      id: 'rental-company-1',
      name: 'Premium Rentals Kenya',
      rating: 4.8,
      verified: true,
      phone: '+254 700 123 456',
      email: 'info@premiumrentals.co.ke',
      address: 'Westlands Square, Nairobi'
    },
    policies: {
      minimumAge: 23,
      drivingLicense: 'Valid driving license required (minimum 2 years)',
      deposit: 50000,
      fuelPolicy: 'Full to Full - Return with same fuel level',
      cancellation: 'Free cancellation up to 24 hours before pickup',
      insurance: 'Comprehensive insurance included'
    },
    includedFeatures: [
      'Comprehensive Insurance',
      'Unlimited Mileage',
      '24/7 Roadside Assistance',
      'GPS Navigation',
      'Air Conditioning',
      'Bluetooth Connectivity'
    ],
    additionalServices: [
      { name: 'Additional Driver', price: 1000, description: 'Add an extra authorized driver' },
      { name: 'Child Safety Seat', price: 500, description: 'Child car seat for safety' },
      { name: 'GPS Device', price: 300, description: 'Portable GPS navigation device' },
      { name: 'Mobile WiFi', price: 800, description: '4G mobile hotspot device' },
      { name: 'Delivery Service', price: 2000, description: 'Car delivered to your location' }
    ]
  }

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const locations = [
    'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Parklands',
    'JKIA Airport', 'Wilson Airport', 'Mombasa', 'Kisumu'
  ]

  useEffect(() => {
    // Simulate API call
    const fetchCarDetails = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCar(mockRentalCar)
      setBookingForm(prev => ({
        ...prev,
        pickupLocation: mockRentalCar.location,
        returnLocation: mockRentalCar.location
      }))
      setIsLoading(false)
    }

    fetchCarDetails()
  }, [params.id])

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

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`

  const calculateDays = () => {
    if (!bookingForm.pickupDate || !bookingForm.returnDate) return 1
    const pickup = new Date(bookingForm.pickupDate)
    const returnDate = new Date(bookingForm.returnDate)
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  const calculateTotalPrice = () => {
    if (!car) return 0
    const days = calculateDays()
    const basePrice = car.pricePerDay * days
    const servicesPrice = bookingForm.additionalServices.reduce((total, serviceId) => {
      const service = car.additionalServices.find(s => s.name === serviceId)
      return total + (service ? service.price * days : 0)
    }, 0)
    return basePrice + servicesPrice
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!bookingForm.pickupDate) errors.pickupDate = 'Pickup date is required'
    if (!bookingForm.returnDate) errors.returnDate = 'Return date is required'
    if (!bookingForm.pickupLocation) errors.pickupLocation = 'Pickup location is required'
    if (!bookingForm.firstName) errors.firstName = 'First name is required'
    if (!bookingForm.lastName) errors.lastName = 'Last name is required'
    if (!bookingForm.email) errors.email = 'Email is required'
    if (!bookingForm.phone) errors.phone = 'Phone number is required'
    if (!bookingForm.drivingLicense) errors.drivingLicense = 'Driving license number is required'
    if (!bookingForm.driverAge) errors.driverAge = 'Driver age is required'

    if (bookingForm.email && !/\S+@\S+\.\S+/.test(bookingForm.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (bookingForm.driverAge && parseInt(bookingForm.driverAge) < (car?.policies.minimumAge || 18)) {
      errors.driverAge = `Minimum age is ${car?.policies.minimumAge || 18} years`
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmittingBooking(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setBookingSubmitted(true)
    setIsSubmittingBooking(false)
    setShowBookingForm(false)
  }

  const handleInputChange = (field: keyof BookingForm, value: string | string[]) => {
    setBookingForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleServiceToggle = (serviceName: string) => {
    setBookingForm(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceName)
        ? prev.additionalServices.filter(s => s !== serviceName)
        : [...prev.additionalServices, serviceName]
    }))
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
          <p className="text-secondary-600 mb-6">The rental car you're looking for doesn't exist.</p>
          <Link
            href="/hire"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Rental Cars
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Booking Success Modal */}
      {bookingSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Booking Request Submitted!
              </h3>
              <p className="text-secondary-600 mb-6">
                We've received your booking request. Our team will contact you within 2 hours to confirm your reservation.
              </p>
              <button
                onClick={() => setBookingSubmitted(false)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-secondary-50">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-secondary-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            <Link href="/hire" className="hover:text-primary-600 transition-colors">
              Car Hire
            </Link>
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            <span className="text-secondary-900 font-medium truncate max-w-xs">
              {car.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mb-6">
                <div className="relative h-64 sm:h-80 lg:h-96">
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
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {car.images.length}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    {car.isFeatured && (
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                    {car.isPopular && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images */}
                {car.images.length > 1 && (
                  <div className="p-4 border-t border-secondary-200">
                    <div className="flex space-x-2 overflow-x-auto">
                      {car.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            index === currentImageIndex 
                              ? 'border-primary-600' 
                              : 'border-transparent hover:border-secondary-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${car.title} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Car Details */}
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                      {car.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-secondary-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{car.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{car.rating}</span>
                        <span>({car.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">
                      {formatPrice(car.pricePerDay)}
                    </div>
                    <div className="text-sm text-secondary-600">per day</div>
                  </div>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
                  <div className="text-center">
                    <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">{car.specifications.seats}</div>
                    <div className="text-xs text-secondary-600">Seats</div>
                  </div>
                  <div className="text-center">
                    <Settings className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">{car.specifications.transmission}</div>
                    <div className="text-xs text-secondary-600">Transmission</div>
                  </div>
                  <div className="text-center">
                    <Fuel className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">{car.specifications.fuelType}</div>
                    <div className="text-xs text-secondary-600">Fuel Type</div>
                  </div>
                  <div className="text-center">
                    <Car className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-secondary-900">{car.category}</div>
                    <div className="text-xs text-secondary-600">Category</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-secondary-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { id: 'features', name: 'Features' },
                      { id: 'policies', name: 'Policies' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-3">Vehicle Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Engine</span>
                          <span className="font-medium">{car.specifications.engine}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Doors</span>
                          <span className="font-medium">{car.specifications.doors}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Luggage</span>
                          <span className="font-medium">{car.specifications.luggage} Large Bags</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Air Conditioning</span>
                          <span className="font-medium">{car.specifications.airConditioning ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-3">Included Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {car.includedFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-secondary-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-3">Vehicle Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="w-5 h-5 text-primary-600" />
                            <span className="text-secondary-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Minimum Age</h4>
                            <p className="text-blue-700 text-sm">{car.policies.minimumAge} years old</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900 mb-1">Driving License</h4>
                            <p className="text-green-700 text-sm">{car.policies.drivingLicense}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-900 mb-1">Security Deposit</h4>
                            <p className="text-yellow-700 text-sm">{formatPrice(car.policies.deposit)} (refundable)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Fuel Policy</span>
                          <span className="font-medium text-right max-w-xs">{car.policies.fuelPolicy}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Cancellation</span>
                          <span className="font-medium text-right max-w-xs">{car.policies.cancellation}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-secondary-200">
                          <span className="text-secondary-600">Insurance</span>
                          <span className="font-medium text-right max-w-xs">{car.policies.insurance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Banner */}
              <AdBanner 
                slot="car-hire-detail"
                format="horizontal"
                className="w-full h-24 mb-6"
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 sm:p-6 sticky top-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Book This Car</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">
                        {formatPrice(car.pricePerDay)}
                      </div>
                      <div className="text-sm text-secondary-600">per day</div>
                    </div>
                    <div className="text-right text-sm text-secondary-600">
                      <div>{formatPrice(car.pricePerWeek)}/week</div>
                      <div>{formatPrice(car.pricePerMonth)}/month</div>
                    </div>
                  </div>
                </div>

                {/* Quick Booking Form */}
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={bookingForm.pickupDate}
                        onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={bookingForm.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        min={bookingForm.pickupDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {bookingForm.pickupDate && bookingForm.returnDate && (
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary-700">Duration:</span>
                        <span className="font-medium">{calculateDays()} day{calculateDays() > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-secondary-700">Total:</span>
                        <span className="font-bold text-primary-600">{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-3"
                >
                  Book Now
                </button>
                
                <div className="text-center">
                  <p className="text-xs text-secondary-500">
                    Free cancellation up to 24 hours before pickup
                  </p>
                </div>
              </div>

              {/* Rental Company Info */}
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Rental Company</h3>
                  <CompanyVerificationBadge 
                    userId={car.rentalCompany.id} 
                    showDetails={true}
                    size="medium"
                  />
                </div>
                
                <div className="text-sm text-secondary-600 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{car.rentalCompany.address}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`tel:${car.rentalCompany.phone}`}
                    className="flex-1 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${car.rentalCompany.email}`}
                    className="flex-1 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 sm:p-6">
                <ReviewSystem 
                  targetUserId={car.rentalCompany.id}
                  rentalListingId={car.id}
                  showAddReview={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-secondary-900">
                  Complete Your Booking
                </h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Rental Details */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Rental Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        value={bookingForm.pickupDate}
                        onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.pickupDate ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.pickupDate && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.pickupDate}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Return Date *
                      </label>
                      <input
                        type="date"
                        value={bookingForm.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        min={bookingForm.pickupDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.returnDate ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.returnDate && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.returnDate}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Pickup Time
                      </label>
                      <select
                        value={bookingForm.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Return Time
                      </label>
                      <select
                        value={bookingForm.returnTime}
                        onChange={(e) => handleInputChange('returnTime', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Pickup Location *
                      </label>
                      <select
                        value={bookingForm.pickupLocation}
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.pickupLocation ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      >
                        <option value="">Select Location</option>
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                      {formErrors.pickupLocation && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.pickupLocation}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Return Location
                      </label>
                      <select
                        value={bookingForm.returnLocation}
                        onChange={(e) => handleInputChange('returnLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Same as pickup</option>
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.firstName ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.firstName && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.firstName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.lastName ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.lastName && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.lastName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.email && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.phone ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.phone && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Driver Age *
                      </label>
                      <input
                        type="number"
                        value={bookingForm.driverAge}
                        onChange={(e) => handleInputChange('driverAge', e.target.value)}
                        min="18"
                        max="80"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.driverAge ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.driverAge && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.driverAge}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Driving License Number *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.drivingLicense}
                        onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.drivingLicense ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      />
                      {formErrors.drivingLicense && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.drivingLicense}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Additional Services</h4>
                  <div className="space-y-3">
                    {car.additionalServices.map((service) => (
                      <div key={service.name} className="flex items-start space-x-3 p-3 border border-secondary-200 rounded-lg">
                        <input
                          type="checkbox"
                          id={service.name}
                          checked={bookingForm.additionalServices.includes(service.name)}
                          onChange={() => handleServiceToggle(service.name)}
                          className="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <label htmlFor={service.name} className="block font-medium text-secondary-900 cursor-pointer">
                            {service.name}
                          </label>
                          <p className="text-sm text-secondary-600 mt-1">{service.description}</p>
                          <p className="text-sm font-medium text-primary-600 mt-1">
                            +{formatPrice(service.price)}/day
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Booking Summary */}
                {bookingForm.pickupDate && bookingForm.returnDate && (
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{calculateDays()} day{calculateDays() > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>{formatPrice(car.pricePerDay * calculateDays())}</span>
                      </div>
                      {bookingForm.additionalServices.length > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Services:</span>
                          <span>{formatPrice(bookingForm.additionalServices.reduce((total, serviceId) => {
                            const service = car.additionalServices.find(s => s.name === serviceId)
                            return total + (service ? service.price * calculateDays() : 0)
                          }, 0))}</span>
                        </div>
                      )}
                      <div className="border-t border-secondary-300 pt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-primary-600">{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg font-medium hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmittingBooking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Booking Request</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}