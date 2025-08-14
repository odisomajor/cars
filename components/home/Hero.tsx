'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Calendar, Car } from 'lucide-react'
import SearchSuggestions from '../ui/SearchSuggestions'

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

  const years = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString())

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
        <div className="py-20 lg:py-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-shadow-lg">
              Find Your Perfect Car in{' '}
              <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Kenya
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Browse thousands of new and used cars from trusted dealers and private sellers across Kenya. 
              Your dream car is just a search away.
            </p>
          </div>

          {/* Search Form */}
          <div ref={searchRef} className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-large p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Mode Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-secondary-100 rounded-lg p-1 flex">
                    <button
                      type="button"
                      onClick={() => setSearchMode('buy')}
                      className={`px-8 py-3 rounded-md text-sm font-medium transition-all ${
                        searchMode === 'buy'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      Buy Cars
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('rent')}
                      className={`px-8 py-3 rounded-md text-sm font-medium transition-all ${
                        searchMode === 'rent'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      Rent Cars
                    </button>
                  </div>
                </div>

                {/* Condition Toggle for Buy Mode */}
                {searchMode === 'buy' && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-secondary-100 rounded-lg p-1 flex">
                      {['all', 'new', 'used'].map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => setSearchData(prev => ({ ...prev, condition }))}
                          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            searchData.condition === condition
                              ? 'bg-primary-600 text-white shadow-md'
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
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Make or Model
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="e.g. Toyota, Honda"
                          value={searchData.make}
                          onChange={(e) => setSearchData(prev => ({ ...prev, make: e.target.value }))}
                          onFocus={() => handleInputFocus('make')}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Mombasa"
                          value={searchData.location}
                          onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                          onFocus={() => handleInputFocus('location')}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Price Range (KSh)
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Min"
                            value={searchData.minPrice}
                            onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: e.target.value }))}
                            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Max"
                            value={searchData.maxPrice}
                            onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: e.target.value }))}
                            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Year */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <select
                          value={searchData.year}
                          onChange={(e) => setSearchData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white"
                        >
                          <option value="">Any Year</option>
                          {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
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
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Pickup Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="e.g. Nairobi, Mombasa"
                          value={searchData.location}
                          onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                          onFocus={() => handleInputFocus('location')}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Pickup Date */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Pickup Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <input
                          type="date"
                          value={searchData.pickupDate}
                          onChange={(e) => setSearchData(prev => ({ ...prev, pickupDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Return Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <input
                          type="date"
                          value={searchData.returnDate}
                          onChange={(e) => setSearchData(prev => ({ ...prev, returnDate: e.target.value }))}
                          min={searchData.pickupDate || new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                        <select
                          value={searchData.category}
                          onChange={(e) => setSearchData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white"
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
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>{searchMode === 'buy' ? 'Search Cars' : 'Search Rentals'}</span>
                  </button>
                </div>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && activeField && (
                <SearchSuggestions
                  query={searchData[activeField as keyof typeof searchData] as string}
                  isVisible={showSuggestions}
                  onSelect={handleSuggestionSelect}
                  onClose={handleCloseSuggestions}
                />
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { number: '12,450+', label: 'Cars Available' },
              { number: '850+', label: 'Trusted Dealers' },
              { number: '47', label: 'Cities Covered' },
              { number: '25,000+', label: 'Happy Customers' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-200 text-sm lg:text-base">
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