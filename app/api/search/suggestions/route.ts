import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const suggestionsSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['all', 'makes', 'models', 'locations', 'features']).default('all'),
  limit: z.number().min(1).max(20).default(10)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = suggestionsSchema.parse({
      q: searchParams.get('q'),
      type: searchParams.get('type') || 'all',
      limit: parseInt(searchParams.get('limit') || '10')
    })

    const suggestions = await getSearchSuggestions(params.q, params.type, params.limit)
    
    return NextResponse.json({
      query: params.q,
      suggestions,
      type: params.type
    })

  } catch (error) {
    console.error('Search suggestions error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSearchSuggestions(query: string, type: string, limit: number) {
  const suggestions: any[] = []
  const queryLower = query.toLowerCase()

  try {
    switch (type) {
      case 'makes':
        const makes = await getMakeSuggestions(queryLower, limit)
        suggestions.push(...makes)
        break
        
      case 'models':
        const models = await getModelSuggestions(queryLower, limit)
        suggestions.push(...models)
        break
        
      case 'locations':
        const locations = await getLocationSuggestions(queryLower, limit)
        suggestions.push(...locations)
        break
        
      case 'features':
        const features = await getFeatureSuggestions(queryLower, limit)
        suggestions.push(...features)
        break
        
      default: // 'all'
        // Get mixed suggestions from all categories
        const [makeResults, modelResults, locationResults, featureResults] = await Promise.all([
          getMakeSuggestions(queryLower, Math.ceil(limit * 0.3)),
          getModelSuggestions(queryLower, Math.ceil(limit * 0.3)),
          getLocationSuggestions(queryLower, Math.ceil(limit * 0.2)),
          getFeatureSuggestions(queryLower, Math.ceil(limit * 0.2))
        ])
        
        suggestions.push(...makeResults, ...modelResults, ...locationResults, ...featureResults)
        break
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.value === item.value && t.type === item.type)
      )
      .slice(0, limit)

    // Sort by relevance (exact matches first, then by popularity)
    return uniqueSuggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase().startsWith(queryLower) ? 1 : 0
      const bExact = b.value.toLowerCase().startsWith(queryLower) ? 1 : 0
      
      if (aExact !== bExact) return bExact - aExact
      return (b.count || 0) - (a.count || 0)
    })

  } catch (error) {
    console.error('Error getting suggestions:', error)
    return []
  }
}

async function getMakeSuggestions(query: string, limit: number) {
  const makes = await prisma.listing.groupBy({
    by: ['make'],
    where: {
      make: {
        contains: query,
        mode: 'insensitive'
      },
      status: 'active',
      expiresAt: { gt: new Date() }
    },
    _count: {
      make: true
    },
    orderBy: {
      _count: {
        make: 'desc'
      }
    },
    take: limit
  })

  return makes.map(make => ({
    value: make.make,
    type: 'make',
    count: make._count.make,
    category: 'Vehicle Make'
  }))
}

async function getModelSuggestions(query: string, limit: number) {
  const models = await prisma.listing.groupBy({
    by: ['model', 'make'],
    where: {
      model: {
        contains: query,
        mode: 'insensitive'
      },
      status: 'active',
      expiresAt: { gt: new Date() }
    },
    _count: {
      model: true
    },
    orderBy: {
      _count: {
        model: 'desc'
      }
    },
    take: limit
  })

  return models.map(model => ({
    value: `${model.make} ${model.model}`,
    type: 'model',
    count: model._count.model,
    category: 'Vehicle Model',
    make: model.make,
    model: model.model
  }))
}

async function getLocationSuggestions(query: string, limit: number) {
  const locations = await prisma.listing.groupBy({
    by: ['location'],
    where: {
      location: {
        contains: query,
        mode: 'insensitive'
      },
      status: 'active',
      expiresAt: { gt: new Date() }
    },
    _count: {
      location: true
    },
    orderBy: {
      _count: {
        location: 'desc'
      }
    },
    take: limit
  })

  return locations.map(location => ({
    value: location.location,
    type: 'location',
    count: location._count.location,
    category: 'Location'
  }))
}

async function getFeatureSuggestions(query: string, limit: number) {
  // This is a simplified version - in a real app, you'd want to parse JSON features
  const commonFeatures = [
    'Air Conditioning', 'Power Steering', 'Power Windows', 'ABS Brakes',
    'Airbags', 'Bluetooth', 'GPS Navigation', 'Backup Camera', 'Sunroof',
    'Leather Seats', 'Heated Seats', 'Cruise Control', 'Keyless Entry',
    'Remote Start', 'Parking Sensors', 'Lane Departure Warning',
    'Blind Spot Monitoring', 'Adaptive Cruise Control', 'Apple CarPlay',
    'Android Auto', 'Wireless Charging', 'Premium Sound System'
  ]

  const matchingFeatures = commonFeatures
    .filter(feature => feature.toLowerCase().includes(query))
    .slice(0, limit)
    .map(feature => ({
      value: feature,
      type: 'feature',
      category: 'Vehicle Feature',
      count: Math.floor(Math.random() * 100) + 10 // Mock count
    }))

  return matchingFeatures
}

// POST endpoint for tracking search suggestions usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { suggestion, query, userId } = body

    // Log suggestion usage for analytics
    console.log('Suggestion used:', {
      suggestion,
      originalQuery: query,
      userId,
      timestamp: new Date().toISOString()
    })

    // You can implement database logging here
    // await prisma.suggestionAnalytics.create({ ... })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error logging suggestion usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}