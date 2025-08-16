import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const upgradeSchema = z.object({
  listingType: z.enum(['FEATURED', 'PREMIUM', 'SPOTLIGHT']),
  duration: z.enum(['7', '14', '30']).optional().default('30'),
  paymentMethodId: z.string().optional()
});

const UPGRADE_PRICING = {
  FEATURED: {
    '7': 15,
    '14': 25,
    '30': 45
  },
  PREMIUM: {
    '7': 25,
    '14': 45,
    '30': 75
  },
  SPOTLIGHT: {
    '7': 45,
    '14': 75,
    '30': 125
  }
};

const UPGRADE_FEATURES = {
  FEATURED: {
    name: 'Featured Listing',
    description: 'Enhanced visibility with blue badge',
    benefits: [
      'Blue "Featured" badge',
      'Higher search ranking',
      'Appears in featured carousel',
      '2x more visibility'
    ]
  },
  PREMIUM: {
    name: 'Premium Listing',
    description: 'Priority placement with purple badge',
    benefits: [
      'Purple "Premium" badge',
      'Priority search placement',
      'Featured in premium section',
      'Advanced analytics',
      '3x more visibility'
    ]
  },
  SPOTLIGHT: {
    name: 'Spotlight Listing',
    description: 'Top placement with gold badge and glow effect',
    benefits: [
      'Gold "Spotlight" badge with glow',
      'Top search placement',
      'Homepage spotlight section',
      'Premium analytics dashboard',
      'Priority customer support',
      '5x more visibility'
    ]
  }
};

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get upgrade options for a listing
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Check if listing exists and belongs to user
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        status: true,
        listingType: true,
        premiumExpiresAt: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found or access denied' },
        { status: 404 }
      );
    }

    // Check current premium status
    const now = new Date();
    const isCurrentlyPremium = listing.premiumExpiresAt && listing.premiumExpiresAt > now;
    const currentType = isCurrentlyPremium ? listing.listingType : 'BASIC';

    return NextResponse.json({
      listing: {
        id: listing.id,
        title: listing.title,
        currentType,
        premiumExpiresAt: listing.premiumExpiresAt,
        isCurrentlyPremium
      },
      upgradeOptions: {
        pricing: UPGRADE_PRICING,
        features: UPGRADE_FEATURES
      },
      availableUpgrades: Object.keys(UPGRADE_FEATURES).filter(
        type => type !== currentType
      )
    });
  } catch (error) {
    console.error('Upgrade options fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upgrade listing to premium tier
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = upgradeSchema.parse(body);
    const { listingType, duration, paymentMethodId } = validatedData;
    const listingId = params.id;

    // Check if listing exists and belongs to user
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

    // Calculate pricing
    const price = UPGRADE_PRICING[listingType][duration as keyof typeof UPGRADE_PRICING[typeof listingType]];
    
    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update listing
      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: {
          listingType,
          premiumExpiresAt: expiresAt,
          status: 'active',
          updatedAt: now
        }
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          amount: price,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: paymentMethodId ? 'stripe' : 'pending',
          listingType,
          metadata: {
            listingId,
            duration,
            upgradeType: 'listing_upgrade',
            previousType: listing.listingType || 'BASIC'
          }
        }
      });

      return { listing: updatedListing, payment };
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: result.listing.id,
        title: result.listing.title,
        listingType: result.listing.listingType,
        premiumExpiresAt: result.listing.premiumExpiresAt
      },
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        status: result.payment.status
      },
      upgrade: {
        type: listingType,
        duration: `${duration} days`,
        features: UPGRADE_FEATURES[listingType],
        expiresAt
      },
      message: `Listing successfully upgraded to ${UPGRADE_FEATURES[listingType].name}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Listing upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Downgrade listing (remove premium features)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Check if listing exists and belongs to user
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

    // Downgrade to basic
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        listingType: 'BASIC',
        premiumExpiresAt: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      listing: {
        id: updatedListing.id,
        title: updatedListing.title,
        listingType: updatedListing.listingType,
        premiumExpiresAt: updatedListing.premiumExpiresAt
      },
      message: 'Listing downgraded to basic tier'
    });
  } catch (error) {
    console.error('Listing downgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}