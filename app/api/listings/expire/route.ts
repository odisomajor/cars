import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint can be called by a cron job to handle expired listings
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Find expired regular listings
    const expiredListings = await prisma.listing.findMany({
      where: {
        expiresAt: {
          lte: now
        },
        status: {
          in: ['active', 'featured']
        }
      },
      select: {
        id: true,
        title: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Find expired rental listings
    const expiredRentalListings = await prisma.rentalListing.findMany({
      where: {
        expiresAt: {
          lte: now
        },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Update expired regular listings
    if (expiredListings.length > 0) {
      await prisma.listing.updateMany({
        where: {
          id: {
            in: expiredListings.map(l => l.id)
          }
        },
        data: {
          status: 'expired',
          updatedAt: now
        }
      });
    }

    // Update expired rental listings
    if (expiredRentalListings.length > 0) {
      await prisma.rentalListing.updateMany({
        where: {
          id: {
            in: expiredRentalListings.map(l => l.id)
          }
        },
        data: {
          isActive: false,
          updatedAt: now
        }
      });
    }

    // TODO: Send notification emails to users about expired listings
    // This would integrate with your email service (SendGrid, etc.)
    const notificationPromises = [];
    
    for (const listing of expiredListings) {
      notificationPromises.push(
        // Example: sendExpirationNotification(listing.user.email, listing.title)
        console.log(`Listing expired: ${listing.title} for user ${listing.user.email}`)
      );
    }

    for (const listing of expiredRentalListings) {
      notificationPromises.push(
        // Example: sendExpirationNotification(listing.user.email, listing.title)
        console.log(`Rental listing expired: ${listing.title} for user ${listing.user.email}`)
      );
    }

    await Promise.all(notificationPromises);

    return NextResponse.json({
      success: true,
      expiredListings: expiredListings.length,
      expiredRentalListings: expiredRentalListings.length,
      message: `Processed ${expiredListings.length + expiredRentalListings.length} expired listings`
    });

  } catch (error) {
    console.error('Error processing expired listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get listings expiring soon (for dashboard warnings)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get listings expiring within specified days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringSoonListings = await prisma.listing.findMany({
      where: {
        userId: userId,
        expiresAt: {
          lte: futureDate,
          gte: new Date()
        },
        status: {
          not: 'expired'
        }
      },
      select: {
        id: true,
        title: true,
        expiresAt: true,
        listingType: true
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });

    const expiringSoonRentalListings = await prisma.rentalListing.findMany({
      where: {
        userId: userId,
        expiresAt: {
          lte: futureDate,
          gte: new Date()
        },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        expiresAt: true,
        listingType: true
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });

    return NextResponse.json({
      expiringSoon: {
        listings: expiringSoonListings,
        rentalListings: expiringSoonRentalListings
      },
      total: expiringSoonListings.length + expiringSoonRentalListings.length,
      days: days
    });

  } catch (error) {
    console.error('Error fetching expiring listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}