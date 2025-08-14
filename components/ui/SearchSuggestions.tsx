'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Car, Clock } from 'lucide-react'

interface SearchSuggestion {
  id: string
  type: 'make' | 'model' | 'location' | 'recent'
  text: string
  subtitle?: string
  count?: number
}

interface SearchSuggestionsProps {
  query: string
  isVisible: boolean
  onSelect: (suggestion: SearchSuggestion) => void
  onClose: () => void
}

export default function SearchSuggestions({ 
  query, 
  isVisible, 
  onSelect, 
  onClose 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API calls
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', type: 'make', text: 'Toyota', count: 4200 },
    { id: '2', type: 'make', text: 'Toyota Camry', subtitle: 'Model', count: 450 },
    { id: '3', type: 'make', text: 'Toyota Prado', subtitle: 'Model', count: 320 },
    { id: '4', type: 'location', text: 'Nairobi', count: 8500 },
    { id: '5', type: 'location', text: 'Mombasa', count: 2100 },
    { id: '6', type: 'recent', text: 'Honda CR-V 2021' },
    { id: '7', type: 'recent', text: 'BMW X3 Nairobi' },
  ]

  const recentSearches: SearchSuggestion[] = [
    { id: 'r1', type: 'recent', text: 'Toyota Camry 2020' },
    { id: 'r2', type: 'recent', text: 'Honda CR-V Nairobi' },
    { id: 'r3', type: 'recent', text: 'BMW under 3M' },
  ]

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(recentSearches)
      return
    }

    setLoading(true)
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 6))
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case 'make':
      case 'model':
        return <Car className="w-4 h-4" />
      case 'location':
        return <MapPin className="w-4 h-4" />
      case 'recent':
        return <Clock className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'make':
        return 'Brand'
      case 'model':
        return 'Model'
      case 'location':
        return 'Location'
      case 'recent':
        return 'Recent'
      default:
        return ''
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      
      {/* Suggestions Dropdown */}
      <div className="absolute top-full left-0 right-0 z-50 bg-white rounded-lg shadow-large border border-secondary-200 mt-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-secondary-600 text-sm">Searching...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <>
            {!query.trim() && (
              <div className="px-4 py-2 border-b border-secondary-100">
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">
                  Recent Searches
                </p>
              </div>
            )}
            
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors border-b border-secondary-50 last:border-b-0 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-secondary-400 group-hover:text-primary-600 transition-colors">
                    {getIcon(suggestion.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {suggestion.text}
                      </span>
                      {suggestion.subtitle && (
                        <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded">
                          {suggestion.subtitle}
                        </span>
                      )}
                    </div>
                    {suggestion.count && (
                      <p className="text-xs text-secondary-500 mt-0.5">
                        {suggestion.count.toLocaleString()} cars available
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs text-secondary-400">
                    {getTypeLabel(suggestion.type)}
                  </div>
                </div>
              </button>
            ))}
            
            {query.trim() && (
              <button
                onClick={() => onSelect({ 
                  id: 'search-all', 
                  type: 'make', 
                  text: query 
                })}
                className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-t border-secondary-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-primary-600">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-primary-600">
                      Search for "{query}"
                    </span>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      See all results
                    </p>
                  </div>
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="p-4 text-center">
            <Search className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
            <p className="text-secondary-600 text-sm">No suggestions found</p>
            <p className="text-secondary-400 text-xs mt-1">
              Try searching for car brands, models, or locations
            </p>
          </div>
        )}
      </div>
    </>
  )
}