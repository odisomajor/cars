import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        profile: {
          select: {
            isCompanyVerified: true,
            companyName: true,
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

    // Get rating statistics
    const ratingStats = await prisma.review.aggregate({
      where: { targetId: userId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    })

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { targetId: userId },
      _count: {
        rating: true
      },
      orderBy: {
        rating: 'desc'
      }
    })

    // Format rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }

    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: { targetId: userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
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

    // Calculate verification score based on ratings and other factors
    const averageRating = ratingStats._avg.rating || 0
    const totalReviews = ratingStats._count.rating
    const isCompanyVerified = user.profile?.isCompanyVerified || false
    
    let verificationScore = 0
    if (averageRating >= 4.5 && totalReviews >= 10) verificationScore = 100
    else if (averageRating >= 4.0 && totalReviews >= 5) verificationScore = 80
    else if (averageRating >= 3.5 && totalReviews >= 3) verificationScore = 60
    else if (averageRating >= 3.0 && totalReviews >= 1) verificationScore = 40
    else verificationScore = 20

    // Boost score if company is verified
    if (isCompanyVerified) {
      verificationScore = Math.min(100, verificationScore + 20)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        isCompanyVerified,
        companyName: user.profile?.companyName
      },
      ratings: {
        average: Number((averageRating).toFixed(1)),
        total: totalReviews,
        distribution,
        verificationScore
      },
      recentReviews
    })

  } catch (error) {
    console.error('Error fetching user ratings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}