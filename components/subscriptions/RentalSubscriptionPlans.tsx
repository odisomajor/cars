'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Check,
  X,
  Star,
  Crown,
  Zap,
  Building,
  Car,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Globe,
  Smartphone,
  CreditCard,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Percent,
  Clock,
  MapPin,
  Phone,
  Mail,
  Settings,
  ChevronRight,
  ArrowRight,
  Gift,
  Sparkles,
  Rocket,
  Diamond
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: {
    name: string
    included: boolean
    limit?: number
    description?: string
  }[]
  limits: {
    listings: number
    photos: number
    videos: number
    analytics: boolean
    support: 'basic' | 'priority' | '24/7'
    api: boolean
    customBranding: boolean
    multiLocation: boolean
  }
  popular?: boolean
  recommended?: boolean
  color: string
  icon: React.ComponentType<{ className?: string }>
}

interface UserSubscription {
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  billingCycle: 'monthly' | 'yearly'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  usage: {
    listings: number
    photos: number
    videos: number
    apiCalls: number
  }
  autoRenew: boolean
}

interface RentalSubscriptionPlansProps {
  className?: string
  currentSubscription?: UserSubscription
  onPlanSelect?: (planId: string, billingCycle: 'monthly' | 'yearly') => void
  onUpgrade?: (planId: string) => void
  onCancel?: () => void
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small rental businesses getting started',
    price: {
      monthly: 29,
      yearly: 290
    },
    features: [
      { name: 'Up to 10 vehicle listings', included: true, limit: 10 },
      { name: 'Basic photo uploads', included: true, limit: 5, description: '5 photos per listing' },
      { name: 'Standard listing visibility', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Video uploads', included: false },
      { name: 'Priority placement', included: false },
      { name: 'Custom branding', included: false },
      { name: 'API access', included: false }
    ],
    limits: {
      listings: 10,
      photos: 5,
      videos: 0,
      analytics: true,
      support: 'basic',
      api: false,
      customBranding: false,
      multiLocation: false
    },
    color: 'border-gray-200',
    icon: Building
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing rental companies with multiple vehicles',
    price: {
      monthly: 79,
      yearly: 790
    },
    features: [
      { name: 'Up to 50 vehicle listings', included: true, limit: 50 },
      { name: 'Enhanced photo uploads', included: true, limit: 15, description: '15 photos per listing' },
      { name: 'Video uploads', included: true, limit: 3, description: '3 videos per listing' },
      { name: 'Priority listing placement', included: true },
      { name: 'Advanced analytics & insights', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'Mobile app with notifications', included: true },
      { name: 'Basic API access', included: true },
      { name: 'Custom branding', included: false },
      { name: 'Multi-location management', included: false }
    ],
    limits: {
      listings: 50,
      photos: 15,
      videos: 3,
      analytics: true,
      support: 'priority',
      api: true,
      customBranding: false,
      multiLocation: false
    },
    popular: true,
    color: 'border-blue-200 bg-blue-50',
    icon: Star
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large rental companies and franchises',
    price: {
      monthly: 199,
      yearly: 1990
    },
    features: [
      { name: 'Unlimited vehicle listings', included: true },
      { name: 'Unlimited photo uploads', included: true },
      { name: 'Unlimited video uploads', included: true },
      { name: 'Spotlight placement & featured listings', included: true },
      { name: 'Comprehensive analytics suite', included: true },
      { name: '24/7 phone & chat support', included: true },
      { name: 'White-label mobile app', included: true },
      { name: 'Full API access with webhooks', included: true },
      { name: 'Complete custom branding', included: true },
      { name: 'Multi-location management', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom integrations', included: true }
    ],
    limits: {
      listings: -1, // unlimited
      photos: -1,
      videos: -1,
      analytics: true,
      support: '24/7',
      api: true,
      customBranding: true,
      multiLocation: true
    },
    recommended: true,
    color: 'border-purple-200 bg-purple-50',
    icon: Crown
  }
]

export const RentalSubscriptionPlans: React.FC<RentalSubscriptionPlansProps> = ({
  className = '',
  currentSubscription,
  onPlanSelect,
  onUpgrade,
  onCancel
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    setLoading(true)
    setSelectedPlan(planId)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      onPlanSelect?.(planId, billingCycle)
      toast.success('Subscription plan selected successfully!')
    } catch (error) {
      toast.error('Failed to select plan. Please try again.')
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    setSelectedPlan(planId)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      onUpgrade?.(planId)
      toast.success('Plan upgraded successfully!')
    } catch (error) {
      toast.error('Failed to upgrade plan. Please try again.')
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const getCurrentPlan = () => {
    if (!currentSubscription) return null
    return SUBSCRIPTION_PLANS.find(plan => plan.id === currentSubscription.planId)
  }

  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price.monthly * 12
    const savings = monthlyTotal - plan.price.yearly
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { amount: savings, percentage }
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect subscription plan for your rental business. 
          Upgrade or downgrade anytime with no long-term commitments.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
          <Label 
            htmlFor="billing-toggle" 
            className={cn(
              'px-4 py-2 rounded-md cursor-pointer transition-colors',
              billingCycle === 'monthly' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600'
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label 
            htmlFor="billing-toggle" 
            className={cn(
              'px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2',
              billingCycle === 'yearly' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600'
            )}
          >
            Yearly
            <Badge variant="secondary" className="text-xs">
              Save up to 17%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && currentPlan && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <currentPlan.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Current Plan: {currentPlan.name}</h3>
                  <p className="text-gray-600">
                    {currentSubscription.status === 'active' ? 'Active' : 'Inactive'} • 
                    {currentSubscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} billing
                  </p>
                  <p className="text-sm text-gray-500">
                    Next billing: {currentSubscription.currentPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
                {currentSubscription.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            {/* Usage Progress */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Listings</span>
                  <span>{currentSubscription.usage.listings}/{currentPlan.limits.listings === -1 ? '∞' : currentPlan.limits.listings}</span>
                </div>
                <Progress 
                  value={currentPlan.limits.listings === -1 ? 0 : (currentSubscription.usage.listings / currentPlan.limits.listings) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Photos Used</span>
                  <span>{currentSubscription.usage.photos}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Calls</span>
                  <span>{currentSubscription.usage.apiCalls.toLocaleString()}</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const PlanIcon = plan.icon
          const savings = getYearlySavings(plan)
          const isCurrentPlan = currentPlan?.id === plan.id
          const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly
          const monthlyPrice = billingCycle === 'yearly' ? plan.price.yearly / 12 : plan.price.monthly
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                'relative transition-all duration-200 hover:shadow-lg',
                plan.color,
                plan.popular && 'ring-2 ring-blue-500',
                plan.recommended && 'ring-2 ring-purple-500',
                isCurrentPlan && 'ring-2 ring-green-500'
              )}
            >
              {/* Plan Badges */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                {plan.popular && (
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                {plan.recommended && (
                  <Badge className="bg-purple-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                )}
              </div>

              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-gray-100 rounded-lg w-fit mb-4">
                  <PlanIcon className="w-8 h-8 text-gray-700" />
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-gray-600">{plan.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">KES {Math.round(monthlyPrice * 150)}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  {billingCycle === 'yearly' && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
        KES {plan.price.yearly * 150}/year
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Save KES {savings.amount * 150} ({savings.percentage}%)
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className={cn(
                          'text-sm',
                          feature.included ? 'text-gray-900' : 'text-gray-500'
                        )}>
                          {feature.name}
                        </span>
                        {feature.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : currentPlan && SUBSCRIPTION_PLANS.findIndex(p => p.id === currentPlan.id) < SUBSCRIPTION_PLANS.findIndex(p => p.id === plan.id) ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading && selectedPlan === plan.id}
                    >
                      {loading && selectedPlan === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Upgrading...
                        </div>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.popular || plan.recommended ? 'default' : 'outline'}
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={loading && selectedPlan === plan.id}
                    >
                      {loading && selectedPlan === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Selecting...
                        </div>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Features</th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="text-center py-3 px-4 min-w-32">
                      <div className="flex flex-col items-center gap-1">
                        <plan.icon className="w-5 h-5" />
                        <span className="font-semibold">{plan.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Vehicle Listings</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.listings === -1 ? 'Unlimited' : plan.limits.listings}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Photos per Listing</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.photos === -1 ? 'Unlimited' : plan.limits.photos}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Video Uploads</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.videos === 0 ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : plan.limits.videos === -1 ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        plan.limits.videos
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Analytics</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.analytics ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Support Level</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4 capitalize">
                      {plan.limits.support}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">API Access</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.api ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Custom Branding</td>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.limits.customBranding ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate the billing accordingly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What happens if I exceed my limits?</h4>
              <p className="text-gray-600 text-sm">
                We'll notify you when you're approaching your limits. You can upgrade your plan 
                or purchase additional resources as needed.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Yes, all plans come with a 14-day free trial. No credit card required to start, 
                and you can cancel anytime during the trial period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. 
                All payments are processed securely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RentalSubscriptionPlans