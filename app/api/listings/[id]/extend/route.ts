import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { days = 30 } = await request.json();
    const listingId = params.id;

    // Verify the listing belongs to the user
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate new expiration date
    const currentExpiry = listing.expiresAt || new Date();
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + (days * 24 * 60 * 60 * 1000));

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        expiresAt: newExpiry,
        status: listing.status === 'expired' ? 'active' : listing.status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: updatedListing.id,
        title: updatedListing.title,
        expiresAt: updatedListing.expiresAt,
        status: updatedListing.status
      },
      message: `Listing extended by ${days} days`
    });

  } catch (error) {
    console.error('Error extending listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}