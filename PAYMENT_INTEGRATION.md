# Payment Integration Guide

This guide covers the implementation of payment processing for listing upgrades using Stripe (international) and M-Pesa (Kenya) payment methods.

## Overview

The payment system supports:
- **Stripe**: Credit/debit card payments for international users
- **M-Pesa**: Mobile money payments for Kenyan users
- Multiple listing upgrade tiers
- Real-time payment status tracking
- Webhook handling for payment confirmations
- Payment history and analytics

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# M-Pesa Configuration
MPESA_CONSUMER_KEY="your_mpesa_consumer_key"
MPESA_CONSUMER_SECRET="your_mpesa_consumer_secret"
MPESA_BUSINESS_SHORT_CODE="174379"
MPESA_PASSKEY="your_mpesa_passkey"
MPESA_CALLBACK_URL="https://yourdomain.com/api/payments/mpesa/callback"
MPESA_ENVIRONMENT="sandbox" # or "production"
```

### 2. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks:
   - Endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
4. Copy the webhook signing secret

### 3. M-Pesa Setup (Kenya)

1. Register for Safaricom Daraja API at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app and get Consumer Key and Consumer Secret
3. For production:
   - Apply for Go-Live approval
   - Get production credentials
   - Set up Till Number or Paybill

### 4. Database Migration

The payment system requires a `Payment` model. Run:

```bash
npx prisma db push
```

## Listing Types and Pricing

### Car Sales
- **Featured Listing**: $9.99 USD (≈ 1,499 KES)
- **Premium Listing**: $19.99 USD (≈ 2,999 KES)
- **Spotlight Listing**: $29.99 USD (≈ 4,499 KES)

### Car Rentals
- **Featured Rental**: $7.99 USD (≈ 1,199 KES)
- **Premium Fleet**: $15.99 USD (≈ 2,399 KES)
- **Spotlight Rental**: $24.99 USD (≈ 3,749 KES)

*Prices are automatically converted using the configured USD to KES rate.*

## API Endpoints

### Payment Creation
```
POST /api/payments/create
```

**Request Body:**
```json
{
  "listingType": "PREMIUM",
  "listingId": "listing-id-optional",
  "provider": "stripe", // or "mpesa"
  "phoneNumber": "+254712345678" // required for M-Pesa
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "payment-id",
    "clientSecret": "pi_xxx_secret_xxx", // Stripe only
    "checkoutRequestID": "ws_xxx", // M-Pesa only
    "amount": 1999,
    "currency": "USD"
  }
}
```

### Payment Status
```
GET /api/payments/status/[paymentId]
```

### Payment History
```
GET /api/payments/history?status=succeeded&provider=stripe&limit=10
```

### Payment Statistics
```
GET /api/payments/stats
```

## Components Usage

### PaymentModal
```tsx
import { PaymentModal } from '@/components/payments'

<PaymentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  listingId="listing-123"
  currentListingType="BASIC"
  onSuccess={(result) => {
    console.log('Payment successful:', result)
  }}
/>
```

### PaymentButton
```tsx
import { PaymentButton } from '@/components/payments'

<PaymentButton
  listingId="listing-123"
  currentListingType="BASIC"
  suggestedUpgrade="PREMIUM"
  onSuccess={(result) => {
    // Handle successful payment
  }}
/>
```

### PaymentHistory
```tsx
import { PaymentHistory } from '@/components/payments'

<PaymentHistory
  showListingInfo={true}
  limit={20}
/>
```

### PaymentDashboard
```tsx
import { PaymentDashboard } from '@/components/payments'

<PaymentDashboard />
```

## Payment Flow

### Stripe Flow
1. User selects listing upgrade
2. Payment intent created on server
3. Client confirms payment with Stripe Elements
4. Webhook receives payment confirmation
5. Listing upgraded automatically

### M-Pesa Flow
1. User selects listing upgrade and enters phone number
2. STK Push initiated to user's phone
3. User enters M-Pesa PIN on phone
4. Callback received with payment status
5. Listing upgraded automatically

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using signatures
2. **Authentication**: Payment endpoints require user authentication
3. **Authorization**: Users can only access their own payments
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: API endpoints are rate-limited

## Testing

### Stripe Test Cards
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002500003155`

### M-Pesa Testing
- Use sandbox environment
- Test phone number: `254708374149`
- Test amount: Any amount between 1-70,000 KES

## Monitoring and Logging

- Payment events are logged to console
- Failed payments trigger error notifications
- Webhook events are tracked
- Payment statistics available in dashboard

## Troubleshooting

### Common Issues

1. **Stripe webhook not working**
   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check Stripe dashboard for delivery attempts

2. **M-Pesa payments failing**
   - Verify phone number format (+254XXXXXXXXX)
   - Check M-Pesa credentials
   - Ensure callback URL is accessible

3. **Payment status not updating**
   - Check webhook endpoints are working
   - Verify database connection
   - Check server logs for errors

### Debug Mode

Set `LOG_LEVEL=debug` in environment variables for detailed logging.

## Production Deployment

1. **Switch to production credentials**
   - Stripe: Use live API keys
   - M-Pesa: Apply for Go-Live and use production credentials

2. **Update webhook URLs**
   - Point to production domain
   - Ensure HTTPS is enabled

3. **Configure monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor payment success rates
   - Set up alerts for failed payments

4. **Security hardening**
   - Enable rate limiting
   - Set up firewall rules
   - Regular security audits

## Support

For issues with:
- **Stripe**: Check [Stripe Documentation](https://stripe.com/docs)
- **M-Pesa**: Check [Safaricom Daraja API](https://developer.safaricom.co.ke)
- **Implementation**: Check application logs and error messages

## Future Enhancements

- [ ] PayPal integration
- [ ] Cryptocurrency payments
- [ ] Subscription-based premium features
- [ ] Bulk payment discounts
- [ ] Refund processing
- [ ] Payment analytics dashboard
- [ ] Multi-currency support
- [ ] Payment reminders
- [ ] Invoice generation