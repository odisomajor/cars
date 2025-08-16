import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { paymentService, CreatePaymentRequest } from '@/lib/payment-service'
import { z } from 'zod'

const createPaymentSchema = z.object({
  listingType: z.enum(['FEATURED', 'PREMIUM', 'SPOTLIGHT', 'FEATURED_RENTAL', 'PREMIUM_FLEET', 'SPOTLIGHT_RENTAL']),
  listingId: z.string().optional(),
  provider: z.enum(['stripe', 'mpesa']),
  phoneNumber: z.string().optional(),
  returnUrl: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // Validate phone number for M-Pesa payments
    if (validatedData.provider === 'mpesa' && !validatedData.phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required for M-Pesa payments' },
        { status: 400 }
      )
    }

    const paymentRequest: CreatePaymentRequest = {
      listingType: validatedData.listingType,
      userId: session.user.id,
      listingId: validatedData.listingId,
      provider: validatedData.provider,
      phoneNumber: validatedData.phoneNumber,
      returnUrl: validatedData.returnUrl,
    }

    const result = await paymentService.createPaymentIntent(paymentRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentIntent: result.paymentIntent,
      checkoutRequestID: result.checkoutRequestID,
      merchantRequestID: result.merchantRequestID,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve payment pricing information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingType = searchParams.get('listingType')

    if (!listingType) {
      return NextResponse.json(
        { error: 'listingType parameter is required' },
        { status: 400 }
      )
    }

    if (!['FEATURED', 'PREMIUM', 'SPOTLIGHT', 'FEATURED_RENTAL', 'PREMIUM_FLEET', 'SPOTLIGHT_RENTAL'].includes(listingType)) {
      return NextResponse.json(
        { error: 'Invalid listing type' },
        { status: 400 }
      )
    }

    const pricingInfo = paymentService.getPricingInfo(listingType as any)

    return NextResponse.json({
      listingType,
      pricing: pricingInfo,
    })
  } catch (error) {
    console.error('Pricing info error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}