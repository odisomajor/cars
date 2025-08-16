import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const dispute = await prisma.rentalBookingDispute.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                createdAt: true
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
                images: true,
                features: true
              }
            },
            rentalCompany: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                isVerified: true
              }
            },
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                paymentMethod: true,
                transactionId: true,
                createdAt: true
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
            image: true,
            createdAt: true
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
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dispute })

  } catch (error) {
    console.error('Error fetching dispute:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dispute' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      status, 
      priority, 
      assignedToId, 
      resolution, 
      adminNotes,
      refundAmount,
      compensationAmount
    } = body

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    // Check if dispute exists
    const existingDispute = await prisma.rentalBookingDispute.findUnique({
      where: { id: params.id },
      include: {
        booking: true
      }
    })

    if (!existingDispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
      
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date()
        updateData.resolvedById = session.user.id
        
        if (resolution) {
          updateData.resolution = resolution
        }
      }
    }

    if (priority) {
      updateData.priority = priority
    }

    if (assignedToId) {
      // Validate assigned user exists and is admin
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId }
      })
      
      if (!assignedUser || assignedUser.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Invalid assigned user' },
          { status: 400 }
        )
      }
      
      updateData.assignedToId = assignedToId
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (typeof refundAmount === 'number') {
      updateData.refundAmount = refundAmount
    }

    if (typeof compensationAmount === 'number') {
      updateData.compensationAmount = compensationAmount
    }

    // Update dispute
    const updatedDispute = await prisma.rentalBookingDispute.update({
      where: { id: params.id },
      data: updateData,
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

    // Update booking status if dispute is resolved
    if (status === 'RESOLVED' || status === 'CLOSED') {
      await prisma.rentalBooking.update({
        where: { id: existingDispute.bookingId },
        data: { 
          status: status === 'RESOLVED' ? 'COMPLETED' : 'CANCELLED'
        }
      })
    }

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_DISPUTE',
        resourceType: 'RENTAL_BOOKING_DISPUTE',
        resourceId: params.id,
        details: {
          previousStatus: existingDispute.status,
          newStatus: status,
          previousPriority: existingDispute.priority,
          newPriority: priority,
          resolution,
          refundAmount,
          compensationAmount
        }
      }
    })

    return NextResponse.json({ dispute: updatedDispute })

  } catch (error) {
    console.error('Error updating dispute:', error)
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check if dispute exists
    const existingDispute = await prisma.rentalBookingDispute.findUnique({
      where: { id: params.id }
    })

    if (!existingDispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of closed disputes
    if (existingDispute.status !== 'CLOSED') {
      return NextResponse.json(
        { error: 'Only closed disputes can be deleted' },
        { status: 400 }
      )
    }

    // Delete dispute and related messages
    await prisma.$transaction(async (tx) => {
      // Delete dispute messages
      await tx.disputeMessage.deleteMany({
        where: { disputeId: params.id }
      })

      // Delete the dispute
      await tx.rentalBookingDispute.delete({
        where: { id: params.id }
      })
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_DISPUTE',
        resourceType: 'RENTAL_BOOKING_DISPUTE',
        resourceId: params.id,
        details: {
          reason: existingDispute.reason,
          status: existingDispute.status,
          bookingId: existingDispute.bookingId
        }
      }
    })

    return NextResponse.json({ message: 'Dispute deleted successfully' })

  } catch (error) {
    console.error('Error deleting dispute:', error)
    return NextResponse.json(
      { error: 'Failed to delete dispute' },
      { status: 500 }
    )
  }
}