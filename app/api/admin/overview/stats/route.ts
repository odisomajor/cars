import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch user statistics
    const [totalUsers, usersThisMonth, usersLastMonth, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      })
    ])

    // Calculate user growth
    const userGrowth = usersLastMonth > 0 
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 
      : usersThisMonth > 0 ? 100 : 0

    // Process user roles
    const roleStats = {
      BUYER: 0,
      SELLER: 0,
      RENTAL_COMPANY: 0,
      ADMIN: 0
    }
    
    usersByRole.forEach(role => {
      if (role.role in roleStats) {
        roleStats[role.role as keyof typeof roleStats] = role._count.id
      }
    })

    // Fetch listing statistics
    const [totalListings, listingsThisMonth, listingsLastMonth, listingsByStatus] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      prisma.listing.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      })
    ])

    // Calculate listing growth
    const listingGrowth = listingsLastMonth > 0 
      ? ((listingsThisMonth - listingsLastMonth) / listingsLastMonth) * 100 
      : listingsThisMonth > 0 ? 100 : 0

    // Process listing status
    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    }
    
    listingsByStatus.forEach(status => {
      if (status.status === 'PENDING') statusStats.pending = status._count.id
      if (status.status === 'APPROVED') statusStats.approved = status._count.id
      if (status.status === 'REJECTED') statusStats.rejected = status._count.id
    })

    // Fetch booking statistics
    const [totalBookings, bookingsThisMonth, bookingsLastMonth] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ])

    // Calculate booking growth
    const bookingGrowth = bookingsLastMonth > 0 
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 
      : bookingsThisMonth > 0 ? 100 : 0

    // Calculate booking revenue (assuming average booking value)
    const avgBookingValue = 15000 // KES - this should be calculated from actual booking data
    const bookingRevenue = bookingsThisMonth * avgBookingValue

    // Fetch moderation statistics
    const [pendingReviews, flaggedContent, reportsToday] = await Promise.all([
      prisma.listing.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.listing.count({
        where: {
          status: 'FLAGGED'
        }
      }),
      // For now, we'll use a placeholder for reports
      Promise.resolve(3)
    ])

    // Calculate revenue statistics
    const commissionRate = 0.05 // 5% commission
    const subscriptionRevenue = 50000 // KES - placeholder
    const commissionRevenue = bookingRevenue * commissionRate
    const totalRevenueThisMonth = commissionRevenue + subscriptionRevenue
    const totalRevenue = totalRevenueThisMonth * 6 // Placeholder for total revenue
    
    // Calculate revenue growth (placeholder)
    const revenueGrowth = 12.5

    // Analytics statistics (placeholders - should be fetched from analytics service)
    const analytics = {
      pageViews: 45230,
      uniqueVisitors: 12450,
      conversionRate: 3.2,
      bounceRate: 42.1
    }

    const stats = {
      users: {
        total: totalUsers,
        newThisMonth: usersThisMonth,
        growth: userGrowth,
        byRole: roleStats
      },
      listings: {
        total: totalListings,
        pending: statusStats.pending,
        approved: statusStats.approved,
        rejected: statusStats.rejected,
        newThisMonth: listingsThisMonth,
        growth: listingGrowth
      },
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
        growth: bookingGrowth,
        revenue: bookingRevenue
      },
      moderation: {
        pendingReviews,
        flaggedContent,
        reportsToday
      },
      revenue: {
        total: totalRevenue,
        thisMonth: totalRevenueThisMonth,
        growth: revenueGrowth,
        commissions: commissionRevenue,
        subscriptions: subscriptionRevenue
      },
      analytics
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin overview stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overview statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}