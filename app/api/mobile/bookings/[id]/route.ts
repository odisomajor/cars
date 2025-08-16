import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED']).optional(),
  notes: z.string().optional(),
});

// GET /api/mobile/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.rentalBooking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            dealer: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Transform data for mobile app
    const transformedBooking = {
      id: booking.id,
      listingId: booking.listingId,
      carTitle: `${booking.listing.year} ${booking.listing.make} ${booking.listing.model}`,
      dealerName: booking.listing.dealer?.name || 'Unknown Dealer',
      dealerPhone: booking.listing.dealer?.phone || '',
      type: booking.type || 'viewing',
      status: booking.status,
      scheduledDate: booking.startDate.toISOString().split('T')[0],
      scheduledTime: booking.startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };

    return NextResponse.json({ booking: transformedBooking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/bookings/[id] - Update booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.rentalBooking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be modified
    if (existingBooking.status === 'COMPLETED' || existingBooking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot modify completed or cancelled booking' },
        { status: 400 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            dealer: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Transform response for mobile app
    const transformedBooking = {
      id: updatedBooking.id,
      listingId: updatedBooking.listingId,
      carTitle: `${updatedBooking.listing.year} ${updatedBooking.listing.make} ${updatedBooking.listing.model}`,
      dealerName: updatedBooking.listing.dealer?.name || 'Unknown Dealer',
      dealerPhone: updatedBooking.listing.dealer?.phone || '',
      type: updatedBooking.type || 'viewing',
      status: updatedBooking.status,
      scheduledDate: updatedBooking.startDate.toISOString().split('T')[0],
      scheduledTime: updatedBooking.startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: updatedBooking.notes,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: transformedBooking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.rentalBooking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: 'Only pending or confirmed bookings can be cancelled' },
        { status: 400 }
      );
    }

    // Update booking status to cancelled instead of deleting
    const cancelledBooking = await prisma.rentalBooking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            dealer: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Transform response for mobile app
    const transformedBooking = {
      id: cancelledBooking.id,
      listingId: cancelledBooking.listingId,
      carTitle: `${cancelledBooking.listing.year} ${cancelledBooking.listing.make} ${cancelledBooking.listing.model}`,
      dealerName: cancelledBooking.listing.dealer?.name || 'Unknown Dealer',
      dealerPhone: cancelledBooking.listing.dealer?.phone || '',
      type: cancelledBooking.type || 'viewing',
      status: cancelledBooking.status,
      scheduledDate: cancelledBooking.startDate.toISOString().split('T')[0],
      scheduledTime: cancelledBooking.startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: cancelledBooking.notes,
      createdAt: cancelledBooking.createdAt.toISOString(),
      updatedAt: cancelledBooking.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: transformedBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}