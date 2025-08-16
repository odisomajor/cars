import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const notificationSchema = z.object({
  type: z.enum(['booking', 'payment', 'listing', 'marketing', 'system', 'reminder', 'social', 'security']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  targetUsers: z.array(z.string()).optional(), // User IDs, if empty sends to all
  scheduledFor: z.string().datetime().optional(), // ISO datetime string
  channels: z.array(z.enum(['push', 'email', 'sms'])).default(['push']),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

const campaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  templateId: z.string().optional(),
  targetAudience: z.object({
    userTypes: z.array(z.enum(['all', 'sellers', 'buyers', 'premium'])).default(['all']),
    locations: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional()
  }).optional(),
  scheduledFor: z.string().datetime().optional(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).default('once')
});

// GET - Retrieve notifications and campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'notifications' or 'campaigns'
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user is admin for campaign management
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'ADMIN';

    if (type === 'campaigns' && !isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required for campaign management' },
        { status: 403 }
      );
    }

    if (type === 'campaigns') {
      // Return mock campaign data for admin users
      const campaigns = [
        {
          id: 'camp_1',
          name: 'New Year Car Sale',
          description: 'Promote special New Year discounts',
          status: 'active',
          targetAudience: { userTypes: ['all'], locations: ['Nairobi', 'Mombasa'] },
          scheduledFor: '2024-01-01T00:00:00Z',
          frequency: 'once',
          metrics: {
            sent: 15420,
            delivered: 14890,
            opened: 8934,
            clicked: 2145,
            conversions: 234
          },
          createdAt: '2023-12-15T10:00:00Z'
        },
        {
          id: 'camp_2',
          name: 'Premium Listing Promotion',
          description: 'Encourage users to upgrade to premium listings',
          status: 'scheduled',
          targetAudience: { userTypes: ['sellers'], interests: ['premium-features'] },
          scheduledFor: '2024-01-15T09:00:00Z',
          frequency: 'weekly',
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            conversions: 0
          },
          createdAt: '2023-12-20T14:30:00Z'
        }
      ];

      return NextResponse.json({
        campaigns,
        pagination: {
          page,
          limit,
          total: campaigns.length,
          totalPages: Math.ceil(campaigns.length / limit)
        }
      });
    }

    // Return user notifications
    const targetUserId = userId && isAdmin ? userId : session.user.id;
    
    const notifications = [
      {
        id: 'notif_1',
        type: 'booking',
        title: 'New Booking Received',
        message: 'You have received a new booking for your Toyota Camry',
        status: 'unread',
        priority: 'high',
        channels: ['push', 'email'],
        metadata: {
          listingId: 'listing_123',
          bookingId: 'booking_456'
        },
        createdAt: '2024-01-10T15:30:00Z'
      },
      {
        id: 'notif_2',
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of KES 5,000 has been received for your premium listing',
        status: 'read',
        priority: 'normal',
        channels: ['push'],
        metadata: {
          paymentId: 'pay_789',
          amount: 5000
        },
        createdAt: '2024-01-09T12:15:00Z'
      },
      {
        id: 'notif_3',
        type: 'listing',
        title: 'Listing Approved',
        message: 'Your Honda Civic listing has been approved and is now live',
        status: 'read',
        priority: 'normal',
        channels: ['push', 'email'],
        metadata: {
          listingId: 'listing_789'
        },
        createdAt: '2024-01-08T09:45:00Z'
      }
    ];

    const filteredNotifications = status 
      ? notifications.filter(n => n.status === status)
      : notifications;

    return NextResponse.json({
      notifications: filteredNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit)
      },
      summary: {
        total: notifications.length,
        unread: notifications.filter(n => n.status === 'unread').length,
        byType: {
          booking: notifications.filter(n => n.type === 'booking').length,
          payment: notifications.filter(n => n.type === 'payment').length,
          listing: notifications.filter(n => n.type === 'listing').length,
          marketing: notifications.filter(n => n.type === 'marketing').length,
          system: notifications.filter(n => n.type === 'system').length
        }
      }
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create notification or campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type } = body;

    if (type === 'campaign') {
      const validatedData = campaignSchema.parse(body);
      
      // Create campaign (mock implementation)
      const campaign = {
        id: `camp_${Date.now()}`,
        ...validatedData,
        status: 'draft',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          conversions: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        campaign,
        message: 'Campaign created successfully'
      });
    } else {
      const validatedData = notificationSchema.parse(body);
      
      // Create notification (mock implementation)
      const notification = {
        id: `notif_${Date.now()}`,
        ...validatedData,
        status: validatedData.scheduledFor ? 'scheduled' : 'sent',
        sentAt: validatedData.scheduledFor ? null : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        metrics: {
          sent: validatedData.targetUsers?.length || 0,
          delivered: 0,
          opened: 0,
          clicked: 0
        }
      };

      return NextResponse.json({
        success: true,
        notification,
        message: 'Notification created successfully'
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Notifications POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update notification status or campaign
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, action } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification/Campaign ID is required' },
        { status: 400 }
      );
    }

    // Mock update implementation
    const updatedItem = {
      id,
      status: status || 'updated',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: `${action || 'Item'} updated successfully`
    });

  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification or campaign
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Mock deletion
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Notifications DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}