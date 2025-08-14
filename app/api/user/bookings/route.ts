import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Get bookings with rental listing details
    const [bookings, total] = await Promise.all([
      prisma.rentalBooking.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          rentalListing: {
            select: {
              id: true,
              title: true,
              make: true,
              model: true,
              year: true,
              images: true,
              location: true,
              pricePerDay: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  profile: {
                    select: {
                      phone: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.rentalBooking.count({ where })
    ])

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalDays: booking.totalDays,
      totalPrice: booking.totalPrice,
      status: booking.status,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      rentalListing: {
        id: booking.rentalListing.id,
        title: booking.rentalListing.title,
        make: booking.rentalListing.make,
        model: booking.rentalListing.model,
        year: booking.rentalListing.year,
        images: booking.rentalListing.images,
        location: booking.rentalListing.location,
        pricePerDay: booking.rentalListing.pricePerDay,
        owner: booking.rentalListing.user
      }
    }))

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        pending: await prisma.rentalBooking.count({ 
          where: { ...where, status: 'PENDING' } 
        }),
        confirmed: await prisma.rentalBooking.count({ 
          where: { ...where, status: 'CONFIRMED' } 
        }),
        active: await prisma.rentalBooking.count({ 
          where: { ...where, status: 'ACTIVE' } 
        }),
        completed: await prisma.rentalBooking.count({ 
          where: { ...where, status: 'COMPLETED' } 
        }),
        cancelled: await prisma.rentalBooking.count({ 
          where: { ...where, status: 'CANCELLED' } 
        })
      }
    })

  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}