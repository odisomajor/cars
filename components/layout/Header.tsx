'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Heart, User, Menu, X, ChevronDown, MapPin, Phone, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { SearchSuggestions } from '@/components/search/SearchSuggestions'
import { SearchResultsPreview } from '@/components/search/SearchResultsPreview'
import { MobileMenu } from '@/components/ui/MobileMenu'
export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchFocus = () => {
    if (searchQuery.length > 2) {
      setShowResults(true)
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
      setShowResults(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 2) {
      setShowResults(true)
      setShowSuggestions(false)
    } else if (value.length > 0) {
      setShowSuggestions(true)
      setShowResults(false)
    } else {
      setShowSuggestions(false)
      setShowResults(false)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setShowResults(false)
    // Navigate to search results
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      setShowResults(false)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const navigation = [
    { name: 'Buy Cars', href: '/cars' },
    { name: 'Car Hire', href: '/hire' },
    { name: 'Rent Cars', href: '/rental-listings' },
    { name: 'Sell Your Car', href: '/sell' },
    { name: 'Dealers', href: '/dealers' },
    { name: 'Finance', href: '/finance' },
    { name: 'Reviews', href: '/reviews' },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-secondary-900 text-white py-1.5 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3 h-3" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3 h-3" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/help" className="hover:text-primary-400 transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="hover:text-primary-400 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🚗</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-secondary-900">
                  Kenya Cars
                </h1>
                <p className="text-xs text-secondary-500 -mt-1">
                  Your trusted marketplace
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary-700 hover:text-primary-600 font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                  <input
                     type="text"
                     placeholder="Search cars, brands, models..."
                     value={searchQuery}
                     onChange={(e) => handleSearchChange(e.target.value)}
                     onFocus={handleSearchFocus}
                     className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                   />
                </div>
              </form>
              
              {/* Search Suggestions */}
               {showSuggestions && (
                 <SearchSuggestions
                   query={searchQuery}
                   isVisible={showSuggestions}
                   onSelect={handleSuggestionSelect}
                   onClose={() => setShowSuggestions(false)}
                 />
               )}
               
               {/* Search Results Preview */}
               {showResults && (
                 <SearchResultsPreview
                   query={searchQuery}
                   isVisible={showResults}
                   onClose={() => setShowResults(false)}
                 />
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Sell Car Button */}
              <Link
                href="/sell"
                className="hidden sm:inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                <span>Sell Car</span>
              </Link>

              {/* Rent Your Car Button */}
              <Link
                href="/create-rental-listing"
                className="hidden md:inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                <span>Rent Your Car</span>
              </Link>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                {isLoading ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                ) : isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <span className="hidden sm:block text-sm font-medium">
                        {user?.name || 'Account'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Authenticated User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-large border border-secondary-200 py-1.5 z-50">
                        <div className="px-3 py-2 border-b border-secondary-200">
                          <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                          <p className="text-xs text-secondary-500">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                            {user?.role?.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/my-listings"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Listings
                        </Link>
                        <Link
                          href="/favorites"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Saved Cars
                        </Link>
                        <Link
                          href="/bookings"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Bookings
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="block px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="my-1.5 border-secondary-200" />
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/auth/signin"
                      className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-4 border-t border-secondary-200">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                       type="text"
                       placeholder="Search cars, brands, models..."
                       value={searchQuery}
                       onChange={(e) => handleSearchChange(e.target.value)}
                       onFocus={handleSearchFocus}
                       className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                     />
                  </div>
                </form>
                
                {/* Mobile Search Suggestions */}
                 {showSuggestions && (
                   <SearchSuggestions
                     query={searchQuery}
                     isVisible={showSuggestions}
                     onSelect={handleSuggestionSelect}
                     onClose={() => setShowSuggestions(false)}
                   />
                 )}
                 
                 {/* Mobile Search Results Preview */}
                 {showResults && (
                   <SearchResultsPreview
                     query={searchQuery}
                     isVisible={showResults}
                     onClose={() => setShowResults(false)}
                   />
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </header>
    </>
  )
}