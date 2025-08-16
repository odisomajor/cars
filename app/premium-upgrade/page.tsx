'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Zap, Crown, TrendingUp, Eye, Calendar, MapPin } from 'lucide-react'
import { PremiumBadge } from '../../components'

interface UpgradePlan {
  id: string
  name: string
  type: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
  price: number
  duration: number
  features: string[]
  benefits: string[]
  icon: React.ReactNode
  popular?: boolean
  color: string
}

const upgradePlans: UpgradePlan[] = [
  {
    id: 'featured',
    name: 'Featured Listing',
    type: 'FEATURED',
    price: 2500,
    duration: 30,
    features: [
      'Featured in carousel',
      '3x more visibility',
      'Priority in search results',
      'Featured badge',
      'Email notifications'
    ],
    benefits: [
      'Increased visibility by 300%',
      'Higher click-through rates',
      'Faster selling time'
    ],
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'premium',
    name: 'Premium Listing',
    type: 'PREMIUM',
    price: 5000,
    duration: 30,
    features: [
      'All Featured benefits',
      'Premium badge',
      'Enhanced listing details',
      'Priority customer support',
      'Analytics dashboard',
      'Social media promotion'
    ],
    benefits: [
      'Increased visibility by 500%',
      'Professional appearance',
      'Detailed performance metrics',
      'Social media exposure'
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'spotlight',
    name: 'Spotlight Listing',
    type: 'SPOTLIGHT',
    price: 10000,
    duration: 30,
    features: [
      'All Premium benefits',
      'Spotlight badge',
      'Top of search results',
      'Homepage banner placement',
      'Dedicated account manager',
      'Custom promotional content',
      'Multi-platform advertising'
    ],
    benefits: [
      'Maximum visibility boost',
      'Premium positioning',
      'Professional marketing support',
      'Cross-platform promotion'
    ],
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-600 to-pink-600'
  }
]

const mockListing = {
  id: '1',
  title: '2023 Toyota Camry Hybrid',
  price: 2850000,
  images: ['/api/placeholder/400/300'],
  location: 'Nairobi, Kenya',
  year: 2023,
  mileage: 15000,
  currentType: 'BASIC' as const,
  views: 45,
  inquiries: 3,
  createdAt: '2024-01-15'
}

export default function PremiumUpgrade() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    alert(`Successfully upgraded to ${planId.toUpperCase()} plan!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Upgrade Your Listing
            </h1>
            <p className="mt-2 text-gray-600">
              Boost your listing's visibility and sell faster with our premium plans
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Listing Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Current Listing</h3>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={mockListing.images[0]} 
                    alt={mockListing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{mockListing.title}</h4>
                    <Badge variant="outline">Basic</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    KES {mockListing.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {mockListing.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {mockListing.year}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Current Performance</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{mockListing.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inquiries:</span>
                      <span className="font-medium">{mockListing.inquiries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Active:</span>
                      <span className="font-medium">10</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Upgrade Plans */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upgradePlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative p-6 cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  } ${
                    plan.popular ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                    {plan.icon}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">KES {plan.price.toLocaleString()}</span>
                      <span className="text-gray-600">/{plan.duration} days</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <PremiumBadge type={plan.type} variant="default" />
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-sm text-gray-900">Features:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-sm text-gray-900">Benefits:</h4>
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      selectedPlan === plan.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpgrade(plan.id)
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlan === plan.id 
                      ? 'Processing...' 
                      : `Upgrade to ${plan.name}`
                    }
                  </Button>
                </Card>
              ))}
            </div>
            
            {/* Comparison Table */}
            <Card className="mt-8 p-6">
              <h3 className="text-xl font-bold mb-6">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Basic</th>
                      <th className="text-center py-3 px-4">Featured</th>
                      <th className="text-center py-3 px-4">Premium</th>
                      <th className="text-center py-3 px-4">Spotlight</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4">Listing Duration</td>
                      <td className="text-center py-3 px-4">30 days</td>
                      <td className="text-center py-3 px-4">30 days</td>
                      <td className="text-center py-3 px-4">30 days</td>
                      <td className="text-center py-3 px-4">30 days</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Visibility Boost</td>
                      <td className="text-center py-3 px-4">1x</td>
                      <td className="text-center py-3 px-4">3x</td>
                      <td className="text-center py-3 px-4">5x</td>
                      <td className="text-center py-3 px-4">10x</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Featured Badge</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Analytics Dashboard</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Priority Support</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Homepage Banner</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}