'use client'

import React, { useState, useEffect } from 'react'
import { Search, Bookmark, X, Calendar, MapPin, DollarSign, Car, Filter } from 'lucide-react'

interface SavedSearch {
  id: string
  name: string
  filters: {
    make?: string
    model?: string
    priceRange?: [number, number]
    yearRange?: [number, number]
    mileageRange?: [number, number]
    bodyType?: string
    fuelType?: string
    transmission?: string
    location?: string
    condition?: string
  }
  createdAt: Date
  lastChecked?: Date
  newResultsCount?: number
}

interface SavedSearchesProps {
  currentFilters: any
  onLoadSearch: (filters: any) => void
  className?: string
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  currentFilters,
  onLoadSearch,
  className = ''
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches')
    if (saved) {
      try {
        const parsedSearches = JSON.parse(saved).map((search: any) => ({
          ...search,
          createdAt: new Date(search.createdAt),
          lastChecked: search.lastChecked ? new Date(search.lastChecked) : undefined
        }))
        setSavedSearches(parsedSearches)
      } catch (error) {
        console.error('Error loading saved searches:', error)
      }
    }
  }, [])

  // Save searches to localStorage whenever savedSearches changes
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches))
  }, [savedSearches])

  const handleSaveSearch = () => {
    if (!searchName.trim()) return

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date(),
      newResultsCount: 0
    }

    setSavedSearches(prev => [newSearch, ...prev])
    setSearchName('')
    setShowSaveDialog(false)
  }

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id))
  }

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch(search.filters)
    // Update last checked time
    setSavedSearches(prev => prev.map(s => 
      s.id === search.id 
        ? { ...s, lastChecked: new Date(), newResultsCount: 0 }
        : s
    ))
  }

  const formatFilters = (filters: any) => {
    const parts = []
    if (filters.make) parts.push(filters.make)
    if (filters.model) parts.push(filters.model)
    if (filters.priceRange) {
      parts.push(`KSh ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}`)
    }
    if (filters.yearRange) {
      parts.push(`${filters.yearRange[0]} - ${filters.yearRange[1]}`)
    }
    if (filters.location) parts.push(filters.location)
    if (filters.bodyType) parts.push(filters.bodyType)
    if (filters.fuelType) parts.push(filters.fuelType)
    if (filters.transmission) parts.push(filters.transmission)
    
    return parts.slice(0, 3).join(' • ') + (parts.length > 3 ? ` +${parts.length - 3} more` : '')
  }

  const hasActiveFilters = () => {
    return Object.keys(currentFilters).some(key => {
      const value = currentFilters[key]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== '' && value !== null
    })
  }

  return (
    <div className={`bg-white rounded-lg border border-secondary-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-secondary-900">Saved Searches</h3>
            {savedSearches.length > 0 && (
              <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                {savedSearches.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-secondary-500 hover:text-secondary-700"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Save Current Search */}
          {hasActiveFilters() && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-900">Current Search</span>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Save Search
                </button>
              </div>
              <p className="text-sm text-primary-700">
                {formatFilters(currentFilters)}
              </p>
            </div>
          )}

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="mb-4 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter search name..."
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
                />
                <button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim()}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false)
                    setSearchName('')
                  }}
                  className="p-2 text-secondary-500 hover:text-secondary-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Saved Searches List */}
          {savedSearches.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500 text-sm">No saved searches yet</p>
              <p className="text-secondary-400 text-xs mt-1">
                Apply filters and save your search to get notified of new matches
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="p-3 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900 mb-1">{search.name}</h4>
                      <p className="text-sm text-secondary-600 mb-2">
                        {formatFilters(search.filters)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-secondary-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {search.createdAt.toLocaleDateString()}</span>
                        </div>
                        {search.lastChecked && (
                          <div className="flex items-center space-x-1">
                            <Search className="w-3 h-3" />
                            <span>Last checked {search.lastChecked.toLocaleDateString()}</span>
                          </div>
                        )}
                        {search.newResultsCount && search.newResultsCount > 0 && (
                          <div className="flex items-center space-x-1 text-primary-600">
                            <Car className="w-3 h-3" />
                            <span>{search.newResultsCount} new results</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={() => handleLoadSearch(search)}
                        className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(search.id)}
                        className="p-1 text-secondary-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SavedSearches