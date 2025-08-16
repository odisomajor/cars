// Email utility functions
import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.')
      return false
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Car Dealership'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
  
  // For development, we'll just log the reset URL
  // In production, replace this with actual email sending logic
  console.log(`\n=== PASSWORD RESET EMAIL ===`)
  console.log(`To: ${email}`)
  console.log(`Subject: Reset your CarMarket password`)
  console.log(`Reset URL: ${resetUrl}`)
  console.log(`Token expires in 1 hour`)
  console.log(`============================\n`)
  
  // Example implementation with a hypothetical email service:
  /*
  const emailContent = {
    to: email,
    subject: "Reset your CarMarket password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reset your password</h2>
        <p>You requested a password reset for your CarMarket account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
    `,
  }
  
  // Send email using your preferred service
  await emailService.send(emailContent)
  */
  
  // For now, we'll simulate successful email sending
  return Promise.resolve()
}

export async function sendEmailVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
  
  // For development, we'll just log the verification URL
  console.log(`\n=== EMAIL VERIFICATION ===`)
  console.log(`To: ${email}`)
  console.log(`Subject: Verify your CarMarket email`)
  console.log(`Verification URL: ${verificationUrl}`)
  console.log(`==========================\n`)
  
  // In production, implement actual email sending logic here
  return Promise.resolve()
}

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  const subject = 'Your Car Dealership Verification Code'
  const html = generateVerificationEmailHTML(code, 'email')
  const text = generateVerificationEmailText(code, 'email')

  return await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

export function generateVerificationEmailHTML(code: string, type: 'email' | 'phone' = 'email'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .content {
          padding: 30px 20px;
        }
        .verification-code {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #495057;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verification Code</h1>
          <p>Verify your ${type === 'email' ? 'email address' : 'phone number'}</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          <p>You requested to verify your ${type === 'email' ? 'email address' : 'phone number'} for your Car Dealership account.</p>
          
          <div class="verification-code">
            <p>Your verification code is:</p>
            <div class="code">${code}</div>
          </div>
          
          <p>This code will expire in 10 minutes for security reasons.</p>
          
          <div class="warning">
            <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email and consider changing your account password.
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The Car Dealership Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Car Dealership. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateVerificationEmailText(code: string, type: 'email' | 'phone' = 'email'): string {
  return `
Verification Code

Hello,

You requested to verify your ${type === 'email' ? 'email address' : 'phone number'} for your Car Dealership account.

Your verification code is: ${code}

This code will expire in 10 minutes for security reasons.

Security Notice: If you didn't request this verification code, please ignore this email and consider changing your account password.

If you have any questions, please contact our support team.

Best regards,
The Car Dealership Team

This is an automated message, please do not reply to this email.
© ${new Date().getFullYear()} Car Dealership. All rights reserved.
  `
}