'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Clock, TrendingUp, MapPin, Car, Settings, Fuel } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { debounce } from 'lodash'

interface SearchSuggestion {
  value: string
  type: 'make' | 'model' | 'location' | 'feature'
  category: string
  count?: number
  make?: string
  model?: string
}

interface SearchSuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
  className?: string
  type?: 'all' | 'makes' | 'models' | 'locations' | 'features'
}

const RECENT_SEARCHES_KEY = 'recent_car_searches'
const MAX_RECENT_SEARCHES = 5

export function SearchSuggestions({ 
  query, 
  onSelect, 
  className,
  type = 'all'
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Debounced API call for suggestions
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string, searchType: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([])
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          type: searchType,
          limit: '8'
        })

        const response = await fetch(`/api/search/suggestions?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    if (query.trim() && query.length >= 2) {
      setLoading(true)
      fetchSuggestions(query, type)
    } else {
      setSuggestions([])
      setLoading(false)
    }
  }, [query, type, fetchSuggestions])

  const handleSelect = useCallback((suggestion: string) => {
    // Add to recent searches
    const updatedRecent = [suggestion, ...recentSearches.filter(s => s !== suggestion)]
      .slice(0, MAX_RECENT_SEARCHES)
    
    setRecentSearches(updatedRecent)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecent))
    
    // Track suggestion usage
    fetch('/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestion,
        query,
        userId: null // Add user ID if available
      })
    }).catch(console.error)
    
    onSelect(suggestion)
  }, [query, onSelect, recentSearches])

  const getIcon = (suggestionType: string) => {
    switch (suggestionType) {
      case 'make':
        return <Car className="h-4 w-4 text-blue-500" />
      case 'model':
        return <Car className="h-4 w-4 text-purple-500" />
      case 'location':
        return <MapPin className="h-4 w-4 text-green-500" />
      case 'feature':
        return <Settings className="h-4 w-4 text-orange-500" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeColor = (suggestionType: string) => {
    switch (suggestionType) {
      case 'make':
        return 'bg-blue-100 text-blue-800'
      case 'model':
        return 'bg-purple-100 text-purple-800'
      case 'location':
        return 'bg-green-100 text-green-800'
      case 'feature':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const showRecentSearches = !query.trim() && recentSearches.length > 0
  const showSuggestions = query.trim() && (suggestions.length > 0 || loading)

  if (!showRecentSearches && !showSuggestions) {
    return null
  }

  return (
    <Card className={`absolute top-full left-0 right-0 mt-1 z-50 shadow-lg ${className}`}>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <Search className="h-5 w-5 animate-spin mx-auto mb-2" />
            <span className="text-sm">Searching...</span>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {/* Recent Searches */}
            {showRecentSearches && (
              <>
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                  </div>
                </div>
                {recentSearches.map((search, index) => (
                  <Button
                    key={`recent-${index}`}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelect(search)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-left font-medium">{search}</span>
                    </div>
                  </Button>
                ))}
              </>
            )}
            
            {/* API Suggestions */}
            {showSuggestions && (
              <>
                {suggestions.length === 0 && !loading && (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="h-5 w-5 mx-auto mb-2 text-gray-300" />
                    <span className="text-sm">No suggestions found</span>
                  </div>
                )}
                
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={`suggestion-${index}`}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelect(suggestion.value)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getIcon(suggestion.type)}
                      <div className="flex-1 text-left">
                        <div className="font-medium">
                          {suggestion.value}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getTypeColor(suggestion.type)}`}
                          >
                            {suggestion.category}
                          </Badge>
                          {suggestion.count && (
                            <span className="text-xs text-gray-500">
                              {suggestion.count.toLocaleString()} listings
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        <Search className="h-3 w-3" />
                      </div>
                    </div>
                  </Button>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}