import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (priority && priority !== 'ALL') {
      where.priority = priority
    }
    
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { booking: { bookingNumber: { contains: search, mode: 'insensitive' } } },
        { reportedBy: { name: { contains: search, mode: 'insensitive' } } },
        { reportedBy: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Fetch disputes with related data
    const disputes = await prisma.rentalBookingDispute.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true
              }
            },
            rentalListing: {
              select: {
                id: true,
                title: true,
                make: true,
                model: true,
                year: true,
                images: true
              }
            },
            rentalCompany: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.rentalBookingDispute.count({ where })

    // Get dispute statistics
    const stats = await prisma.rentalBookingDispute.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      disputes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: stats.map(stat => ({
        status: stat.status,
        count: stat._count.status
      }))
    })

  } catch (error) {
    console.error('Error fetching disputes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      bookingId, 
      reportedById, 
      reason, 
      description, 
      priority = 'MEDIUM',
      evidence
    } = body

    // Validate required fields
    if (!bookingId || !reportedById || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, reportedById, reason, description' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    // Check if booking exists
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: reportedById }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create dispute
    const dispute = await prisma.rentalBookingDispute.create({
      data: {
        bookingId,
        reportedById,
        reason,
        description,
        priority,
        evidence: evidence || [],
        status: 'OPEN',
        assignedToId: session.user.id // Auto-assign to creating admin
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            customer: {
              select: {
                name: true,
                email: true
              }
            },
            rentalListing: {
              select: {
                title: true
              }
            },
            rentalCompany: {
              select: {
                name: true
              }
            }
          }
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update booking status to disputed
    await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { status: 'DISPUTED' }
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_DISPUTE',
        resourceType: 'RENTAL_BOOKING_DISPUTE',
        resourceId: dispute.id,
        details: {
          bookingId,
          reason,
          priority,
          reportedBy: user.name
        }
      }
    })

    return NextResponse.json({ dispute }, { status: 201 })

  } catch (error) {
    console.error('Error creating dispute:', error)
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    )
  }
}