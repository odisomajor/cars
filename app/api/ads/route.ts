import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const adSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['banner', 'native', 'interstitial', 'rewarded']),
  format: z.enum(['image', 'video', 'text', 'carousel']),
  placement: z.enum(['top', 'bottom', 'sidebar', 'feed', 'fullscreen']),
  targetAudience: z.object({
    demographics: z.object({
      ageRange: z.array(z.number()).optional(),
      locations: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional()
    }).optional(),
    behaviors: z.object({
      searchHistory: z.array(z.string()).optional(),
      listingViews: z.array(z.string()).optional(),
      priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional()
    }).optional()
  }).optional(),
  budget: z.object({
    daily: z.number().positive().optional(),
    total: z.number().positive().optional(),
    bidType: z.enum(['cpc', 'cpm', 'cpa']).default('cpc'),
    bidAmount: z.number().positive()
  }),
  schedule: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    timeZone: z.string().default('Africa/Nairobi'),
    dayParting: z.object({
      days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
      hours: z.object({
        start: z.string().optional(), // HH:MM format
        end: z.string().optional()
      }).optional()
    }).optional()
  }),
  creative: z.object({
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    headline: z.string().max(100).optional(),
    bodyText: z.string().max(300).optional(),
    callToAction: z.string().max(50).optional(),
    landingUrl: z.string().url().optional()
  }),
  status: z.enum(['draft', 'pending', 'active', 'paused', 'completed']).default('draft')
});

const campaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  objective: z.enum(['awareness', 'traffic', 'conversions', 'engagement']),
  budget: z.object({
    total: z.number().positive(),
    daily: z.number().positive().optional(),
    currency: z.string().default('KES')
  }),
  schedule: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
  }),
  adIds: z.array(z.string()).optional()
});

// GET - Retrieve ads, campaigns, and analytics
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
    const type = searchParams.get('type'); // 'ads', 'campaigns', 'analytics'
    const status = searchParams.get('status');
    const adType = searchParams.get('adType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required for ad management' },
        { status: 403 }
      );
    }

    if (type === 'analytics') {
      // Return ad analytics data
      const analytics = {
        overview: {
          totalRevenue: 125000,
          totalImpressions: 2500000,
          totalClicks: 75000,
          averageCTR: 3.0,
          averageCPC: 1.67,
          activeAds: 24,
          activeCampaigns: 8
        },
        performance: {
          topPerformingAds: [
            {
              id: 'ad_1',
              title: 'Premium Car Listings',
              type: 'banner',
              impressions: 450000,
              clicks: 13500,
              ctr: 3.0,
              revenue: 22500,
              cpc: 1.67
            },
            {
              id: 'ad_2',
              title: 'Luxury Vehicle Showcase',
              type: 'native',
              impressions: 380000,
              clicks: 11400,
              ctr: 3.0,
              revenue: 19000,
              cpc: 1.67
            }
          ],
          revenueByType: {
            banner: 45000,
            native: 35000,
            interstitial: 30000,
            rewarded: 15000
          },
          performanceByPlacement: {
            top: { impressions: 800000, clicks: 24000, revenue: 40000 },
            feed: { impressions: 600000, clicks: 18000, revenue: 30000 },
            sidebar: { impressions: 500000, clicks: 15000, revenue: 25000 },
            bottom: { impressions: 400000, clicks: 12000, revenue: 20000 }
          }
        },
        trends: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            impressions: Math.floor(Math.random() * 100000) + 50000,
            clicks: Math.floor(Math.random() * 3000) + 1500,
            revenue: Math.floor(Math.random() * 5000) + 2500
          })),
          hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            impressions: Math.floor(Math.random() * 20000) + 10000,
            clicks: Math.floor(Math.random() * 600) + 300,
            revenue: Math.floor(Math.random() * 1000) + 500
          }))
        }
      };

      return NextResponse.json({ analytics });
    }

    if (type === 'campaigns') {
      // Return campaigns data
      const campaigns = [
        {
          id: 'camp_1',
          name: 'Q1 Premium Listings Campaign',
          description: 'Promote premium car listings for Q1',
          objective: 'conversions',
          status: 'active',
          budget: {
            total: 50000,
            daily: 1667,
            spent: 15000,
            currency: 'KES'
          },
          schedule: {
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-03-31T23:59:59Z'
          },
          performance: {
            impressions: 1200000,
            clicks: 36000,
            conversions: 720,
            ctr: 3.0,
            conversionRate: 2.0,
            revenue: 60000
          },
          adCount: 8,
          createdAt: '2023-12-15T10:00:00Z'
        },
        {
          id: 'camp_2',
          name: 'Mobile App Promotion',
          description: 'Drive mobile app downloads and engagement',
          objective: 'awareness',
          status: 'active',
          budget: {
            total: 30000,
            daily: 1000,
            spent: 8500,
            currency: 'KES'
          },
          schedule: {
            startDate: '2024-01-10T00:00:00Z',
            endDate: '2024-02-10T23:59:59Z'
          },
          performance: {
            impressions: 800000,
            clicks: 24000,
            conversions: 480,
            ctr: 3.0,
            conversionRate: 2.0,
            revenue: 40000
          },
          adCount: 5,
          createdAt: '2024-01-05T14:30:00Z'
        }
      ];

      const filteredCampaigns = status 
        ? campaigns.filter(c => c.status === status)
        : campaigns;

      return NextResponse.json({
        campaigns: filteredCampaigns,
        pagination: {
          page,
          limit,
          total: filteredCampaigns.length,
          totalPages: Math.ceil(filteredCampaigns.length / limit)
        }
      });
    }

    // Return ads data (default)
    const ads = [
      {
        id: 'ad_1',
        title: 'Premium Car Listings Banner',
        description: 'Promote premium car listings with attractive banner',
        type: 'banner',
        format: 'image',
        placement: 'top',
        status: 'active',
        budget: {
          daily: 500,
          total: 15000,
          bidType: 'cpc',
          bidAmount: 1.50,
          spent: 4500
        },
        performance: {
          impressions: 450000,
          clicks: 13500,
          ctr: 3.0,
          cpc: 1.67,
          conversions: 270,
          conversionRate: 2.0,
          revenue: 22500
        },
        creative: {
          imageUrl: 'https://example.com/banner.jpg',
          headline: 'Find Your Dream Car',
          bodyText: 'Browse thousands of premium vehicles',
          callToAction: 'Browse Now',
          landingUrl: 'https://example.com/listings'
        },
        schedule: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        },
        createdAt: '2023-12-28T10:00:00Z'
      },
      {
        id: 'ad_2',
        title: 'Native Feed Ad',
        description: 'Native ad integrated into listing feed',
        type: 'native',
        format: 'image',
        placement: 'feed',
        status: 'active',
        budget: {
          daily: 300,
          total: 9000,
          bidType: 'cpm',
          bidAmount: 5.00,
          spent: 2700
        },
        performance: {
          impressions: 380000,
          clicks: 11400,
          ctr: 3.0,
          cpc: 1.67,
          conversions: 228,
          conversionRate: 2.0,
          revenue: 19000
        },
        creative: {
          imageUrl: 'https://example.com/native.jpg',
          headline: 'Luxury Vehicles Available',
          bodyText: 'Discover premium cars from trusted dealers',
          callToAction: 'View Details',
          landingUrl: 'https://example.com/luxury'
        },
        schedule: {
          startDate: '2024-01-05T00:00:00Z',
          endDate: '2024-02-05T23:59:59Z'
        },
        createdAt: '2024-01-02T14:30:00Z'
      }
    ];

    let filteredAds = ads;
    if (status) {
      filteredAds = filteredAds.filter(ad => ad.status === status);
    }
    if (adType) {
      filteredAds = filteredAds.filter(ad => ad.type === adType);
    }

    return NextResponse.json({
      ads: filteredAds,
      pagination: {
        page,
        limit,
        total: filteredAds.length,
        totalPages: Math.ceil(filteredAds.length / limit)
      },
      summary: {
        total: ads.length,
        active: ads.filter(ad => ad.status === 'active').length,
        paused: ads.filter(ad => ad.status === 'paused').length,
        draft: ads.filter(ad => ad.status === 'draft').length,
        byType: {
          banner: ads.filter(ad => ad.type === 'banner').length,
          native: ads.filter(ad => ad.type === 'native').length,
          interstitial: ads.filter(ad => ad.type === 'interstitial').length,
          rewarded: ads.filter(ad => ad.type === 'rewarded').length
        }
      }
    });

  } catch (error) {
    console.error('Ads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create ad or campaign
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
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0,
          revenue: 0
        },
        adCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        campaign,
        message: 'Campaign created successfully'
      });
    } else {
      const validatedData = adSchema.parse(body);
      
      // Create ad (mock implementation)
      const ad = {
        id: `ad_${Date.now()}`,
        ...validatedData,
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          cpc: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        ad,
        message: 'Ad created successfully'
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Ads POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update ad or campaign
export async function PATCH(request: NextRequest) {
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
    const { id, status, budget, schedule, creative } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Ad/Campaign ID is required' },
        { status: 400 }
      );
    }

    // Mock update implementation
    const updatedItem = {
      id,
      status: status || 'updated',
      budget,
      schedule,
      creative,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Item updated successfully'
    });

  } catch (error) {
    console.error('Ads PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ad or campaign
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
    console.error('Ads DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}