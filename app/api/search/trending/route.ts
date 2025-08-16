import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trendingQuerySchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  period: z.enum(['hour', 'day', 'week']).default('day')
})

// GET - Get trending searches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { limit, period } = trendingQuerySchema.parse({
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      period: searchParams.get('period')
    })

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'hour':
        startDate.setHours(now.getHours() - 1)
        break
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
    }

    // Get trending searches from analytics if available
    let trendingFromAnalytics: string[] = []
    try {
      const analyticsData = await prisma.searchAnalytics.groupBy({
        by: ['query'],
        where: {
          timestamp: {
            gte: startDate
          },
          query: {
            not: ''
          }
        },
        _count: {
          query: true
        },
        orderBy: {
          _count: {
            query: 'desc'
          }
        },
        take: Math.floor(limit * 0.7) // 70% from analytics
      })

      trendingFromAnalytics = analyticsData.map(item => item.query)
    } catch (error) {
      console.log('Analytics table not available, using fallback data')
    }

    // Get popular car makes and models as fallback/supplement
    const popularMakes = await prisma.listing.groupBy({
      by: ['make'],
      where: {
        status: 'ACTIVE',
        make: {
          not: null
        }
      },
      _count: {
        make: true
      },
      orderBy: {
        _count: {
          make: 'desc'
        }
      },
      take: 5
    })

    const popularModels = await prisma.listing.groupBy({
      by: ['model'],
      where: {
        status: 'ACTIVE',
        model: {
          not: null
        }
      },
      _count: {
        model: true
      },
      orderBy: {
        _count: {
          model: 'desc'
        }
      },
      take: 5
    })

    const popularLocations = await prisma.listing.groupBy({
      by: ['location'],
      where: {
        status: 'ACTIVE',
        location: {
          not: null
        }
      },
      _count: {
        location: true
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 3
    })

    // Combine trending searches with popular terms
    const fallbackTrending = [
      ...popularMakes.map(item => item.make!),
      ...popularModels.map(item => item.model!),
      ...popularLocations.map(item => item.location!)
    ]

    // Merge and deduplicate
    const allTrending = [...trendingFromAnalytics, ...fallbackTrending]
    const uniqueTrending = Array.from(new Set(allTrending)).slice(0, limit)

    // If we still don't have enough, add some default popular searches
    const defaultTrending = [
      'Toyota Camry',
      'Honda Civic',
      'Nissan Altima',
      'BMW X5',
      'Mercedes C-Class',
      'Audi A4',
      'Ford Explorer',
      'Hyundai Elantra',
      'Kia Optima',
      'Mazda CX-5',
      'Subaru Outback',
      'Volkswagen Jetta',
      'Lexus RX',
      'Acura TLX',
      'Infiniti Q50'
    ]

    const finalTrending = uniqueTrending.length >= limit 
      ? uniqueTrending 
      : [...uniqueTrending, ...defaultTrending.filter(term => !uniqueTrending.includes(term))].slice(0, limit)

    // Get recent popular searches (last 24 hours)
    let recentPopular: string[] = []
    try {
      const recentDate = new Date()
      recentDate.setHours(recentDate.getHours() - 24)
      
      const recentData = await prisma.searchAnalytics.groupBy({
        by: ['query'],
        where: {
          timestamp: {
            gte: recentDate
          },
          resultsCount: {
            gt: 0
          }
        },
        _count: {
          query: true
        },
        orderBy: {
          _count: {
            query: 'desc'
          }
        },
        take: 5
      })

      recentPopular = recentData.map(item => item.query)
    } catch (error) {
      // Fallback to some recent popular terms
      recentPopular = ['SUV', 'sedan', 'automatic', 'low mileage', 'certified']
    }

    return NextResponse.json({
      trending: finalTrending,
      recent: recentPopular,
      period,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Trending search error:', error)
    
    // Return fallback data on error
    const fallbackTrending = [
      'Toyota Camry',
      'Honda Civic',
      'BMW X5',
      'Mercedes C-Class',
      'Audi A4',
      'Ford Explorer',
      'Nissan Altima',
      'Hyundai Elantra',
      'Mazda CX-5',
      'Lexus RX'
    ]

    return NextResponse.json({
      trending: fallbackTrending.slice(0, 10),
      recent: ['SUV', 'sedan', 'automatic', 'low mileage', 'certified'],
      period: 'day',
      generatedAt: new Date().toISOString(),
      fallback: true
    })
  }
}