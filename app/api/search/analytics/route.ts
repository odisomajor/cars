import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for tracking search events
const searchEventSchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.any()).optional(),
  resultsCount: z.number().int().min(0),
  clickedResultId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.enum(['header', 'page', 'suggestion', 'filter']).default('header')
})

// Schema for analytics query
const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  limit: z.number().int().min(1).max(100).default(20)
})

// POST - Track search event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = searchEventSchema.parse(body)

    // Create search analytics record
    await prisma.searchAnalytics.create({
      data: {
        query: validatedData.query,
        filters: validatedData.filters || {},
        resultsCount: validatedData.resultsCount,
        clickedResultId: validatedData.clickedResultId,
        sessionId: validatedData.sessionId,
        source: validatedData.source,
        userId: session?.user?.id,
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Search analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to track search event' },
      { status: 500 }
    )
  }
}

// GET - Retrieve search analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to access analytics
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const { period, limit } = analyticsQuerySchema.parse({
      period: searchParams.get('period'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    })

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get popular searches
    const popularSearches = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        timestamp: {
          gte: startDate
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
      take: limit
    })

    // Get search trends over time
    const searchTrends = await prisma.searchAnalytics.groupBy({
      by: ['timestamp'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Get zero result searches
    const zeroResultSearches = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        timestamp: {
          gte: startDate
        },
        resultsCount: 0
      },
      _count: {
        query: true
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: limit
    })

    // Get click-through rates
    const clickThroughData = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        timestamp: {
          gte: startDate
        },
        resultsCount: {
          gt: 0
        }
      },
      _count: {
        query: true
      },
      _sum: {
        resultsCount: true
      }
    })

    const clickedSearches = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        timestamp: {
          gte: startDate
        },
        clickedResultId: {
          not: null
        }
      },
      _count: {
        query: true
      }
    })

    // Calculate CTR for each query
    const clickThroughRates = clickThroughData.map(search => {
      const clicked = clickedSearches.find(c => c.query === search.query)
      const ctr = clicked ? (clicked._count.query / search._count.query) * 100 : 0
      
      return {
        query: search.query,
        searches: search._count.query,
        clicks: clicked?._count.query || 0,
        ctr: Math.round(ctr * 100) / 100
      }
    }).sort((a, b) => b.ctr - a.ctr).slice(0, limit)

    // Get filter usage statistics
    const filterUsage = await prisma.searchAnalytics.findMany({
      where: {
        timestamp: {
          gte: startDate
        },
        filters: {
          not: {}
        }
      },
      select: {
        filters: true
      }
    })

    // Analyze filter usage
    const filterStats: Record<string, number> = {}
    filterUsage.forEach(record => {
      const filters = record.filters as Record<string, any>
      Object.keys(filters).forEach(filterKey => {
        if (filters[filterKey] !== undefined && filters[filterKey] !== null && filters[filterKey] !== '') {
          filterStats[filterKey] = (filterStats[filterKey] || 0) + 1
        }
      })
    })

    const topFilters = Object.entries(filterStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([filter, count]) => ({ filter, count }))

    // Get overall statistics
    const totalSearches = await prisma.searchAnalytics.count({
      where: {
        timestamp: {
          gte: startDate
        }
      }
    })

    const uniqueQueries = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        timestamp: {
          gte: startDate
        }
      }
    })

    const avgResultsPerSearch = await prisma.searchAnalytics.aggregate({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _avg: {
        resultsCount: true
      }
    })

    const totalClicks = await prisma.searchAnalytics.count({
      where: {
        timestamp: {
          gte: startDate
        },
        clickedResultId: {
          not: null
        }
      }
    })

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalSearches,
        uniqueQueries: uniqueQueries.length,
        avgResultsPerSearch: Math.round((avgResultsPerSearch._avg.resultsCount || 0) * 100) / 100,
        totalClicks,
        overallCTR: totalSearches > 0 ? Math.round((totalClicks / totalSearches) * 10000) / 100 : 0
      },
      popularSearches: popularSearches.map(search => ({
        query: search.query,
        count: search._count.query
      })),
      searchTrends: searchTrends.map(trend => ({
        date: trend.timestamp,
        count: trend._count.id
      })),
      zeroResultSearches: zeroResultSearches.map(search => ({
        query: search.query,
        count: search._count.query
      })),
      clickThroughRates,
      topFilters
    })
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}