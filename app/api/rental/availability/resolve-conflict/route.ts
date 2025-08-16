import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ConflictResolutionRequest {
  conflictId: string
  resolution: 'local' | 'remote'
  metadata?: any
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ConflictResolutionRequest = await request.json()
    const { conflictId, resolution, metadata } = body

    if (!conflictId || !resolution) {
      return NextResponse.json(
        { error: 'Conflict ID and resolution are required' },
        { status: 400 }
      )
    }

    // Get conflict details from sync log or conflict store
    // In a real implementation, you might store conflicts in a dedicated table
    const conflictLog = await prisma.syncLog.findFirst({
      where: {
        metadata: {
          path: ['conflicts'],
          array_contains: [{ id: conflictId }]
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!conflictLog) {
      return NextResponse.json(
        { error: 'Conflict not found' },
        { status: 404 }
      )
    }

    // Extract conflict details from metadata
    const conflicts = (conflictLog.metadata as any)?.conflicts || []
    const conflict = conflicts.find((c: any) => c.id === conflictId)

    if (!conflict) {
      return NextResponse.json(
        { error: 'Conflict details not found' },
        { status: 404 }
      )
    }

    let resolutionResult: any = {}

    // Apply resolution based on conflict type
    switch (conflict.conflictType) {
      case 'double_booking':
        resolutionResult = await resolveDoubleBookingConflict(conflict, resolution, session.user.id)
        break
      case 'pricing_mismatch':
        resolutionResult = await resolvePricingMismatchConflict(conflict, resolution, session.user.id)
        break
      case 'availability_conflict':
        resolutionResult = await resolveAvailabilityConflict(conflict, resolution, session.user.id)
        break
      default:
        return NextResponse.json(
          { error: 'Unknown conflict type' },
          { status: 400 }
        )
    }

    // Log the resolution
    await prisma.conflictResolution.create({
      data: {
        conflictId,
        conflictType: conflict.conflictType,
        vehicleId: conflict.vehicleId,
        resolvedBy: session.user.id,
        resolution,
        resolutionData: resolutionResult,
        metadata: {
          originalConflict: conflict,
          userMetadata: metadata
        }
      }
    })

    // Update the original sync log to mark conflict as resolved
    const updatedConflicts = conflicts.map((c: any) => 
      c.id === conflictId ? { ...c, resolved: true, resolvedAt: new Date().toISOString() } : c
    )

    await prisma.syncLog.update({
      where: { id: conflictLog.id },
      data: {
        metadata: {
          ...conflictLog.metadata,
          conflicts: updatedConflicts
        }
      }
    })

    return NextResponse.json({
      success: true,
      conflictId,
      resolution,
      resolutionResult,
      resolvedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Conflict resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve conflict' },
      { status: 500 }
    )
  }
}

// Resolve double booking conflicts
async function resolveDoubleBookingConflict(
  conflict: any,
  resolution: 'local' | 'remote',
  userId: string
) {
  const { localValue, remoteValue } = conflict
  
  if (resolution === 'local') {
    // Keep the first booking, cancel or modify the second
    const booking1 = localValue.booking1
    const booking2 = remoteValue.booking2
    
    // Update the conflicting booking
    await prisma.booking.update({
      where: { id: booking2.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'Resolved double booking conflict',
        cancelledBy: userId,
        cancelledAt: new Date()
      }
    })
    
    // Send notification to affected customer
    await prisma.notification.create({
      data: {
        userId: booking2.userId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled Due to Conflict',
        message: `Your booking has been cancelled due to a scheduling conflict. We apologize for the inconvenience.`,
        metadata: {
          bookingId: booking2.id,
          reason: 'double_booking_conflict'
        }
      }
    })
    
    return {
      action: 'cancelled_conflicting_booking',
      cancelledBookingId: booking2.id,
      keptBookingId: booking1.id
    }
  } else {
    // Keep the second booking, modify the first
    const booking1 = localValue.booking1
    const booking2 = remoteValue.booking2
    
    // Adjust the first booking's end date
    const newEndDate = new Date(booking2.startDate)
    newEndDate.setDate(newEndDate.getDate() - 1)
    
    await prisma.booking.update({
      where: { id: booking1.id },
      data: {
        endDate: newEndDate,
        modifiedBy: userId,
        modifiedAt: new Date()
      }
    })
    
    // Recalculate pricing for the shortened booking
    const daysDifference = Math.ceil(
      (newEndDate.getTime() - new Date(booking1.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    const dailyRate = booking1.totalAmount / Math.ceil(
      (new Date(booking1.endDate).getTime() - new Date(booking1.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    const newTotalAmount = dailyRate * daysDifference
    
    await prisma.booking.update({
      where: { id: booking1.id },
      data: {
        totalAmount: newTotalAmount
      }
    })
    
    // Send notification to affected customer
    await prisma.notification.create({
      data: {
        userId: booking1.userId,
        type: 'BOOKING_MODIFIED',
        title: 'Booking Modified Due to Conflict',
        message: `Your booking has been shortened to resolve a scheduling conflict. The new end date is ${newEndDate.toLocaleDateString()}.`,
        metadata: {
          bookingId: booking1.id,
          originalEndDate: booking1.endDate,
          newEndDate: newEndDate.toISOString(),
          refundAmount: booking1.totalAmount - newTotalAmount
        }
      }
    })
    
    return {
      action: 'modified_first_booking',
      modifiedBookingId: booking1.id,
      newEndDate: newEndDate.toISOString(),
      refundAmount: booking1.totalAmount - newTotalAmount
    }
  }
}

// Resolve pricing mismatch conflicts
async function resolvePricingMismatchConflict(
  conflict: any,
  resolution: 'local' | 'remote',
  userId: string
) {
  const { localValue, remoteValue } = conflict
  
  if (resolution === 'local') {
    // Keep the current booking price
    return {
      action: 'kept_booking_price',
      price: localValue.bookingPrice,
      ignoredRules: remoteValue.applicableRules
    }
  } else {
    // Apply the pricing rule with highest priority or most recent
    const applicableRules = remoteValue.applicableRules
    const selectedRule = applicableRules.reduce((prev: any, current: any) => 
      (current.priority || 0) > (prev.priority || 0) ? current : prev
    )
    
    // Update booking with new pricing
    const booking = await prisma.booking.findFirst({
      where: {
        vehicleId: conflict.vehicleId,
        startDate: { lte: new Date(conflict.date) },
        endDate: { gte: new Date(conflict.date) }
      }
    })
    
    if (booking) {
      const daysDifference = Math.ceil(
        (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      const newTotalAmount = selectedRule.price * daysDifference
      
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          totalAmount: newTotalAmount,
          modifiedBy: userId,
          modifiedAt: new Date()
        }
      })
      
      // Send notification if price changed significantly
      const priceDifference = Math.abs(newTotalAmount - booking.totalAmount)
      if (priceDifference > booking.totalAmount * 0.1) { // 10% threshold
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_PRICE_UPDATED',
            title: 'Booking Price Updated',
            message: `Your booking price has been updated due to pricing rule changes. New total: $${newTotalAmount.toFixed(2)}`,
            metadata: {
              bookingId: booking.id,
              oldPrice: booking.totalAmount,
              newPrice: newTotalAmount,
              priceDifference
            }
          }
        })
      }
      
      return {
        action: 'updated_booking_price',
        bookingId: booking.id,
        oldPrice: booking.totalAmount,
        newPrice: newTotalAmount,
        appliedRule: selectedRule
      }
    }
    
    return {
      action: 'no_booking_found',
      selectedRule
    }
  }
}

// Resolve availability conflicts
async function resolveAvailabilityConflict(
  conflict: any,
  resolution: 'local' | 'remote',
  userId: string
) {
  const { localValue, remoteValue } = conflict
  
  if (resolution === 'local') {
    // Keep local availability data
    await prisma.availabilityCache.upsert({
      where: {
        vehicleId_date: {
          vehicleId: conflict.vehicleId,
          date: new Date(conflict.date)
        }
      },
      update: {
        available: localValue.available,
        lastUpdated: new Date(),
        source: 'MANUAL_RESOLUTION'
      },
      create: {
        vehicleId: conflict.vehicleId,
        date: new Date(conflict.date),
        available: localValue.available,
        lastUpdated: new Date(),
        source: 'MANUAL_RESOLUTION'
      }
    })
    
    return {
      action: 'kept_local_availability',
      date: conflict.date,
      available: localValue.available
    }
  } else {
    // Use remote availability data
    await prisma.availabilityCache.upsert({
      where: {
        vehicleId_date: {
          vehicleId: conflict.vehicleId,
          date: new Date(conflict.date)
        }
      },
      update: {
        available: remoteValue.available,
        lastUpdated: new Date(),
        source: 'REMOTE_SYNC'
      },
      create: {
        vehicleId: conflict.vehicleId,
        date: new Date(conflict.date),
        available: remoteValue.available,
        lastUpdated: new Date(),
        source: 'REMOTE_SYNC'
      }
    })
    
    return {
      action: 'used_remote_availability',
      date: conflict.date,
      available: remoteValue.available
    }
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
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Get recent conflict resolutions
    const resolutions = await prisma.conflictResolution.findMany({
      where: vehicleId ? { vehicleId } : {},
      include: {
        resolvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      resolutions: resolutions.map(resolution => ({
        id: resolution.id,
        conflictId: resolution.conflictId,
        conflictType: resolution.conflictType,
        vehicleId: resolution.vehicleId,
        resolution: resolution.resolution,
        resolvedBy: resolution.resolvedByUser,
        resolvedAt: resolution.createdAt,
        resolutionData: resolution.resolutionData
      }))
    })

  } catch (error) {
    console.error('Get conflict resolutions error:', error)
    return NextResponse.json(
      { error: 'Failed to get conflict resolutions' },
      { status: 500 }
    )
  }
}