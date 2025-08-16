import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    // Get current date for time-based calculations
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get moderation statistics
    const [listingStats, reportStats, dailyStats] = await Promise.all([
      // Listing statistics by status
      prisma.listing.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Report statistics
      Promise.all([
        prisma.report.count(),
        prisma.report.count({
          where: { status: 'PENDING' }
        }),
        prisma.report.count({
          where: { status: 'RESOLVED' }
        }),
        prisma.report.count({
          where: { status: 'DISMISSED' }
        }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: startOfDay
            }
          }
        }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: startOfWeek
            }
          }
        })
      ]),
      
      // Daily moderation activity for the last 30 days
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count,
          'listing' as type
        FROM "Listing" 
        WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE("createdAt")
        UNION ALL
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count,
          'report' as type
        FROM "Report" 
        WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `
    ])

    // Process listing stats
    const listingCounts = listingStats.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Process report stats
    const [totalReports, pendingReports, resolvedReports, dismissedReports, reportsToday, reportsThisWeek] = reportStats

    // Get pending listings that need moderation
    const pendingListings = await prisma.listing.count({
      where: { status: 'PENDING' }
    })

    // Get high priority reports (multiple reports on same listing)
    const highPriorityReports = await prisma.report.groupBy({
      by: ['listingId'],
      where: {
        status: 'PENDING'
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    })

    // Get recent moderation activity
    const recentActivity = await prisma.listing.findMany({
      where: {
        moderatedAt: {
          gte: startOfWeek
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        moderatedAt: true,
        moderatedBy: true,
        user: {
          select: {
            name: true
          }
        },
        moderatedByUser: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        moderatedAt: 'desc'
      },
      take: 10
    })

    const stats = {
      listings: {
        total: Object.values(listingCounts).reduce((sum, count) => sum + count, 0),
        pending: listingCounts.pending || 0,
        approved: listingCounts.approved || 0,
        rejected: listingCounts.rejected || 0,
        needsModeration: pendingListings
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
        today: reportsToday,
        thisWeek: reportsThisWeek,
        highPriority: highPriorityReports.length
      },
      activity: {
        recent: recentActivity,
        daily: dailyStats
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching moderation stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}