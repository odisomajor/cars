import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const createVehicleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  category: z.string().min(1, 'Category is required'),
  dailyRate: z.number().min(0),
  weeklyRate: z.number().min(0).optional(),
  monthlyRate: z.number().min(0).optional(),
  location: z.string().min(1, 'Location is required'),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  mileage: z.number().min(0),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  seats: z.number().min(1),
  doors: z.number().min(2),
  airConditioning: z.boolean().default(false),
  gps: z.boolean().default(false),
  bluetooth: z.boolean().default(false),
  description: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  registrationExpiry: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string().optional()
})

const updateVehicleSchema = createVehicleSchema.partial()

// GET /api/rental/fleet - Get rental fleet vehicles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const whereClause: any = {
      userId: companyId || session.user.id,
      listingType: 'rental'
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (category && category !== 'all') {
      whereClause.category = {
        contains: category,
        mode: 'insensitive'
      }
    }

    if (location && location !== 'all') {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    if (fromDate || toDate) {
      whereClause.createdAt = {}
      if (fromDate) whereClause.createdAt.gte = new Date(fromDate)
      if (toDate) whereClause.createdAt.lte = new Date(toDate)
    }

    // Get vehicles with related data
    const [vehicles, totalCount] = await Promise.all([
      db.listing.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          rentalBookings: {
            where: {
              status: { in: ['confirmed', 'active'] }
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { startDate: 'asc' }
          },
          maintenanceRecords: {
            orderBy: { date: 'desc' },
            take: 5
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.listing.count({ where: whereClause })
    ])

    // Transform data to match frontend interface
    const transformedVehicles = vehicles.map(vehicle => {
      const currentBooking = vehicle.rentalBookings.find(booking => 
        new Date(booking.startDate) <= new Date() && 
        new Date(booking.endDate) >= new Date()
      )

      const upcomingBookings = vehicle.rentalBookings.filter(booking => 
        new Date(booking.startDate) > new Date()
      )

      const averageRating = vehicle.reviews.length > 0 
        ? vehicle.reviews.reduce((sum, review) => sum + review.rating, 0) / vehicle.reviews.length
        : 0

      return {
        id: vehicle.id,
        title: vehicle.title,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        dailyRate: vehicle.rentalDailyRate || 0,
        weeklyRate: vehicle.rentalWeeklyRate || 0,
        monthlyRate: vehicle.rentalMonthlyRate || 0,
        location: vehicle.location,
        status: vehicle.status,
        images: vehicle.images || [],
        features: vehicle.features || [],
        mileage: vehicle.mileage || 0,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        seats: vehicle.seats || 5,
        doors: vehicle.doors || 4,
        airConditioning: vehicle.airConditioning || false,
        gps: vehicle.gps || false,
        bluetooth: vehicle.bluetooth || false,
        totalBookings: vehicle.rentalBookings.length,
        totalRevenue: vehicle.rentalBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        averageRating,
        lastServiceDate: vehicle.lastServiceDate,
        nextServiceDue: vehicle.nextServiceDue,
        insuranceExpiry: vehicle.insuranceExpiry,
        registrationExpiry: vehicle.registrationExpiry,
        currentBooking: currentBooking ? {
          id: currentBooking.id,
          customerName: currentBooking.user.name || 'Unknown',
          startDate: currentBooking.startDate.toISOString(),
          endDate: currentBooking.endDate.toISOString(),
          totalAmount: currentBooking.totalAmount || 0
        } : undefined,
        upcomingBookings: upcomingBookings.map(booking => ({
          id: booking.id,
          customerName: booking.user.name || 'Unknown',
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          totalAmount: booking.totalAmount || 0
        })),
        maintenanceHistory: vehicle.maintenanceRecords.map(record => ({
          id: record.id,
          date: record.date.toISOString(),
          type: record.type,
          description: record.description,
          cost: record.cost || 0
        })),
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      vehicles: transformedVehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Fleet fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fleet data' },
      { status: 500 }
    )
  }
}

// POST /api/rental/fleet - Create new rental vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createVehicleSchema.parse(body)

    // Create the rental vehicle listing
    const vehicle = await db.listing.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        listingType: 'rental',
        rentalDailyRate: validatedData.dailyRate,
        rentalWeeklyRate: validatedData.weeklyRate,
        rentalMonthlyRate: validatedData.monthlyRate,
        status: 'available',
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
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
    })

    return NextResponse.json({
      message: 'Vehicle added to fleet successfully',
      vehicle: {
        id: vehicle.id,
        title: vehicle.title,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        dailyRate: vehicle.rentalDailyRate,
        status: vehicle.status,
        location: vehicle.location,
        createdAt: vehicle.createdAt.toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Vehicle creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}

// PUT /api/rental/fleet - Update multiple vehicles (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleIds, updates } = body

    if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle IDs are required' },
        { status: 400 }
      )
    }

    const validatedUpdates = updateVehicleSchema.parse(updates)

    // Update vehicles
    const updatedVehicles = await db.listing.updateMany({
      where: {
        id: { in: vehicleIds },
        userId: session.user.id,
        listingType: 'rental'
      },
      data: {
        ...validatedUpdates,
        ...(validatedUpdates.dailyRate && { rentalDailyRate: validatedUpdates.dailyRate }),
        ...(validatedUpdates.weeklyRate && { rentalWeeklyRate: validatedUpdates.weeklyRate }),
        ...(validatedUpdates.monthlyRate && { rentalMonthlyRate: validatedUpdates.monthlyRate }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `${updatedVehicles.count} vehicles updated successfully`,
      updatedCount: updatedVehicles.count
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update vehicles' },
      { status: 500 }
    )
  }
}

// DELETE /api/rental/fleet - Delete multiple vehicles
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleIds } = body

    if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle IDs are required' },
        { status: 400 }
      )
    }

    // Check for active bookings
    const activeBookings = await db.rentalBooking.findMany({
      where: {
        listingId: { in: vehicleIds },
        status: { in: ['confirmed', 'active'] },
        endDate: { gte: new Date() }
      }
    })

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicles with active bookings' },
        { status: 400 }
      )
    }

    // Delete vehicles and related data
    await db.$transaction(async (tx) => {
      // Delete related records first
      await tx.rentalBooking.deleteMany({
        where: { listingId: { in: vehicleIds } }
      })

      await tx.maintenanceRecord.deleteMany({
        where: { listingId: { in: vehicleIds } }
      })

      await tx.review.deleteMany({
        where: { listingId: { in: vehicleIds } }
      })

      await tx.favorite.deleteMany({
        where: { listingId: { in: vehicleIds } }
      })

      // Delete the vehicles
      await tx.listing.deleteMany({
        where: {
          id: { in: vehicleIds },
          userId: session.user.id,
          listingType: 'rental'
        }
      })
    })

    return NextResponse.json({
      message: `${vehicleIds.length} vehicles deleted successfully`
    })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicles' },
      { status: 500 }
    )
  }
}