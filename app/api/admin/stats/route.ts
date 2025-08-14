import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      )
    }

    // Get total counts
    const [totalUsers, totalListings, totalBookings, totalFavorites] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.rentalBooking.count(),
      prisma.favorite.count(),
    ])

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    })

    // Format users by role data
    const roleStats = {
      BUYER: 0,
      SELLER: 0,
      RENTAL_COMPANY: 0,
      ADMIN: 0,
    }

    usersByRole.forEach((group) => {
      roleStats[group.role as keyof typeof roleStats] = group._count.id
    })

    const stats = {
      totalUsers,
      totalListings,
      totalBookings,
      totalFavorites,
      usersByRole: roleStats,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}