import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const userOnly = searchParams.get('userOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userOnly) {
      where.userId = session.user.id;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get both regular listings and rental listings
    const [listings, rentalListings, totalListings, totalRentalListings] = await Promise.all([
      type === 'rental' ? [] : prisma.listing.findMany({
        where: type === 'sale' ? where : { ...where, NOT: { id: 'dummy' } },
        orderBy: { createdAt: 'desc' },
        skip: type === 'sale' ? skip : 0,
        take: type === 'sale' ? limit : 0,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      type === 'sale' ? [] : prisma.rentalListing.findMany({
        where: type === 'rental' ? {
          ...where,
          // Map rental-specific fields
          ...(where.status && { isActive: where.status === 'active' })
        } : { userId: 'dummy' }, // Don't fetch if not rental type
        orderBy: { createdAt: 'desc' },
        skip: type === 'rental' ? skip : 0,
        take: type === 'rental' ? limit : 0,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      type === 'rental' ? 0 : prisma.listing.count({ 
        where: type === 'sale' ? where : { ...where, NOT: { id: 'dummy' } }
      }),
      type === 'sale' ? 0 : prisma.rentalListing.count({ 
        where: type === 'rental' ? {
          ...where,
          ...(where.status && { isActive: where.status === 'active' })
        } : { userId: 'dummy' }
      })
    ]);

    // Normalize rental listings to match listing format
    const normalizedRentalListings = rentalListings.map(rental => ({
      id: rental.id,
      title: rental.title,
      make: rental.make,
      model: rental.model,
      year: rental.year,
      price: 0, // Not applicable for rentals
      pricePerDay: rental.pricePerDay,
      location: rental.location,
      images: rental.images,
      status: rental.isActive ? 'active' : 'inactive',
      listingType: rental.isFeatured ? 'featured' : 
                   rental.isPremium ? 'premium' : 
                   rental.isSpotlight ? 'spotlight' : 'free',
      views: rental.views,
      contactCount: 0, // Not tracked for rentals yet
      createdAt: rental.createdAt,
      updatedAt: rental.updatedAt,
      expiresAt: null,
      type: 'rental' as const,
      user: rental.user
    }));

    // Normalize regular listings
    const normalizedListings = listings.map(listing => ({
      ...listing,
      type: 'sale' as const
    }));

    // Combine and sort by creation date if showing all types
    let allListings;
    let total;
    
    if (type === 'sale') {
      allListings = normalizedListings;
      total = totalListings;
    } else if (type === 'rental') {
      allListings = normalizedRentalListings;
      total = totalRentalListings;
    } else {
      // Combine both types and re-paginate
      const combined = [...normalizedListings, ...normalizedRentalListings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      allListings = combined.slice(skip, skip + limit);
      total = totalListings + totalRentalListings;
    }

    return NextResponse.json({
      listings: allListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, listingIds, listingId, data } = body;

    // Single listing update
    if (listingId && data) {
      const { type, ...updateData } = data;
      
      if (type === 'rental') {
        const updated = await prisma.rentalListing.updateMany({
          where: {
            id: listingId,
            userId: session.user.id
          },
          data: {
            ...updateData,
            updatedAt: new Date()
          }
        });
        
        if (updated.count === 0) {
          return NextResponse.json(
            { error: 'Listing not found or unauthorized' },
            { status: 404 }
          );
        }
      } else {
        const updated = await prisma.listing.updateMany({
          where: {
            id: listingId,
            userId: session.user.id
          },
          data: {
            ...updateData,
            updatedAt: new Date()
          }
        });
        
        if (updated.count === 0) {
          return NextResponse.json(
            { error: 'Listing not found or unauthorized' },
            { status: 404 }
          );
        }
      }
      
      return NextResponse.json({ success: true });
    }

    // Bulk operations
    if (!action || !listingIds || !Array.isArray(listingIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Separate listing IDs by type (we'll need to determine this)
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

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      updated: regularListingIds.length + rentalListingIds.length
    });

  } catch (error) {
    console.error('Error updating listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');
    const type = searchParams.get('type');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      );
    }

    if (type === 'rental') {
      const deleted = await prisma.rentalListing.deleteMany({
        where: {
          id: listingId,
          userId: session.user.id
        }
      });
      
      if (deleted.count === 0) {
        return NextResponse.json(
          { error: 'Listing not found or unauthorized' },
          { status: 404 }
        );
      }
    } else {
      const deleted = await prisma.listing.deleteMany({
        where: {
          id: listingId,
          userId: session.user.id
        }
      });
      
      if (deleted.count === 0) {
        return NextResponse.json(
          { error: 'Listing not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}