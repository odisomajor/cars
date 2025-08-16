import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const limit = searchParams.get('limit')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: any = {
      userId: userId || session.user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (provider && provider !== 'all') {
      where.provider = provider
    }

    // Fetch payments with optional filters
    const payments = await prisma.payment.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    })

    // Calculate summary statistics
    const summary = {
      total: payments.length,
      succeeded: payments.filter(p => p.status === 'succeeded').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      totalAmount: payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0)
    }

    return NextResponse.json({
      success: true,
      payments,
      summary
    })
  } catch (error) {
    console.error('Payment history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
}