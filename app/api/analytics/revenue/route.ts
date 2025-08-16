import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Retrieve comprehensive revenue analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or has analytics access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const userId = searchParams.get('userId'); // Optional: filter by specific user

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: now
      },
      status: 'succeeded',
      ...(userId && { userId })
    };

    // Get total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get revenue by listing type
    const revenueByType = await prisma.payment.groupBy({
      by: ['listingType'],
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get monthly revenue trend
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions,
        AVG(amount) as avg_order_value
      FROM "Payment"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${now}
        AND status = 'succeeded'
        ${userId ? prisma.$queryRaw`AND "userId" = ${userId}` : prisma.$queryRaw``}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as any[];

    // Get daily revenue for the last 30 days
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as day,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM "Payment"
      WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
        AND "createdAt" <= ${now}
        AND status = 'succeeded'
        ${userId ? prisma.$queryRaw`AND "userId" = ${userId}` : prisma.$queryRaw``}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    ` as any[];

    // Get top performing users
    const topUsers = await prisma.payment.groupBy({
      by: ['userId'],
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 10
    });

    // Get user details for top performers
    const topUserDetails = await Promise.all(
      topUsers.map(async (user) => {
        const userInfo = await prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });
        return {
          ...userInfo,
          revenue: user._sum.amount || 0,
          transactions: user._count.id
        };
      })
    );

    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate);
    const periodDuration = now.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodDuration);

    const previousRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        },
        status: 'succeeded',
        ...(userId && { userId })
      },
      _sum: {
        amount: true
      }
    });

    const growthRate = previousRevenue._sum.amount 
      ? ((totalRevenue._sum.amount || 0) - (previousRevenue._sum.amount || 0)) / (previousRevenue._sum.amount || 1) * 100
      : 0;

    // Calculate average order value
    const avgOrderValue = totalRevenue._count.id > 0 
      ? (totalRevenue._sum.amount || 0) / totalRevenue._count.id 
      : 0;

    // Get subscription metrics
    const subscriptionMetrics = await prisma.subscription.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gt: now
        }
      }
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrrData = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gt: now
        }
      },
      select: {
        planId: true,
        billingCycle: true
      }
    });

    const planPricing = {
      starter: { monthly: 29, yearly: 290 },
      professional: { monthly: 79, yearly: 790 },
      enterprise: { monthly: 199, yearly: 1990 }
    };

    let mrr = 0;
    mrrData.forEach(sub => {
      const plan = planPricing[sub.planId as keyof typeof planPricing];
      if (plan) {
        if (sub.billingCycle === 'monthly') {
          mrr += plan.monthly;
        } else {
          mrr += plan.yearly / 12; // Convert yearly to monthly
        }
      }
    });

    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalTransactions: totalRevenue._count.id,
        avgOrderValue,
        growthRate,
        timeframe
      },
      revenueByType: revenueByType.map(item => ({
        type: item.listingType,
        revenue: item._sum.amount || 0,
        transactions: item._count.id,
        percentage: totalRevenue._sum.amount 
          ? ((item._sum.amount || 0) / (totalRevenue._sum.amount || 1)) * 100 
          : 0
      })),
      trends: {
        monthly: monthlyRevenue.map(item => ({
          period: item.month,
          revenue: Number(item.revenue) || 0,
          transactions: Number(item.transactions) || 0,
          avgOrderValue: Number(item.avg_order_value) || 0
        })),
        daily: dailyRevenue.map(item => ({
          date: item.day,
          revenue: Number(item.revenue) || 0,
          transactions: Number(item.transactions) || 0
        }))
      },
      topUsers: topUserDetails,
      subscriptions: {
        active: activeSubscriptions,
        mrr,
        breakdown: subscriptionMetrics.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}