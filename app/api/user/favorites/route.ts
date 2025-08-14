import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addFavoriteSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
            mileage: true,
            location: true,
            images: true,
            condition: true,
            fuelType: true,
            transmission: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      favorites,
      count: favorites.length,
    })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { listingId } = addFavoriteSchema.parse(body)

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    })

    if (existingFavorite) {
      // Remove from favorites if already exists
      await prisma.favorite.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: listingId,
          },
        },
      })

      return NextResponse.json({
        message: 'Removed from favorites',
        action: 'removed',
        isFavorite: false,
      })
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId: listingId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Added to favorites',
      favorite,
      action: 'added',
      isFavorite: true,
    })
  } catch (error) {
    console.error('Manage favorite error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}