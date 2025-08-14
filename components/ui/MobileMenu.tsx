'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  X, 
  Home, 
  Car, 
  Search, 
  Heart, 
  User, 
  Settings, 
  HelpCircle, 
  Phone, 
  LogIn, 
  UserPlus,
  Calendar 
} from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Browse Cars', href: '/cars', icon: Car },
  { name: 'Car Hire', href: '/hire', icon: Car },
  { name: 'Rent Cars', href: '/rental-listings', icon: Car },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Favorites', href: '/favorites', icon: Heart },
]

const userActions = [
  { name: 'Sign In', href: '/login', icon: LogIn },
  { name: 'Create Account', href: '/register', icon: UserPlus },
]

const accountLinks = [
  { name: 'My Dashboard', href: '/dashboard', icon: User },
  { name: 'My Listings', href: '/my-listings', icon: Car },
  { name: 'My Bookings', href: '/bookings', icon: Calendar },
  { name: 'Create Rental Listing', href: '/create-rental-listing', icon: Car },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Contact Us', href: '/contact', icon: Phone },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [isLoggedIn] = useState(false) // This would come from auth context

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🚗</span>
            </div>
            <span className="font-bold text-secondary-900">Kenya Cars</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-3 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5 group-hover:text-primary-600" />
                  <span className="font-medium">{item.name}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}

            {/* Sell Car Button */}
            <Link
              href="/sell"
              className="flex items-center space-x-3 px-3 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mt-4"
              onClick={onClose}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Sell Your Car</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-secondary-200 my-6" />

            {/* User Actions */}
            <div className="space-y-2">
              {!isLoggedIn ? (
                <>
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide px-3 mb-3">
                    Account
                  </h3>
                  {userActions.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-3 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                        onClick={onClose}
                      >
                        <Icon className="w-5 h-5 group-hover:text-primary-600" />
                        <span className="font-medium">{item.name}</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide px-3 mb-3">
                    My Account
                  </h3>
                  {accountLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-3 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                        onClick={onClose}
                      >
                        <Icon className="w-5 h-5 group-hover:text-primary-600" />
                        <span className="font-medium">{item.name}</span>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200 bg-secondary-50">
            <div className="text-center">
              <p className="text-sm text-secondary-600 mb-2">
                Need help? Contact us
              </p>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">+254 700 123 456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}