'use client'

import React, { useState } from 'react'
import {
  FeaturedCarousel,
  PremiumBadge,
  PremiumFeatures,
  InstantBooking,
  SellerAnalyticsDashboard,
  AdPlacementSystem,
  MobileAdFormats,
  MobileAdIntegration,
  RevenueTrackingDashboard,
  RentalSubscriptionPlans,
  CommissionSystem,
  PushNotificationSystem
} from '../../components'

// Mock data for demonstration
const mockFeaturedListings = [
  {
    id: '1',
    title: '2023 Toyota Camry Hybrid',
    price: 28500,
    currency: 'KES',
    images: ['/api/placeholder/400/300'],
    location: 'Nairobi, Kenya',
    year: 2023,
    mileage: 15000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    listingType: 'FEATURED' as const,
    category: 'SALE' as const,
    views: 1250,
    createdAt: '2024-01-15',
    user: {
      name: 'Premium Motors',
      avatar: '/api/placeholder/40/40',
      isVerified: true
    }
  },
  {
    id: '2',
    title: '2022 BMW X5 M Sport',
    price: 6500000,
    currency: 'KES',
    images: ['/api/placeholder/400/300'],
    location: 'Mombasa, Kenya',
    year: 2022,
    mileage: 25000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    listingType: 'SPOTLIGHT' as const,
    category: 'SALE' as const,
    views: 2100,
    createdAt: '2024-01-10',
    user: {
      name: 'Elite Auto',
      avatar: '/api/placeholder/40/40',
      isVerified: true
    }
  },
  {
    id: '3',
    title: '2023 Mercedes C-Class',
    price: 8500,
    currency: 'KES',
    images: ['/api/placeholder/400/300'],
    location: 'Kisumu, Kenya',
    year: 2023,
    mileage: 5000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    listingType: 'PREMIUM' as const,
    category: 'RENTAL' as const,
    views: 890,
    createdAt: '2024-01-20',
    user: {
      name: 'Luxury Rentals',
      avatar: '/api/placeholder/40/40',
      isVerified: true
    }
  }
]

export default function PremiumShowcase() {
  const [activeTab, setActiveTab] = useState('premium')

  const tabs = [
    { id: 'premium', label: 'Premium Listings', icon: '⭐' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'ads', label: 'Advertising', icon: '📢' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '📋' },
    { id: 'commissions', label: 'Commissions', icon: '🤝' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'mobile', label: 'Mobile Ads', icon: '📱' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'premium':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Listings Carousel</h2>
              <FeaturedCarousel listings={mockFeaturedListings} />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Badges & Highlighting</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <PremiumBadge listingType="FEATURED" variant="default" />
                  <p className="text-sm text-gray-600 mt-2">Featured Badge</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <PremiumBadge listingType="PREMIUM" variant="default" />
                  <p className="text-sm text-gray-600 mt-2">Premium Badge</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <PremiumBadge listingType="SPOTLIGHT" variant="default" />
                  <p className="text-sm text-gray-600 mt-2">Spotlight Badge</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Rental Features</h2>
              <div className="space-y-4">
                <InstantBooking 
                  listing={{
                    id: '3',
                    title: '2023 Mercedes C-Class',
                    pricePerDay: 8500,
                    currency: 'KES',
                    location: 'Kisumu, Kenya',
                    availability: {
                      startDate: '2024-01-25',
                      endDate: '2024-12-31',
                      blackoutDates: []
                    },
                    features: ['GPS Navigation', 'Bluetooth', 'Air Conditioning', 'Premium Sound'],
                    instantBooking: true,
                    minRentalDays: 1,
                    maxRentalDays: 30
                  }}
                />
              </div>
            </div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Analytics Dashboard</h2>
            <SellerAnalyticsDashboard />
          </div>
        )
      
      case 'ads':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ad Placement System</h2>
              <AdPlacementSystem />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mobile Ad Formats</h2>
              <MobileAdFormats />
            </div>
          </div>
        )
      
      case 'revenue':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Tracking Dashboard</h2>
            <RevenueTrackingDashboard />
          </div>
        )
      
      case 'subscriptions':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Subscription Plans</h2>
            <RentalSubscriptionPlans />
          </div>
        )
      
      case 'commissions':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission System</h2>
            <CommissionSystem />
          </div>
        )
      
      case 'notifications':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Push Notification System</h2>
            <PushNotificationSystem />
          </div>
        )
      
      case 'mobile':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mobile Ad Integration</h2>
            <MobileAdIntegration className="w-full" />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Premium Features Showcase
                </h1>
                <p className="mt-2 text-gray-600">
                  Comprehensive demonstration of premium listing system, monetization features, and mobile enhancements
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ All Features Active
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  🚀 Production Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Complete Premium Solution</h2>
            <p className="text-xl mb-8 opacity-90">
              Transform your car dealership with our comprehensive premium features and monetization systems
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Multiple Revenue Streams</h3>
                <p className="opacity-90">Premium listings, subscriptions, ads, and commissions</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
                <p className="opacity-90">Optimized for all devices with native mobile features</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="opacity-90">Comprehensive insights and performance tracking</p>
              </div>
            </div>
            
            <div className="mt-12">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}