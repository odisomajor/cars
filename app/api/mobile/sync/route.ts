import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

interface SyncRequest {
  lastSyncTimestamp?: string
  entities: string[] // ['listings', 'favorites', 'notifications', 'profile', 'drafts']
  deviceId?: string
  appVersion?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { lastSyncTimestamp, entities, deviceId, appVersion }: SyncRequest = await request.json()
    
    const lastSync = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0)
    const currentTimestamp = new Date()
    
    const syncData: any = {
      timestamp: currentTimestamp.toISOString(),
      userId,
      deviceId,
      appVersion
    }

    // Sync user listings
    if (entities.includes('listings')) {
      const listings = await prisma.listing.findMany({
        where: {
          userId: userId,
          updatedAt: {
            gt: lastSync
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: {
                select: {
                  phone: true,
                  location: true,
                  businessName: true,
                  isVerified: true
                }
              }
            }
          },
          category: true,
          _count: {
            select: {
              favorites: true,
              views: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      syncData.listings = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        images: listing.images,
        status: listing.status,
        category: listing.category?.name,
        location: listing.location,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        expiresAt: listing.expiresAt?.toISOString(),
        views: listing._count.views,
        favorites: listing._count.favorites,
        seller: {
          id: listing.user.id,
          name: listing.user.name,
          email: listing.user.email,
          image: listing.user.image,
          phone: listing.user.profile?.phone,
          location: listing.user.profile?.location,
          businessName: listing.user.profile?.businessName,
          isVerified: listing.user.profile?.isVerified || false
        },
        // Technical details
        make: listing.make,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        bodyType: listing.bodyType,
        color: listing.color,
        engineSize: listing.engineSize,
        features: listing.features
      }))
    }

    // Sync user favorites
    if (entities.includes('favorites')) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
          updatedAt: {
            gt: lastSync
          }
        },
        include: {
          listing: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  profile: {
                    select: {
                      businessName: true,
                      isVerified: true
                    }
                  }
                }
              },
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      syncData.favorites = favorites.map(fav => ({
        id: fav.id,
        listingId: fav.listingId,
        createdAt: fav.createdAt.toISOString(),
        listing: fav.listing ? {
          id: fav.listing.id,
          title: fav.listing.title,
          price: fav.listing.price,
          images: fav.listing.images,
          status: fav.listing.status,
          location: fav.listing.location,
          make: fav.listing.make,
          model: fav.listing.model,
          year: fav.listing.year,
          seller: {
            id: fav.listing.user.id,
            name: fav.listing.user.name,
            image: fav.listing.user.image,
            businessName: fav.listing.user.profile?.businessName,
            isVerified: fav.listing.user.profile?.isVerified || false
          }
        } : null
      }))
    }

    // Sync notifications
    if (entities.includes('notifications')) {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          updatedAt: {
            gt: lastSync
          }
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100 // Limit notifications to prevent large payloads
      })

      syncData.notifications = notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        createdAt: notif.createdAt.toISOString(),
        listingId: notif.listingId,
        listing: notif.listing ? {
          id: notif.listing.id,
          title: notif.listing.title,
          image: notif.listing.images?.[0] || null
        } : null,
        data: notif.data ? JSON.parse(notif.data) : null
      }))
    }

    // Sync user profile
    if (entities.includes('profile')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          _count: {
            select: {
              listings: true,
              favorites: true,
              sentMessages: true,
              receivedMessages: true
            }
          }
        }
      })

      if (user && (!lastSyncTimestamp || user.updatedAt > lastSync || (user.profile && user.profile.updatedAt > lastSync))) {
        // Calculate additional stats
        const activeListings = await prisma.listing.count({
          where: {
            userId: userId,
            status: 'ACTIVE'
          }
        })

        const totalViews = await prisma.listing.aggregate({
          where: { userId: userId },
          _sum: { views: true }
        })

        const avgRating = await prisma.review.aggregate({
          where: { sellerId: userId },
          _avg: { rating: true },
          _count: { rating: true }
        })

        syncData.profile = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          profile: user.profile ? {
            phone: user.profile.phone,
            location: user.profile.location,
            businessName: user.profile.businessName,
            businessType: user.profile.businessType,
            description: user.profile.description,
            website: user.profile.website,
            isVerified: user.profile.isVerified,
            preferences: user.profile.preferences ? JSON.parse(user.profile.preferences) : null
          } : null,
          stats: {
            totalListings: user._count.listings,
            activeListings,
            totalViews: totalViews._sum.views || 0,
            favorites: user._count.favorites,
            messages: user._count.sentMessages + user._count.receivedMessages,
            averageRating: avgRating._avg.rating || 0,
            totalReviews: avgRating._count.rating || 0
          }
        }
      }
    }

    // Sync draft listings (stored locally but backed up to server)
    if (entities.includes('drafts')) {
      const drafts = await prisma.listing.findMany({
        where: {
          userId: userId,
          status: 'DRAFT',
          updatedAt: {
            gt: lastSync
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      syncData.drafts = drafts.map(draft => ({
        id: draft.id,
        title: draft.title,
        description: draft.description,
        price: draft.price,
        images: draft.images,
        location: draft.location,
        make: draft.make,
        model: draft.model,
        year: draft.year,
        mileage: draft.mileage,
        fuelType: draft.fuelType,
        transmission: draft.transmission,
        bodyType: draft.bodyType,
        color: draft.color,
        engineSize: draft.engineSize,
        features: draft.features,
        categoryId: draft.categoryId,
        createdAt: draft.createdAt.toISOString(),
        updatedAt: draft.updatedAt.toISOString()
      }))
    }

    // Log sync activity
    await prisma.syncLog.create({
      data: {
        userId,
        deviceId: deviceId || 'unknown',
        appVersion: appVersion || 'unknown',
        entities: entities.join(','),
        lastSyncTimestamp: lastSyncTimestamp || null,
        syncTimestamp: currentTimestamp,
        dataSize: JSON.stringify(syncData).length
      }
    }).catch(error => {
      // Sync log is optional, don't fail the request if it fails
      console.warn('Failed to create sync log:', error)
    })

    return NextResponse.json({
      success: true,
      data: syncData,
      serverTimestamp: currentTimestamp.toISOString()
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    )
  }
}

// Get sync status and conflicts
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    // Get last sync information
    const lastSync = await prisma.syncLog.findFirst({
      where: {
        userId,
        ...(deviceId && { deviceId })
      },
      orderBy: {
        syncTimestamp: 'desc'
      }
    })

    // Get pending changes count
    const lastSyncTime = lastSync?.syncTimestamp || new Date(0)
    
    const pendingChanges = {
      listings: await prisma.listing.count({
        where: {
          userId,
          updatedAt: { gt: lastSyncTime }
        }
      }),
      favorites: await prisma.favorite.count({
        where: {
          userId,
          updatedAt: { gt: lastSyncTime }
        }
      }),
      notifications: await prisma.notification.count({
        where: {
          userId,
          updatedAt: { gt: lastSyncTime }
        }
      })
    }

    // Check for conflicts (if multiple devices)
    const recentSyncs = await prisma.syncLog.findMany({
      where: {
        userId,
        syncTimestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        syncTimestamp: 'desc'
      },
      take: 10
    })

    const uniqueDevices = [...new Set(recentSyncs.map(sync => sync.deviceId))]
    const hasMultipleDevices = uniqueDevices.length > 1

    return NextResponse.json({
      lastSync: lastSync ? {
        timestamp: lastSync.syncTimestamp.toISOString(),
        deviceId: lastSync.deviceId,
        entities: lastSync.entities.split(','),
        dataSize: lastSync.dataSize
      } : null,
      pendingChanges,
      hasMultipleDevices,
      activeDevices: uniqueDevices.length,
      serverTimestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

// Handle conflict resolution
export async function PUT(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: JWTPayload
    
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { conflicts, resolution } = await request.json()
    
    // Handle conflict resolution based on strategy
    // resolution can be 'server_wins', 'client_wins', 'merge', or 'manual'
    
    const resolvedConflicts = []
    
    for (const conflict of conflicts) {
      const { entityType, entityId, clientData, serverData } = conflict
      
      let resolvedData
      
      switch (resolution) {
        case 'server_wins':
          resolvedData = serverData
          break
        case 'client_wins':
          resolvedData = clientData
          break
        case 'merge':
          // Simple merge strategy - prefer newer timestamps
          resolvedData = {
            ...serverData,
            ...clientData,
            updatedAt: new Date().toISOString()
          }
          break
        default:
          // Manual resolution - use provided resolved data
          resolvedData = conflict.resolvedData
      }
      
      // Apply resolution based on entity type
      if (entityType === 'listing') {
        await prisma.listing.update({
          where: { id: entityId, userId },
          data: {
            ...resolvedData,
            updatedAt: new Date()
          }
        })
      } else if (entityType === 'favorite') {
        // Handle favorite conflicts (usually just existence)
        if (resolvedData.exists) {
          await prisma.favorite.upsert({
            where: {
              userId_listingId: {
                userId,
                listingId: resolvedData.listingId
              }
            },
            create: {
              userId,
              listingId: resolvedData.listingId
            },
            update: {}
          })
        } else {
          await prisma.favorite.deleteMany({
            where: {
              userId,
              listingId: resolvedData.listingId
            }
          })
        }
      }
      
      resolvedConflicts.push({
        entityType,
        entityId,
        resolution: resolution,
        resolvedData
      })
    }
    
    return NextResponse.json({
      success: true,
      resolvedConflicts,
      message: `${resolvedConflicts.length} conflicts resolved`
    })
    
  } catch (error) {
    console.error('Conflict resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve conflicts' },
      { status: 500 }
    )
  }
}