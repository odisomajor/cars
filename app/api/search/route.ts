import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  minMileage: z.number().optional(),
  maxMileage: z.number().optional(),
  location: z.string().optional(),
  bodyType: z.array(z.string()).optional(),
  fuelType: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  condition: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  listingType: z.array(z.string()).optional(),
  sortBy: z.enum(['relevance', 'price', 'year', 'mileage', 'createdAt', 'views']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  includeRentals: z.boolean().default(false),
  radius: z.number().optional(), // for location-based search
  lat: z.number().optional(),
  lng: z.number().optional()
})

interface SearchFilters {
  q?: string
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  minMileage?: number
  maxMileage?: number
  location?: string
  bodyType?: string[]
  fuelType?: string[]
  transmission?: string[]
  condition?: string[]
  features?: string[]
  listingType?: string[]
  sortBy: 'relevance' | 'price' | 'year' | 'mileage' | 'createdAt' | 'views'
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
  includeRentals: boolean
  radius?: number
  lat?: number
  lng?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const rawParams = {
      q: searchParams.get('q') || undefined,
      make: searchParams.get('make') || undefined,
      model: searchParams.get('model') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minYear: searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined,
      maxYear: searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined,
      minMileage: searchParams.get('minMileage') ? parseInt(searchParams.get('minMileage')!) : undefined,
      maxMileage: searchParams.get('maxMileage') ? parseInt(searchParams.get('maxMileage')!) : undefined,
      location: searchParams.get('location') || undefined,
      bodyType: searchParams.get('bodyType')?.split(',').filter(Boolean) || undefined,
      fuelType: searchParams.get('fuelType')?.split(',').filter(Boolean) || undefined,
      transmission: searchParams.get('transmission')?.split(',').filter(Boolean) || undefined,
      condition: searchParams.get('condition')?.split(',').filter(Boolean) || undefined,
      features: searchParams.get('features')?.split(',').filter(Boolean) || undefined,
      listingType: searchParams.get('listingType')?.split(',').filter(Boolean) || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      includeRentals: searchParams.get('includeRentals') === 'true',
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined
    }

    const filters = searchSchema.parse(rawParams)
    const skip = (filters.page - 1) * filters.limit

    // Build search results
    const searchResults = await performAdvancedSearch(filters, skip)
    
    // Get search facets for filtering UI
    const facets = await getSearchFacets(filters)
    
    // Log search analytics (non-blocking)
    logSearchAnalytics(filters).catch(console.error)

    return NextResponse.json({
      results: searchResults.results,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: searchResults.total,
        pages: Math.ceil(searchResults.total / filters.limit)
      },
      facets,
      searchInfo: {
        query: filters.q,
        totalResults: searchResults.total,
        searchTime: searchResults.searchTime,
        appliedFilters: getAppliedFilters(filters)
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function performAdvancedSearch(filters: SearchFilters, skip: number) {
  const startTime = Date.now()
  
  // Build where clause for listings
  const listingWhere: any = {
    status: 'active',
    expiresAt: { gt: new Date() }
  }

  // Build where clause for rental listings
  const rentalWhere: any = {
    isActive: true,
    isDraft: false
  }

  // Apply text search
  if (filters.q) {
    const searchTerms = filters.q.split(' ').filter(term => term.length > 0)
    const searchConditions = searchTerms.map(term => ({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { make: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } }
      ]
    }))
    
    listingWhere.AND = searchConditions
    rentalWhere.AND = searchConditions
  }

  // Apply filters
  if (filters.make) {
    listingWhere.make = { contains: filters.make, mode: 'insensitive' }
    rentalWhere.make = { contains: filters.make, mode: 'insensitive' }
  }
  
  if (filters.model) {
    listingWhere.model = { contains: filters.model, mode: 'insensitive' }
    rentalWhere.model = { contains: filters.model, mode: 'insensitive' }
  }

  if (filters.location) {
    listingWhere.location = { contains: filters.location, mode: 'insensitive' }
    rentalWhere.location = { contains: filters.location, mode: 'insensitive' }
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    listingWhere.price = {}
    if (filters.minPrice) listingWhere.price.gte = filters.minPrice
    if (filters.maxPrice) listingWhere.price.lte = filters.maxPrice
    
    // For rentals, use daily price
    rentalWhere.pricePerDay = {}
    if (filters.minPrice) rentalWhere.pricePerDay.gte = filters.minPrice
    if (filters.maxPrice) rentalWhere.pricePerDay.lte = filters.maxPrice
  }

  // Year range
  if (filters.minYear || filters.maxYear) {
    listingWhere.year = {}
    rentalWhere.year = {}
    if (filters.minYear) {
      listingWhere.year.gte = filters.minYear
      rentalWhere.year.gte = filters.minYear
    }
    if (filters.maxYear) {
      listingWhere.year.lte = filters.maxYear
      rentalWhere.year.lte = filters.maxYear
    }
  }

  // Mileage range
  if (filters.minMileage || filters.maxMileage) {
    listingWhere.mileage = {}
    rentalWhere.mileage = {}
    if (filters.minMileage) {
      listingWhere.mileage.gte = filters.minMileage
      rentalWhere.mileage.gte = filters.minMileage
    }
    if (filters.maxMileage) {
      listingWhere.mileage.lte = filters.maxMileage
      rentalWhere.mileage.lte = filters.maxMileage
    }
  }

  // Array filters
  if (filters.bodyType?.length) {
    listingWhere.bodyType = { in: filters.bodyType }
    rentalWhere.bodyType = { in: filters.bodyType }
  }
  
  if (filters.fuelType?.length) {
    listingWhere.fuelType = { in: filters.fuelType }
    rentalWhere.fuelType = { in: filters.fuelType }
  }
  
  if (filters.transmission?.length) {
    listingWhere.transmission = { in: filters.transmission }
    rentalWhere.transmission = { in: filters.transmission }
  }
  
  if (filters.condition?.length) {
    listingWhere.condition = { in: filters.condition }
    // Rental listings might not have condition field
  }

  // Features filter (JSON contains)
  if (filters.features?.length) {
    const featureConditions = filters.features.map(feature => ({
      features: { contains: feature }
    }))
    listingWhere.AND = [...(listingWhere.AND || []), ...featureConditions]
    rentalWhere.AND = [...(rentalWhere.AND || []), ...featureConditions]
  }

  // Listing type filter
  if (filters.listingType?.length) {
    listingWhere.listingType = { in: filters.listingType }
  }

  // Build order by
  const getOrderBy = (sortBy: string, sortOrder: string) => {
    switch (sortBy) {
      case 'price':
        return { price: sortOrder }
      case 'year':
        return { year: sortOrder }
      case 'mileage':
        return { mileage: sortOrder }
      case 'views':
        return { views: sortOrder }
      case 'relevance':
        // For relevance, we'll use a combination of factors
        return [
          { listingType: 'desc' }, // Premium listings first
          { views: 'desc' },
          { createdAt: 'desc' }
        ]
      default:
        return { createdAt: sortOrder }
    }
  }

  const orderBy = getOrderBy(filters.sortBy, filters.sortOrder)
  const rentalOrderBy = filters.sortBy === 'price' 
    ? { pricePerDay: filters.sortOrder }
    : orderBy

  // Execute searches
  const promises = []
  
  // Regular listings
  promises.push(
    prisma.listing.findMany({
      where: listingWhere,
      orderBy,
      skip,
      take: filters.limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                isVerified: true,
                isCompanyVerified: true
              }
            }
          }
        }
      }
    }),
    prisma.listing.count({ where: listingWhere })
  )

  // Rental listings (if requested)
  if (filters.includeRentals) {
    promises.push(
      prisma.rentalListing.findMany({
        where: rentalWhere,
        orderBy: rentalOrderBy,
        skip,
        take: filters.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  isVerified: true,
                  isCompanyVerified: true
                }
              }
            }
          }
        }
      }),
      prisma.rentalListing.count({ where: rentalWhere })
    )
  }

  const results = await Promise.all(promises)
  
  let listings = results[0] as any[]
  let total = results[1] as number
  
  if (filters.includeRentals && results.length > 2) {
    const rentalListings = results[2] as any[]
    const rentalTotal = results[3] as number
    
    // Combine and sort results
    const combinedResults = [
      ...listings.map(l => ({ ...l, type: 'sale' })),
      ...rentalListings.map(l => ({ ...l, type: 'rental', price: l.pricePerDay }))
    ]
    
    // Re-sort combined results
    if (filters.sortBy === 'price') {
      combinedResults.sort((a, b) => {
        const priceA = a.type === 'rental' ? a.pricePerDay : a.price
        const priceB = b.type === 'rental' ? b.pricePerDay : b.price
        return filters.sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      })
    }
    
    listings = combinedResults.slice(0, filters.limit)
    total = total + rentalTotal
  }

  const searchTime = Date.now() - startTime

  return {
    results: listings,
    total,
    searchTime
  }
}

async function getSearchFacets(filters: SearchFilters) {
  // Get facet counts for filtering UI
  const [makes, bodyTypes, fuelTypes, transmissions, conditions, priceRanges] = await Promise.all([
    // Makes
    prisma.listing.groupBy({
      by: ['make'],
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _count: { make: true },
      orderBy: { _count: { make: 'desc' } },
      take: 20
    }),
    
    // Body Types
    prisma.listing.groupBy({
      by: ['bodyType'],
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _count: { bodyType: true },
      orderBy: { _count: { bodyType: 'desc' } }
    }),
    
    // Fuel Types
    prisma.listing.groupBy({
      by: ['fuelType'],
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _count: { fuelType: true },
      orderBy: { _count: { fuelType: 'desc' } }
    }),
    
    // Transmissions
    prisma.listing.groupBy({
      by: ['transmission'],
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _count: { transmission: true },
      orderBy: { _count: { transmission: 'desc' } }
    }),
    
    // Conditions
    prisma.listing.groupBy({
      by: ['condition'],
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _count: { condition: true },
      orderBy: { _count: { condition: 'desc' } }
    }),
    
    // Price ranges
    prisma.listing.aggregate({
      where: { status: 'active', expiresAt: { gt: new Date() } },
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true }
    })
  ])

  return {
    makes: makes.map(m => ({ value: m.make, count: m._count.make })),
    bodyTypes: bodyTypes.map(bt => ({ value: bt.bodyType, count: bt._count.bodyType })),
    fuelTypes: fuelTypes.map(ft => ({ value: ft.fuelType, count: ft._count.fuelType })),
    transmissions: transmissions.map(t => ({ value: t.transmission, count: t._count.transmission })),
    conditions: conditions.map(c => ({ value: c.condition, count: c._count.condition })),
    priceRange: {
      min: priceRanges._min.price || 0,
      max: priceRanges._max.price || 10000000,
      avg: Math.round(priceRanges._avg.price || 0)
    }
  }
}

function getAppliedFilters(filters: SearchFilters) {
  const applied: any = {}
  
  if (filters.q) applied.query = filters.q
  if (filters.make) applied.make = filters.make
  if (filters.model) applied.model = filters.model
  if (filters.location) applied.location = filters.location
  if (filters.minPrice) applied.minPrice = filters.minPrice
  if (filters.maxPrice) applied.maxPrice = filters.maxPrice
  if (filters.minYear) applied.minYear = filters.minYear
  if (filters.maxYear) applied.maxYear = filters.maxYear
  if (filters.bodyType?.length) applied.bodyType = filters.bodyType
  if (filters.fuelType?.length) applied.fuelType = filters.fuelType
  if (filters.transmission?.length) applied.transmission = filters.transmission
  if (filters.condition?.length) applied.condition = filters.condition
  if (filters.features?.length) applied.features = filters.features
  
  return applied
}

async function logSearchAnalytics(filters: SearchFilters) {
  try {
    // Log search for analytics (you can extend this to store in database)
    console.log('Search Analytics:', {
      query: filters.q,
      filters: getAppliedFilters(filters),
      timestamp: new Date().toISOString()
    })
    
    // You can implement database logging here
    // await prisma.searchAnalytics.create({ ... })
  } catch (error) {
    console.error('Failed to log search analytics:', error)
  }
}

// POST endpoint for saving searches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, filters, userId } = body

    if (!name || !filters || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save search to database (you'll need to create SavedSearch model)
    // const savedSearch = await prisma.savedSearch.create({
    //   data: {
    //     name,
    //     filters: JSON.stringify(filters),
    //     userId
    //   }
    // })

    return NextResponse.json({
      message: 'Search saved successfully'
      // id: savedSearch.id
    })

  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}