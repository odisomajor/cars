import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            listings: {
              where: {
                status: { not: 'ARCHIVED' }
              }
            },
            rentalListings: {
              where: {
                isDraft: false
              }
            },
            favorites: true,
            rentalBookings: true,
            reviews: true,
            receivedReviews: true
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

    // Get recent listings
    const recentListings = await prisma.listing.findMany({
      where: {
        userId,
        status: { not: 'ARCHIVED' }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        price: true,
        status: true,
        listingType: true,
        views: true,
        createdAt: true,
        images: true
      }
    })

    // Get recent rental listings
    const recentRentalListings = await prisma.rentalListing.findMany({
      where: {
        userId,
        isDraft: false
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        pricePerDay: true,
        isActive: true,
        isFeatured: true,
        views: true,
        createdAt: true,
        images: true
      }
    })

    // Get recent bookings (for rental companies)
    const recentBookings = user.role === 'RENTAL_COMPANY' ? await prisma.rentalBooking.findMany({
      where: {
        rentalListing: {
          userId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        rentalListing: {
          select: {
            title: true,
            make: true,
            model: true
          }
        }
      }
    }) : []

    // Calculate total views for all listings
    const totalViews = await prisma.listing.aggregate({
      where: {
        userId,
        status: { not: 'ARCHIVED' }
      },
      _sum: {
        views: true
      }
    })

    // Calculate total rental views
    const totalRentalViews = await prisma.rentalListing.aggregate({
      where: {
        userId,
        isDraft: false
      },
      _sum: {
        views: true
      }
    })

    // Get active listings count by status
    const listingsByStatus = await prisma.listing.groupBy({
      by: ['status'],
      where: {
        userId,
        status: { not: 'ARCHIVED' }
      },
      _count: {
        status: true
      }
    })

    // Get revenue data (for premium listings)
    const revenueData = await prisma.payment.findMany({
      where: {
        userId,
        status: 'succeeded'
      },
      select: {
        amount: true,
        currency: true,
        listingType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        userId,
        status: 'succeeded',
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        image: user.image,
        profile: user.profile
      },
      stats: {
        totalListings: user._count.listings,
        totalRentalListings: user._count.rentalListings,
        totalFavorites: user._count.favorites,
        totalBookings: user._count.rentalBookings,
        totalReviews: user._count.reviews,
        totalReceivedReviews: user._count.receivedReviews,
        totalViews: (totalViews._sum.views || 0) + (totalRentalViews._sum.views || 0),
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      },
      recentListings: recentListings.map(listing => ({
        ...listing,
        images: JSON.parse(listing.images || '[]')
      })),
      recentRentalListings: recentRentalListings.map(listing => ({
        ...listing,
        images: JSON.parse(listing.images || '[]')
      })),
      recentBookings,
      listingsByStatus: listingsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      revenueData: revenueData.map(payment => ({
        amount: payment.amount,
        currency: payment.currency,
        type: payment.listingType,
        date: payment.createdAt
      }))
    }

    return NextResponse.json(dashboardData, { status: 200 })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}