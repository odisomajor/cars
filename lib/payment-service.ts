import { stripe, LISTING_PRICES, convertUSDToKES, ListingType } from './stripe'
import { mpesaService, convertUSDToKESForMpesa, MpesaPaymentRequest, PaymentProvider } from './mpesa'
import { prisma } from './prisma'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
  provider: PaymentProvider
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
  checkoutRequestID?: string
  merchantRequestID?: string
}

export interface CreatePaymentRequest {
  listingType: ListingType
  userId: string
  listingId?: string
  provider: PaymentProvider
  phoneNumber?: string // Required for M-Pesa
  returnUrl?: string
}

class PaymentService {
  async createPaymentIntent(request: CreatePaymentRequest): Promise<PaymentResult> {
    try {
      const amount = LISTING_PRICES[request.listingType]
      
      if (request.provider === 'stripe') {
        return await this.createStripePayment({
          amount,
          userId: request.userId,
          listingId: request.listingId,
          listingType: request.listingType,
          returnUrl: request.returnUrl,
        })
      } else if (request.provider === 'mpesa') {
        if (!request.phoneNumber) {
          return {
            success: false,
            error: 'Phone number is required for M-Pesa payments',
          }
        }
        
        return await this.createMpesaPayment({
          amount,
          userId: request.userId,
          listingId: request.listingId,
          listingType: request.listingType,
          phoneNumber: request.phoneNumber,
        })
      }
      
      return {
        success: false,
        error: 'Unsupported payment provider',
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      }
    }
  }

  private async createStripePayment({
    amount,
    userId,
    listingId,
    listingType,
    returnUrl,
  }: {
    amount: number
    userId: string
    listingId?: string
    listingType: ListingType
    returnUrl?: string
  }): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          userId,
          listingId: listingId || '',
          listingType,
          provider: 'stripe',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // Store payment record in database
      await this.createPaymentRecord({
        paymentIntentId: paymentIntent.id,
        userId,
        listingId,
        amount,
        currency: 'usd',
        provider: 'stripe',
        status: 'pending',
        listingType,
      })

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret,
          provider: 'stripe',
          metadata: paymentIntent.metadata,
        },
      }
    } catch (error) {
      console.error('Stripe payment error:', error)
      throw error
    }
  }

  private async createMpesaPayment({
    amount,
    userId,
    listingId,
    listingType,
    phoneNumber,
  }: {
    amount: number
    userId: string
    listingId?: string
    listingType: ListingType
    phoneNumber: string
  }): Promise<PaymentResult> {
    try {
      const kesAmount = convertUSDToKESForMpesa(amount)
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`
      
      const mpesaRequest: MpesaPaymentRequest = {
        phoneNumber,
        amount: kesAmount,
        accountReference: `LISTING_${listingType}_${Date.now()}`,
        transactionDesc: `Payment for ${listingType} listing upgrade`,
        callbackUrl,
      }

      const response = await mpesaService.initiatePayment(mpesaRequest)

      // Store payment record in database
      await this.createPaymentRecord({
        paymentIntentId: response.checkoutRequestID,
        userId,
        listingId,
        amount: kesAmount,
        currency: 'kes',
        provider: 'mpesa',
        status: 'pending',
        listingType,
        merchantRequestID: response.merchantRequestID,
      })

      return {
        success: true,
        checkoutRequestID: response.checkoutRequestID,
        merchantRequestID: response.merchantRequestID,
        paymentIntent: {
          id: response.checkoutRequestID,
          amount: kesAmount,
          currency: 'kes',
          status: 'pending',
          provider: 'mpesa',
        },
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error)
      throw error
    }
  }

  private async createPaymentRecord({
    paymentIntentId,
    userId,
    listingId,
    amount,
    currency,
    provider,
    status,
    listingType,
    merchantRequestID,
  }: {
    paymentIntentId: string
    userId: string
    listingId?: string
    amount: number
    currency: string
    provider: PaymentProvider
    status: string
    listingType: ListingType
    merchantRequestID?: string
  }) {
    try {
      await prisma.payment.create({
        data: {
          paymentIntentId,
          userId,
          listingId,
          amount,
          currency,
          provider,
          status,
          listingType,
          merchantRequestID,
          createdAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to create payment record:', error)
      // Don't throw here as the payment might still succeed
    }
  }

  async updatePaymentStatus(paymentIntentId: string, status: string, metadata?: Record<string, any>) {
    try {
      await prisma.payment.update({
        where: { paymentIntentId },
        data: {
          status,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  async getPaymentByIntentId(paymentIntentId: string) {
    try {
      return await prisma.payment.findUnique({
        where: { paymentIntentId },
        include: {
          user: true,
          listing: true,
        },
      })
    } catch (error) {
      console.error('Failed to get payment:', error)
      return null
    }
  }

  async getUserPayments(userId: string) {
    try {
      return await prisma.payment.findMany({
        where: { userId },
        include: {
          listing: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } catch (error) {
      console.error('Failed to get user payments:', error)
      return []
    }
  }

  // Helper method to get pricing information
  getPricingInfo(listingType: ListingType) {
    const usdPrice = LISTING_PRICES[listingType]
    const kesPrice = convertUSDToKES(usdPrice)
    
    return {
      usd: {
        cents: usdPrice,
        formatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(usdPrice / 100),
      },
      kes: {
        amount: kesPrice,
        formatted: new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(kesPrice),
      },
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()

// Export types
export type { ListingType, PaymentProvider }