import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicleId, dateRange } = await request.json()

    if (!vehicleId || !dateRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch current bookings for the date range
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        rentalListingId: vehicleId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        OR: [
          {
            startDate: {
              gte: new Date(dateRange.start),
              lte: new Date(dateRange.end)
            }
          },
          {
            endDate: {
              gte: new Date(dateRange.start),
              lte: new Date(dateRange.end)
            }
          },
          {
            AND: [
              { startDate: { lte: new Date(dateRange.start) } },
              { endDate: { gte: new Date(dateRange.end) } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Convert bookings to booked dates format
    const bookedDates = []
    for (const booking of bookings) {
      const currentDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      
      while (currentDate <= endDate) {
        bookedDates.push({
          date: currentDate.toISOString().split('T')[0],
          bookingId: booking.id,
          customerName: booking.user.name || 'Unknown',
          status: booking.status
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Fetch current pricing rules
    const pricingRules = await prisma.rentalPricingRule.findMany({
      where: {
        rentalListingId: vehicleId,
        isActive: true,
        OR: [
          {
            startDate: {
              lte: new Date(dateRange.end)
            },
            endDate: {
              gte: new Date(dateRange.start)
            }
          }
        ]
      },
      orderBy: {
        priority: 'asc'
      }
    })

    // Format pricing rules
    const formattedPricingRules = pricingRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      startDate: rule.startDate.toISOString().split('T')[0],
      endDate: rule.endDate.toISOString().split('T')[0],
      pricePerDay: rule.pricePerDay,
      multiplier: rule.multiplier,
      isActive: rule.isActive,
      priority: rule.priority
    }))

    return NextResponse.json({
      success: true,
      bookedDates,
      pricingRules: formattedPricingRules,
      updatedCount: bookedDates.length,
      syncTime: new Date().toISOString()
    })

  } catch (error) {
    console.error('Availability sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync availability' },
      { status: 500 }
    )
  }
}

// GET endpoint for manual sync trigger
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const dateRange = {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    }

    // Reuse POST logic
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ vehicleId, dateRange })
    })

    return await POST(postRequest)

  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: 'Failed to perform manual sync' },
      { status: 500 }
    )
  }
}