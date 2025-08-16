import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get analytics data
    const [pageViews, users, listings, bookings, favorites, webVitals] = await Promise.all([
      // Page views from analytics events
      prisma.analyticsEvent.count({
        where: {
          eventType: 'page_view',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // User registrations
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // New listings
      prisma.listing.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Favorites
      prisma.favorite.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Web vitals
      prisma.webVital.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          metric: true,
          value: true,
          createdAt: true
        }
      })
    ])

    // Get unique visitors
    const uniqueVisitors = await prisma.analyticsEvent.findMany({
      where: {
        eventType: 'page_view',
        createdAt: {
          gte: startDate
        }
      },
      select: {
        sessionId: true
      },
      distinct: ['sessionId']
    })

    // Get device breakdown
    const deviceData = await prisma.analyticsEvent.groupBy({
      by: ['deviceType'],
      where: {
        eventType: 'page_view',
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // Get top pages
    const topPages = await prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: {
        eventType: 'page_view',
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get daily growth data
    const dailyData = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics_events 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Array<{
      date: string
      page_views: bigint
      unique_visitors: bigint
    }>

    // Get listing growth data
    const listingGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM listings 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Array<{
      date: string
      count: bigint
    }>

    // Get user growth data
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Array<{
      date: string
      count: bigint
    }>

    // Calculate conversion rate (bookings / page views)
    const conversionRate = pageViews > 0 ? (bookings / pageViews) * 100 : 0

    // Calculate average web vitals
    const webVitalsAvg = webVitals.reduce((acc, vital) => {
      if (!acc[vital.metric]) {
        acc[vital.metric] = { total: 0, count: 0 }
      }
      acc[vital.metric].total += vital.value
      acc[vital.metric].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const webVitalsData = Object.entries(webVitalsAvg).map(([metric, data]) => ({
      metric,
      value: data.total / data.count
    }))

    // Mock revenue data (replace with actual revenue calculation)
    const totalRevenue = bookings * 50 // Assuming $50 average commission per booking

    const analytics = {
      overview: {
        pageViews,
        uniqueVisitors: uniqueVisitors.length,
        conversionRate: Number(conversionRate.toFixed(2)),
        totalRevenue
      },
      growth: {
        users: userGrowth.map(item => ({
          date: item.date,
          count: Number(item.count)
        })),
        listings: listingGrowth.map(item => ({
          date: item.date,
          count: Number(item.count)
        })),
        traffic: dailyData.map(item => ({
          date: item.date,
          pageViews: Number(item.page_views),
          uniqueVisitors: Number(item.unique_visitors)
        }))
      },
      devices: deviceData.map(item => ({
        device: item.deviceType || 'Unknown',
        count: item._count.id
      })),
      topPages: topPages.map(item => ({
        page: item.page || 'Unknown',
        views: item._count.id
      })),
      webVitals: webVitalsData,
      revenue: {
        total: totalRevenue,
        breakdown: [
          { source: 'Listing Fees', amount: totalRevenue * 0.6 },
          { source: 'Premium Features', amount: totalRevenue * 0.3 },
          { source: 'Advertising', amount: totalRevenue * 0.1 }
        ]
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}