'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Clock, TrendingUp } from 'lucide-react'

interface SearchSuggestionsProps {
  query: string
  activeField: 'make' | 'location' | null
  onSelect: (suggestion: string, field: 'make' | 'location') => void
  isVisible: boolean
}

interface Suggestion {
  id: string
  text: string
  type: 'make' | 'model' | 'location' | 'recent' | 'trending'
  category?: string
}

export function SearchSuggestions({ query, activeField, onSelect, isVisible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for suggestions
  const mockSuggestions = {
    makes: [
      { id: '1', text: 'Toyota', type: 'make' as const },
      { id: '2', text: 'Honda', type: 'make' as const },
      { id: '3', text: 'BMW', type: 'make' as const },
      { id: '4', text: 'Mercedes-Benz', type: 'make' as const },
      { id: '5', text: 'Nissan', type: 'make' as const },
      { id: '6', text: 'Mazda', type: 'make' as const },
      { id: '7', text: 'Subaru', type: 'make' as const },
      { id: '8', text: 'Volkswagen', type: 'make' as const },
      { id: '9', text: 'Audi', type: 'make' as const },
      { id: '10', text: 'Hyundai', type: 'make' as const },
    ],
    models: [
      { id: '11', text: 'Camry', type: 'model' as const, category: 'Toyota' },
      { id: '12', text: 'Corolla', type: 'model' as const, category: 'Toyota' },
      { id: '13', text: 'CR-V', type: 'model' as const, category: 'Honda' },
      { id: '14', text: 'Civic', type: 'model' as const, category: 'Honda' },
      { id: '15', text: 'X3', type: 'model' as const, category: 'BMW' },
      { id: '16', text: 'X5', type: 'model' as const, category: 'BMW' },
    ],
    locations: [
      { id: '21', text: 'Nairobi', type: 'location' as const },
      { id: '22', text: 'Mombasa', type: 'location' as const },
      { id: '23', text: 'Kisumu', type: 'location' as const },
      { id: '24', text: 'Nakuru', type: 'location' as const },
      { id: '25', text: 'Eldoret', type: 'location' as const },
      { id: '26', text: 'Thika', type: 'location' as const },
      { id: '27', text: 'Meru', type: 'location' as const },
      { id: '28', text: 'Nyeri', type: 'location' as const },
    ],
    recent: [
      { id: '31', text: 'Toyota Camry Nairobi', type: 'recent' as const },
      { id: '32', text: 'Honda CR-V Mombasa', type: 'recent' as const },
      { id: '33', text: 'BMW X3 Kisumu', type: 'recent' as const },
    ],
    trending: [
      { id: '41', text: 'Toyota Prado', type: 'trending' as const },
      { id: '42', text: 'Honda Vezel', type: 'trending' as const },
      { id: '43', text: 'Nissan X-Trail', type: 'trending' as const },
    ]
  }

  useEffect(() => {
    if (!isVisible || !query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    // Simulate API delay
    const timer = setTimeout(() => {
      let filteredSuggestions: Suggestion[] = []

      if (activeField === 'make') {
        // Filter makes and models
        const makes = mockSuggestions.makes.filter(item =>
          item.text.toLowerCase().includes(query.toLowerCase())
        )
        const models = mockSuggestions.models.filter(item =>
          item.text.toLowerCase().includes(query.toLowerCase())
        )
        filteredSuggestions = [...makes, ...models]
      } else if (activeField === 'location') {
        // Filter locations
        filteredSuggestions = mockSuggestions.locations.filter(item =>
          item.text.toLowerCase().includes(query.toLowerCase())
        )
      }

      // Add recent searches if query is short
      if (query.length <= 2) {
        filteredSuggestions = [
          ...mockSuggestions.recent.slice(0, 3),
          ...filteredSuggestions.slice(0, 5)
        ]
      }

      // Add trending if no specific matches
      if (filteredSuggestions.length === 0) {
        filteredSuggestions = mockSuggestions.trending.slice(0, 5)
      }

      setSuggestions(filteredSuggestions.slice(0, 8))
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, activeField, isVisible])

  if (!isVisible) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPin className="w-4 h-4 text-secondary-400" />
      case 'recent':
        return <Clock className="w-4 h-4 text-secondary-400" />
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-secondary-400" />
      default:
        return <Search className="w-4 h-4 text-secondary-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'make':
        return 'Make'
      case 'model':
        return 'Model'
      case 'location':
        return 'Location'
      case 'recent':
        return 'Recent'
      case 'trending':
        return 'Trending'
      default:
        return ''
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (activeField && (suggestion.type === 'make' || suggestion.type === 'model')) {
      onSelect(suggestion.text, 'make')
    } else if (activeField && suggestion.type === 'location') {
      onSelect(suggestion.text, 'location')
    } else if (suggestion.type === 'recent' || suggestion.type === 'trending') {
      // For recent/trending, extract the relevant part
      const parts = suggestion.text.split(' ')
      if (activeField === 'make') {
        onSelect(parts[0] + (parts[1] ? ' ' + parts[1] : ''), 'make')
      } else if (activeField === 'location') {
        onSelect(parts[parts.length - 1], 'location')
      }
    }
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="inline-flex items-center space-x-2 text-secondary-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors flex items-center space-x-3 group"
            >
              {getIcon(suggestion.type)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-secondary-900 group-hover:text-primary-600">
                    {suggestion.text}
                  </span>
                  <span className="text-xs text-secondary-400 bg-secondary-100 px-2 py-1 rounded-full">
                    {getTypeLabel(suggestion.type)}
                  </span>
                </div>
                {suggestion.category && (
                  <div className="text-xs text-secondary-500 mt-1">
                    {suggestion.category}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="p-4 text-center text-secondary-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
          <p className="text-sm">No suggestions found for "{query}"</p>
          <p className="text-xs text-secondary-400 mt-1">
            Try searching for car makes, models, or locations
          </p>
        </div>
      ) : (
        <div className="p-4">
          <div className="text-xs font-medium text-secondary-500 mb-3 uppercase tracking-wide">
            Popular Searches
          </div>
          {mockSuggestions.trending.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-2 py-2 text-left hover:bg-secondary-50 transition-colors flex items-center space-x-3 group rounded-md"
            >
              <TrendingUp className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-secondary-700 group-hover:text-primary-600">
                {suggestion.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}