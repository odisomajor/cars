import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

interface MobileUserProfile {
  id: string
  name: string
  email: string
  image: string
  role: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  profile: {
    phone: string
    location: string
    bio: string
    avatar: string
    businessName: string
    businessLicense: string
    businessAddress: string
    businessPhone: string
    businessEmail: string
    website: string
  }
  stats: {
    totalListings: number
    activeListings: number
    totalViews: number
    totalFavorites: number
    averageRating: number
    totalReviews: number
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
      emailNotifications: boolean
      pushNotifications: boolean
      marketingEmails: boolean
      listingUpdates: boolean
      favoriteAlerts: boolean
      preferences: {
        premium_upgrade: boolean
        booking_confirmed: boolean
        payment_success: boolean
        listing_featured: boolean
        inquiry_received: boolean
        rental_reminder: boolean
        promotion: boolean
        system: boolean
      }
      channels: {
        push: boolean
        email: boolean
        sms: boolean
      }
      quietHours: {
        enabled: boolean
        startTime: string
        endTime: string
      }
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    }
    privacy: {
      showPhone: boolean
      showEmail: boolean
      showLocation: boolean
    }
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  businessName: z.string().optional(),
  businessLicense: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      listingUpdates: z.boolean().optional(),
      favoriteAlerts: z.boolean().optional(),
      preferences: z.object({
        premium_upgrade: z.boolean().optional(),
        booking_confirmed: z.boolean().optional(),
        payment_success: z.boolean().optional(),
        listing_featured: z.boolean().optional(),
        inquiry_received: z.boolean().optional(),
        rental_reminder: z.boolean().optional(),
        promotion: z.boolean().optional(),
        system: z.boolean().optional()
      }).optional(),
      channels: z.object({
        push: z.boolean().optional(),
        email: z.boolean().optional(),
        sms: z.boolean().optional()
      }).optional(),
      quietHours: z.object({
        enabled: z.boolean().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional()
      }).optional(),
      frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional()
    }).optional(),
    privacy: z.object({
      showPhone: z.boolean().optional(),
      showEmail: z.boolean().optional(),
      showLocation: z.boolean().optional()
    }).optional()
  }).optional()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// Verify JWT token for mobile requests
function verifyMobileToken(request: NextRequest): { userId: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.type !== 'access') {
      return null
    }
    return { userId: decoded.userId, role: decoded.role }
  } catch (error) {
    return null
  }
}

// GET /api/mobile/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch user with profile and stats
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        profile: true,
        _count: {
          select: {
            listings: {
              where: { status: { in: ['active', 'expired'] } }
            },
            favorites: true
          }
        },
        listings: {
          where: { status: 'active' },
          select: {
            views: true
          }
        },
        receivedReviews: {
          select: {
            rating: true
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

    // Calculate stats
    const totalViews = user.listings.reduce((sum, listing) => sum + (listing.views || 0), 0)
    const activeListings = user.listings.length
    const totalListings = user._count.listings
    const totalFavorites = user._count.favorites
    
    const reviews = user.receivedReviews || []
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0
    const totalReviews = reviews.length

    // Get user preferences (default values if not set)
    const notificationSettings = user.notificationSettings 
      ? JSON.parse(user.notificationSettings as string)
      : {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          listingUpdates: true,
          favoriteAlerts: true,
          preferences: {
            premium_upgrade: true,
            booking_confirmed: true,
            payment_success: true,
            listing_featured: true,
            inquiry_received: true,
            rental_reminder: true,
            promotion: false,
            system: true
          },
          channels: {
            push: true,
            email: true,
            sms: false
          },
          quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00'
          },
          frequency: 'immediate'
        }

    const preferences = {
      notifications: {
        email: user.profile?.emailNotifications ?? true,
        sms: user.profile?.smsNotifications ?? true,
        push: user.profile?.pushNotifications ?? true,
        ...notificationSettings
      },
      privacy: {
        showPhone: user.profile?.showPhone ?? false,
        showEmail: user.profile?.showEmail ?? false,
        showLocation: user.profile?.showLocation ?? true
      }
    }

    const mobileProfile: MobileUserProfile = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      image: user.image || '/default-avatar.png',
      role: user.role,
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.phoneVerified,
      createdAt: user.createdAt.toISOString(),
      profile: {
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || user.image || '/default-avatar.png',
        businessName: user.profile?.businessName || '',
        businessLicense: user.profile?.businessLicense || '',
        businessAddress: user.profile?.businessAddress || '',
        businessPhone: user.profile?.businessPhone || '',
        businessEmail: user.profile?.businessEmail || '',
        website: user.profile?.website || ''
      },
      stats: {
        totalListings,
        activeListings,
        totalViews,
        totalFavorites,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      },
      preferences
    }

    return NextResponse.json({
      profile: mobileProfile,
      success: true
    })

  } catch (error) {
    console.error('Mobile profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/mobile/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Separate user data from profile data
    const { name, preferences, ...profileData } = validatedData
    
    // Update user name if provided
    const userUpdateData: any = {}
    if (name) {
      userUpdateData.name = name
    }

    // Update profile data
    const profileUpdateData: any = { ...profileData }
    
    // Handle preferences
    let notificationSettingsUpdate = null
    if (preferences) {
      if (preferences.notifications) {
        // Handle basic notification preferences
        if (preferences.notifications.email !== undefined) {
          profileUpdateData.emailNotifications = preferences.notifications.email
        }
        if (preferences.notifications.sms !== undefined) {
          profileUpdateData.smsNotifications = preferences.notifications.sms
        }
        if (preferences.notifications.push !== undefined) {
          profileUpdateData.pushNotifications = preferences.notifications.push
        }

        // Handle enhanced notification settings
        const enhancedSettings: any = {}
        if (preferences.notifications.emailNotifications !== undefined) {
          enhancedSettings.emailNotifications = preferences.notifications.emailNotifications
        }
        if (preferences.notifications.pushNotifications !== undefined) {
          enhancedSettings.pushNotifications = preferences.notifications.pushNotifications
        }
        if (preferences.notifications.marketingEmails !== undefined) {
          enhancedSettings.marketingEmails = preferences.notifications.marketingEmails
        }
        if (preferences.notifications.listingUpdates !== undefined) {
          enhancedSettings.listingUpdates = preferences.notifications.listingUpdates
        }
        if (preferences.notifications.favoriteAlerts !== undefined) {
          enhancedSettings.favoriteAlerts = preferences.notifications.favoriteAlerts
        }
        if (preferences.notifications.preferences) {
          enhancedSettings.preferences = preferences.notifications.preferences
        }
        if (preferences.notifications.channels) {
          enhancedSettings.channels = preferences.notifications.channels
        }
        if (preferences.notifications.quietHours) {
          enhancedSettings.quietHours = preferences.notifications.quietHours
        }
        if (preferences.notifications.frequency) {
          enhancedSettings.frequency = preferences.notifications.frequency
        }

        if (Object.keys(enhancedSettings).length > 0) {
          notificationSettingsUpdate = JSON.stringify(enhancedSettings)
        }
      }
      
      if (preferences.privacy) {
        if (preferences.privacy.showPhone !== undefined) {
          profileUpdateData.showPhone = preferences.privacy.showPhone
        }
        if (preferences.privacy.showEmail !== undefined) {
          profileUpdateData.showEmail = preferences.privacy.showEmail
        }
        if (preferences.privacy.showLocation !== undefined) {
          profileUpdateData.showLocation = preferences.privacy.showLocation
        }
      }
    }

    // Perform updates in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user if needed (including notification settings)
      if (Object.keys(userUpdateData).length > 0 || notificationSettingsUpdate) {
        const userData = { ...userUpdateData }
        if (notificationSettingsUpdate) {
          userData.notificationSettings = notificationSettingsUpdate
        }
        await tx.user.update({
          where: { id: auth.userId },
          data: userData
        })
      }

      // Update or create profile
      const profile = await tx.profile.upsert({
        where: { userId: auth.userId },
        update: profileUpdateData,
        create: {
          userId: auth.userId,
          ...profileUpdateData
        }
      })

      // Return updated user with profile
      return await tx.user.findUnique({
        where: { id: auth.userId },
        include: {
          profile: true
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        image: updatedUser!.image,
        updatedAt: updatedUser!.updatedAt.toISOString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Mobile profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// POST /api/mobile/profile/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        password: true
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found or no password set' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Mobile password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

// DELETE /api/mobile/profile - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const confirmDelete = searchParams.get('confirm') === 'true'

    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Account deletion must be confirmed' },
        { status: 400 }
      )
    }

    // Delete user account and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's listings
      await tx.listing.deleteMany({
        where: { userId: auth.userId }
      })

      // Delete user's favorites
      await tx.favorite.deleteMany({
        where: { userId: auth.userId }
      })

      // Delete user's reviews
      await tx.review.deleteMany({
        where: { userId: auth.userId }
      })

      // Delete user's profile
      await tx.profile.deleteMany({
        where: { userId: auth.userId }
      })

      // Delete user's accounts (OAuth)
      await tx.account.deleteMany({
        where: { userId: auth.userId }
      })

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId: auth.userId }
      })

      // Finally delete the user
      await tx.user.delete({
        where: { id: auth.userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Mobile account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}