'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Star, 
  Zap, 
  Calendar, 
  CreditCard, 
  Settings, 
  TrendingUp,
  Users,
  Car,
  BarChart3,
  Shield,
  Headphones
} from 'lucide-react'

interface Subscription {
  id: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  startDate: string
  endDate: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  autoRenew: boolean
  features: string[]
  usage: {
    listings: { used: number; limit: number }
    premiumListings: { used: number; limit: number }
    analytics: boolean
    support: string
  }
}

interface SubscriptionPlan {
  id: string
  name: string
  type: 'starter' | 'professional' | 'enterprise'
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    listings: number
    premiumListings: number
    analytics: boolean
    support: string
  }
  icon: React.ReactNode
  color: string
  popular?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    type: 'starter',
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    features: [
      'Up to 5 active listings',
      '1 premium listing per month',
      'Basic analytics',
      'Email support',
      'Mobile app access'
    ],
    limits: {
      listings: 5,
      premiumListings: 1,
      analytics: true,
      support: 'Email'
    },
    icon: <Star className="w-6 h-6" />,
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'professional',
    name: 'Professional',
    type: 'professional',
    monthlyPrice: 7500,
    yearlyPrice: 75000,
    features: [
      'Up to 25 active listings',
      '5 premium listings per month',
      'Advanced analytics & insights',
      'Priority email & chat support',
      'Custom branding options',
      'Lead management tools',
      'Social media integration'
    ],
    limits: {
      listings: 25,
      premiumListings: 5,
      analytics: true,
      support: 'Priority'
    },
    icon: <Zap className="w-6 h-6" />,
    color: 'from-blue-500 to-purple-600',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    features: [
      'Unlimited active listings',
      'Unlimited premium listings',
      'Advanced analytics & reporting',
      '24/7 phone & chat support',
      'Custom branding & white-label',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Multi-location management'
    ],
    limits: {
      listings: -1, // Unlimited
      premiumListings: -1, // Unlimited
      analytics: true,
      support: '24/7'
    },
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-600 to-pink-600'
  }
]

// Mock current subscription
const mockSubscription: Subscription = {
  id: 'sub_123',
  plan: 'professional',
  status: 'active',
  startDate: '2024-01-01',
  endDate: '2024-02-01',
  price: 7500,
  billingCycle: 'monthly',
  autoRenew: true,
  features: [
    'Up to 25 active listings',
    '5 premium listings per month',
    'Advanced analytics & insights',
    'Priority email & chat support'
  ],
  usage: {
    listings: { used: 12, limit: 25 },
    premiumListings: { used: 2, limit: 5 },
    analytics: true,
    support: 'Priority'
  }
}

export default function SubscriptionManagement() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription>(mockSubscription)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const getCurrentPlan = () => {
    return subscriptionPlans.find(plan => plan.type === currentSubscription.plan)
  }

  const handlePlanChange = async (planType: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    alert(`Successfully changed to ${planType} plan!`)
  }

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentSubscription(prev => ({ ...prev, status: 'cancelled', autoRenew: false }))
      setIsLoading(false)
      alert('Subscription cancelled successfully')
    }
  }

  const toggleAutoRenew = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCurrentSubscription(prev => ({ ...prev, autoRenew: !prev.autoRenew }))
    setIsLoading(false)
  }

  const currentPlan = getCurrentPlan()
  const daysUntilRenewal = Math.ceil(
    (new Date(currentSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Subscription Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your premium subscription and billing preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <Badge 
                  className={`${
                    currentSubscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                </Badge>
              </div>
              
              {currentPlan && (
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${currentPlan.color} flex items-center justify-center text-white`}>
                    {currentPlan.icon}
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold">{currentPlan.name}</h4>
                    <p className="text-2xl font-bold text-green-600">
                      KES {currentSubscription.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-600">/{currentSubscription.billingCycle}</span>
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {daysUntilRenewal > 0 
                          ? `Renews in ${daysUntilRenewal} days`
                          : 'Expired'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Auto-renew: {currentSubscription.autoRenew ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Usage Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Active Listings</span>
                    <span>{currentSubscription.usage.listings.used}/{currentSubscription.usage.listings.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(currentSubscription.usage.listings.used / currentSubscription.usage.listings.limit) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Premium Listings</span>
                    <span>{currentSubscription.usage.premiumListings.used}/{currentSubscription.usage.premiumListings.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(currentSubscription.usage.premiumListings.used / currentSubscription.usage.premiumListings.limit) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={toggleAutoRenew}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {currentSubscription.autoRenew ? 'Disable' : 'Enable'} Auto-Renew
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </Card>
          </div>

          {/* Available Plans */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">Available Plans</h3>
              
              {/* Billing Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Billing Cycle:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setBillingCycle('yearly')}
                  >
                    Yearly (Save 17%)
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                const isCurrentPlan = plan.type === currentSubscription.plan
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative p-6 ${
                      isCurrentPlan 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg transition-shadow'
                    } ${
                      plan.popular ? 'border-blue-500' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-500 text-white px-3 py-1">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                      {plan.icon}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">KES {price.toLocaleString()}</span>
                        <span className="text-gray-600">/{billingCycle}</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Save KES {((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString()} per year
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        isCurrentPlan
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={() => !isCurrentPlan && handlePlanChange(plan.type)}
                      disabled={isCurrentPlan || isLoading}
                    >
                      {isCurrentPlan 
                        ? 'Current Plan' 
                        : isLoading 
                          ? 'Processing...' 
                          : `Upgrade to ${plan.name}`
                      }
                    </Button>
                  </Card>
                )
              })}
            </div>
            
            {/* Feature Comparison */}
            <Card className="mt-8 p-6">
              <h3 className="text-xl font-bold mb-6">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Starter</th>
                      <th className="text-center py-3 px-4">Professional</th>
                      <th className="text-center py-3 px-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Active Listings
                      </td>
                      <td className="text-center py-3 px-4">5</td>
                      <td className="text-center py-3 px-4">25</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Premium Listings
                      </td>
                      <td className="text-center py-3 px-4">1/month</td>
                      <td className="text-center py-3 px-4">5/month</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </td>
                      <td className="text-center py-3 px-4">Basic</td>
                      <td className="text-center py-3 px-4">Advanced</td>
                      <td className="text-center py-3 px-4">Advanced + API</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        Support
                      </td>
                      <td className="text-center py-3 px-4">Email</td>
                      <td className="text-center py-3 px-4">Priority</td>
                      <td className="text-center py-3 px-4">24/7 + Phone</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Custom Branding
                      </td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅ + White-label</td>
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