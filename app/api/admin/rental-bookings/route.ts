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
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus
    }
    
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { rentalListing: { title: { contains: search, mode: 'insensitive' } } },
        { rentalCompany: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Fetch bookings with related data
    const bookings = await prisma.rentalBooking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
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
            pricePerDay: true,
            location: true,
            images: true
          }
        },
        rentalCompany: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true
          }
        },
        dispute: {
          select: {
            id: true,
            reason: true,
            description: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.rentalBooking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching rental bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental bookings' },
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
    const { customerId, rentalListingId, startDate, endDate, totalAmount, paymentMethod } = body

    // Validate required fields
    if (!customerId || !rentalListingId || !startDate || !endDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Generate booking number
    const bookingNumber = `RB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Get rental listing to find company
    const rentalListing = await prisma.rentalListing.findUnique({
      where: { id: rentalListingId },
      include: { rentalCompany: true }
    })

    if (!rentalListing) {
      return NextResponse.json(
        { error: 'Rental listing not found' },
        { status: 404 }
      )
    }

    // Create booking
    const booking = await prisma.rentalBooking.create({
      data: {
        bookingNumber,
        customerId,
        rentalListingId,
        rentalCompanyId: rentalListing.rentalCompanyId,
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount,
        paymentMethod: paymentMethod || 'STRIPE',
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
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
            pricePerDay: true,
            location: true,
            images: true
          }
        },
        rentalCompany: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      }
    })

    return NextResponse.json({ booking }, { status: 201 })

  } catch (error) {
    console.error('Error creating rental booking:', error)
    return NextResponse.json(
      { error: 'Failed to create rental booking' },
      { status: 500 }
    )
  }
}