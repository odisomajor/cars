import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, listingIds } = await request.json();

    if (!action || !listingIds || !Array.isArray(listingIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Separate listing IDs by type
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id
      },
      select: { id: true }
    });
    
    const rentalListings = await prisma.rentalListing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id
      },
      select: { id: true }
    });

    const regularListingIds = listings.map(l => l.id);
    const rentalListingIds = rentalListings.map(l => l.id);

    switch (action) {
      case 'activate':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.updateMany({
            where: { id: { in: regularListingIds } },
            data: { status: 'active', updatedAt: new Date() }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.updateMany({
            where: { id: { in: rentalListingIds } },
            data: { isActive: true, updatedAt: new Date() }
          })
        ]);
        break;

      case 'deactivate':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.updateMany({
            where: { id: { in: regularListingIds } },
            data: { status: 'inactive', updatedAt: new Date() }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.updateMany({
            where: { id: { in: rentalListingIds } },
            data: { isActive: false, updatedAt: new Date() }
          })
        ]);
        break;

      case 'archive':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.updateMany({
            where: { id: { in: regularListingIds } },
            data: { status: 'archived', updatedAt: new Date() }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.updateMany({
            where: { id: { in: rentalListingIds } },
            data: { isActive: false, updatedAt: new Date() }
          })
        ]);
        break;

      case 'delete':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.deleteMany({
            where: { id: { in: regularListingIds } }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.deleteMany({
            where: { id: { in: rentalListingIds } }
          })
        ]);
        break;

      case 'feature':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.updateMany({
            where: { id: { in: regularListingIds } },
            data: { 
              listingType: 'FEATURED',
              featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              updatedAt: new Date() 
            }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.updateMany({
            where: { id: { in: rentalListingIds } },
            data: { 
              listingType: 'FEATURED_RENTAL',
              featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              updatedAt: new Date() 
            }
          })
        ]);
        break;

      case 'unfeature':
        await Promise.all([
          regularListingIds.length > 0 && prisma.listing.updateMany({
            where: { id: { in: regularListingIds } },
            data: { 
              listingType: 'BASIC',
              featuredUntil: null,
              updatedAt: new Date() 
            }
          }),
          rentalListingIds.length > 0 && prisma.rentalListing.updateMany({
            where: { id: { in: rentalListingIds } },
            data: { 
              listingType: 'BASIC',
              featuredUntil: null,
              updatedAt: new Date() 
            }
          })
        ]);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      updated: regularListingIds.length + rentalListingIds.length,
      message: `Successfully ${action}d ${regularListingIds.length + rentalListingIds.length} listing(s)`
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}