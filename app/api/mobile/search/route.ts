import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

interface SearchFilters {
  query?: string
  category?: string
  make?: string
  model?: string
  yearFrom?: number
  yearTo?: number
  priceFrom?: number
  priceTo?: number
  mileageFrom?: number
  mileageTo?: number
  fuelType?: string
  transmission?: string
  bodyType?: string
  location?: string
  radius?: number // km
  features?: string[]
  isRental?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'mileage_asc' | 'mileage_desc' | 'relevance'
  limit?: number
  offset?: number
}

export async function GET(request: NextRequest) {
  try {
    // JWT token is optional for search, but provides personalized results
    let userId: string | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
        userId = decoded.userId
      } catch (error) {
        // Invalid token, continue as anonymous user
        console.warn('Invalid token in search request')
      }
    }

    const { searchParams } = new URL(request.url)
    
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      make: searchParams.get('make') || undefined,
      model: searchParams.get('model') || undefined,
      yearFrom: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined,
      yearTo: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined,
      priceFrom: searchParams.get('priceFrom') ? parseFloat(searchParams.get('priceFrom')!) : undefined,
      priceTo: searchParams.get('priceTo') ? parseFloat(searchParams.get('priceTo')!) : undefined,
      mileageFrom: searchParams.get('mileageFrom') ? parseInt(searchParams.get('mileageFrom')!) : undefined,
      mileageTo: searchParams.get('mileageTo') ? parseInt(searchParams.get('mileageTo')!) : undefined,
      fuelType: searchParams.get('fuelType') || undefined,
      transmission: searchParams.get('transmission') || undefined,
      bodyType: searchParams.get('bodyType') || undefined,
      location: searchParams.get('location') || undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
      features: searchParams.get('features')?.split(',') || undefined,
      isRental: searchParams.get('isRental') === 'true',
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Build where clause
    const whereClause: any = {
      status: 'ACTIVE',
      expiresAt: {
        gt: new Date()
      }
    }

    // Text search
    if (filters.query) {
      whereClause.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { make: { contains: filters.query, mode: 'insensitive' } },
        { model: { contains: filters.query, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (filters.category) {
      whereClause.category = {
        name: filters.category
      }
    }

    // Vehicle filters
    if (filters.make) {
      whereClause.make = { contains: filters.make, mode: 'insensitive' }
    }
    if (filters.model) {
      whereClause.model = { contains: filters.model, mode: 'insensitive' }
    }
    if (filters.yearFrom || filters.yearTo) {
      whereClause.year = {}
      if (filters.yearFrom) whereClause.year.gte = filters.yearFrom
      if (filters.yearTo) whereClause.year.lte = filters.yearTo
    }
    if (filters.priceFrom || filters.priceTo) {
      whereClause.price = {}
      if (filters.priceFrom) whereClause.price.gte = filters.priceFrom
      if (filters.priceTo) whereClause.price.lte = filters.priceTo
    }
    if (filters.mileageFrom || filters.mileageTo) {
      whereClause.mileage = {}
      if (filters.mileageFrom) whereClause.mileage.gte = filters.mileageFrom
      if (filters.mileageTo) whereClause.mileage.lte = filters.mileageTo
    }
    if (filters.fuelType) {
      whereClause.fuelType = filters.fuelType
    }
    if (filters.transmission) {
      whereClause.transmission = filters.transmission
    }
    if (filters.bodyType) {
      whereClause.bodyType = filters.bodyType
    }
    if (filters.location) {
      whereClause.location = { contains: filters.location, mode: 'insensitive' }
    }
    if (filters.features && filters.features.length > 0) {
      whereClause.features = {
        hasEvery: filters.features
      }
    }

    // Rental filter
    if (filters.isRental) {
      whereClause.isRental = true
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' } // default
    
    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'date_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'date_desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'mileage_asc':
        orderBy = { mileage: 'asc' }
        break
      case 'mileage_desc':
        orderBy = { mileage: 'desc' }
        break
      case 'relevance':
        // For relevance, we'll use a combination of factors
        orderBy = [
          { views: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // Execute search
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  businessName: true,
                  isVerified: true,
                  location: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              favorites: true,
              views: true
            }
          },
          ...(userId && {
            favorites: {
              where: { userId },
              select: { id: true }
            }
          })
        },
        orderBy,
        take: filters.limit,
        skip: filters.offset
      }),
      prisma.listing.count({ where: whereClause })
    ])

    // Format results for mobile
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      images: listing.images,
      location: listing.location,
      createdAt: listing.createdAt.toISOString(),
      expiresAt: listing.expiresAt?.toISOString(),
      views: listing._count.views,
      favorites: listing._count.favorites,
      isFavorited: userId ? listing.favorites?.length > 0 : false,
      isRental: listing.isRental,
      
      // Vehicle details
      make: listing.make,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      bodyType: listing.bodyType,
      color: listing.color,
      engineSize: listing.engineSize,
      features: listing.features,
      
      // Category
      category: listing.category ? {
        id: listing.category.id,
        name: listing.category.name
      } : null,
      
      // Seller info
      seller: {
        id: listing.user.id,
        name: listing.user.name,
        image: listing.user.image,
        businessName: listing.user.profile?.businessName,
        isVerified: listing.user.profile?.isVerified || false,
        location: listing.user.profile?.location
      }
    }))

    // Get search suggestions if query is provided
    let suggestions: string[] = []
    if (filters.query && filters.query.length >= 2) {
      const makeSuggestions = await prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          make: {
            contains: filters.query,
            mode: 'insensitive'
          }
        },
        select: { make: true },
        distinct: ['make'],
        take: 5
      })
      
      const modelSuggestions = await prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          model: {
            contains: filters.query,
            mode: 'insensitive'
          }
        },
        select: { model: true },
        distinct: ['model'],
        take: 5
      })
      
      suggestions = [
        ...makeSuggestions.map(l => l.make).filter(Boolean),
        ...modelSuggestions.map(l => l.model).filter(Boolean)
      ].slice(0, 8)
    }

    // Save search query for analytics (if user is logged in)
    if (userId && filters.query) {
      await prisma.searchQuery.create({
        data: {
          userId,
          query: filters.query,
          filters: JSON.stringify(filters),
          resultsCount: totalCount
        }
      }).catch(error => {
        // Search analytics is optional, don't fail the request
        console.warn('Failed to save search query:', error)
      })
    }

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        total: totalCount,
        limit: filters.limit!,
        offset: filters.offset!,
        hasMore: (filters.offset! + filters.limit!) < totalCount
      },
      suggestions,
      appliedFilters: filters
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search listings' },
      { status: 500 }
    )
  }
}

// Save search and get popular searches
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { action, query, filters } = await request.json()

    if (action === 'save_search') {
      // Save search for later
      const savedSearch = await prisma.savedSearch.create({
        data: {
          userId,
          name: query || 'Saved Search',
          query: query || '',
          filters: JSON.stringify(filters || {}),
          notificationsEnabled: true
        }
      })

      return NextResponse.json({
        success: true,
        savedSearch: {
          id: savedSearch.id,
          name: savedSearch.name,
          query: savedSearch.query,
          filters: JSON.parse(savedSearch.filters),
          notificationsEnabled: savedSearch.notificationsEnabled,
          createdAt: savedSearch.createdAt.toISOString()
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Save search error:', error)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
}

// Get search suggestions and popular searches
export async function PUT(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'get_suggestions') {
      // Get popular makes and models
      const [popularMakes, popularModels, popularSearches] = await Promise.all([
        prisma.listing.groupBy({
          by: ['make'],
          where: {
            status: 'ACTIVE',
            make: { not: null }
          },
          _count: { make: true },
          orderBy: { _count: { make: 'desc' } },
          take: 10
        }),
        prisma.listing.groupBy({
          by: ['model'],
          where: {
            status: 'ACTIVE',
            model: { not: null }
          },
          _count: { model: true },
          orderBy: { _count: { model: 'desc' } },
          take: 10
        }),
        prisma.searchQuery.groupBy({
          by: ['query'],
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            },
            query: { not: '' }
          },
          _count: { query: true },
          orderBy: { _count: { query: 'desc' } },
          take: 10
        })
      ])

      return NextResponse.json({
        popularMakes: popularMakes.map(item => ({
          name: item.make,
          count: item._count.make
        })),
        popularModels: popularModels.map(item => ({
          name: item.model,
          count: item._count.model
        })),
        popularSearches: popularSearches.map(item => ({
          query: item.query,
          count: item._count.query
        }))
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Get suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}