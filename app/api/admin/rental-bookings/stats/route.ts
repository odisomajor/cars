import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get booking counts by status
    const [total, pending, confirmed, active, completed, cancelled, disputed] = await Promise.all([
      prisma.rentalBooking.count(),
      prisma.rentalBooking.count({ where: { status: 'PENDING' } }),
      prisma.rentalBooking.count({ where: { status: 'CONFIRMED' } }),
      prisma.rentalBooking.count({ where: { status: 'ACTIVE' } }),
      prisma.rentalBooking.count({ where: { status: 'COMPLETED' } }),
      prisma.rentalBooking.count({ where: { status: 'CANCELLED' } }),
      prisma.rentalBooking.count({ where: { status: 'DISPUTED' } })
    ])

    // Get revenue statistics
    const [totalRevenueResult, monthlyRevenueResult] = await Promise.all([
      prisma.rentalBooking.aggregate({
        where: {
          paymentStatus: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.rentalBooking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    // Get booking trends (last 12 months)
    const bookingTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as bookings,
        SUM(CASE WHEN "paymentStatus" = 'PAID' THEN "totalAmount" ELSE 0 END) as revenue
      FROM "RentalBooking"
      WHERE "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `

    // Get top performing companies
    const topCompanies = await prisma.rentalCompany.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // Get recent activity
    const recentBookings = await prisma.rentalBooking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customer: {
          select: {
            name: true
          }
        },
        rentalListing: {
          select: {
            title: true
          }
        }
      }
    })

    // Get payment method distribution
    const paymentMethods = await prisma.rentalBooking.groupBy({
      by: ['paymentMethod'],
      _count: {
        paymentMethod: true
      },
      where: {
        paymentStatus: 'PAID'
      }
    })

    // Calculate average booking value
    const avgBookingValue = await prisma.rentalBooking.aggregate({
      where: {
        paymentStatus: 'PAID'
      },
      _avg: {
        totalAmount: true
      }
    })

    // Get dispute statistics
    const disputeStats = await prisma.rentalBookingDispute.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const stats = {
      total,
      pending,
      confirmed,
      active,
      completed,
      cancelled,
      disputed,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenueResult._sum.totalAmount || 0,
      averageBookingValue: avgBookingValue._avg.totalAmount || 0,
      bookingTrends,
      topCompanies: topCompanies.map(company => ({
        id: company.id,
        name: company.name,
        completedBookings: company._count.bookings
      })),
      recentBookings,
      paymentMethods: paymentMethods.map(pm => ({
        method: pm.paymentMethod,
        count: pm._count.paymentMethod
      })),
      disputeStats: disputeStats.map(ds => ({
        status: ds.status,
        count: ds._count.status
      }))
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error fetching rental booking stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental booking statistics' },
      { status: 500 }
    )
  }
}