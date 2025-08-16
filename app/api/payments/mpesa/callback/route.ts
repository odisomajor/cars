import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment-service'
import { prisma } from '@/lib/prisma'

interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MpesaCallbackData = await request.json()
    const callback = body.Body.stkCallback
    
    console.log('M-Pesa callback received:', {
      merchantRequestID: callback.MerchantRequestID,
      checkoutRequestID: callback.CheckoutRequestID,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
    })

    // Get payment record
    const payment = await paymentService.getPaymentByIntentId(callback.CheckoutRequestID)
    
    if (!payment) {
      console.error('Payment not found for checkout request ID:', callback.CheckoutRequestID)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (callback.ResultCode === 0) {
      // Payment successful
      await handleMpesaPaymentSuccess(callback, payment)
    } else {
      // Payment failed
      await handleMpesaPaymentFailure(callback, payment)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Failed to process callback' },
      { status: 500 }
    )
  }
}

async function handleMpesaPaymentSuccess(callback: any, payment: any) {
  try {
    // Extract payment details from callback metadata
    const metadata: Record<string, any> = {}
    
    if (callback.CallbackMetadata?.Item) {
      callback.CallbackMetadata.Item.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            metadata.amount = item.Value
            break
          case 'MpesaReceiptNumber':
            metadata.mpesaReceiptNumber = item.Value
            break
          case 'TransactionDate':
            metadata.transactionDate = item.Value
            break
          case 'PhoneNumber':
            metadata.phoneNumber = item.Value
            break
        }
      })
    }

    console.log('M-Pesa payment succeeded:', {
      checkoutRequestID: callback.CheckoutRequestID,
      receiptNumber: metadata.mpesaReceiptNumber,
      amount: metadata.amount,
    })

    // Update payment status
    await paymentService.updatePaymentStatus(
      callback.CheckoutRequestID,
      'succeeded',
      {
        mpesaReceiptNumber: metadata.mpesaReceiptNumber,
        transactionDate: metadata.transactionDate,
        phoneNumber: metadata.phoneNumber,
        merchantRequestID: callback.MerchantRequestID,
        resultDesc: callback.ResultDesc,
      }
    )

    // Update listing to premium status if applicable
    if (payment.listingId) {
      await prisma.listing.update({
        where: { id: payment.listingId },
        data: {
          listingType: payment.listingType.toLowerCase(),
          updatedAt: new Date(),
        },
      })
      
      console.log(`Updated listing ${payment.listingId} to ${payment.listingType}`)
    }

    // TODO: Send confirmation SMS to user
    // TODO: Send confirmation email to user
    
  } catch (error) {
    console.error('Error handling M-Pesa payment success:', error)
  }
}

async function handleMpesaPaymentFailure(callback: any, payment: any) {
  try {
    console.log('M-Pesa payment failed:', {
      checkoutRequestID: callback.CheckoutRequestID,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
    })

    // Update payment status
    await paymentService.updatePaymentStatus(
      callback.CheckoutRequestID,
      'failed',
      {
        merchantRequestID: callback.MerchantRequestID,
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        failureReason: callback.ResultDesc,
      }
    )

    // TODO: Send failure notification to user
    
  } catch (error) {
    console.error('Error handling M-Pesa payment failure:', error)
  }
}

// M-Pesa requires specific response format
export const runtime = 'nodejs'
export const preferredRegion = 'auto'