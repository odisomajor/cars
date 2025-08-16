'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, Crown, Sparkles, Eye, TrendingUp, Clock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ListingType = 'BASIC' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
export type BadgeVariant = 'default' | 'compact' | 'detailed' | 'animated'

interface PremiumBadgeProps {
  listingType: ListingType
  variant?: BadgeVariant
  showIcon?: boolean
  showDescription?: boolean
  className?: string
  animated?: boolean
}

interface ListingTypeConfig {
  label: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgColor: string
  textColor: string
  borderColor: string
  description: string
  features: string[]
  priority: number
}

const listingTypeConfigs: Record<ListingType, ListingTypeConfig> = {
  BASIC: {
    label: 'Basic',
    icon: Eye,
    gradient: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    description: 'Standard listing visibility',
    features: ['Basic search visibility', 'Standard placement'],
    priority: 1
  },
  FEATURED: {
    label: 'Featured',
    icon: Star,
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    description: 'Enhanced visibility and placement',
    features: ['Priority in search results', 'Featured section placement', 'Green highlight border'],
    priority: 2
  },
  PREMIUM: {
    label: 'Premium',
    icon: Zap,
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    description: 'Premium placement with special highlighting',
    features: ['Top search placement', 'Premium carousel inclusion', 'Blue premium border', 'Boost icon'],
    priority: 3
  },
  SPOTLIGHT: {
    label: 'Spotlight',
    icon: Crown,
    gradient: 'from-purple-400 via-pink-500 to-red-500',
    bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    description: 'Maximum visibility with spotlight treatment',
    features: ['Highest priority placement', 'Spotlight carousel', 'Animated gradient border', 'Crown icon', 'Social media promotion'],
    priority: 4
  }
}

// Main Premium Badge Component
export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  listingType,
  variant = 'default',
  showIcon = true,
  showDescription = false,
  className = '',
  animated = false
}) => {
  const config = listingTypeConfigs[listingType]
  const Icon = config.icon

  if (listingType === 'BASIC') {
    return null // Don't show badge for basic listings
  }

  const baseClasses = cn(
    'inline-flex items-center font-semibold transition-all duration-300',
    animated && 'animate-pulse',
    className
  )

  switch (variant) {
    case 'compact':
      return (
        <Badge className={cn(
          `bg-gradient-to-r ${config.gradient} text-white shadow-sm`,
          baseClasses
        )}>
          {showIcon && <Icon className="w-3 h-3 mr-1" />}
          {config.label}
        </Badge>
      )

    case 'detailed':
      return (
        <div className={cn(
          `${config.bgColor} ${config.textColor} ${config.borderColor} border rounded-lg p-3`,
          baseClasses
        )}>
          <div className="flex items-center mb-2">
            {showIcon && <Icon className="w-5 h-5 mr-2" />}
            <span className="font-bold">{config.label}</span>
          </div>
          {showDescription && (
            <p className="text-sm opacity-80">{config.description}</p>
          )}
        </div>
      )

    case 'animated':
      return (
        <div className={cn(
          'relative overflow-hidden rounded-full',
          baseClasses
        )}>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} animate-pulse`} />
          <Badge className="relative bg-white/90 text-gray-900 border-0">
            {showIcon && <Icon className="w-4 h-4 mr-1" />}
            {config.label}
          </Badge>
        </div>
      )

    default:
      return (
        <Badge className={cn(
          `bg-gradient-to-r ${config.gradient} text-white shadow-md hover:shadow-lg`,
          baseClasses
        )}>
          {showIcon && <Icon className="w-4 h-4 mr-1" />}
          {config.label}
        </Badge>
      )
  }
}

// Premium Highlight Border Component
interface PremiumHighlightProps {
  listingType: ListingType
  children: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
}

export const PremiumHighlight: React.FC<PremiumHighlightProps> = ({
  listingType,
  children,
  className = '',
  intensity = 'medium'
}) => {
  const config = listingTypeConfigs[listingType]

  if (listingType === 'BASIC') {
    return <div className={className}>{children}</div>
  }

  const intensityClasses = {
    subtle: 'border-2 shadow-sm',
    medium: 'border-3 shadow-md',
    strong: 'border-4 shadow-lg'
  }

  const glowClasses = {
    FEATURED: 'shadow-green-200/50',
    PREMIUM: 'shadow-blue-200/50',
    SPOTLIGHT: 'shadow-purple-200/50'
  }

  return (
    <div className={cn(
      'relative rounded-lg transition-all duration-300 hover:scale-[1.02]',
      config.borderColor,
      intensityClasses[intensity],
      listingType !== 'BASIC' && glowClasses[listingType as keyof typeof glowClasses],
      listingType === 'SPOTLIGHT' && 'bg-gradient-to-br from-purple-50/30 to-pink-50/30',
      className
    )}>
      {listingType === 'SPOTLIGHT' && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-red-400/10 rounded-lg animate-pulse" />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

// Premium Features List Component
interface PremiumFeaturesProps {
  listingType: ListingType
  showTitle?: boolean
  className?: string
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  listingType,
  showTitle = true,
  className = ''
}) => {
  const config = listingTypeConfigs[listingType]

  return (
    <div className={cn('space-y-2', className)}>
      {showTitle && (
        <div className="flex items-center mb-3">
          <config.icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
          <h4 className={`font-semibold ${config.textColor}`}>
            {config.label} Features
          </h4>
        </div>
      )}
      <ul className="space-y-1">
        {config.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-3 h-3 mr-2 text-yellow-500" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Premium Status Indicator
interface PremiumStatusProps {
  listingType: ListingType
  expiresAt?: Date
  className?: string
}

export const PremiumStatus: React.FC<PremiumStatusProps> = ({
  listingType,
  expiresAt,
  className = ''
}) => {
  const config = listingTypeConfigs[listingType]
  const isExpiringSoon = expiresAt && new Date(expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg border', config.bgColor, config.borderColor, className)}>
      <div className="flex items-center">
        <config.icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
        <div>
          <span className={`font-semibold ${config.textColor}`}>
            {config.label} Listing
          </span>
          {expiresAt && (
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Expires: {expiresAt.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      {isExpiringSoon && (
        <Badge variant="destructive" className="animate-pulse">
          Expiring Soon
        </Badge>
      )}
    </div>
  )
}

// Premium Upgrade Suggestion
interface UpgradeSuggestionProps {
  currentType: ListingType
  suggestedType: ListingType
  onUpgrade?: () => void
  className?: string
}

export const UpgradeSuggestion: React.FC<UpgradeSuggestionProps> = ({
  currentType,
  suggestedType,
  onUpgrade,
  className = ''
}) => {
  const currentConfig = listingTypeConfigs[currentType]
  const suggestedConfig = listingTypeConfigs[suggestedType]

  if (currentConfig.priority >= suggestedConfig.priority) {
    return null
  }

  return (
    <div className={cn(
      'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900">
              Upgrade to {suggestedConfig.label}
            </h4>
            <p className="text-sm text-gray-600">
              Get {suggestedConfig.features.length - currentConfig.features.length} more features
            </p>
          </div>
        </div>
        
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Upgrade Now
          </button>
        )}
      </div>
    </div>
  )
}

// Premium Listing Card Wrapper
interface PremiumListingCardProps {
  listingType: ListingType
  children: React.ReactNode
  showBadge?: boolean
  showHighlight?: boolean
  className?: string
}

export const PremiumListingCard: React.FC<PremiumListingCardProps> = ({
  listingType,
  children,
  showBadge = true,
  showHighlight = true,
  className = ''
}) => {
  return (
    <PremiumHighlight
      listingType={listingType}
      className={className}
      intensity={listingType === 'SPOTLIGHT' ? 'strong' : 'medium'}
    >
      <div className="relative">
        {showBadge && listingType !== 'BASIC' && (
          <div className="absolute top-3 left-3 z-10">
            <PremiumBadge
              listingType={listingType}
              variant="compact"
              animated={listingType === 'SPOTLIGHT'}
            />
          </div>
        )}
        {children}
      </div>
    </PremiumHighlight>
  )
}

export { listingTypeConfigs }
export type { ListingTypeConfig }