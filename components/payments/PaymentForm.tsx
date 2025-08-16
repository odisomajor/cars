'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Smartphone, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  listingType: 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT' | 'FEATURED_RENTAL' | 'PREMIUM_FLEET' | 'SPOTLIGHT_RENTAL'
  listingId?: string
  onSuccess?: (paymentResult: any) => void
  onCancel?: () => void
}

interface PricingInfo {
  usd: { cents: number; formatted: string }
  kes: { amount: number; formatted: string }
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  listingType,
  listingId,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mpesa'>('stripe')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pricing, setPricing] = useState<PricingInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')

  useEffect(() => {
    fetchPricing()
  }, [listingType])

  const fetchPricing = async () => {
    try {
      const response = await fetch(`/api/payments/create?listingType=${listingType}`)
      const data = await response.json()
      
      if (data.pricing) {
        setPricing(data.pricing)
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
    }
  }

  const handlePaymentMethodChange = (method: 'stripe' | 'mpesa') => {
    setPaymentMethod(method)
    setError(null)
  }

  const validatePhoneNumber = (phone: string): boolean => {
    // Kenyan phone number validation
    const phoneRegex = /^(?:\+254|254|0)?([17]\d{8})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const createPayment = async () => {
    if (paymentMethod === 'mpesa' && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number')
      return null
    }

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingType,
          listingId,
          provider: paymentMethod,
          phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
        }),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed')
      }

      return data
    } catch (error) {
      console.error('Payment creation error:', error)
      throw error
    }
  }

  const handleMpesaPayment = async () => {
    setIsLoading(true)
    setError(null)
    setPaymentStatus('processing')

    try {
      const paymentData = await createPayment()
      
      if (paymentData.checkoutRequestID) {
        toast.success('M-Pesa payment initiated! Please check your phone for the payment prompt.')
        
        // Poll for payment status
        pollPaymentStatus(paymentData.checkoutRequestID)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'M-Pesa payment failed')
      setPaymentStatus('failed')
      toast.error('M-Pesa payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${paymentId}`)
        const data = await response.json()

        if (data.status === 'succeeded') {
          setPaymentStatus('success')
          toast.success('Payment successful!')
          onSuccess?.(data)
          return
        } else if (data.status === 'failed') {
          setPaymentStatus('failed')
          setError('Payment failed. Please try again.')
          toast.error('Payment failed')
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000) // Check every 10 seconds
        } else {
          setPaymentStatus('failed')
          setError('Payment timeout. Please check your payment status manually.')
          toast.error('Payment timeout')
        }
      } catch (error) {
        console.error('Status check error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000)
        }
      }
    }

    checkStatus()
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to make a payment.
        </AlertDescription>
      </Alert>
    )
  }

  if (!pricing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading pricing...</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Upgrade to {listingType.replace('_', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {pricing.usd.formatted}
          </div>
          <div className="text-sm text-gray-600">
            ≈ {pricing.kes.formatted}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handlePaymentMethodChange('stripe')}
              className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                paymentMethod === 'stripe'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Card</span>
            </button>
            <button
              type="button"
              onClick={() => handlePaymentMethodChange('mpesa')}
              className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                paymentMethod === 'mpesa'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-sm">M-Pesa</span>
            </button>
          </div>
        </div>

        {/* Payment Forms */}
        {paymentMethod === 'stripe' ? (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              listingType={listingType}
              listingId={listingId}
              pricing={pricing}
              onSuccess={onSuccess}
              onError={setError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </Elements>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                M-Pesa Phone Number
              </label>
              <Input
                type="tel"
                placeholder="0712345678 or +254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={error && !validatePhoneNumber(phoneNumber) ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Safaricom number to receive payment prompt
              </p>
            </div>

            <Button
              onClick={handleMpesaPayment}
              disabled={isLoading || !phoneNumber || paymentStatus === 'processing'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initiating M-Pesa Payment...
                </>
              ) : paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Waiting for Payment...
                </>
              ) : (
                `Pay ${pricing.kes.formatted} via M-Pesa`
              )}
            </Button>
          </div>
        )}

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your listing has been upgraded.
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'failed' && error && (
          <Alert className="border-red-500 bg-red-50">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
            disabled={isLoading || paymentStatus === 'processing'}
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Stripe Payment Form Component
interface StripePaymentFormProps {
  listingType: string
  listingId?: string
  pricing: PricingInfo
  onSuccess?: (paymentResult: any) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  listingType,
  listingId,
  pricing,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
}) => {
  const stripe = useStripe()
  const elements = useElements()

  const handleStripePayment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    onError('')

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingType,
          listingId,
          provider: 'stripe',
        }),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed')
      }

      const { paymentIntent } = data
      
      // Confirm payment
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      if (confirmedPayment?.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess?.(confirmedPayment)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleStripePayment} className="space-y-4">
      <div className="p-3 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          `Pay ${pricing.usd.formatted}`
        )}
      </Button>
    </form>
  )
}

export default PaymentForm