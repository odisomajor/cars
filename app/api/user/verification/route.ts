import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resendVerificationSchema = z.object({
  type: z.enum(['email', 'phone']),
})

// GET /api/user/verification - Get verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true,
        profile: {
          select: {
            phone: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      email: user.email,
      emailVerified: !!user.emailVerified,
      phone: user.profile?.phone,
      phoneVerified: !!user.phoneVerified,
      isFullyVerified: user.isVerified,
      verificationStatus: {
        email: {
          verified: !!user.emailVerified,
          verifiedAt: user.emailVerified
        },
        phone: {
          verified: !!user.phoneVerified,
          verifiedAt: user.phoneVerified
        }
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Verification status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/verification - Resend verification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type } = resendVerificationSchema.parse(body)

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

    if (type === 'email') {
      if (user.emailVerified) {
        return NextResponse.json(
          { error: 'Email is already verified' },
          { status: 400 }
        )
      }

      // Generate new verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: verificationToken,
          expires: tokenExpiry
        }
      })

      // Here you would send the verification email
      // For now, we'll just return success
      return NextResponse.json({
        message: 'Email verification sent successfully',
        type: 'email'
      }, { status: 200 })
    }

    if (type === 'phone') {
      if (!user.profile?.phone) {
        return NextResponse.json(
          { error: 'No phone number found. Please add a phone number first.' },
          { status: 400 }
        )
      }

      if (user.phoneVerified) {
        return NextResponse.json(
          { error: 'Phone number is already verified' },
          { status: 400 }
        )
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneVerificationToken: verificationCode,
          phoneVerificationTokenExpiry: tokenExpiry
        }
      })

      // Here you would send the SMS
      // For now, we'll just return success
      return NextResponse.json({
        message: 'SMS verification code sent successfully',
        type: 'phone',
        phone: user.profile.phone
      }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Invalid verification type' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}