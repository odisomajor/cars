import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// Generate JWT tokens for mobile app
function generateTokens(userId: string, userRole: string) {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
  
  const accessToken = jwt.sign(
    { 
      userId, 
      role: userRole,
      type: 'access'
    },
    jwtSecret,
    { expiresIn: '15m' } // Short-lived access token
  )
  
  const refreshToken = jwt.sign(
    { 
      userId, 
      role: userRole,
      type: 'refresh'
    },
    jwtSecret,
    { expiresIn: '7d' } // Long-lived refresh token
  )
  
  return { accessToken, refreshToken }
}

// POST /api/auth/mobile-token - Login and get JWT tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '')
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken,
        lastLoginAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.profile?.phone,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        isVerified: user.isVerified,
        image: user.image
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes in seconds
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Mobile login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/auth/mobile-token - Refresh JWT tokens
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = refreshSchema.parse(body)

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

    // Verify refresh token
    let decoded: any
    try {
      decoded = jwt.verify(refreshToken, jwtSecret)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Find user and verify refresh token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    })

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role)

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    })

    return NextResponse.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900 // 15 minutes in seconds
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/auth/mobile-token - Logout (invalidate refresh token)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Clear refresh token from database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { refreshToken: null }
    })

    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Mobile logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}