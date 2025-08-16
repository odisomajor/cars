import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

interface MobileFavoriteListing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  location: string
  thumbnail: string
  condition: string
  mileage: number
  fuelType: string
  transmission: string
  status: string
  createdAt: string
  addedToFavoritesAt: string
  seller: {
    id: string
    name: string
    verified: boolean
  }
}

const addFavoriteSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required')
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.enum(['date_added_desc', 'date_added_asc', 'price_asc', 'price_desc']).optional().default('date_added_desc')
})

// Verify JWT token for mobile requests
function verifyMobileToken(request: NextRequest): { userId: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.type !== 'access') {
      return null
    }
    return { userId: decoded.userId, role: decoded.role }
  } catch (error) {
    return null
  }
}

// GET /api/mobile/favorites - Get user's favorite listings
export async function GET(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page)
    const limit = Math.min(parseInt(query.limit), 50) // Max 50 items per request
    const skip = (page - 1) * limit

    // Sort options
    let orderBy: any = { createdAt: 'desc' }
    switch (query.sortBy) {
      case 'date_added_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'price_asc':
        orderBy = { listing: { price: 'asc' } }
        break
      case 'price_desc':
        orderBy = { listing: { price: 'desc' } }
        break
    }

    // Fetch favorites with listing details
    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where: {
          userId: auth.userId,
          listing: {
            status: 'active' // Only show active listings
          }
        },
        skip,
        take: limit,
        orderBy,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              make: true,
              model: true,
              year: true,
              price: true,
              location: true,
              images: true,
              condition: true,
              mileage: true,
              fuelType: true,
              transmission: true,
              status: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  emailVerified: true,
                  phoneVerified: true
                }
              }
            }
          }
        }
      }),
      prisma.favorite.count({
        where: {
          userId: auth.userId,
          listing: {
            status: 'active'
          }
        }
      })
    ])

    // Transform to mobile format
    const mobileFavorites: MobileFavoriteListing[] = favorites.map(favorite => {
      const listing = favorite.listing
      const images = Array.isArray(listing.images) ? listing.images : 
                    typeof listing.images === 'string' ? listing.images.split(',') : []
      
      return {
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        location: listing.location,
        thumbnail: images[0] || '/placeholder-car.jpg',
        condition: listing.condition || 'used',
        mileage: listing.mileage || 0,
        fuelType: listing.fuelType || 'petrol',
        transmission: listing.transmission || 'manual',
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        addedToFavoritesAt: favorite.createdAt.toISOString(),
        seller: {
          id: listing.user.id,
          name: listing.user.name || 'Anonymous',
          verified: !!(listing.user.emailVerified && listing.user.phoneVerified)
        }
      }
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      favorites: mobileFavorites,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      },
      success: true
    })

  } catch (error) {
    console.error('Mobile favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/mobile/favorites - Add listing to favorites
export async function POST(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId } = addFavoriteSchema.parse(body)

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        status: true,
        userId: true
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      )
    }

    // Prevent users from favoriting their own listings
    if (listing.userId === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot favorite your own listing' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: auth.userId,
          listingId: listingId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Listing already in favorites' },
        { status: 400 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: auth.userId,
        listingId: listingId
      },
      select: {
        id: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        listingId: listingId,
        addedAt: favorite.createdAt.toISOString()
      },
      message: `${listing.title} added to favorites`
    })

  } catch (error) {
    console.error('Mobile add favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

// DELETE /api/mobile/favorites - Remove listing from favorites
export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if favorite exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: auth.userId,
          listingId: listingId
        }
      },
      include: {
        listing: {
          select: {
            title: true
          }
        }
      }
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: auth.userId,
          listingId: listingId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${existingFavorite.listing.title} removed from favorites`
    })

  } catch (error) {
    console.error('Mobile remove favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
}

// PUT /api/mobile/favorites/bulk - Bulk operations on favorites
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, listingIds } = body

    if (!action || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    if (action === 'remove') {
      // Bulk remove favorites
      const result = await prisma.favorite.deleteMany({
        where: {
          userId: auth.userId,
          listingId: {
            in: listingIds
          }
        }
      })

      return NextResponse.json({
        success: true,
        removedCount: result.count,
        message: `Removed ${result.count} listing(s) from favorites`
      })
    }

    if (action === 'add') {
      // Bulk add favorites
      const validListings = await prisma.listing.findMany({
        where: {
          id: { in: listingIds },
          status: 'active',
          userId: { not: auth.userId } // Exclude own listings
        },
        select: { id: true }
      })

      const validListingIds = validListings.map(l => l.id)
      
      // Filter out already favorited listings
      const existingFavorites = await prisma.favorite.findMany({
        where: {
          userId: auth.userId,
          listingId: { in: validListingIds }
        },
        select: { listingId: true }
      })

      const existingListingIds = existingFavorites.map(f => f.listingId)
      const newListingIds = validListingIds.filter(id => !existingListingIds.includes(id))

      if (newListingIds.length > 0) {
        await prisma.favorite.createMany({
          data: newListingIds.map(listingId => ({
            userId: auth.userId,
            listingId
          }))
        })
      }

      return NextResponse.json({
        success: true,
        addedCount: newListingIds.length,
        skippedCount: listingIds.length - newListingIds.length,
        message: `Added ${newListingIds.length} listing(s) to favorites`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "add" or "remove"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Mobile bulk favorites error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}