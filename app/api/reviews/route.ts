import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReviewSchema = z.object({
  targetId: z.string().min(1, 'Target user ID is required'),
  listingId: z.string().optional(),
  rentalListingId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

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
    const validatedData = createReviewSchema.parse(body)

    // Prevent self-review
    if (validatedData.targetId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot review yourself' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.targetId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // Check if listing exists (if provided)
    if (validatedData.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: validatedData.listingId }
      })
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
    }

    // Check if rental listing exists (if provided)
    if (validatedData.rentalListingId) {
      const rentalListing = await prisma.rentalListing.findUnique({
        where: { id: validatedData.rentalListingId }
      })
      if (!rentalListing) {
        return NextResponse.json(
          { error: 'Rental listing not found' },
          { status: 404 }
        )
      }
    }

    // Check if user has already reviewed this target for the same listing
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        targetId: validatedData.targetId,
        listingId: validatedData.listingId || null,
        rentalListingId: validatedData.rentalListingId || null,
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this user for this listing' },
        { status: 400 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        targetId: validatedData.targetId,
        listingId: validatedData.listingId || null,
        rentalListingId: validatedData.rentalListingId || null,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        target: {
          select: {
            id: true,
            name: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
          }
        },
        rentalListing: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json({
      review,
      message: 'Review created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const listingId = searchParams.get('listingId')
    const rentalListingId = searchParams.get('rentalListingId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (targetId) where.targetId = targetId
    if (listingId) where.listingId = listingId
    if (rentalListingId) where.rentalListingId = rentalListingId

    // Get reviews with user details
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          target: {
            select: {
              id: true,
              name: true,
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
            }
          },
          rentalListing: {
            select: {
              id: true,
              title: true,
            }
          }
        }
      }),
      prisma.review.count({ where })
    ])

    // Calculate average rating if targetId is provided
    let averageRating = null
    if (targetId) {
      const ratingStats = await prisma.review.aggregate({
        where: { targetId },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      })
      averageRating = {
        average: ratingStats._avg.rating || 0,
        count: ratingStats._count.rating
      }
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      averageRating
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}