'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Calendar, Car } from 'lucide-react'
import HeroSearchSuggestions from '../ui/HeroSearchSuggestions'

export default function Hero() {
  const [searchMode, setSearchMode] = useState<'buy' | 'rent'>('buy')
  const [searchData, setSearchData] = useState({
    make: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    condition: 'all',
    // Rental specific fields
    pickupDate: '',
    returnDate: '',
    category: ''
  })
  
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const carMakes = [
    'Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Subaru', 
    'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Hyundai', 'Kia'
  ]

  const locations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru'
  ]

  const priceRanges = [
    'Under 500K', '500K - 1M', '1M - 2M', '2M - 3M', 
    '3M - 5M', '5M - 10M', 'Above 10M'
  ]

  // Generate years array statically to avoid hydration mismatch
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 25 }, (_, i) => (currentYear - i).toString())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    
    if (searchMode === 'buy') {
      // Navigate to car sales page
      const params = new URLSearchParams()
      if (searchData.make) params.set('make', searchData.make)
      if (searchData.location) params.set('location', searchData.location)
      if (searchData.minPrice) params.set('minPrice', searchData.minPrice)
      if (searchData.maxPrice) params.set('maxPrice', searchData.maxPrice)
      if (searchData.year) params.set('year', searchData.year)
      if (searchData.condition !== 'all') params.set('condition', searchData.condition)
      window.location.href = `/cars?${params.toString()}`
    } else {
      // Navigate to car rental page
      const params = new URLSearchParams()
      if (searchData.location) params.set('location', searchData.location)
      if (searchData.pickupDate) params.set('pickupDate', searchData.pickupDate)
      if (searchData.returnDate) params.set('returnDate', searchData.returnDate)
      if (searchData.category) params.set('category', searchData.category)
      window.location.href = `/hire?${params.toString()}`
    }
  }

  const handleInputFocus = (field: string) => {
    setActiveField(field)
    setShowSuggestions(true)
  }

  const handleSuggestionSelect = (suggestion: any) => {
    if (activeField) {
      setSearchData(prev => ({
        ...prev,
        [activeField]: suggestion.text
      }))
    }
    setShowSuggestions(false)
    setActiveField(null)
  }

  const handleCloseSuggestions = () => {
    setShowSuggestions(false)
    setActiveField(null)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setActiveField(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="container-custom relative">
        <div className="py-8 lg:py-12">
          <div className="text-center mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-shadow-lg">
              Find Your Perfect Car in{' '}
              <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Kenya
              </span>
            </h1>
            <p className="text-base lg:text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Browse thousands of cars from trusted dealers and sellers. 
              Your dream car is just a search away.
            </p>
          </div>

          {/* Search Form */}
          <div ref={searchRef} className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-3 lg:p-4">
              <form onSubmit={handleSearch} className="space-y-3">
                {/* Search Mode Toggle */}
                <div className="flex justify-center mb-3">
                  <div className="bg-gray-100 rounded-md p-1 flex">
                    <button
                      type="button"
                      onClick={() => setSearchMode('buy')}
                      className={`px-4 py-1.5 rounded-sm text-xs font-medium transition-all ${
                        searchMode === 'buy'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      Buy Cars
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('rent')}
                      className={`px-4 py-1.5 rounded-sm text-xs font-medium transition-all ${
                        searchMode === 'rent'
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      Rent Cars
                    </button>
                  </div>
                </div>

                {/* Condition Toggle for Buy Mode */}
                {searchMode === 'buy' && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 rounded-md p-1 flex">
                      {['all', 'new', 'used'].map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => setSearchData(prev => ({ ...prev, condition }))}
                          className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-all ${
                            searchData.condition === condition
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-secondary-600 hover:text-secondary-900'
                          }`}
                        >
                          {condition === 'all' ? 'All Cars' : condition === 'new' ? 'New Cars' : 'Used Cars'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Fields */}
                {searchMode === 'buy' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Make/Model */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Make or Model
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="e.g. Toyota, Honda"
                          value={searchData.make}
                          onChange={(e) => setSearchData(prev => ({ ...prev, make: e.target.value }))}
                          onFocus={() => handleInputFocus('make')}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Mombasa"
                          value={searchData.location}
                          onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                          onFocus={() => handleInputFocus('location')}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Price Range (KSh)
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Min"
                            value={searchData.minPrice}
                            onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Max"
                            value={searchData.maxPrice}
                            onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Year */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <select
                          value={searchData.year}
                          onChange={(e) => setSearchData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
                        >
                          <option value="">Any Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pickup Location */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Pickup Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Mombasa"
                          value={searchData.location}
                          onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                          onFocus={() => handleInputFocus('location')}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Pickup Date */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Pickup Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                          type="date"
                          value={searchData.pickupDate}
                          onChange={(e) => setSearchData(prev => ({ ...prev, pickupDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Return Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                          type="date"
                          value={searchData.returnDate}
                          onChange={(e) => setSearchData(prev => ({ ...prev, returnDate: e.target.value }))}
                          min={searchData.pickupDate || new Date().toISOString().split('T')[0]}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">
                        Category
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <select
                          value={searchData.category}
                          onChange={(e) => setSearchData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2.5 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white text-sm"
                        >
                          <option value="">Any Category</option>
                          <option value="economy">Economy</option>
                          <option value="compact">Compact</option>
                          <option value="midsize">Midsize</option>
                          <option value="fullsize">Full Size</option>
                          <option value="suv">SUV</option>
                          <option value="luxury">Luxury</option>
                          <option value="van">Van</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Button */}
                <div className="flex justify-center pt-3">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-md font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>{searchMode === 'buy' ? 'Search Cars' : 'Search Rentals'}</span>
                  </button>
                </div>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && activeField && (
                <HeroSearchSuggestions
                  query={searchData[activeField as keyof typeof searchData] as string}
                  isVisible={showSuggestions}
                  onSelect={handleSuggestionSelect}
                  onClose={handleCloseSuggestions}
                />
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {[
              { number: '12,450+', label: 'Cars Available' },
              { number: '850+', label: 'Trusted Dealers' },
              { number: '47', label: 'Cities Covered' },
              { number: '25,000+', label: 'Happy Customers' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-primary-200 text-xs lg:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}