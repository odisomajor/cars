import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

interface MobileListingDetail {
  id: string
  title: string
  description: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: string
  fuelType: string
  transmission: string
  bodyType: string
  color: string
  engineSize: string
  location: string
  images: string[]
  features: string[]
  status: string
  listingType: string
  views: number
  createdAt: string
  updatedAt: string
  expiresAt: string
  seller: {
    id: string
    name: string
    image: string
    rating: number
    verified: boolean
    totalListings: number
    memberSince: string
  }
  contactInfo?: {
    phone: string
    email: string
  }
  isFavorite?: boolean
  relatedListings: {
    id: string
    title: string
    make: string
    model: string
    year: number
    price: number
    thumbnail: string
    location: string
  }[]
}

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

// GET /api/mobile/listings/[id] - Get detailed listing for mobile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const auth = verifyMobileToken(request)
    const userId = auth?.userId

    // Fetch listing with all details
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            profile: {
              select: {
                phone: true,
                businessLicense: true
              }
            },
            _count: {
              select: {
                listings: {
                  where: { status: 'active' }
                }
              }
            }
          }
        },
        // Include favorites if user is authenticated
        ...(userId && {
          favorites: {
            where: { userId },
            select: { id: true }
          }
        }),
        // Include reviews for seller rating
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            profile: {
              select: {
                phone: true,
                businessLicense: true
              }
            },
            _count: {
              select: {
                listings: {
                  where: { status: 'active' }
                }
              }
            },
            receivedReviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Increment view count (async, don't wait)
    prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    }).catch(console.error)

    // Calculate seller rating
    const reviews = listing.user.receivedReviews || []
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Get related listings (same make/model or similar price range)
    const relatedListings = await prisma.listing.findMany({
      where: {
        id: { not: id },
        status: 'active',
        OR: [
          {
            make: listing.make,
            model: listing.model
          },
          {
            price: {
              gte: listing.price * 0.8,
              lte: listing.price * 1.2
            }
          }
        ]
      },
      take: 5,
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        price: true,
        images: true,
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Process images
    const images = Array.isArray(listing.images) ? listing.images : 
                  typeof listing.images === 'string' ? listing.images.split(',') : []
    
    // Process features
    const features = Array.isArray(listing.features) ? listing.features :
                    typeof listing.features === 'string' ? listing.features.split(',') : []

    // Build mobile response
    const mobileListingDetail: MobileListingDetail = {
      id: listing.id,
      title: listing.title,
      description: listing.description || '',
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: listing.price,
      mileage: listing.mileage || 0,
      condition: listing.condition || 'used',
      fuelType: listing.fuelType || 'petrol',
      transmission: listing.transmission || 'manual',
      bodyType: listing.bodyType || 'sedan',
      color: listing.color || '',
      engineSize: listing.engineSize || '',
      location: listing.location,
      images: images.filter(Boolean),
      features: features.filter(Boolean),
      status: listing.status,
      listingType: listing.listingType || 'free',
      views: listing.views || 0,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      expiresAt: listing.expiresAt?.toISOString() || '',
      seller: {
        id: listing.user.id,
        name: listing.user.name || 'Anonymous',
        image: listing.user.image || '/default-avatar.png',
        rating: Math.round(averageRating * 10) / 10,
        verified: !!(listing.user.emailVerified && listing.user.phoneVerified),
        totalListings: listing.user._count.listings,
        memberSince: listing.user.createdAt.toISOString()
      },
      isFavorite: userId ? (listing as any).favorites?.length > 0 : undefined,
      relatedListings: relatedListings.map(related => {
        const relatedImages = Array.isArray(related.images) ? related.images :
                             typeof related.images === 'string' ? related.images.split(',') : []
        return {
          id: related.id,
          title: related.title,
          make: related.make,
          model: related.model,
          year: related.year,
          price: related.price,
          thumbnail: relatedImages[0] || '/placeholder-car.jpg',
          location: related.location
        }
      })
    }

    // Include contact info only if user is authenticated and not the owner
    if (userId && userId !== listing.userId) {
      mobileListingDetail.contactInfo = {
        phone: listing.user.profile?.phone || '',
        email: listing.user.email || ''
      }
    }

    return NextResponse.json({
      listing: mobileListingDetail,
      success: true
    })

  } catch (error) {
    console.error('Mobile listing detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/mobile/listings/[id] - Update listing from mobile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const auth = verifyMobileToken(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if user owns the listing
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, status: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
        // If changing from draft to active, set expiry
        ...(existingListing.status === 'draft' && body.status === 'active' && {
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      listing: updatedListing,
      message: 'Listing updated successfully'
    })

  } catch (error) {
    console.error('Mobile listing update error:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/mobile/listings/[id] - Delete listing from mobile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const auth = verifyMobileToken(request)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the listing
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true, title: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (existingListing.userId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully'
    })

  } catch (error) {
    console.error('Mobile listing deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}