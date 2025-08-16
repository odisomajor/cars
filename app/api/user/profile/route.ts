import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  website: z.string().url().optional().or(z.literal('')),
  companyName: z.string().optional(),
  businessLicense: z.string().optional(),
})

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
      include: { 
        profile: true,
        _count: {
          select: {
            listings: true,
            rentalListings: true,
            favorites: true,
            reviews: true,
            receivedReviews: true
          }
        }
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate average rating from received reviews
    const avgRating = await prisma.review.aggregate({
      where: { revieweeId: user.id },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: user.profile,
        stats: {
          totalListings: user._count.listings,
          totalRentalListings: user._count.rentalListings,
          totalFavorites: user._count.favorites,
          totalReviews: user._count.reviews,
          totalReceivedReviews: user._count.receivedReviews,
          averageRating: avgRating._avg.rating || 0,
          ratingCount: avgRating._count.rating || 0
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if phone number is being changed
    const isPhoneChanged = validatedData.phone && validatedData.phone !== existingUser.profile?.phone
    
    // If phone is being changed, reset phone verification
    const userUpdateData: any = {}
    if (isPhoneChanged) {
      userUpdateData.phoneVerified = null
      userUpdateData.phoneVerificationToken = null
      userUpdateData.phoneVerificationTokenExpiry = null
    }

    // Update user if needed
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData
      })
    }

    // Update or create profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        ...validatedData,
      },
    })

    // Get updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        phoneVerificationReset: isPhoneChanged,
        user: {
          id: updatedUser!.id,
          name: updatedUser!.name,
          email: updatedUser!.email,
          image: updatedUser!.image,
          role: updatedUser!.role,
          emailVerified: updatedUser!.emailVerified,
          phoneVerified: updatedUser!.phoneVerified,
          isVerified: updatedUser!.isVerified,
          profile: updatedUser!.profile,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has active listings or bookings
    const activeData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            listings: {
              where: {
                status: { in: ['ACTIVE', 'PENDING'] }
              }
            },
            rentalListings: {
              where: {
                isActive: true
              }
            },
            rentalBookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      }
    })

    if (!activeData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasActiveContent = activeData._count.listings > 0 || 
                           activeData._count.rentalListings > 0 || 
                           activeData._count.rentalBookings > 0

    if (hasActiveContent) {
      return NextResponse.json(
        { 
          error: 'Cannot delete profile with active listings or bookings. Please complete or cancel them first.',
          details: {
            activeListings: activeData._count.listings,
            activeRentalListings: activeData._count.rentalListings,
            activeBookings: activeData._count.rentalBookings
          }
        },
        { status: 400 }
      )
    }

    // Soft delete - mark user as deleted instead of hard delete
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: `deleted_${session.user.id}@deleted.com`,
        name: 'Deleted User',
        image: null,
        password: null,
        refreshToken: null,
        emailVerified: null,
        phoneVerified: null,
        isVerified: false
      }
    })

    // Delete profile data
    await prisma.profile.delete({
      where: { userId: session.user.id },
    })

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}