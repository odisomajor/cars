// SMS utility functions
// In a production environment, you would integrate with an SMS service like:
// - Twilio
// - AWS SNS
// - Africa's Talking (popular in Kenya)
// - Vonage (formerly Nexmo)
// - MessageBird

export interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // For development, we'll just log the SMS
    // In production, replace this with actual SMS sending logic
    console.log(`\n=== SMS VERIFICATION ===`)
    console.log(`To: ${options.to}`)
    console.log(`Message: ${options.message}`)
    console.log(`========================\n`)

    // Simulate SMS sending with Twilio (example implementation)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Uncomment and install twilio package for production use
      /*
      const twilio = require('twilio')
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      
      await client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to
      })
      */
      
      console.log('Twilio credentials found - SMS would be sent in production')
      return true
    }

    // For development, simulate successful SMS sending
    console.warn('SMS credentials not configured. SMS not sent.')
    return false
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
  const message = generateVerificationSMSText(code)
  return await sendSMS({
    to: phoneNumber,
    message
  })
}

export function generateVerificationSMSText(code: string): string {
  return `Your Car Dealership verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`
}

export async function sendPhoneVerificationSMS(phone: string, verificationCode: string) {
  // For development, we'll just log the verification code
  // In production, replace this with actual SMS sending logic
  console.log(`\n=== SMS VERIFICATION ===`)
  console.log(`To: ${phone}`)
  console.log(`Message: Your CarMarket verification code is: ${verificationCode}`)
  console.log(`Code expires in 10 minutes`)
  console.log(`========================\n`)
  
  // Example implementation with Twilio:
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    const message = await client.messages.create({
      body: `Your CarMarket verification code is: ${verificationCode}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('SMS sent successfully:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
  */
  
  // For development, simulate successful sending
  return Promise.resolve({ success: true, messageId: 'dev-message-id' })
}

// Rate limiting for SMS to prevent abuse
const smsRateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkSMSRateLimit(phoneNumber: string, maxAttempts: number = 3, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = phoneNumber
  const record = smsRateLimit.get(key)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    smsRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false // Rate limit exceeded
  }
  
  // Increment count
  record.count++
  return true
}

export function getRemainingCooldown(phoneNumber: string): number {
  const record = smsRateLimit.get(phoneNumber)
  if (!record) return 0
  
  const now = Date.now()
  return Math.max(0, record.resetTime - now)
}

export async function sendPasswordResetSMS(phone: string, resetCode: string) {
  // For development, we'll just log the reset code
  console.log(`\n=== PASSWORD RESET SMS ===`)
  console.log(`To: ${phone}`)
  console.log(`Message: Your CarMarket password reset code is: ${resetCode}`)
  console.log(`Code expires in 10 minutes`)
  console.log(`==========================\n`)
  
  // In production, implement actual SMS sending logic here
  return Promise.resolve({ success: true, messageId: 'dev-reset-message-id' })
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Validate phone number format (basic validation for Kenyan numbers)
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check for Kenyan phone number patterns
  // Kenyan numbers: +254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
  const kenyanPatterns = [
    /^254[17]\d{8}$/, // +254 format
    /^0[17]\d{8}$/,   // 07 or 01 format
  ]
  
  return kenyanPatterns.some(pattern => pattern.test(cleanPhone))
}

// Format phone number to international format
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Convert to international format
  if (cleanPhone.startsWith('254')) {
    return `+${cleanPhone}`
  } else if (cleanPhone.startsWith('0')) {
    return `+254${cleanPhone.substring(1)}`
  } else if (cleanPhone.length === 9) {
    return `+254${cleanPhone}`
  }
  
  return phone // Return original if format is unclear
}