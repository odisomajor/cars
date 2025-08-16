import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe configuration for different environments
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: 'usd', // Primary currency for international payments
  localCurrency: 'kes', // Kenyan Shilling for local pricing display
}

// Premium listing pricing in USD cents
export const LISTING_PRICES = {
  FEATURED: 1000, // $10.00
  PREMIUM: 2500,  // $25.00
  SPOTLIGHT: 5000, // $50.00
  // Rental pricing
  FEATURED_RENTAL: 1500, // $15.00
  PREMIUM_FLEET: 3500,   // $35.00
  SPOTLIGHT_RENTAL: 6000, // $60.00
} as const

// Convert USD to KES (approximate rate - should be fetched from API in production)
export const USD_TO_KES_RATE = 150

export const convertUSDToKES = (usdCents: number): number => {
  return Math.round((usdCents / 100) * USD_TO_KES_RATE)
}

export const formatPrice = (cents: number, currency: 'usd' | 'kes' = 'kes'): string => {
  if (currency === 'kes') {
    const kesAmount = convertUSDToKES(cents)
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(kesAmount)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

// Stripe webhook signature verification
export const verifyStripeSignature = (payload: string, signature: string): Stripe.Event => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
}

export type ListingType = keyof typeof LISTING_PRICES
export type PaymentCurrency = 'usd' | 'kes'