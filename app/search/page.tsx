'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, X, MapPin, Calendar, Gauge, Fuel, Settings, Star, Eye, Heart } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatNumber } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  pricePerDay?: number
  mileage: number
  location: string
  bodyType: string
  fuelType: string
  transmission: string
  condition?: string
  images: string[]
  views: number
  listingType: string
  type?: 'sale' | 'rental'
  user: {
    id: string
    name: string
    image?: string
    profile?: {
      isVerified: boolean
      isCompanyVerified: boolean
    }
  }
}

interface SearchFacets {
  makes: { value: string; count: number }[]
  bodyTypes: { value: string; count: number }[]
  fuelTypes: { value: string; count: number }[]
  transmissions: { value: string; count: number }[]
  conditions: { value: string; count: number }[]
  priceRange: { min: number; max: number; avg: number }
}

interface SearchFilters {
  q: string
  make: string
  model: string
  minPrice: number
  maxPrice: number
  minYear: number
  maxYear: number
  minMileage: number
  maxMileage: number
  location: string
  bodyType: string[]
  fuelType: string[]
  transmission: string[]
  condition: string[]
  features: string[]
  listingType: string[]
  sortBy: string
  sortOrder: string
  includeRentals: boolean
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price', label: 'Price' },
  { value: 'year', label: 'Year' },
  { value: 'mileage', label: 'Mileage' },
  { value: 'createdAt', label: 'Date Listed' },
  { value: 'views', label: 'Most Viewed' }
]

const LISTING_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'featured', label: 'Featured' },
  { value: 'premium', label: 'Premium' }
]

const COMMON_FEATURES = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'ABS Brakes',
  'Airbags', 'Bluetooth', 'GPS Navigation', 'Backup Camera', 'Sunroof',
  'Leather Seats', 'Heated Seats', 'Cruise Control', 'Keyless Entry'
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [facets, setFacets] = useState<SearchFacets | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTime, setSearchTime] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000000'),
    minYear: parseInt(searchParams.get('minYear') || '1990'),
    maxYear: parseInt(searchParams.get('maxYear') || new Date().getFullYear().toString()),
    minMileage: parseInt(searchParams.get('minMileage') || '0'),
    maxMileage: parseInt(searchParams.get('maxMileage') || '500000'),
    location: searchParams.get('location') || '',
    bodyType: searchParams.get('bodyType')?.split(',').filter(Boolean) || [],
    fuelType: searchParams.get('fuelType')?.split(',').filter(Boolean) || [],
    transmission: searchParams.get('transmission')?.split(',').filter(Boolean) || [],
    condition: searchParams.get('condition')?.split(',').filter(Boolean) || [],
    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
    listingType: searchParams.get('listingType')?.split(',').filter(Boolean) || [],
    sortBy: searchParams.get('sortBy') || 'relevance',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    includeRentals: searchParams.get('includeRentals') === 'true'
  })

  const performSearch = useCallback(async (page = 1) => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','))
            }
          } else {
            params.set(key, value.toString())
          }
        }
      })
      
      params.set('page', page.toString())
      params.set('limit', '12')
      
      const response = await fetch(`/api/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      setResults(data.results)
      setFacets(data.facets)
      setTotalResults(data.searchInfo.totalResults)
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.pages)
      setSearchTime(data.searchInfo.searchTime)
      
      // Update URL
      const newUrl = `/search?${params.toString()}`
      router.push(newUrl, { scroll: false })
      
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters, router])

  useEffect(() => {
    performSearch(1)
  }, [performSearch])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const clearFilters = () => {
    setFilters({
      q: '',
      make: '',
      model: '',
      minPrice: 0,
      maxPrice: 10000000,
      minYear: 1990,
      maxYear: new Date().getFullYear(),
      minMileage: 0,
      maxMileage: 500000,
      location: '',
      bodyType: [],
      fuelType: [],
      transmission: [],
      condition: [],
      features: [],
      listingType: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeRentals: false
    })
  }

  const getAppliedFiltersCount = () => {
    let count = 0
    if (filters.q) count++
    if (filters.make) count++
    if (filters.model) count++
    if (filters.location) count++
    if (filters.minPrice > 0) count++
    if (filters.maxPrice < 10000000) count++
    if (filters.minYear > 1990) count++
    if (filters.maxYear < new Date().getFullYear()) count++
    if (filters.bodyType.length) count++
    if (filters.fuelType.length) count++
    if (filters.transmission.length) count++
    if (filters.condition.length) count++
    if (filters.features.length) count++
    if (filters.listingType.length) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for cars, makes, models..."
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch(1)}
                className="pl-10 h-12"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getAppliedFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getAppliedFiltersCount()}
                  </Badge>
                )}
              </Button>
              
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => performSearch(1)}
                className="h-12 px-6"
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Search Info */}
          {!loading && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                {totalResults.toLocaleString()} results found
                {filters.q && ` for "${filters.q}"`}
                <span className="ml-2">({searchTime}ms)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="include-rentals" className="text-sm">
                  Include Rentals
                </Label>
                <Checkbox
                  id="include-rentals"
                  checked={filters.includeRentals}
                  onCheckedChange={(checked) => updateFilter('includeRentals', checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Location */}
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter city or area"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => {
                          updateFilter('minPrice', min)
                          updateFilter('maxPrice', max)
                        }}
                        max={facets?.priceRange.max || 10000000}
                        min={facets?.priceRange.min || 0}
                        step={1000}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(filters.minPrice)}</span>
                      <span>{formatPrice(filters.maxPrice)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Year Range */}
                  <div className="space-y-2">
                    <Label>Year Range</Label>
                    <div className="px-2">
                      <Slider
                        value={[filters.minYear, filters.maxYear]}
                        onValueChange={([min, max]) => {
                          updateFilter('minYear', min)
                          updateFilter('maxYear', max)
                        }}
                        max={new Date().getFullYear()}
                        min={1990}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.minYear}</span>
                      <span>{filters.maxYear}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Makes */}
                  {facets?.makes && facets.makes.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label>Make</Label>
                        <Select value={filters.make} onValueChange={(value) => updateFilter('make', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Makes</SelectItem>
                            {facets.makes.map(make => (
                              <SelectItem key={make.value} value={make.value}>
                                {make.value} ({make.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator className="my-4" />
                    </>
                  )}
                  
                  {/* Body Types */}
                  {facets?.bodyTypes && facets.bodyTypes.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {facets.bodyTypes.map(bodyType => (
                            <div key={bodyType.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`bodyType-${bodyType.value}`}
                                checked={filters.bodyType.includes(bodyType.value)}
                                onCheckedChange={() => toggleArrayFilter('bodyType', bodyType.value)}
                              />
                              <Label htmlFor={`bodyType-${bodyType.value}`} className="text-sm">
                                {bodyType.value} ({bodyType.count})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </>
                  )}
                  
                  {/* Fuel Types */}
                  {facets?.fuelTypes && facets.fuelTypes.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label>Fuel Type</Label>
                        <div className="space-y-2">
                          {facets.fuelTypes.map(fuelType => (
                            <div key={fuelType.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`fuelType-${fuelType.value}`}
                                checked={filters.fuelType.includes(fuelType.value)}
                                onCheckedChange={() => toggleArrayFilter('fuelType', fuelType.value)}
                              />
                              <Label htmlFor={`fuelType-${fuelType.value}`} className="text-sm">
                                {fuelType.value} ({fuelType.count})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </>
                  )}
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {COMMON_FEATURES.map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={filters.features.includes(feature)}
                            onCheckedChange={() => toggleArrayFilter('features', feature)}
                          />
                          <Label htmlFor={`feature-${feature}`} className="text-sm">
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {results.map((result) => (
                    <Card key={result.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative h-48">
                          <Image
                            src={result.images[0] || '/placeholder-car.jpg'}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            {result.type === 'rental' && (
                              <Badge variant="secondary">Rental</Badge>
                            )}
                            {result.listingType === 'featured' && (
                              <Badge className="bg-yellow-500">Featured</Badge>
                            )}
                            {result.listingType === 'premium' && (
                              <Badge className="bg-purple-500">Premium</Badge>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            <Eye className="h-3 w-3 inline mr-1" />
                            {formatNumber(result.views)}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg leading-tight">
                              {result.year} {result.make} {result.model}
                            </h3>
                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600">
                                {result.type === 'rental' 
                                  ? `${formatPrice(result.pricePerDay!)}/day`
                                  : formatPrice(result.price)
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Gauge className="h-4 w-4" />
                                {formatNumber(result.mileage)} km
                              </div>
                              <div className="flex items-center gap-1">
                                <Fuel className="h-4 w-4" />
                                {result.fuelType}
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings className="h-4 w-4" />
                                {result.transmission}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {result.location}
                            </div>
                          </div>
                          
                          {/* Seller Info */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                {result.user.image ? (
                                  <Image
                                    src={result.user.image}
                                    alt={result.user.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <span className="text-xs font-medium">
                                    {result.user.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{result.user.name}</div>
                                {result.user.profile?.isVerified && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-600">Verified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Link href={`/${result.type === 'rental' ? 'rental-listings' : 'listings'}/${result.id}`}>
                              <Button size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => performSearch(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2)
                      if (page > totalPages) return null
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          onClick={() => performSearch(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => performSearch(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}