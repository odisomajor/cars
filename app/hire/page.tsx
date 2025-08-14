'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Car, 
  Filter,
  Star,
  Shield,
  Clock,
  Fuel,
  Settings,
  ChevronRight,
  Heart,
  Eye
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdBanner from '@/components/ads/AdBanner'
import RentalSearchTest from '@/components/test/RentalSearchTest'

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
  }
  location: string
  rating: number
  reviewCount: number
  availability: boolean
  isPopular: boolean
  isFeatured: boolean
  rentalCompany: {
    name: string
    rating: number
    verified: boolean
  }
}

interface SearchFilters {
  location: string
  pickupDate: string
  returnDate: string
  category: string
  priceRange: [number, number]
  seats: string
  transmission: string
  fuelType: string
}

export default function CarHirePage() {
  const [rentalCars, setRentalCars] = useState<RentalCar[]>([])
  const [filteredCars, setFilteredCars] = useState<RentalCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const carsPerPage = 12

  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    pickupDate: '',
    returnDate: '',
    category: '',
    priceRange: [0, 20000],
    seats: '',
    transmission: '',
    fuelType: ''
  })

  // Mock rental car data
  const mockRentalCars: RentalCar[] = [
    {
      id: '1',
      title: 'Toyota Corolla 2023',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      category: 'Economy',
      pricePerDay: 3500,
      pricePerWeek: 21000,
      pricePerMonth: 80000,
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/301'],
      features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Fuel Efficient'],
      specifications: {
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        airConditioning: true,
        gps: true
      },
      location: 'Nairobi CBD',
      rating: 4.5,
      reviewCount: 128,
      availability: true,
      isPopular: true,
      isFeatured: false,
      rentalCompany: {
        name: 'Kenya Car Rentals',
        rating: 4.6,
        verified: true
      }
    },
    {
      id: '2',
      title: 'Toyota RAV4 2023',
      brand: 'Toyota',
      model: 'RAV4',
      year: 2023,
      category: 'SUV',
      pricePerDay: 6500,
      pricePerWeek: 39000,
      pricePerMonth: 150000,
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/301'],
      features: ['4WD', 'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera'],
      specifications: {
        seats: 7,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        airConditioning: true,
        gps: true
      },
      location: 'Westlands',
      rating: 4.7,
      reviewCount: 89,
      availability: true,
      isPopular: false,
      isFeatured: true,
      rentalCompany: {
        name: 'Premium Rentals',
        rating: 4.8,
        verified: true
      }
    },
    {
      id: '3',
      title: 'Nissan X-Trail 2022',
      brand: 'Nissan',
      model: 'X-Trail',
      year: 2022,
      category: 'SUV',
      pricePerDay: 5800,
      pricePerWeek: 35000,
      pricePerMonth: 135000,
      image: '/api/placeholder/400/300',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/301'],
      features: ['All-Wheel Drive', 'Panoramic Sunroof', 'Heated Seats', 'Premium Sound'],
      specifications: {
        seats: 7,
        transmission: 'CVT',
        fuelType: 'Petrol',
        airConditioning: true,
        gps: true
      },
      location: 'Karen',
      rating: 4.4,
      reviewCount: 67,
      availability: true,
      isPopular: true,
      isFeatured: false,
      rentalCompany: {
        name: 'Elite Car Hire',
        rating: 4.5,
        verified: true
      }
    }
  ]

  const categories = [
    { name: 'All Categories', value: '' },
    { name: 'Economy', value: 'Economy' },
    { name: 'Compact', value: 'Compact' },
    { name: 'SUV', value: 'SUV' },
    { name: 'Luxury', value: 'Luxury' },
    { name: 'Van', value: 'Van' }
  ]

  const locations = [
    'Nairobi CBD', 'Westlands', 'Karen', 'Kilimani', 'Parklands',
    'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'
  ]

  useEffect(() => {
    // Simulate API call
    const fetchRentalCars = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRentalCars(mockRentalCars)
      setFilteredCars(mockRentalCars)
      setIsLoading(false)
    }

    fetchRentalCars()
  }, [])

  useEffect(() => {
    let filtered = rentalCars

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.category) {
      filtered = filtered.filter(car => car.category === filters.category)
    }

    if (filters.seats) {
      filtered = filtered.filter(car => car.specifications.seats >= parseInt(filters.seats))
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => car.specifications.transmission === filters.transmission)
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.specifications.fuelType === filters.fuelType)
    }

    // Price range filter
    filtered = filtered.filter(car => 
      car.pricePerDay >= filters.priceRange[0] && car.pricePerDay <= filters.priceRange[1]
    )

    setFilteredCars(filtered)
    setCurrentPage(1)
  }, [filters, rentalCars])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFavoriteToggle = (carId: string) => {
    setFavorites(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    )
  }

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`

  const calculateDays = () => {
    if (!filters.pickupDate || !filters.returnDate) return 1
    const pickup = new Date(filters.pickupDate)
    const returnDate = new Date(filters.returnDate)
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / carsPerPage)
  const startIndex = (currentPage - 1) * carsPerPage
  const paginatedCars = filteredCars.slice(startIndex, startIndex + carsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading rental cars..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Rent Your Perfect Car
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Choose from our wide selection of quality rental cars. 
              Perfect for business trips, vacations, or daily commutes.
            </p>
          </div>

          {/* Search Parameters Test */}
          <RentalSearchTest />

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Pickup Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    type="date"
                    value={filters.pickupDate}
                    onChange={(e) => handleFilterChange('pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                    type="date"
                    value={filters.returnDate}
                    onChange={(e) => handleFilterChange('returnDate', e.target.value)}
                    min={filters.pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Cars</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-secondary-600 mb-6">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-secondary-400" />
          <span className="text-secondary-900 font-medium">Car Hire</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Seats Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Minimum Seats
                  </label>
                  <select
                    value={filters.seats}
                    onChange={(e) => handleFilterChange('seats', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="2">2+ Seats</option>
                    <option value="4">4+ Seats</option>
                    <option value="5">5+ Seats</option>
                    <option value="7">7+ Seats</option>
                  </select>
                </div>

                {/* Transmission Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Transmission
                  </label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Fuel Type
                  </label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Daily Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-secondary-600">
                      <span>KSh 0</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Available Rental Cars
                </h2>
                <p className="text-secondary-600 mt-1">
                  {filteredCars.length} cars found
                  {filters.pickupDate && filters.returnDate && (
                    <span> • {calculateDays()} day{calculateDays() > 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Ad Banner */}
            <div className="mb-6">
              <AdBanner 
                slot="car-hire-top"
                format="horizontal"
                className="w-full h-24"
              />
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedCars.map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Car Image */}
                  <div className="relative h-48">
                    <Image
                      src={car.image}
                      alt={car.title}
                      fill
                      className="object-cover"
                    />
                    {car.isFeatured && (
                      <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                    {car.isPopular && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Popular
                      </div>
                    )}
                    <button
                      onClick={() => handleFavoriteToggle(car.id)}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${
                        favorites.includes(car.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-secondary-600'
                      }`} />
                    </button>
                  </div>

                  {/* Car Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 truncate">
                        {car.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-secondary-700">{car.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-secondary-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{car.location}</span>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="flex items-center text-secondary-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{car.specifications.seats} seats</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <Settings className="w-4 h-4 mr-1" />
                        <span>{car.specifications.transmission}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <Fuel className="w-4 h-4 mr-1" />
                        <span>{car.specifications.fuelType}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span>{car.rentalCompany.verified ? 'Verified' : 'Unverified'}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-secondary-200 pt-3">
                      <div className="flex items-center justify-between mb-2">
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

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          href={`/hire/${car.id}`}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors"
                        >
                          Book Now
                        </Link>
                        <Link
                          href={`/hire/${car.id}`}
                          className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                          <Eye className="w-5 h-5 text-secondary-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Bottom Ad Banner */}
            <div className="mt-12">
              <AdBanner 
                slot="car-hire-bottom"
                format="horizontal"
                className="w-full h-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}