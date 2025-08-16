import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
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

    const userId = decoded.userId

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get user's listings with related data
    const listings = await prisma.listing.findMany({
      where: {
        userId: userId
      },
      include: {
        _count: {
          select: {
            favorites: true,
            views: true
          }
        },
        rentalBookings: {
          where: {
            status: 'confirmed',
            createdAt: {
              gte: startOfMonth
            }
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    })

    // Get user's messages count
    const messagesCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    })

    // Get user's reviews and ratings
    const reviews = await prisma.review.findMany({
      where: {
        listing: {
          userId: userId
        }
      },
      select: {
        rating: true,
        createdAt: true
      }
    })

    // Calculate stats
    const totalListings = listings.length
    const activeListings = listings.filter(l => l.status === 'active').length
    const draftListings = listings.filter(l => l.status === 'draft').length
    const expiredListings = listings.filter(l => l.status === 'expired').length
    const soldListings = listings.filter(l => l.status === 'sold').length

    const totalViews = listings.reduce((sum, listing) => sum + listing._count.views, 0)
    const totalFavorites = listings.reduce((sum, listing) => sum + listing._count.favorites, 0)
    
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0
    const totalReviews = reviews.length

    // Calculate monthly revenue from rentals
    const monthlyRevenue = listings.reduce((total, listing) => {
      return total + listing.rentalBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    }, 0)

    // Calculate last month revenue for comparison
    const lastMonthBookings = await prisma.rentalBooking.findMany({
      where: {
        listing: {
          userId: userId
        },
        status: 'confirmed',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      select: {
        totalAmount: true
      }
    })

    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    // Calculate pending actions
    let pendingActions = 0
    
    // Count expired listings
    pendingActions += expiredListings
    
    // Count draft listings
    pendingActions += draftListings
    
    // Count listings expiring soon (within 7 days)
    const soonToExpire = listings.filter(listing => {
      if (!listing.expiresAt || listing.status !== 'active') return false
      const daysUntilExpiry = Math.ceil((new Date(listing.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length
    pendingActions += soonToExpire

    // Count unread messages (simplified - you might want to implement a proper message read status)
    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
    pendingActions += unreadMessages

    // Get recent activity for trends
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentViews = await prisma.listingView.count({
      where: {
        listing: {
          userId: userId
        },
        createdAt: {
          gte: last30Days
        }
      }
    })

    const recentFavorites = await prisma.favorite.count({
      where: {
        listing: {
          userId: userId
        },
        createdAt: {
          gte: last30Days
        }
      }
    })

    // Calculate view trend (simplified)
    const viewTrend = recentViews > 0 ? 'up' : 'stable'
    const favoriteTrend = recentFavorites > 0 ? 'up' : 'stable'

    // Get top performing listing
    const topListing = listings.reduce((top, current) => {
      const currentScore = current._count.views + (current._count.favorites * 2)
      const topScore = top ? top._count.views + (top._count.favorites * 2) : 0
      return currentScore > topScore ? current : top
    }, null as any)

    const stats = {
      // Basic counts
      totalListings,
      activeListings,
      draftListings,
      expiredListings,
      soldListings,
      
      // Engagement
      totalViews,
      totalFavorites,
      totalMessages: messagesCount,
      
      // Performance
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      
      // Revenue
      monthlyRevenue,
      lastMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      
      // Actions needed
      pendingActions,
      soonToExpire,
      unreadMessages,
      
      // Trends
      trends: {
        views: {
          direction: viewTrend,
          count: recentViews
        },
        favorites: {
          direction: favoriteTrend,
          count: recentFavorites
        }
      },
      
      // Top performer
      topListing: topListing ? {
        id: topListing.id,
        title: topListing.title,
        views: topListing._count.views,
        favorites: topListing._count.favorites,
        price: topListing.price
      } : null,
      
      // Additional insights
      insights: {
        averageViewsPerListing: totalListings > 0 ? Math.round(totalViews / totalListings) : 0,
        averageFavoritesPerListing: totalListings > 0 ? Math.round(totalFavorites / totalListings) : 0,
        conversionRate: totalViews > 0 ? Math.round((totalFavorites / totalViews) * 100 * 10) / 10 : 0
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

// Get dashboard configuration and limits
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
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

    const { action, data } = await request.json()

    switch (action) {
      case 'refresh_stats':
        // Force refresh stats (useful for real-time updates)
        // This could trigger background jobs or cache invalidation
        return NextResponse.json({ success: true, message: 'Stats refresh initiated' })
      
      case 'update_preferences':
        // Update user dashboard preferences
        const userId = decoded.userId
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            profile: {
              update: {
                dashboardPreferences: data.preferences
              }
            }
          }
        })
        
        return NextResponse.json({ success: true, message: 'Preferences updated' })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Dashboard action error:', error)
    return NextResponse.json(
      { error: 'Failed to process dashboard action' },
      { status: 500 }
    )
  }
}