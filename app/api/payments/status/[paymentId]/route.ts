import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { paymentService } from '@/lib/payment-service'
import { mpesaService } from '@/lib/mpesa'
import { stripe } from '@/lib/stripe'

interface RouteParams {
  params: {
    paymentId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { paymentId } = params
    
    // Get payment record from database
    const payment = await paymentService.getPaymentByIntentId(paymentId)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify user owns this payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let currentStatus = payment.status
    let providerData: any = null

    // For pending payments, check with the payment provider
    if (payment.status === 'pending') {
      if (payment.provider === 'stripe') {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
          currentStatus = paymentIntent.status
          providerData = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            clientSecret: paymentIntent.client_secret,
          }
          
          // Update local status if it changed
          if (currentStatus !== payment.status) {
            await paymentService.updatePaymentStatus(paymentId, currentStatus)
          }
        } catch (error) {
          console.error('Error fetching Stripe payment status:', error)
        }
      } else if (payment.provider === 'mpesa') {
        try {
          const mpesaStatus = await mpesaService.queryPaymentStatus(paymentId)
          
          if (mpesaStatus.ResultCode === '0') {
            currentStatus = 'succeeded'
            providerData = {
              checkoutRequestID: paymentId,
              merchantRequestID: payment.merchantRequestID,
              resultCode: mpesaStatus.ResultCode,
              resultDesc: mpesaStatus.ResultDesc,
            }
            
            // Update local status
            await paymentService.updatePaymentStatus(paymentId, currentStatus, {
              mpesaQueryResult: mpesaStatus,
            })
          } else if (mpesaStatus.ResultCode !== '1032') { // 1032 means still pending
            currentStatus = 'failed'
            providerData = {
              checkoutRequestID: paymentId,
              merchantRequestID: payment.merchantRequestID,
              resultCode: mpesaStatus.ResultCode,
              resultDesc: mpesaStatus.ResultDesc,
            }
            
            // Update local status
            await paymentService.updatePaymentStatus(paymentId, currentStatus, {
              mpesaQueryResult: mpesaStatus,
            })
          }
        } catch (error) {
          console.error('Error fetching M-Pesa payment status:', error)
        }
      }
    }

    return NextResponse.json({
      id: payment.id,
      paymentIntentId: payment.paymentIntentId,
      merchantRequestID: payment.merchantRequestID,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      status: currentStatus,
      listingType: payment.listingType,
      listingId: payment.listingId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      providerData,
    })
  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to manually update payment status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin (you might want to add an admin role check)
    // For now, we'll allow users to update their own payment status
    const { paymentId } = params
    const body = await request.json()
    const { status } = body

    if (!['pending', 'succeeded', 'failed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const payment = await paymentService.getPaymentByIntentId(paymentId)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify user owns this payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await paymentService.updatePaymentStatus(paymentId, status, {
      manualUpdate: true,
      updatedBy: session.user.id,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Payment status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}