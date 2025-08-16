import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyStripeSignature } from '@/lib/stripe'
import { paymentService } from '@/lib/payment-service'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event
    
    try {
      event = verifyStripeSignature(body, signature)
    } catch (error) {
      console.error('Stripe signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id)
    
    // Update payment status
    await paymentService.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
      {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }
    )

    // Get payment record to update listing
    const payment = await paymentService.getPaymentByIntentId(paymentIntent.id)
    
    if (payment && payment.listingId) {
      // Update listing to premium status
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: {
          listingType: payment.listingType.toLowerCase(),
          updatedAt: new Date(),
        },
      })
      
      console.log(`Updated listing ${payment.listingId} to ${payment.listingType}`)
    }

    // TODO: Send confirmation email to user
    // TODO: Send notification to user
    
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id)
    
    await paymentService.updatePaymentStatus(
      paymentIntent.id,
      'failed',
      {
        stripePaymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message,
      }
    )

    // TODO: Send failure notification to user
    
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment canceled:', paymentIntent.id)
    
    await paymentService.updatePaymentStatus(
      paymentIntent.id,
      'cancelled',
      {
        stripePaymentIntentId: paymentIntent.id,
      }
    )

    // TODO: Send cancellation notification to user
    
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs'
export const preferredRegion = 'auto'