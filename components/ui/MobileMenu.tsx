'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
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
  Calendar,
  ChevronRight,
  Plus
} from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface AccountLink {
  name: string
  href: string
  icon: any
  roleRequired?: string[]
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

const accountLinks: AccountLink[] = [
  { name: 'My Dashboard', href: '/dashboard', icon: User },
  { name: 'My Listings', href: '/my-listings', icon: Car },
  { name: 'My Bookings', href: '/bookings', icon: Calendar },
  { name: 'Create Rental Listing', href: '/create-rental-listing', icon: Car },
  { name: 'Fleet Management', href: '/dashboard/fleet', icon: Car, roleRequired: ['DEALER', 'RENTAL_COMPANY'] },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Contact Us', href: '/contact', icon: Phone },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isOpen) return null

  // Filter account links based on user role
  const filteredAccountLinks = accountLinks.filter(item => {
    if (item.roleRequired) {
      return user?.role && item.roleRequired.includes(user.role)
    }
    return true
  })

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
        <div className="flex items-center justify-between p-3 border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">🚗</span>
            </div>
            <span className="font-bold text-secondary-900 text-sm">Kenya Cars</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                  onClick={onClose}
                >
                  <Icon className="w-4 h-4 group-hover:text-primary-600" />
                  <span className="font-medium text-sm">{item.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}

            {/* Sell Car Button */}
            <Link
              href="/sell"
              className="flex items-center space-x-3 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mt-3"
              onClick={onClose}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium text-sm">Sell Your Car</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-secondary-200 my-4" />

            {/* User Actions */}
            <div className="space-y-1">
              {!isAuthenticated ? (
                <>
                  <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide px-3 mb-2">
                    Account
                  </h3>
                  {userActions.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2.5 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                        onClick={onClose}
                      >
                        <Icon className="w-4 h-4 group-hover:text-primary-600" />
                        <span className="font-medium text-sm">{item.name}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </>
              ) : (
                <>
                  <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide px-3 mb-2">
                    My Account
                  </h3>
                  {filteredAccountLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2.5 text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group"
                        onClick={onClose}
                      >
                        <Icon className="w-4 h-4 group-hover:text-primary-600" />
                        <span className="font-medium text-sm">{item.name}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-secondary-200 bg-secondary-50">
            <div className="text-center">
              <p className="text-xs text-secondary-600 mb-1.5">
                Need help? Contact us
              </p>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <Phone className="w-3 h-3" />
                <span className="text-xs font-medium">+254 700 123 456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}