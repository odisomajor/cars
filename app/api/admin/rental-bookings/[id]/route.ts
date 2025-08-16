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

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: params.id },
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
            isVerified: true,
            verificationStatus: true
          }
        },
        dispute: {
          select: {
            id: true,
            reason: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            adminNotes: true
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
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Error fetching rental booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental booking' },
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
    const { status, paymentStatus, adminNotes, cancellationReason } = body

    // Validate status values
    const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED']
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status value' },
        { status: 400 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.rentalBooking.findUnique({
      where: { id: params.id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (cancellationReason && status === 'CANCELLED') {
      updateData.cancellationReason = cancellationReason
    }

    // Update booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: params.id },
      data: updateData,
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

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_RENTAL_BOOKING',
        resourceType: 'RENTAL_BOOKING',
        resourceId: params.id,
        details: {
          previousStatus: existingBooking.status,
          newStatus: status,
          previousPaymentStatus: existingBooking.paymentStatus,
          newPaymentStatus: paymentStatus,
          adminNotes
        }
      }
    })

    return NextResponse.json({ booking: updatedBooking })

  } catch (error) {
    console.error('Error updating rental booking:', error)
    return NextResponse.json(
      { error: 'Failed to update rental booking' },
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

    // Check if booking exists
    const existingBooking = await prisma.rentalBooking.findUnique({
      where: { id: params.id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled or disputed bookings
    if (!['CANCELLED', 'DISPUTED'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: 'Only cancelled or disputed bookings can be deleted' },
        { status: 400 }
      )
    }

    // Delete related records first
    await prisma.$transaction(async (tx) => {
      // Delete dispute if exists
      await tx.rentalBookingDispute.deleteMany({
        where: { bookingId: params.id }
      })

      // Delete payments
      await tx.payment.deleteMany({
        where: { bookingId: params.id }
      })

      // Delete the booking
      await tx.rentalBooking.delete({
        where: { id: params.id }
      })
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_RENTAL_BOOKING',
        resourceType: 'RENTAL_BOOKING',
        resourceId: params.id,
        details: {
          bookingNumber: existingBooking.bookingNumber,
          status: existingBooking.status,
          totalAmount: existingBooking.totalAmount
        }
      }
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })

  } catch (error) {
    console.error('Error deleting rental booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete rental booking' },
      { status: 500 }
    )
  }
}