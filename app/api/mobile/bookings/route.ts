import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBookingSchema = z.object({
  listingId: z.string(),
  type: z.enum(['viewing', 'test_drive']),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  notes: z.string().optional(),
});

// GET /api/mobile/bookings - Get user bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (type) {
      where.type = type;
    }

    const [bookings, total] = await Promise.all([
      prisma.rentalBooking.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rentalBooking.count({ where }),
    ]);

    // Transform data for mobile app
    const transformedBookings = bookings.map((booking) => ({
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
    }));

    return NextResponse.json({
      bookings: transformedBookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/mobile/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if listing exists
    const listing = await prisma.rentalListing.findUnique({
      where: { id: validatedData.listingId },
      include: {
        dealer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Parse date and time
    const scheduledDateTime = new Date(`${validatedData.scheduledDate}T${validatedData.scheduledTime}:00`);
    
    // Validate future date
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Check for existing booking at the same time
    const existingBooking = await prisma.rentalBooking.findFirst({
      where: {
        listingId: validatedData.listingId,
        startDate: scheduledDateTime,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await prisma.rentalBooking.create({
      data: {
        userId: session.user.id,
        listingId: validatedData.listingId,
        type: validatedData.type,
        startDate: scheduledDateTime,
        endDate: new Date(scheduledDateTime.getTime() + 60 * 60 * 1000), // 1 hour duration
        status: 'PENDING',
        notes: validatedData.notes,
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

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: transformedBooking,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}