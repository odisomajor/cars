import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ review })

  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateReviewSchema.parse(body)

    // Check if review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own reviews' },
        { status: 403 }
      )
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(validatedData.rating && { rating: validatedData.rating }),
        ...(validatedData.comment !== undefined && { comment: validatedData.comment }),
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
      review: updatedReview,
      message: 'Review updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}