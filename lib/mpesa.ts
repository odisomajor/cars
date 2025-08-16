// M-Pesa integration for Kenyan mobile payments
// This uses the Safaricom Daraja API for M-Pesa payments

interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  businessShortCode: string
  passkey: string
  environment: 'sandbox' | 'production'
}

interface MpesaPaymentRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
  callbackUrl: string
}

interface MpesaPaymentResponse {
  merchantRequestID: string
  checkoutRequestID: string
  responseCode: string
  responseDescription: string
  customerMessage: string
}

class MpesaService {
  private config: MpesaConfig
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
      passkey: process.env.MPESA_PASSKEY!,
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    }

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke'
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64')
    
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      const data = await response.json()
      
      if (data.access_token) {
        this.accessToken = data.access_token
        // Token expires in 1 hour, set expiry to 55 minutes for safety
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)
        return this.accessToken
      }
      
      throw new Error('Failed to get M-Pesa access token')
    } catch (error) {
      console.error('M-Pesa token error:', error)
      throw new Error('Failed to authenticate with M-Pesa')
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${this.config.businessShortCode}${this.config.passkey}${timestamp}`).toString('base64')
    return password
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1)
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1)
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned
    }
    
    return cleaned
  }

  async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.getTimestamp()
      const password = this.generatePassword()
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber)

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: formattedPhone,
        PartyB: this.config.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: request.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      if (data.ResponseCode === '0') {
        return {
          merchantRequestID: data.MerchantRequestID,
          checkoutRequestID: data.CheckoutRequestID,
          responseCode: data.ResponseCode,
          responseDescription: data.ResponseDescription,
          customerMessage: data.CustomerMessage,
        }
      }
      
      throw new Error(data.ResponseDescription || 'M-Pesa payment initiation failed')
    } catch (error) {
      console.error('M-Pesa payment error:', error)
      throw error
    }
  }

  async queryPaymentStatus(checkoutRequestID: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.getTimestamp()
      const password = this.generatePassword()

      const payload = {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      }

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      return await response.json()
    } catch (error) {
      console.error('M-Pesa query error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const mpesaService = new MpesaService()

// Helper function to convert USD to KES for M-Pesa payments
export const convertUSDToKESForMpesa = (usdCents: number): number => {
  const USD_TO_KES_RATE = 150 // Should be fetched from a currency API
  return Math.round((usdCents / 100) * USD_TO_KES_RATE)
}

// M-Pesa payment method types
export type MpesaPaymentMethod = 'mpesa'
export type PaymentProvider = 'stripe' | 'mpesa'

export { MpesaPaymentRequest, MpesaPaymentResponse }