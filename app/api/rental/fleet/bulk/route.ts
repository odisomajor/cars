import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for bulk actions
const bulkActionSchema = z.object({
  action: z.enum([
    'activate',
    'deactivate', 
    'maintenance',
    'available',
    'delete',
    'update_rates',
    'update_location',
    'update_category',
    'schedule_maintenance'
  ]),
  vehicleIds: z.array(z.string()).min(1, 'At least one vehicle ID is required'),
  data: z.object({
    // For rate updates
    dailyRate: z.number().optional(),
    weeklyRate: z.number().optional(),
    monthlyRate: z.number().optional(),
    // For location updates
    location: z.string().optional(),
    // For category updates
    category: z.string().optional(),
    // For maintenance scheduling
    maintenanceDate: z.string().optional(),
    maintenanceType: z.string().optional(),
    maintenanceDescription: z.string().optional(),
    // General updates
    status: z.string().optional(),
    reason: z.string().optional()
  }).optional()
})

// POST /api/rental/fleet/bulk - Perform bulk actions on vehicles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, vehicleIds, data } = bulkActionSchema.parse(body)

    // Verify ownership of all vehicles
    const ownedVehicles = await db.listing.findMany({
      where: {
        id: { in: vehicleIds },
        userId: session.user.id,
        listingType: 'rental'
      },
      select: { id: true, title: true, status: true }
    })

    if (ownedVehicles.length !== vehicleIds.length) {
      return NextResponse.json(
        { error: 'Some vehicles not found or not owned by user' },
        { status: 403 }
      )
    }

    let result: any = { success: true, message: '', affectedVehicles: ownedVehicles.length }

    switch (action) {
      case 'activate':
        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            status: 'available',
            isActive: true,
            updatedAt: new Date()
          }
        })
        result.message = `${ownedVehicles.length} vehicles activated successfully`
        break

      case 'deactivate':
        // Check for active bookings first
        const activeBookings = await db.rentalBooking.count({
          where: {
            listingId: { in: vehicleIds },
            status: { in: ['confirmed', 'active'] },
            endDate: { gte: new Date() }
          }
        })

        if (activeBookings > 0) {
          return NextResponse.json(
            { error: `Cannot deactivate vehicles with ${activeBookings} active bookings` },
            { status: 400 }
          )
        }

        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            status: 'inactive',
            isActive: false,
            updatedAt: new Date()
          }
        })
        result.message = `${ownedVehicles.length} vehicles deactivated successfully`
        break

      case 'maintenance':
        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            status: 'maintenance',
            updatedAt: new Date()
          }
        })

        // Create maintenance records if data provided
        if (data?.maintenanceType && data?.maintenanceDescription) {
          const maintenanceRecords = vehicleIds.map(vehicleId => ({
            listingId: vehicleId,
            type: data.maintenanceType!,
            description: data.maintenanceDescription!,
            date: data.maintenanceDate ? new Date(data.maintenanceDate) : new Date(),
            status: 'scheduled',
            cost: 0
          }))

          await db.maintenanceRecord.createMany({
            data: maintenanceRecords
          })
        }

        result.message = `${ownedVehicles.length} vehicles marked for maintenance`
        break

      case 'available':
        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            status: 'available',
            updatedAt: new Date()
          }
        })
        result.message = `${ownedVehicles.length} vehicles marked as available`
        break

      case 'update_rates':
        if (!data?.dailyRate && !data?.weeklyRate && !data?.monthlyRate) {
          return NextResponse.json(
            { error: 'At least one rate must be provided' },
            { status: 400 }
          )
        }

        const rateUpdates: any = { updatedAt: new Date() }
        if (data.dailyRate) rateUpdates.rentalDailyRate = data.dailyRate
        if (data.weeklyRate) rateUpdates.rentalWeeklyRate = data.weeklyRate
        if (data.monthlyRate) rateUpdates.rentalMonthlyRate = data.monthlyRate

        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: rateUpdates
        })
        result.message = `Rates updated for ${ownedVehicles.length} vehicles`
        break

      case 'update_location':
        if (!data?.location) {
          return NextResponse.json(
            { error: 'Location is required' },
            { status: 400 }
          )
        }

        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            location: data.location,
            updatedAt: new Date()
          }
        })
        result.message = `Location updated for ${ownedVehicles.length} vehicles`
        break

      case 'update_category':
        if (!data?.category) {
          return NextResponse.json(
            { error: 'Category is required' },
            { status: 400 }
          )
        }

        await db.listing.updateMany({
          where: { id: { in: vehicleIds } },
          data: {
            category: data.category,
            updatedAt: new Date()
          }
        })
        result.message = `Category updated for ${ownedVehicles.length} vehicles`
        break

      case 'schedule_maintenance':
        if (!data?.maintenanceDate || !data?.maintenanceType) {
          return NextResponse.json(
            { error: 'Maintenance date and type are required' },
            { status: 400 }
          )
        }

        const scheduledMaintenanceRecords = vehicleIds.map(vehicleId => ({
          listingId: vehicleId,
          type: data.maintenanceType!,
          description: data.maintenanceDescription || `Scheduled ${data.maintenanceType}`,
          date: new Date(data.maintenanceDate!),
          status: 'scheduled',
          cost: 0
        }))

        await db.maintenanceRecord.createMany({
          data: scheduledMaintenanceRecords
        })

        result.message = `Maintenance scheduled for ${ownedVehicles.length} vehicles`
        break

      case 'delete':
        // Check for active bookings
        const activeBookingsForDelete = await db.rentalBooking.count({
          where: {
            listingId: { in: vehicleIds },
            status: { in: ['confirmed', 'active'] },
            endDate: { gte: new Date() }
          }
        })

        if (activeBookingsForDelete > 0) {
          return NextResponse.json(
            { error: `Cannot delete vehicles with ${activeBookingsForDelete} active bookings` },
            { status: 400 }
          )
        }

        // Delete in transaction
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

          await tx.listingView.deleteMany({
            where: { listingId: { in: vehicleIds } }
          })

          // Delete the vehicles
          await tx.listing.deleteMany({
            where: { id: { in: vehicleIds } }
          })
        })

        result.message = `${ownedVehicles.length} vehicles deleted successfully`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log the bulk action
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `bulk_${action}`,
        entityType: 'rental_vehicle',
        entityId: vehicleIds.join(','),
        details: {
          action,
          vehicleCount: ownedVehicles.length,
          vehicleIds,
          data
        }
      }
    }).catch(console.error) // Don't fail the main operation if logging fails

    return NextResponse.json(result)

  } catch (error) {
    console.error('Bulk action error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}

// GET /api/rental/fleet/bulk - Get bulk action options and constraints
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleIds = searchParams.get('vehicleIds')?.split(',') || []

    if (vehicleIds.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle IDs are required' },
        { status: 400 }
      )
    }

    // Get vehicle details and constraints
    const vehicles = await db.listing.findMany({
      where: {
        id: { in: vehicleIds },
        userId: session.user.id,
        listingType: 'rental'
      },
      include: {
        rentalBookings: {
          where: {
            status: { in: ['confirmed', 'active'] },
            endDate: { gte: new Date() }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        }
      }
    })

    const vehiclesWithActiveBookings = vehicles.filter(v => v.rentalBookings.length > 0)
    const availableActions = []

    // Determine available actions based on current state
    const statuses = [...new Set(vehicles.map(v => v.status))]
    
    if (statuses.includes('inactive')) {
      availableActions.push({
        action: 'activate',
        label: 'Activate Vehicles',
        description: 'Make vehicles available for rental',
        icon: 'CheckCircle',
        requiresConfirmation: false
      })
    }

    if (vehiclesWithActiveBookings.length === 0) {
      availableActions.push(
        {
          action: 'deactivate',
          label: 'Deactivate Vehicles',
          description: 'Remove vehicles from rental availability',
          icon: 'XCircle',
          requiresConfirmation: true
        },
        {
          action: 'delete',
          label: 'Delete Vehicles',
          description: 'Permanently remove vehicles from fleet',
          icon: 'Trash2',
          requiresConfirmation: true,
          destructive: true
        }
      )
    }

    availableActions.push(
      {
        action: 'maintenance',
        label: 'Mark for Maintenance',
        description: 'Set vehicles to maintenance status',
        icon: 'AlertTriangle',
        requiresConfirmation: false
      },
      {
        action: 'available',
        label: 'Mark as Available',
        description: 'Set vehicles to available status',
        icon: 'CheckCircle',
        requiresConfirmation: false
      },
      {
        action: 'update_rates',
        label: 'Update Rental Rates',
        description: 'Change daily, weekly, or monthly rates',
        icon: 'DollarSign',
        requiresConfirmation: false,
        requiresData: true,
        dataFields: ['dailyRate', 'weeklyRate', 'monthlyRate']
      },
      {
        action: 'update_location',
        label: 'Update Location',
        description: 'Change vehicle pickup location',
        icon: 'MapPin',
        requiresConfirmation: false,
        requiresData: true,
        dataFields: ['location']
      },
      {
        action: 'update_category',
        label: 'Update Category',
        description: 'Change vehicle category',
        icon: 'Tag',
        requiresConfirmation: false,
        requiresData: true,
        dataFields: ['category']
      },
      {
        action: 'schedule_maintenance',
        label: 'Schedule Maintenance',
        description: 'Schedule future maintenance',
        icon: 'Calendar',
        requiresConfirmation: false,
        requiresData: true,
        dataFields: ['maintenanceDate', 'maintenanceType', 'maintenanceDescription']
      }
    )

    return NextResponse.json({
      vehicles: vehicles.map(v => ({
        id: v.id,
        title: v.title,
        status: v.status,
        hasActiveBookings: v.rentalBookings.length > 0,
        activeBookingsCount: v.rentalBookings.length
      })),
      availableActions,
      constraints: {
        vehiclesWithActiveBookings: vehiclesWithActiveBookings.length,
        canDelete: vehiclesWithActiveBookings.length === 0,
        canDeactivate: vehiclesWithActiveBookings.length === 0
      }
    })

  } catch (error) {
    console.error('Bulk options error:', error)
    return NextResponse.json(
      { error: 'Failed to get bulk action options' },
      { status: 500 }
    )
  }
}