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

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get user statistics
    const [totalUsers, verifiedUsers, activeUsers, newUsersThisMonth, usersByRole] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Verified users
      prisma.user.count({
        where: { isVerified: true }
      }),
      
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      })
    ])

    // Process role counts
    const roleStats = {
      BUYER: 0,
      SELLER: 0,
      RENTAL_COMPANY: 0,
      ADMIN: 0
    }

    usersByRole.forEach(group => {
      if (group.role in roleStats) {
        roleStats[group.role as keyof typeof roleStats] = group._count.id
      }
    })

    const stats = {
      totalUsers,
      verifiedUsers,
      newUsersThisMonth,
      activeUsers,
      usersByRole: roleStats
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}