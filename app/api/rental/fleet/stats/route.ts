import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

// GET /api/rental/fleet/stats - Get fleet statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const userId = companyId || session.user.id

    // Date range for filtering
    const dateFilter = {
      ...(fromDate && { gte: new Date(fromDate) }),
      ...(toDate && { lte: new Date(toDate) })
    }

    // Get basic vehicle counts
    const [totalVehicles, vehiclesByStatus] = await Promise.all([
      db.listing.count({
        where: {
          userId,
          listingType: 'rental',
          ...(fromDate || toDate ? { createdAt: dateFilter } : {})
        }
      }),
      db.listing.groupBy({
        by: ['status'],
        where: {
          userId,
          listingType: 'rental',
          ...(fromDate || toDate ? { createdAt: dateFilter } : {})
        },
        _count: {
          id: true
        }
      })
    ])

    // Transform status counts
    const statusCounts = vehiclesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    const availableVehicles = statusCounts['available'] || 0
    const rentedVehicles = statusCounts['rented'] || 0
    const maintenanceVehicles = statusCounts['maintenance'] || 0
    const inactiveVehicles = statusCounts['inactive'] || 0

    // Get booking statistics
    const bookingStats = await db.rentalBooking.aggregate({
      where: {
        listing: {
          userId,
          listingType: 'rental'
        },
        status: { in: ['confirmed', 'completed'] },
        ...(fromDate || toDate ? { createdAt: dateFilter } : {})
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get monthly revenue (current month)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const monthlyBookingStats = await db.rentalBooking.aggregate({
      where: {
        listing: {
          userId,
          listingType: 'rental'
        },
        status: { in: ['confirmed', 'completed'] },
        createdAt: {
          gte: currentMonth,
          lt: nextMonth
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    // Get average rating
    const ratingStats = await db.review.aggregate({
      where: {
        listing: {
          userId,
          listingType: 'rental'
        },
        ...(fromDate || toDate ? { createdAt: dateFilter } : {})
      },
      _avg: {
        rating: true
      }
    })

    // Calculate utilization rate
    const utilizationRate = totalVehicles > 0 
      ? Math.round((rentedVehicles / totalVehicles) * 100)
      : 0

    // Get vehicles needing maintenance (service due or expired documents)
    const now = new Date()
    const pendingMaintenanceCount = await db.listing.count({
      where: {
        userId,
        listingType: 'rental',
        OR: [
          {
            nextServiceDue: {
              lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Due within 30 days
            }
          },
          {
            status: 'maintenance'
          }
        ]
      }
    })

    // Get vehicles with expiring documents (within 60 days)
    const expiringDocumentsCount = await db.listing.count({
      where: {
        userId,
        listingType: 'rental',
        OR: [
          {
            insuranceExpiry: {
              lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
            }
          },
          {
            registrationExpiry: {
              lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
            }
          }
        ]
      }
    })

    // Get recent performance metrics
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [recentBookings, previousBookings] = await Promise.all([
      db.rentalBooking.count({
        where: {
          listing: {
            userId,
            listingType: 'rental'
          },
          createdAt: { gte: last30Days }
        }
      }),
      db.rentalBooking.count({
        where: {
          listing: {
            userId,
            listingType: 'rental'
          },
          createdAt: {
            gte: last60Days,
            lt: last30Days
          }
        }
      })
    ])

    // Calculate growth rate
    const bookingGrowthRate = previousBookings > 0 
      ? Math.round(((recentBookings - previousBookings) / previousBookings) * 100)
      : recentBookings > 0 ? 100 : 0

    // Get top performing vehicles
    const topVehicles = await db.listing.findMany({
      where: {
        userId,
        listingType: 'rental'
      },
      include: {
        rentalBookings: {
          where: {
            status: { in: ['confirmed', 'completed'] }
          },
          select: {
            totalAmount: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 5
    })

    const topPerformers = topVehicles
      .map(vehicle => ({
        id: vehicle.id,
        title: vehicle.title,
        totalRevenue: vehicle.rentalBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        totalBookings: vehicle.rentalBookings.length,
        averageRating: vehicle.reviews.length > 0 
          ? vehicle.reviews.reduce((sum, review) => sum + review.rating, 0) / vehicle.reviews.length
          : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    const stats = {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      inactiveVehicles,
      totalRevenue: bookingStats._sum.totalAmount || 0,
      monthlyRevenue: monthlyBookingStats._sum.totalAmount || 0,
      averageUtilization: utilizationRate,
      averageRating: Math.round((ratingStats._avg.rating || 0) * 10) / 10,
      totalBookings: bookingStats._count.id || 0,
      pendingMaintenance: pendingMaintenanceCount,
      expiringDocuments: expiringDocumentsCount,
      bookingGrowthRate,
      topPerformers,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Fleet stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fleet statistics' },
      { status: 500 }
    )
  }
}