'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Calendar, Fuel, Settings, Eye, Heart, Share2, Star, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import Image from 'next/image'
import { debounce } from 'lodash'

interface SearchResult {
  id: string
  title: string
  price: number
  year: number
  mileage: number
  fuelType: string
  transmission: string
  location: string
  images: string[]
  seller: {
    name: string
    rating: number
    verified: boolean
  }
  featured: boolean
  condition: string
  bodyType: string
  listingType: 'sale' | 'rental'
  createdAt: string
}

interface SearchResultsPreviewProps {
  query: string
  maxResults?: number
  onViewAll?: () => void
  filters?: any
  showTrending?: boolean
}

export function SearchResultsPreview({ 
  query, 
  maxResults = 6, 
  onViewAll,
  filters,
  showTrending = false
}: SearchResultsPreviewProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters?: any) => {
      if (!searchQuery.trim()) {
        setResults([])
        setTotalResults(0)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: maxResults.toString(),
          ...searchFilters
        })

        const response = await fetch(`/api/search?${params}`)
        
        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setResults(data.results || [])
        setTotalResults(data.total || 0)
      } catch (error) {
        console.error('Search error:', error)
        setError('Failed to search. Please try again.')
        setResults([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }, 300),
    [maxResults]
  )

  useEffect(() => {
    debouncedSearch(query, filters)
  }, [query, filters, debouncedSearch])

  // Fetch trending searches
  useEffect(() => {
    if (showTrending && !query.trim()) {
      fetchTrendingSearches()
    }
  }, [showTrending, query])

  const fetchTrendingSearches = async () => {
    try {
      const response = await fetch('/api/search/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingSearches(data.trending || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending searches:', error)
    }
  }

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `KES ${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `KES ${(price / 1000).toFixed(0)}K`
    }
    return `KES ${price.toLocaleString()}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  // Show trending searches when no query
  if (!query.trim() && showTrending && trendingSearches.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Trending Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((trend, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-blue-100 hover:text-blue-800"
              onClick={() => onViewAll && onViewAll()}
            >
              {trend}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  if (!query.trim()) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">
            Search Results for "{query}"
          </h3>
          {totalResults > 0 && (
            <Badge variant="secondary">
              {totalResults.toLocaleString()} found
            </Badge>
          )}
        </div>
        
        {totalResults > maxResults && onViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            View All ({totalResults.toLocaleString()})
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: maxResults }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">{error}</div>
          <Button 
            variant="outline" 
            onClick={() => debouncedSearch(query, filters)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((car) => (
            <Card key={car.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="relative">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={car.images[0] || '/api/placeholder/400/300'}
                    alt={car.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {car.featured && (
                      <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                        Featured
                      </Badge>
                    )}
                    {car.listingType === 'rental' && (
                      <Badge className="bg-green-500 text-white text-xs">
                        For Rent
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {car.condition}
                    </Badge>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Time ago */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(car.createdAt)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {car.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(car.price)}
                          {car.listingType === 'rental' && <span className="text-sm font-normal text-gray-500">/day</span>}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {car.bodyType}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{car.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{car.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4" />
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span>{car.mileage.toLocaleString()} km</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {car.seller.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-20">{car.seller.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{car.seller.rating}</span>
                            {car.seller.verified && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
                                ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Link href={`/${car.listingType === 'rental' ? 'rental-listings' : 'cars'}/${car.id}`}>
                        <Button size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && query.trim() && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No results found for "{query}"
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or browse our categories
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => onViewAll && onViewAll()}>
              Browse All Cars
            </Button>
            <Button variant="outline">
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}