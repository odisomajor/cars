import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const commissionSchema = z.object({
  bookingId: z.string(),
  type: z.enum(['rental', 'sale', 'subscription', 'ad']),
  amount: z.number().positive(),
  rate: z.number().min(0).max(100), // Commission rate as percentage
  metadata: z.record(z.any()).optional()
});

const COMMISSION_RATES = {
  rental: 15, // 15% commission on rental bookings
  sale: 5,    // 5% commission on vehicle sales
  subscription: 10, // 10% commission on subscription fees
  ad: 20      // 20% commission on ad revenue
};

// GET - Retrieve commission data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const timeframe = searchParams.get('timeframe') || '30d';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user is admin or requesting their own data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'ADMIN';
    const targetUserId = userId && isAdmin ? userId : session.user.id;

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
      userId: targetUserId,
      createdAt: {
        gte: startDate,
        lte: now
      },
      ...(type && { type }),
      ...(status && { status })
    };

    // Get commissions with pagination
    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.commission.count({
      where: whereClause
    });

    // Get summary statistics
    const summary = await prisma.commission.groupBy({
      by: ['status'],
      where: {
        userId: targetUserId,
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _sum: {
        amount: true,
        commissionAmount: true
      },
      _count: {
        id: true
      }
    });

    // Get commission by type
    const commissionByType = await prisma.commission.groupBy({
      by: ['type'],
      where: {
        userId: targetUserId,
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _sum: {
        commissionAmount: true
      },
      _count: {
        id: true
      }
    });

    // Calculate monthly trends
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("commissionAmount") as total_commission,
        COUNT(*) as transaction_count,
        AVG("commissionAmount") as avg_commission
      FROM "Commission"
      WHERE "userId" = ${targetUserId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${now}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as any[];

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary: {
        total: summary.reduce((acc, item) => acc + (item._sum.commissionAmount || 0), 0),
        pending: summary.find(s => s.status === 'PENDING')?._sum.commissionAmount || 0,
        paid: summary.find(s => s.status === 'PAID')?._sum.commissionAmount || 0,
        cancelled: summary.find(s => s.status === 'CANCELLED')?._sum.commissionAmount || 0,
        count: summary.reduce((acc, item) => acc + item._count.id, 0)
      },
      byType: commissionByType.map(item => ({
        type: item.type,
        amount: item._sum.commissionAmount || 0,
        count: item._count.id
      })),
      trends: monthlyTrends.map(item => ({
        month: item.month,
        totalCommission: Number(item.total_commission) || 0,
        transactionCount: Number(item.transaction_count) || 0,
        avgCommission: Number(item.avg_commission) || 0
      })),
      rates: COMMISSION_RATES
    });
  } catch (error) {
    console.error('Commission fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new commission record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (only admins can create commission records)
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

    const body = await request.json();
    const validatedData = commissionSchema.parse(body);
    const { bookingId, type, amount, rate, metadata } = validatedData;

    // Calculate commission amount
    const commissionAmount = (amount * rate) / 100;

    // Get booking details to determine the user
    let userId: string;
    let referenceId: string;

    if (type === 'rental') {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id: bookingId },
        include: {
          rentalListing: {
            select: { userId: true }
          }
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      userId = booking.rentalListing.userId;
      referenceId = booking.id;
    } else {
      // For other types, you might need different logic
      // This is a simplified example
      return NextResponse.json(
        { error: 'Commission type not yet supported' },
        { status: 400 }
      );
    }

    // Create commission record
    const commission = await prisma.commission.create({
      data: {
        userId,
        type,
        referenceId,
        amount,
        rate,
        commissionAmount,
        status: 'PENDING',
        metadata: metadata || {},
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      commission,
      message: 'Commission record created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Commission creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update commission status (mark as paid, cancelled, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
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

    const body = await request.json();
    const { commissionIds, status, paymentReference } = body;

    if (!commissionIds || !Array.isArray(commissionIds) || !status) {
      return NextResponse.json(
        { error: 'Commission IDs and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'PAID', 'CANCELLED', 'PROCESSING'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update commission records
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'PAID' && paymentReference) {
      updateData.paidAt = new Date();
      updateData.paymentReference = paymentReference;
    }

    const updatedCommissions = await prisma.commission.updateMany({
      where: {
        id: {
          in: commissionIds
        }
      },
      data: updateData
    });

    return NextResponse.json({
      updated: updatedCommissions.count,
      status,
      message: `${updatedCommissions.count} commission(s) updated to ${status}`
    });
  } catch (error) {
    console.error('Commission update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}