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

    // Verify the rental listing belongs to the user
    const rentalListing = await prisma.rentalListing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id
      }
    });

    if (!rentalListing) {
      return NextResponse.json(
        { error: 'Rental listing not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate new expiration date
    const currentExpiry = rentalListing.expiresAt || new Date();
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + (days * 24 * 60 * 60 * 1000));

    // Update the rental listing
    const updatedListing = await prisma.rentalListing.update({
      where: { id: listingId },
      data: {
        expiresAt: newExpiry,
        isActive: true, // Reactivate if it was expired
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: updatedListing.id,
        title: updatedListing.title,
        expiresAt: updatedListing.expiresAt,
        isActive: updatedListing.isActive
      },
      message: `Rental listing extended by ${days} days`
    });

  } catch (error) {
    console.error('Error extending rental listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}