import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscriptionSchema = z.object({
  planId: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().optional()
});

const SUBSCRIPTION_PLANS = {
  starter: {
    monthly: 29,
    yearly: 290,
    features: {
      listings: 10,
      photos: 5,
      videos: 0,
      analytics: true,
      support: 'basic',
      api: false,
      customBranding: false
    }
  },
  professional: {
    monthly: 79,
    yearly: 790,
    features: {
      listings: 50,
      photos: 15,
      videos: 3,
      analytics: true,
      support: 'priority',
      api: true,
      customBranding: false
    }
  },
  enterprise: {
    monthly: 199,
    yearly: 1990,
    features: {
      listings: -1, // unlimited
      photos: -1,
      videos: -1,
      analytics: true,
      support: '24/7',
      api: true,
      customBranding: true
    }
  }
};

// GET - Retrieve user's subscription information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        availablePlans: SUBSCRIPTION_PLANS
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        features: SUBSCRIPTION_PLANS[subscription.planId as keyof typeof SUBSCRIPTION_PLANS]?.features,
        usage: {
          listings: subscription.usageListings,
          photos: subscription.usagePhotos,
          videos: subscription.usageVideos
        }
      },
      availablePlans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = subscriptionSchema.parse(body);
    const { planId, billingCycle, paymentMethodId } = validatedData;

    const planDetails = SUBSCRIPTION_PLANS[planId];
    const amount = planDetails[billingCycle];

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    const now = new Date();
    const periodEnd = new Date();
    if (billingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    if (existingSubscription) {
      // Update existing subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          planId,
          billingCycle,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          updatedAt: now
        }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: paymentMethodId ? 'stripe' : 'pending',
          listingType: 'SUBSCRIPTION',
          metadata: {
            planId,
            billingCycle,
            subscriptionId: updatedSubscription.id
          }
        }
      });

      return NextResponse.json({
        subscription: updatedSubscription,
        message: 'Subscription updated successfully'
      });
    } else {
      // Create new subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId,
          billingCycle,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          usageListings: 0,
          usagePhotos: 0,
          usageVideos: 0
        }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: paymentMethodId ? 'stripe' : 'pending',
          listingType: 'SUBSCRIPTION',
          metadata: {
            planId,
            billingCycle,
            subscriptionId: newSubscription.id
          }
        }
      });

      return NextResponse.json({
        subscription: newSubscription,
        message: 'Subscription created successfully'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Mark subscription for cancellation at period end
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Subscription will be cancelled at the end of the current period'
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}