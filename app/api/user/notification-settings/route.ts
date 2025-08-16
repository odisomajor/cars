import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  listingUpdates: boolean
  favoriteAlerts: boolean
  preferences: {
    premium_upgrade: boolean
    booking_confirmed: boolean
    payment_success: boolean
    listing_featured: boolean
    inquiry_received: boolean
    rental_reminder: boolean
    promotion: boolean
    system: boolean
  }
  channels: {
    push: boolean
    email: boolean
    sms: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

// GET - Retrieve user notification settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's notification settings from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notificationSettings: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return default settings if none exist
    const defaultSettings: NotificationSettings = {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      listingUpdates: true,
      favoriteAlerts: true,
      preferences: {
        premium_upgrade: true,
        booking_confirmed: true,
        payment_success: true,
        listing_featured: true,
        inquiry_received: true,
        rental_reminder: true,
        promotion: false,
        system: true
      },
      channels: {
        push: true,
        email: true,
        sms: false
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00'
      },
      frequency: 'immediate'
    }

    const settings = user.notificationSettings 
      ? JSON.parse(user.notificationSettings as string)
      : defaultSettings

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings: NotificationSettings = await request.json()

    // Validate the settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = [
      'emailNotifications',
      'pushNotifications', 
      'marketingEmails',
      'listingUpdates',
      'favoriteAlerts',
      'preferences',
      'channels',
      'quietHours',
      'frequency'
    ]

    for (const field of requiredFields) {
      if (!(field in settings)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate frequency value
    const validFrequencies = ['immediate', 'hourly', 'daily', 'weekly']
    if (!validFrequencies.includes(settings.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency value' },
        { status: 400 }
      )
    }

    // Update user's notification settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationSettings: JSON.stringify(settings),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Notification settings updated successfully',
      settings 
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}