import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Mobile-optimized listing response schema
interface MobileListing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  location: string
  thumbnail: string
  images: string[]
  status: string
  listingType: string
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

interface MobileListingDetail extends MobileListing {
  description: string
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  bodyType: string
  color: string
  engineSize: string
  features: string[]
  seller: {
    id: string
    name: string
    image: string
    rating: number
    verified: boolean
  }
  views: number
  contactInfo?: {
    phone: string
    email: string
  }
}

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  make: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'date_desc', 'date_asc']).optional().default('date_desc'),
  lastSync: z.string().optional(), // For incremental sync
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

// GET /api/mobile/listings - Mobile-optimized listings with incremental sync
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page)
    const limit = Math.min(parseInt(query.limit), 50) // Max 50 items per request
    const skip = (page - 1) * limit

    // Optional authentication for favorites
    const auth = verifyMobileToken(request)
    const userId = auth?.userId

    // Build where clause
    const where: any = {
      status: 'active'
    }

    // Incremental sync support
    if (query.lastSync) {
      where.updatedAt = {
        gt: new Date(query.lastSync)
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { make: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.make) {
      where.make = { equals: query.make, mode: 'insensitive' }
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {}
      if (query.minPrice) where.price.gte = parseInt(query.minPrice)
      if (query.maxPrice) where.price.lte = parseInt(query.maxPrice)
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' }
    }

    if (query.condition) {
      where.condition = query.condition
    }

    if (query.fuelType) {
      where.fuelType = query.fuelType
    }

    if (query.transmission) {
      where.transmission = query.transmission
    }

    // Sort options
    let orderBy: any = { createdAt: 'desc' }
    switch (query.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'date_asc':
        orderBy = { createdAt: 'asc' }
        break
    }

    // Fetch listings with minimal data for mobile
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          make: true,
          model: true,
          year: true,
          price: true,
          location: true,
          images: true,
          status: true,
          listingType: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          // Include favorites if user is authenticated
          ...(userId && {
            favorites: {
              where: { userId },
              select: { id: true }
            }
          })
        }
      }),
      prisma.listing.count({ where })
    ])

    // Transform to mobile format
    const mobileListings: MobileListing[] = listings.map(listing => {
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
        images: images.slice(0, 3), // Limit images for mobile
        status: listing.status,
        listingType: listing.listingType,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        isFavorite: userId ? (listing as any).favorites?.length > 0 : undefined
      }
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      listings: mobileListings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      },
      syncTimestamp: new Date().toISOString(),
      filters: {
        makes: await getAvailableMakes(),
        priceRange: await getPriceRange(),
        locations: await getAvailableLocations()
      }
    })

  } catch (error) {
    console.error('Mobile listings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for filter options
async function getAvailableMakes() {
  const makes = await prisma.listing.findMany({
    where: { status: 'active' },
    select: { make: true },
    distinct: ['make'],
    orderBy: { make: 'asc' }
  })
  return makes.map(m => m.make)
}

async function getPriceRange() {
  const result = await prisma.listing.aggregate({
    where: { status: 'active' },
    _min: { price: true },
    _max: { price: true }
  })
  return {
    min: result._min.price || 0,
    max: result._max.price || 10000000
  }
}

async function getAvailableLocations() {
  const locations = await prisma.listing.findMany({
    where: { status: 'active' },
    select: { location: true },
    distinct: ['location'],
    orderBy: { location: 'asc' }
  })
  return locations.map(l => l.location).filter(Boolean)
}

// POST /api/mobile/listings - Create listing from mobile
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
    
    // Validate required fields
    const requiredFields = ['title', 'make', 'model', 'year', 'price', 'location']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        ...body,
        userId: auth.userId,
        status: body.isDraft ? 'draft' : 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      listing,
      message: body.isDraft ? 'Draft saved successfully' : 'Listing created successfully'
    })

  } catch (error) {
    console.error('Mobile listing creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}