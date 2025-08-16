import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const now = new Date()
    
    // Calculate date ranges
    const thisMonthStart = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Fetch this month's payments
    const thisMonthPayments = await prisma.payment.findMany({
      where: {
        userId,
        status: 'succeeded',
        createdAt: {
          gte: thisMonthStart,
          lte: thisMonthEnd
        }
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true
      }
    })

    // Fetch last month's payments
    const lastMonthPayments = await prisma.payment.findMany({
      where: {
        userId,
        status: 'succeeded',
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true
      }
    })

    // Calculate statistics
    const thisMonthAmount = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const lastMonthAmount = lastMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    const thisMonthCount = thisMonthPayments.length
    const lastMonthCount = lastMonthPayments.length

    // Calculate growth percentages
    const amountGrowth = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
      : thisMonthAmount > 0 ? 100 : 0

    const countGrowth = lastMonthCount > 0
      ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
      : thisMonthCount > 0 ? 100 : 0

    // Fetch payment trends (last 6 months)
    const sixMonthsAgo = subMonths(now, 6)
    const monthlyTrends = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        status: 'succeeded',
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Group by month for trends
    const trends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      
      const monthPayments = await prisma.payment.findMany({
        where: {
          userId,
          status: 'succeeded',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          amount: true
        }
      })

      const monthAmount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0)
      
      trends.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        amount: monthAmount,
        count: monthPayments.length
      })
    }

    // Fetch payment method breakdown
    const paymentMethodStats = await prisma.payment.groupBy({
      by: ['provider'],
      where: {
        userId,
        status: 'succeeded'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Fetch listing type breakdown
    const listingTypeStats = await prisma.payment.groupBy({
      by: ['listingType'],
      where: {
        userId,
        status: 'succeeded'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const stats = {
      thisMonth: {
        amount: thisMonthAmount,
        count: thisMonthCount
      },
      lastMonth: {
        amount: lastMonthAmount,
        count: lastMonthCount
      },
      growth: {
        amount: amountGrowth,
        count: countGrowth
      },
      trends,
      paymentMethods: paymentMethodStats.map(stat => ({
        provider: stat.provider,
        amount: stat._sum.amount || 0,
        count: stat._count.id
      })),
      listingTypes: listingTypeStats.map(stat => ({
        listingType: stat.listingType,
        amount: stat._sum.amount || 0,
        count: stat._count.id
      }))
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Payment stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    )
  }
}