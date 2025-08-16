import { NextRequest, NextResponse } from 'next/server'
import { sign, verify } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, phone, deviceId, deviceInfo } = await request.json()

    if (action === 'login') {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          profile: true,
          accounts: {
            select: {
              provider: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Check if user has a password (social login users might not)
      if (!user.password) {
        const providers = user.accounts.map(acc => acc.provider).join(', ')
        return NextResponse.json(
          { 
            error: `This account was created with ${providers}. Please use social login or reset your password.`,
            socialProviders: user.accounts.map(acc => acc.provider)
          },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = sign(
        {
          userId: user.id,
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )

      // Create or update device session
      if (deviceId) {
        await prisma.deviceSession.upsert({
          where: {
            userId_deviceId: {
              userId: user.id,
              deviceId
            }
          },
          create: {
            userId: user.id,
            deviceId,
            deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
            token,
            lastActiveAt: new Date()
          },
          update: {
            token,
            deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : undefined,
            lastActiveAt: new Date()
          }
        }).catch(error => {
          // Device session is optional, don't fail login
          console.warn('Failed to create device session:', error)
        })
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }).catch(error => {
        console.warn('Failed to update last login:', error)
      })

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          profile: user.profile ? {
            phone: user.profile.phone,
            location: user.profile.location,
            businessName: user.profile.businessName,
            businessType: user.profile.businessType,
            isVerified: user.profile.isVerified,
            preferences: user.profile.preferences ? JSON.parse(user.profile.preferences) : null
          } : null
        }
      })

    } else if (action === 'register') {
      // Validate input
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        )
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      // Hash password
      const hashedPassword = await hash(password, 12)

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          profile: {
            create: {
              phone: phone || null,
              preferences: JSON.stringify({
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                },
                privacy: {
                  showPhone: false,
                  showEmail: false
                }
              })
            }
          }
        },
        include: {
          profile: true
        }
      })

      // Generate JWT token
      const token = sign(
        {
          userId: user.id,
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )

      // Create device session
      if (deviceId) {
        await prisma.deviceSession.create({
          data: {
            userId: user.id,
            deviceId,
            deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
            token,
            lastActiveAt: new Date()
          }
        }).catch(error => {
          console.warn('Failed to create device session:', error)
        })
      }

      // Send welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system',
          title: 'Welcome to CarDealership!',
          message: 'Your account has been created successfully. Start browsing cars or create your first listing.',
          read: false
        }
      }).catch(error => {
        console.warn('Failed to create welcome notification:', error)
      })

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          profile: {
            phone: user.profile?.phone,
            location: user.profile?.location,
            businessName: user.profile?.businessName,
            businessType: user.profile?.businessType,
            isVerified: user.profile?.isVerified || false,
            preferences: user.profile?.preferences ? JSON.parse(user.profile.preferences) : null
          }
        }
      })

    } else if (action === 'refresh') {
      // Refresh token
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      let decoded: JWTPayload
      
      try {
        decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Generate new token
      const newToken = sign(
        {
          userId: user.id,
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )

      // Update device session
      if (deviceId) {
        await prisma.deviceSession.updateMany({
          where: {
            userId: user.id,
            deviceId
          },
          data: {
            token: newToken,
            lastActiveAt: new Date()
          }
        }).catch(error => {
          console.warn('Failed to update device session:', error)
        })
      }

      return NextResponse.json({
        success: true,
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          profile: user.profile ? {
            phone: user.profile.phone,
            location: user.profile.location,
            businessName: user.profile.businessName,
            businessType: user.profile.businessType,
            isVerified: user.profile.isVerified,
            preferences: user.profile.preferences ? JSON.parse(user.profile.preferences) : null
          } : null
        }
      })

    } else if (action === 'forgot_password') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        // Don't reveal if email exists or not
        return NextResponse.json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        })
      }

      // Generate reset token
      const resetToken = sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )

      // Save reset token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })

      // Here you would send the reset email
      // await sendPasswordResetEmail(user.email, resetToken)

      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
        resetToken // Remove this in production, only for testing
      })

    } else if (action === 'reset_password') {
      const { resetToken, newPassword } = await request.json()

      if (!resetToken || !newPassword) {
        return NextResponse.json(
          { error: 'Reset token and new password are required' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      // Verify reset token
      let decoded: any
      try {
        decoded = verify(resetToken, process.env.JWT_SECRET!)
        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type')
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 401 }
        )
      }

      // Check if reset token exists and is not expired
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token: resetToken,
          expiresAt: { gt: new Date() },
          used: false
        }
      })

      if (!resetRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 401 }
        )
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 12)

      // Update user password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      })

      // Mark reset token as used
      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })

      // Invalidate all device sessions for security
      await prisma.deviceSession.deleteMany({
        where: { userId: decoded.userId }
      })

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const logoutAll = searchParams.get('all') === 'true'

    if (logoutAll) {
      // Logout from all devices
      await prisma.deviceSession.deleteMany({
        where: { userId: decoded.userId }
      })

      return NextResponse.json({
        success: true,
        message: 'Logged out from all devices'
      })
    } else if (deviceId) {
      // Logout from specific device
      await prisma.deviceSession.deleteMany({
        where: {
          userId: decoded.userId,
          deviceId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Logged out from device'
      })
    } else {
      // Logout from current session (invalidate token)
      await prisma.deviceSession.deleteMany({
        where: {
          userId: decoded.userId,
          token
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      })
    }

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update device session activity
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    
    if (deviceId) {
      await prisma.deviceSession.updateMany({
        where: {
          userId: user.id,
          deviceId,
          token
        },
        data: {
          lastActiveAt: new Date()
        }
      }).catch(error => {
        console.warn('Failed to update device session activity:', error)
      })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        profile: user.profile ? {
          phone: user.profile.phone,
          location: user.profile.location,
          businessName: user.profile.businessName,
          businessType: user.profile.businessType,
          isVerified: user.profile.isVerified,
          preferences: user.profile.preferences ? JSON.parse(user.profile.preferences) : null
        } : null
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}