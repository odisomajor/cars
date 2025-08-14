'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Map,
  ChevronDown, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Heart,
  Star,
  BarChart3
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdBanner from '@/components/ads/AdBanner'
import { CarCard } from '@/components/cars/CarCard'
import { FilterSidebar } from '@/components/cars/FilterSidebar'
import ComparisonModal from '@/components/cars/ComparisonModal'
import MapView from '@/components/cars/MapView'
import SavedSearches from '@/components/cars/SavedSearches'

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
  condition: 'New' | 'Used' | 'Certified Pre-owned'
}

interface FilterOptions {
  priceRange: [number, number]
  yearRange: [number, number]
  mileageRange: [number, number]
  makes: string[]
  models: string[]
  bodyTypes: string[]
  fuelTypes: string[]
  transmissions: string[]
  conditions: string[]
  locations: string[]
  features: string[]
}

type ViewMode = 'grid' | 'list' | 'map'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'mileage-low' | 'year-new'

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [comparisonCars, setComparisonCars] = useState<Car[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedMapCar, setSelectedMapCar] = useState<Car | null>(null)
  
  const carsPerPage = 12

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000000],
    yearRange: [1990, new Date().getFullYear()],
    mileageRange: [0, 500000],
    makes: [],
    models: [],
    bodyTypes: [],
    fuelTypes: [],
    transmissions: [],
    conditions: [],
    locations: [],
    features: []
  })

  // Mock data - replace with actual API call
  const mockCars: Car[] = Array.from({ length: 24 }, (_, i) => ({
    id: `${i + 1}`,
    title: `${['2022 Toyota Camry Hybrid LE', '2023 Honda CR-V EX-L', '2021 BMW X3 xDrive30i', '2022 Nissan X-Trail Tekna', '2023 Mazda CX-5 Touring'][i % 5]}`,
    price: [4500000, 5200000, 7800000, 4200000, 4800000][i % 5] + (i * 50000),
    originalPrice: i % 3 === 0 ? [4800000, 5500000, 8200000, 4500000, 5100000][i % 5] + (i * 50000) : undefined,
    location: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'][i % 5],
    year: 2020 + (i % 4),
    mileage: `${15000 + (i * 2000)} km`,
    fuelType: ['Hybrid', 'Petrol', 'Diesel', 'Electric'][i % 4],
    transmission: ['Automatic', 'CVT', 'Manual'][i % 3],
    bodyType: ['Sedan', 'SUV', 'Hatchback', 'Coupe'][i % 4],
    make: ['Toyota', 'Honda', 'BMW', 'Nissan', 'Mazda'][i % 5],
    model: ['Camry', 'CR-V', 'X3', 'X-Trail', 'CX-5'][i % 5],
    image: '/api/placeholder/400/300',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    isFeatured: i % 4 === 0,
    isNew: i % 6 === 0,
    dealer: {
      name: ['Toyota Kenya', 'Honda Center', 'BMW Kenya', 'Nissan Kenya', 'Mazda Kenya'][i % 5],
      rating: 4.2 + (i % 8) * 0.1,
      verified: i % 3 === 0
    },
    description: 'Well maintained vehicle with excellent performance and reliability.',
    features: ['Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera'],
    dateAdded: new Date(2024, 0, 15 - i).toISOString().split('T')[0],
    views: 1000 + (i * 50),
    condition: ['New', 'Used', 'Certified Pre-owned'][i % 3] as 'New' | 'Used' | 'Certified Pre-owned'
  }))

  const handleFavoriteToggle = (carId: string) => {
    setFavorites(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    )
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      yearRange: [1990, new Date().getFullYear()],
      mileageRange: [0, 500000],
      makes: [],
      models: [],
      bodyTypes: [],
      fuelTypes: [],
      transmissions: [],
      conditions: [],
      locations: [],
      features: []
    })
    setCurrentPage(1)
  }

  const handleToggleCompare = (car: Car) => {
    setComparisonCars(prev => {
      const isAlreadyInComparison = prev.some(c => c.id === car.id)
      if (isAlreadyInComparison) {
        return prev.filter(c => c.id !== car.id)
      } else if (prev.length < 3) {
        return [...prev, car]
      } else {
        // Replace the first car if we're at the limit
        return [prev[1], prev[2], car]
      }
    })
  }

  const handleRemoveFromComparison = (carId: string) => {
    setComparisonCars(prev => prev.filter(c => c.id !== carId))
  }

  const handleOpenComparison = () => {
    setShowComparison(true)
  }

  const handleMapCarSelect = (car: Car) => {
    setSelectedMapCar(car)
  }

  // Filter cars based on current filters
  const filteredCarsList = useMemo(() => mockCars.filter(car => {
    // Price filter
    if (car.price < filters.priceRange[0] || car.price > filters.priceRange[1]) {
      return false
    }
    
    // Year filter
    if (car.year < filters.yearRange[0] || car.year > filters.yearRange[1]) {
      return false
    }
    
    // Mileage filter (convert km string to number)
    const carMileage = parseInt(car.mileage.replace(/[^\d]/g, ''))
    if (carMileage < filters.mileageRange[0] || carMileage > filters.mileageRange[1]) {
      return false
    }
    
    // Make filter
    if (filters.makes.length > 0 && !filters.makes.includes(car.make)) {
      return false
    }
    
    // Body type filter
    if (filters.bodyTypes.length > 0 && !filters.bodyTypes.includes(car.bodyType)) {
      return false
    }
    
    // Fuel type filter
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(car.fuelType)) {
      return false
    }
    
    // Transmission filter
    if (filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) {
      return false
    }
    
    // Condition filter
    if (filters.conditions.length > 0 && !filters.conditions.includes(car.condition)) {
      return false
    }
    
    // Location filter
    if (filters.locations.length > 0 && !filters.locations.includes(car.location)) {
      return false
    }
    
    return true
  }), [filters])

  // Sort cars
  const sortedCars = useMemo(() => [...filteredCarsList].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'year-new':
        return b.year - a.year
      case 'year-old':
        return a.year - b.year
      case 'mileage-low':
        return parseInt(a.mileage.replace(/[^\d]/g, '')) - parseInt(b.mileage.replace(/[^\d]/g, ''))
      case 'mileage-high':
        return parseInt(b.mileage.replace(/[^\d]/g, '')) - parseInt(a.mileage.replace(/[^\d]/g, ''))
      case 'newest':
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
  }), [filteredCarsList, sortBy])

  // Paginate cars
  const totalPages = Math.ceil(sortedCars.length / carsPerPage)
  const paginatedCars = sortedCars.slice(
    (currentPage - 1) * carsPerPage,
    currentPage * carsPerPage
  )

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [filters, sortBy, currentPage])

  const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Nissan', 'Mazda', 'Subaru']
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van']
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
  const transmissions = ['Manual', 'Automatic', 'CVT']

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header Section */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                Cars for Sale in Kenya
              </h1>
              <p className="text-secondary-600">
                {sortedCars.length} cars found
              </p>
            </div>
            
            {/* View Toggle and Sort */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="mileage-low">Lowest Mileage</option>
                  <option value="year-new">Newest Year</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  title="Map View"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* Comparison Toggle */}
              {comparisonCars.length > 0 && (
                <button
                  onClick={handleOpenComparison}
                  className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors relative"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Compare</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {comparisonCars.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 space-y-6">
              <SavedSearches
                currentFilters={filters}
                onLoadSearch={handleFiltersChange}
                className="sticky top-6"
              />
              
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
              
              <AdBanner 
                slot="car-listings-sidebar"
                format="vertical"
                className="sticky top-6"
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Ad Banner */}
            <div className="mb-6">
              <AdBanner 
                slot="car-listings-top"
                format="horizontal"
                className="w-full h-24"
              />
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size="lg" text="Loading cars..." />
              </div>
            ) : (
              <>
                {/* Cars Grid/List/Map */}
                {viewMode === 'map' ? (
                  <div className="h-[600px] rounded-lg overflow-hidden border border-secondary-200">
                    <MapView
                      cars={filteredCarsList.map(car => ({
                        ...car,
                        coordinates: { lat: -1.2921, lng: 36.8219 } // Will be set based on location in MapView
                      }))}
                      onCarSelect={handleMapCarSelect}
                      selectedCarId={selectedMapCar?.id}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-6'
                  }`}>
                    {paginatedCars.map((car) => (
                      <CarCard 
                        key={car.id} 
                        car={car} 
                        viewMode={viewMode}
                        isFavorite={favorites.includes(car.id)}
                        onToggleFavorite={() => handleFavoriteToggle(car.id)}
                        isInComparison={comparisonCars.some(c => c.id === car.id)}
                        onToggleCompare={() => handleToggleCompare(car)}
                        formatPrice={(price: number) => `KSh ${price.toLocaleString()}`}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination - Hide in map view */}
                {viewMode !== 'map' && totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        cars={comparisonCars}
        onRemoveCar={handleRemoveFromComparison}
      />
    </div>
  )
}