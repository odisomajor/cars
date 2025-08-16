'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subscription {
  id: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  amount: number
  interval: 'month' | 'year'
  autoRenew: boolean
  features: string[]
  nextBillingDate: string
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank'
    last4?: string
    brand?: string
  }
}

interface SubscriptionManagerProps {
  subscription: Subscription
  availablePlans: Array<{
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    features: string[]
  }>
  onUpdatePlan?: (planId: string) => void
  onCancelSubscription?: () => void
  onReactivateSubscription?: () => void
  onUpdatePaymentMethod?: () => void
  onToggleAutoRenew?: (enabled: boolean) => void
  className?: string
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  subscription,
  availablePlans,
  onUpdatePlan,
  onCancelSubscription,
  onReactivateSubscription,
  onUpdatePaymentMethod,
  onToggleAutoRenew,
  className
}) => {
  const [selectedPlan, setSelectedPlan] = useState(subscription.planName)

  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount / 100) // Assuming amount is in cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'trialing':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodDisplay = () => {
    const { type, last4, brand } = subscription.paymentMethod
    if (type === 'card' && brand && last4) {
      return `${brand.toUpperCase()} •••• ${last4}`
    }
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          Manage your subscription plan and billing settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Subscription Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{subscription.planName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(subscription.status)}
                <Badge className={cn('text-xs', getStatusColor(subscription.status))}>
                  {subscription.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(subscription.amount)}
              </div>
              <div className="text-sm text-gray-600">
                per {subscription.interval}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Current Period:</span>
              <div className="font-medium">
                {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Next Billing:</span>
              <div className="font-medium">
                {formatDate(subscription.nextBillingDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div>
          <h4 className="font-medium mb-2">Current Plan Features</h4>
          <ul className="space-y-1">
            {subscription.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Method */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <div>
              <div className="font-medium">Payment Method</div>
              <div className="text-sm text-gray-600">
                {getPaymentMethodDisplay()}
              </div>
            </div>
          </div>
          {onUpdatePaymentMethod && (
            <Button variant="outline" size="sm" onClick={onUpdatePaymentMethod}>
              Update
            </Button>
          )}
        </div>

        {/* Auto-Renewal Setting */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <div>
              <Label htmlFor="auto-renew" className="font-medium">
                Auto-Renewal
              </Label>
              <div className="text-sm text-gray-600">
                Automatically renew subscription
              </div>
            </div>
          </div>
          <Switch
            id="auto-renew"
            checked={subscription.autoRenew}
            onCheckedChange={onToggleAutoRenew}
          />
        </div>

        {/* Plan Change */}
        {onUpdatePlan && availablePlans.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Change Plan</h4>
            <div className="flex gap-2">
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name} - {formatCurrency(plan.price)}/{plan.interval}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  const plan = availablePlans.find(p => p.name === selectedPlan)
                  if (plan) onUpdatePlan(plan.id)
                }}
                disabled={selectedPlan === subscription.planName}
              >
                Update Plan
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {subscription.status === 'active' && onCancelSubscription && (
            <Button variant="destructive" onClick={onCancelSubscription}>
              Cancel Subscription
            </Button>
          )}
          {subscription.status === 'cancelled' && onReactivateSubscription && (
            <Button onClick={onReactivateSubscription}>
              Reactivate Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionManager