import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { paymentService } from '@/lib/payment-service'
import { z } from 'zod'

// Schema for payment intent creation
const createPaymentSchema = z.object({
  listingType: z.enum(['FEATURED', 'PREMIUM', 'SPOTLIGHT', 'FEATURED_RENTAL', 'PREMIUM_FLEET', 'SPOTLIGHT_RENTAL']),
  listingId: z.string().optional(),
  provider: z.enum(['stripe', 'mpesa']),
  phoneNumber: z.string().optional(),
  returnUrl: z.string().optional(),
})

// Schema for payment status update
const updatePaymentSchema = z.object({
  paymentIntentId: z.string(),
  status: z.string(),
  metadata: z.record(z.any()).optional(),
})

// GET - Retrieve user's payment history and pricing info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const listingType = searchParams.get('listingType')

    // Get pricing information
    if (action === 'pricing' && listingType) {
      const pricingInfo = paymentService.getPricingInfo(listingType as any)
      return NextResponse.json({ pricing: pricingInfo })
    }

    // Get user's payment history
    if (action === 'history') {
      const payments = await paymentService.getUserPayments(session.user.id)
      return NextResponse.json({ payments })
    }

    // Get payment by intent ID
    const paymentIntentId = searchParams.get('paymentIntentId')
    if (paymentIntentId) {
      const payment = await paymentService.getPaymentByIntentId(paymentIntentId)
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ payment })
    }

    // Default: return user's payment history
    const payments = await paymentService.getUserPayments(session.user.id)
    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Error in payments GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create payment intent
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

    const paymentRequest = {
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update payment status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updatePaymentSchema.parse(body)

    await paymentService.updatePaymentStatus(
      validatedData.paymentIntentId,
      validatedData.status,
      validatedData.metadata
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}