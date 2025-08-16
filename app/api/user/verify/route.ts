import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'
import { z } from 'zod'
import crypto from 'crypto'

// Schema for verification requests
const verificationSchema = z.object({
  type: z.enum(['email', 'phone']),
  action: z.enum(['send', 'verify']),
  code: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash verification code for secure storage
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

// POST - Send or verify verification codes
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
    const validatedData = verificationSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (validatedData.action === 'send') {
      return await handleSendVerification(user, validatedData)
    } else if (validatedData.action === 'verify') {
      return await handleVerifyCode(user, validatedData)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSendVerification(user: any, data: any) {
  const code = generateVerificationCode()
  const hashedCode = hashCode(code)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  if (data.type === 'email') {
    const email = data.email || user.email
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Store verification code in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedCode,
        expires: expiresAt,
        type: 'EMAIL_VERIFICATION'
      }
    })

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email Address - Car Dealership',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p>Hello ${user.name || 'User'},</p>
            <p>Please use the following verification code to verify your email address:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Car Dealership Platform<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        `
      })

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email'
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

  } else if (data.type === 'phone') {
    const phone = data.phone || user.profile?.phone
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Store verification code in database
    await prisma.verificationToken.create({
      data: {
        identifier: phone,
        token: hashedCode,
        expires: expiresAt,
        type: 'PHONE_VERIFICATION'
      }
    })

    // Send verification SMS
    try {
      await sendSMS({
        to: phone,
        message: `Your Car Dealership verification code is: ${code}. This code expires in 10 minutes.`
      })

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your phone'
      })
    } catch (smsError) {
      console.error('Error sending verification SMS:', smsError)
      return NextResponse.json(
        { error: 'Failed to send verification SMS' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Invalid verification type' },
    { status: 400 }
  )
}

async function handleVerifyCode(user: any, data: any) {
  if (!data.code) {
    return NextResponse.json(
      { error: 'Verification code is required' },
      { status: 400 }
    )
  }

  const hashedCode = hashCode(data.code)
  const identifier = data.type === 'email' 
    ? (data.email || user.email)
    : (data.phone || user.profile?.phone)

  if (!identifier) {
    return NextResponse.json(
      { error: `${data.type === 'email' ? 'Email' : 'Phone number'} is required` },
      { status: 400 }
    )
  }

  // Find valid verification token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      token: hashedCode,
      expires: { gt: new Date() },
      type: data.type === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION'
    }
  })

  if (!verificationToken) {
    return NextResponse.json(
      { error: 'Invalid or expired verification code' },
      { status: 400 }
    )
  }

  // Update user verification status
  if (data.type === 'email') {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        email: identifier // Update email if it was changed
      }
    })
  } else if (data.type === 'phone') {
    // Update phone verification in profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        phone: identifier,
        phoneVerified: true
      },
      update: {
        phone: identifier,
        phoneVerified: true
      }
    })
  }

  // Delete used verification token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id }
  })

  return NextResponse.json({
    success: true,
    message: `${data.type === 'email' ? 'Email' : 'Phone number'} verified successfully`
  })
}

// GET - Check verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.profile?.phoneVerified,
      isFullyVerified: !!user.emailVerified && !!user.profile?.phoneVerified
    })

  } catch (error) {
    console.error('Error checking verification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}