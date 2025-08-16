'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PaymentModal from './PaymentModal'
import {
  Crown,
  Star,
  Zap,
  Truck,
  Building2,
  Search,
  ArrowUp,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface PaymentButtonProps {
  listingId: string
  currentListingType?: string
  suggestedUpgrade?: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT' | 'FEATURED_RENTAL' | 'PREMIUM_FLEET' | 'SPOTLIGHT_RENTAL'
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showBadge?: boolean
  className?: string
  onSuccess?: (paymentResult: any) => void
}

const listingTypeConfig = {
  FEATURED: {
    name: 'Featured',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  PREMIUM: {
    name: 'Premium',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  SPOTLIGHT: {
    name: 'Spotlight',
    icon: Search,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  FEATURED_RENTAL: {
    name: 'Featured Rental',
    icon: Truck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  PREMIUM_FLEET: {
    name: 'Premium Fleet',
    icon: Building2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  SPOTLIGHT_RENTAL: {
    name: 'Spotlight Rental',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  listingId,
  currentListingType,
  suggestedUpgrade,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showBadge = true,
  className = '',
  onSuccess,
}) => {
  const { user } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleUpgradeClick = () => {
    if (!user) {
      toast.error('Please log in to upgrade your listing')
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentResult: any) => {
    toast.success('Listing upgraded successfully!')
    onSuccess?.(paymentResult)
    setShowPaymentModal(false)
  }

  // Determine if listing is already premium
  const isPremiumListing = currentListingType && currentListingType !== 'BASIC'
  
  // Get suggested upgrade config
  const upgradeConfig = suggestedUpgrade ? listingTypeConfig[suggestedUpgrade] : null
  const currentConfig = currentListingType && currentListingType !== 'BASIC' 
    ? listingTypeConfig[currentListingType as keyof typeof listingTypeConfig] 
    : null

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  // If already premium, show current status
  if (isPremiumListing && currentConfig) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showBadge && (
          <Badge className={`${currentConfig.bgColor} ${currentConfig.color} ${currentConfig.borderColor} border`}>
            <currentConfig.icon className="h-3 w-3 mr-1" />
            {currentConfig.name}
          </Badge>
        )}
        <Button
          variant="outline"
          size={size}
          onClick={handleUpgradeClick}
          className={`${sizeClasses[size]} border-dashed`}
        >
          {showIcon && <ArrowUp className="h-4 w-4 mr-2" />}
          Upgrade Further
        </Button>
      </div>
    )
  }

  // Default upgrade button
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleUpgradeClick}
        className={`${sizeClasses[size]} ${className} ${upgradeConfig ? upgradeConfig.color : ''}`}
      >
        {showIcon && upgradeConfig && (
          <upgradeConfig.icon className="h-4 w-4 mr-2" />
        )}
        {showIcon && !upgradeConfig && (
          <ArrowUp className="h-4 w-4 mr-2" />
        )}
        {suggestedUpgrade 
          ? `Upgrade to ${upgradeConfig?.name}`
          : 'Upgrade Listing'
        }
      </Button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        listingId={listingId}
        currentListingType={currentListingType}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}

// Compact version for use in listing cards
export const CompactPaymentButton: React.FC<Omit<PaymentButtonProps, 'size' | 'showBadge'>> = (props) => {
  return (
    <PaymentButton
      {...props}
      size="sm"
      variant="outline"
      showBadge={false}
      className="w-full"
    />
  )
}

// Premium badge component for displaying current listing status
export const PremiumBadge: React.FC<{
  listingType: string
  className?: string
}> = ({ listingType, className = '' }) => {
  if (listingType === 'BASIC' || !listingType) {
    return null
  }

  const config = listingTypeConfig[listingType as keyof typeof listingTypeConfig]
  if (!config) return null

  return (
    <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border ${className}`}>
      <config.icon className="h-3 w-3 mr-1" />
      {config.name}
    </Badge>
  )
}

// Upgrade suggestion component
export const UpgradeSuggestion: React.FC<{
  listingId: string
  currentListingType?: string
  className?: string
  onSuccess?: (paymentResult: any) => void
}> = ({ listingId, currentListingType, className = '', onSuccess }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { user } = useAuth()

  // Determine suggested upgrade based on current type
  const getSuggestedUpgrade = () => {
    switch (currentListingType) {
      case 'BASIC':
      case undefined:
        return 'FEATURED'
      case 'FEATURED':
        return 'PREMIUM'
      case 'PREMIUM':
        return 'SPOTLIGHT'
      case 'FEATURED_RENTAL':
        return 'PREMIUM_FLEET'
      case 'PREMIUM_FLEET':
        return 'SPOTLIGHT_RENTAL'
      default:
        return null
    }
  }

  const suggestedUpgrade = getSuggestedUpgrade()
  if (!suggestedUpgrade) return null

  const config = listingTypeConfig[suggestedUpgrade]

  const handleUpgrade = () => {
    if (!user) {
      toast.error('Please log in to upgrade your listing')
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentResult: any) => {
    toast.success('Listing upgraded successfully!')
    onSuccess?.(paymentResult)
    setShowPaymentModal(false)
  }

  return (
    <>
      <div className={`p-4 rounded-lg border-2 border-dashed ${config.borderColor} ${config.bgColor} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-white ${config.color}`}>
              <config.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Upgrade to {config.name}
              </h4>
              <p className="text-sm text-gray-600">
                Get more visibility and inquiries
              </p>
            </div>
          </div>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className={config.color}
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        listingId={listingId}
        currentListingType={currentListingType}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}

export default PaymentButton