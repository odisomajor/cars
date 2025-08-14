import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch user's listings (both regular and rental)
    const [listings, rentalListings] = await Promise.all([
      prisma.listing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.rentalListing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    ])

    // Combine and format listings
    const allListings = [
      ...listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        mileage: listing.mileage,
        location: listing.location,
        images: listing.images,
        status: listing.status,
        listingType: 'SALE',
        views: listing.views,
        createdAt: listing.createdAt.toISOString(),
        expiresAt: listing.expiresAt?.toISOString() || null,
        user: listing.user
      })),
      ...rentalListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: listing.dailyRate,
        mileage: listing.mileage,
        location: listing.location,
        images: listing.images,
        status: listing.status,
        listingType: 'RENTAL',
        views: listing.views,
        createdAt: listing.createdAt.toISOString(),
        expiresAt: listing.expiresAt?.toISOString() || null,
        user: listing.user
      }))
    ]

    // Sort by creation date
    allListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      listings: allListings,
      total: allListings.length,
      active: allListings.filter(l => l.status === 'ACTIVE').length,
      sold: allListings.filter(l => l.status === 'SOLD').length,
      expired: allListings.filter(l => l.status === 'EXPIRED').length
    })

  } catch (error) {
    console.error("Error fetching user listings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}