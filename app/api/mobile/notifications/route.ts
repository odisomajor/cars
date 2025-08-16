import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'message', 'favorite', 'view', 'booking', 'system'
    const unreadOnly = searchParams.get('unread') === 'true'

    // Build where clause
    const whereClause: any = {
      userId: userId
    }

    if (type) {
      whereClause.type = type
    }

    if (unreadOnly) {
      whereClause.read = false
    }

    // Get notifications from database
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    })

    // Format notifications for mobile
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt.toISOString(),
      read: notification.read,
      listingId: notification.listingId,
      listing: notification.listing ? {
        id: notification.listing.id,
        title: notification.listing.title,
        image: notification.listing.images?.[0] || null
      } : null,
      data: notification.data ? JSON.parse(notification.data) : null
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      unreadCount
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Mark notifications as read or create new notification
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
    const { action, notificationIds, markAllAsRead } = await request.json()

    if (action === 'mark_read') {
      if (markAllAsRead) {
        // Mark all notifications as read
        await prisma.notification.updateMany({
          where: {
            userId: userId,
            read: false
          },
          data: {
            read: true,
            readAt: new Date()
          }
        })

        return NextResponse.json({ 
          success: true, 
          message: 'All notifications marked as read' 
        })
      } else if (notificationIds && Array.isArray(notificationIds)) {
        // Mark specific notifications as read
        await prisma.notification.updateMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: userId
          },
          data: {
            read: true,
            readAt: new Date()
          }
        })

        return NextResponse.json({ 
          success: true, 
          message: `${notificationIds.length} notifications marked as read` 
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

// Delete notifications
export async function DELETE(request: NextRequest) {
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
    const notificationIds = searchParams.get('ids')?.split(',') || []
    const deleteAll = searchParams.get('all') === 'true'
    const olderThan = searchParams.get('olderThan') // ISO date string

    if (deleteAll) {
      // Delete all notifications for user
      const whereClause: any = { userId: userId }
      
      if (olderThan) {
        whereClause.createdAt = {
          lt: new Date(olderThan)
        }
      }

      const deletedCount = await prisma.notification.deleteMany({
        where: whereClause
      })

      return NextResponse.json({ 
        success: true, 
        message: `${deletedCount.count} notifications deleted` 
      })
    } else if (notificationIds.length > 0) {
      // Delete specific notifications
      const deletedCount = await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: userId
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: `${deletedCount.count} notifications deleted` 
      })
    }

    return NextResponse.json(
      { error: 'No notifications specified for deletion' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Delete notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}

// Utility function to create notifications (can be called from other parts of the app)
export async function createNotification({
  userId,
  type,
  title,
  message,
  listingId,
  data
}: {
  userId: string
  type: 'message' | 'favorite' | 'view' | 'booking' | 'system'
  title: string
  message: string
  listingId?: string
  data?: any
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        listingId,
        data: data ? JSON.stringify(data) : null,
        read: false
      }
    })

    // Here you could also trigger push notifications, email notifications, etc.
    // await sendPushNotification(userId, { title, message })

    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    throw error
  }
}

// Utility function to create bulk notifications
export async function createBulkNotifications(notifications: Array<{
  userId: string
  type: 'message' | 'favorite' | 'view' | 'booking' | 'system'
  title: string
  message: string
  listingId?: string
  data?: any
}>) {
  try {
    const formattedNotifications = notifications.map(notif => ({
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      listingId: notif.listingId,
      data: notif.data ? JSON.stringify(notif.data) : null,
      read: false
    }))

    const result = await prisma.notification.createMany({
      data: formattedNotifications
    })

    return result
  } catch (error) {
    console.error('Create bulk notifications error:', error)
    throw error
  }
}