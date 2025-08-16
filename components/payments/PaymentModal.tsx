'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PaymentForm from './PaymentForm'
import { X, Star, Zap, Crown, Truck, Building2, Search } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  listingId?: string
  currentListingType?: string
  onSuccess?: (paymentResult: any) => void
}

type ListingTypeOption = {
  id: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT' | 'FEATURED_RENTAL' | 'PREMIUM_FLEET' | 'SPOTLIGHT_RENTAL'
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  category: 'sale' | 'rental'
  popular?: boolean
}

const listingTypes: ListingTypeOption[] = [
  // Sale Listings
  {
    id: 'FEATURED',
    name: 'Featured Listing',
    description: 'Get more visibility with featured placement',
    icon: <Star className="h-5 w-5" />,
    features: [
      'Priority placement in search results',
      'Featured badge on listing',
      '30 days duration',
      'Email notifications for inquiries'
    ],
    category: 'sale'
  },
  {
    id: 'PREMIUM',
    name: 'Premium Listing',
    description: 'Maximum exposure with premium features',
    icon: <Crown className="h-5 w-5" />,
    features: [
      'Top placement in search results',
      'Premium badge and highlighting',
      '45 days duration',
      'Priority customer support',
      'Advanced analytics',
      'Social media promotion'
    ],
    category: 'sale',
    popular: true
  },
  {
    id: 'SPOTLIGHT',
    name: 'Spotlight Listing',
    description: 'Ultimate visibility with spotlight features',
    icon: <Search className="h-5 w-5" />,
    features: [
      'Homepage spotlight placement',
      'Spotlight badge and effects',
      '60 days duration',
      'Dedicated account manager',
      'Professional photography tips',
      'Multi-platform promotion'
    ],
    category: 'sale'
  },
  // Rental Listings
  {
    id: 'FEATURED_RENTAL',
    name: 'Featured Rental',
    description: 'Boost your rental visibility',
    icon: <Truck className="h-5 w-5" />,
    features: [
      'Priority in rental search',
      'Featured rental badge',
      '30 days duration',
      'Rental inquiry notifications'
    ],
    category: 'rental'
  },
  {
    id: 'PREMIUM_FLEET',
    name: 'Premium Fleet',
    description: 'Perfect for fleet operators',
    icon: <Building2 className="h-5 w-5" />,
    features: [
      'Fleet operator badge',
      'Bulk listing management',
      '45 days duration',
      'Fleet analytics dashboard',
      'Priority support'
    ],
    category: 'rental',
    popular: true
  },
  {
    id: 'SPOTLIGHT_RENTAL',
    name: 'Spotlight Rental',
    description: 'Maximum rental exposure',
    icon: <Zap className="h-5 w-5" />,
    features: [
      'Homepage rental spotlight',
      'Premium rental placement',
      '60 days duration',
      'Rental performance insights',
      'Cross-platform promotion'
    ],
    category: 'rental'
  }
]

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  listingId,
  currentListingType,
  onSuccess,
}) => {
  const [selectedListingType, setSelectedListingType] = useState<ListingTypeOption['id'] | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'sale' | 'rental'>('sale')

  const handleListingTypeSelect = (listingType: ListingTypeOption['id']) => {
    setSelectedListingType(listingType)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = (paymentResult: any) => {
    setShowPaymentForm(false)
    setSelectedListingType(null)
    onSuccess?.(paymentResult)
    onClose()
  }

  const handleBack = () => {
    setShowPaymentForm(false)
    setSelectedListingType(null)
  }

  const filteredListingTypes = listingTypes.filter(type => type.category === activeCategory)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {showPaymentForm ? 'Complete Payment' : 'Upgrade Your Listing'}
              </DialogTitle>
              <DialogDescription>
                {showPaymentForm
                  ? 'Choose your payment method to upgrade your listing'
                  : 'Choose a listing type to increase visibility and get more inquiries'
                }
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {showPaymentForm && selectedListingType ? (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-4"
            >
              ← Back to Listing Types
            </Button>
            <PaymentForm
              listingType={selectedListingType}
              listingId={listingId}
              onSuccess={handlePaymentSuccess}
              onCancel={handleBack}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveCategory('sale')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === 'sale'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Car Sales
              </button>
              <button
                onClick={() => setActiveCategory('rental')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === 'rental'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Car Rentals
              </button>
            </div>

            {/* Listing Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListingTypes.map((listingType) => {
                const isCurrentType = currentListingType === listingType.id
                
                return (
                  <div
                    key={listingType.id}
                    className={`relative border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                      isCurrentType
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => !isCurrentType && handleListingTypeSelect(listingType.id)}
                  >
                    {listingType.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500">
                        Popular
                      </Badge>
                    )}
                    
                    {isCurrentType && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500">
                        Current
                      </Badge>
                    )}

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {listingType.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{listingType.name}</h3>
                        <p className="text-sm text-gray-600">{listingType.description}</p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {listingType.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentType ? (
                      <Button disabled className="w-full bg-green-500">
                        Current Plan
                      </Button>
                    ) : (
                      <Button className="w-full">
                        Select This Plan
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Payment Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Secure payments via Stripe (International) or M-Pesa (Kenya)</li>
                <li>• Instant listing upgrade upon successful payment</li>
                <li>• 30-day money-back guarantee</li>
                <li>• Customer support available 24/7</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal