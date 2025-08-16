import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SyncRequest {
  vehicleIds: string[]
  fullSync?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

interface SyncConflict {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  conflictType: 'double_booking' | 'pricing_mismatch' | 'availability_conflict'
  description: string
  localValue: any
  remoteValue: any
  resolved: boolean
}

interface VehicleAvailability {
  vehicleId: string
  vehicleName: string
  lastUpdated: string
  syncStatus: 'synced' | 'pending' | 'error' | 'conflict'
  conflictCount: number
  bookingCount: number
  availableDays: number
  revenue: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SyncRequest = await request.json()
    const { vehicleIds, fullSync = false, dateRange } = body

    if (!vehicleIds || vehicleIds.length === 0) {
      return NextResponse.json({ error: 'Vehicle IDs are required' }, { status: 400 })
    }

    // Set default date range if not provided
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date()
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now

    const vehicleAvailability: VehicleAvailability[] = []
    const conflicts: SyncConflict[] = []
    let updatedCount = 0

    // Process each vehicle
    for (const vehicleId of vehicleIds) {
      try {
        // Get vehicle details
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
          include: {
            bookings: {
              where: {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
                status: { in: ['CONFIRMED', 'ACTIVE'] }
              }
            },
            pricingRules: {
              where: {
                startDate: { lte: endDate },
                endDate: { gte: startDate }
              }
            }
          }
        })

        if (!vehicle) {
          console.warn(`Vehicle ${vehicleId} not found`)
          continue
        }

        // Check for conflicts
        const vehicleConflicts = await detectConflicts(vehicle, startDate, endDate)
        conflicts.push(...vehicleConflicts)

        // Calculate availability metrics
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const bookedDays = vehicle.bookings.reduce((total, booking) => {
          const bookingStart = new Date(Math.max(booking.startDate.getTime(), startDate.getTime()))
          const bookingEnd = new Date(Math.min(booking.endDate.getTime(), endDate.getTime()))
          return total + Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        const availableDays = totalDays - bookedDays

        // Calculate revenue
        const revenue = vehicle.bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0)

        // Determine sync status
        let syncStatus: 'synced' | 'pending' | 'error' | 'conflict' = 'synced'
        if (vehicleConflicts.length > 0) {
          syncStatus = 'conflict'
        }

        vehicleAvailability.push({
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          lastUpdated: new Date().toISOString(),
          syncStatus,
          conflictCount: vehicleConflicts.length,
          bookingCount: vehicle.bookings.length,
          availableDays,
          revenue
        })

        // Update availability cache if full sync
        if (fullSync) {
          await updateAvailabilityCache(vehicleId, startDate, endDate, vehicle.bookings)
          updatedCount++
        }

        // Simulate sync progress for real-time updates
        if (vehicleIds.length > 1) {
          // In a real implementation, you might use WebSocket or Server-Sent Events
          // to send progress updates to the client
        }

      } catch (error) {
        console.error(`Error syncing vehicle ${vehicleId}:`, error)
        
        vehicleAvailability.push({
          vehicleId,
          vehicleName: 'Unknown Vehicle',
          lastUpdated: new Date().toISOString(),
          syncStatus: 'error',
          conflictCount: 0,
          bookingCount: 0,
          availableDays: 0,
          revenue: 0
        })
      }
    }

    // Log sync activity
    await prisma.syncLog.create({
      data: {
        userId: session.user.id,
        syncType: 'AVAILABILITY',
        vehicleIds: vehicleIds,
        status: conflicts.length > 0 ? 'COMPLETED_WITH_CONFLICTS' : 'COMPLETED',
        conflictCount: conflicts.length,
        updatedCount,
        metadata: {
          fullSync,
          dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
          totalVehicles: vehicleIds.length
        }
      }
    })

    return NextResponse.json({
      success: true,
      vehicleAvailability,
      conflicts,
      updatedCount,
      syncedAt: new Date().toISOString(),
      stats: {
        totalVehicles: vehicleIds.length,
        successfulSyncs: vehicleAvailability.filter(v => v.syncStatus === 'synced').length,
        conflictCount: conflicts.length,
        errorCount: vehicleAvailability.filter(v => v.syncStatus === 'error').length
      }
    })

  } catch (error) {
    console.error('Enhanced sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync availability data' },
      { status: 500 }
    )
  }
}

// Detect conflicts in vehicle availability
async function detectConflicts(
  vehicle: any,
  startDate: Date,
  endDate: Date
): Promise<SyncConflict[]> {
  const conflicts: SyncConflict[] = []

  // Check for double bookings
  const bookings = vehicle.bookings.sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())
  
  for (let i = 0; i < bookings.length - 1; i++) {
    const currentBooking = bookings[i]
    const nextBooking = bookings[i + 1]
    
    if (currentBooking.endDate > nextBooking.startDate) {
      conflicts.push({
        id: `conflict_${vehicle.id}_${Date.now()}_${i}`,
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        date: currentBooking.startDate.toISOString().split('T')[0],
        conflictType: 'double_booking',
        description: `Overlapping bookings detected between ${currentBooking.startDate.toLocaleDateString()} and ${nextBooking.startDate.toLocaleDateString()}`,
        localValue: {
          booking1: {
            id: currentBooking.id,
            startDate: currentBooking.startDate,
            endDate: currentBooking.endDate
          }
        },
        remoteValue: {
          booking2: {
            id: nextBooking.id,
            startDate: nextBooking.startDate,
            endDate: nextBooking.endDate
          }
        },
        resolved: false
      })
    }
  }

  // Check for pricing mismatches
  const pricingRules = vehicle.pricingRules
  for (const booking of bookings) {
    const applicableRules = pricingRules.filter((rule: any) => 
      rule.startDate <= booking.startDate && rule.endDate >= booking.endDate
    )
    
    if (applicableRules.length > 1) {
      conflicts.push({
        id: `conflict_${vehicle.id}_${booking.id}_pricing`,
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        date: booking.startDate.toISOString().split('T')[0],
        conflictType: 'pricing_mismatch',
        description: `Multiple pricing rules apply to booking on ${booking.startDate.toLocaleDateString()}`,
        localValue: { bookingPrice: booking.totalAmount },
        remoteValue: { applicableRules: applicableRules.map((r: any) => ({ id: r.id, price: r.dailyRate })) },
        resolved: false
      })
    }
  }

  return conflicts
}

// Update availability cache for faster lookups
async function updateAvailabilityCache(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
  bookings: any[]
) {
  try {
    // Delete existing cache entries for the date range
    await prisma.availabilityCache.deleteMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Generate availability entries for each day
    const cacheEntries = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Check if this date is booked
      const isBooked = bookings.some(booking => 
        booking.startDate <= currentDate && booking.endDate > currentDate
      )
      
      cacheEntries.push({
        vehicleId,
        date: new Date(currentDate),
        available: !isBooked,
        lastUpdated: new Date()
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Batch insert cache entries
    if (cacheEntries.length > 0) {
      await prisma.availabilityCache.createMany({
        data: cacheEntries,
        skipDuplicates: true
      })
    }

  } catch (error) {
    console.error('Error updating availability cache:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Get sync status for a specific vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        bookings: {
          where: {
            startDate: { gte: new Date() },
            status: { in: ['CONFIRMED', 'ACTIVE'] }
          },
          take: 10,
          orderBy: { startDate: 'asc' }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Get latest sync log
    const latestSync = await prisma.syncLog.findFirst({
      where: {
        syncType: 'AVAILABILITY',
        vehicleIds: { has: vehicleId }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      lastSync: latestSync?.createdAt?.toISOString() || null,
      syncStatus: latestSync?.status || 'NEVER_SYNCED',
      upcomingBookings: vehicle.bookings.length,
      nextBooking: vehicle.bookings[0] || null
    })

  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}