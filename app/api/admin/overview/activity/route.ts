import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivityEvent {
  id: string
  type: 'user_registration' | 'listing_created' | 'booking_made' | 'report_filed' | 'payment_received'
  description: string
  timestamp: string
  user?: {
    name: string
    email: string
  }
  metadata?: any
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get recent activities from different sources
    const activities: ActivityEvent[] = []

    // Recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: 10,
      skip: 0,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registration',
        description: `New ${user.role.toLowerCase()} registered: ${user.name || user.email}`,
        timestamp: user.createdAt.toISOString(),
        user: {
          name: user.name || 'Unknown',
          email: user.email
        },
        metadata: {
          userId: user.id,
          role: user.role
        }
      })
    })

    // Recent listings
    const recentListings = await prisma.listing.findMany({
      take: 10,
      skip: 0,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        price: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    recentListings.forEach(listing => {
      activities.push({
        id: `listing_${listing.id}`,
        type: 'listing_created',
        description: `New listing created: ${listing.make} ${listing.model} - ${listing.title}`,
        timestamp: listing.createdAt.toISOString(),
        user: {
          name: listing.user.name || 'Unknown',
          email: listing.user.email
        },
        metadata: {
          listingId: listing.id,
          price: listing.price,
          vehicle: `${listing.make} ${listing.model}`
        }
      })
    })

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      skip: 0,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            title: true,
            make: true,
            model: true
          }
        }
      }
    })

    recentBookings.forEach(booking => {
      const duration = Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      activities.push({
        id: `booking_${booking.id}`,
        type: 'booking_made',
        description: `New booking: ${booking.listing.make} ${booking.listing.model} for ${duration} days`,
        timestamp: booking.createdAt.toISOString(),
        user: {
          name: booking.user.name || 'Unknown',
          email: booking.user.email
        },
        metadata: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          duration,
          vehicle: `${booking.listing.make} ${booking.listing.model}`
        }
      })
    })

    // Recent favorites (as engagement indicator)
    const recentFavorites = await prisma.favorite.findMany({
      take: 5,
      skip: 0,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            title: true,
            make: true,
            model: true
          }
        }
      }
    })

    recentFavorites.forEach(favorite => {
      activities.push({
        id: `favorite_${favorite.id}`,
        type: 'user_registration', // Using this as a general engagement type
        description: `User favorited: ${favorite.listing.make} ${favorite.listing.model}`,
        timestamp: favorite.createdAt.toISOString(),
        user: {
          name: favorite.user.name || 'Unknown',
          email: favorite.user.email
        },
        metadata: {
          favoriteId: favorite.id,
          vehicle: `${favorite.listing.make} ${favorite.listing.model}`
        }
      })
    })

    // Add some mock payment activities (since we don't have a payments table yet)
    const mockPayments = [
      {
        id: 'payment_1',
        type: 'payment_received' as const,
        description: 'Commission payment received from booking #12345',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          amount: 750,
          bookingId: '12345'
        }
      },
      {
        id: 'payment_2',
        type: 'payment_received' as const,
        description: 'Premium subscription payment received',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: {
          amount: 2500,
          type: 'subscription'
        }
      }
    ]

    activities.push(...mockPayments)

    // Add some mock report activities
    const mockReports = [
      {
        id: 'report_1',
        type: 'report_filed' as const,
        description: 'Content report filed for listing: Suspicious pricing',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: {
          reason: 'suspicious_pricing',
          listingId: 'listing_123'
        }
      }
    ]

    activities.push(...mockReports)

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit)

    return NextResponse.json(paginatedActivities)
  } catch (error) {
    console.error('Admin activity fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}