import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users with their counts
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            listings: true,
            favorites: true,
            rentalBookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create CSV content
    const csvHeaders = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Verified',
      'Location',
      'Listings Count',
      'Favorites Count',
      'Bookings Count',
      'Created At',
      'Last Login At'
    ]

    const csvRows = users.map(user => [
      user.id,
      user.name || '',
      user.email,
      user.phone || '',
      user.role,
      user.isVerified ? 'Yes' : 'No',
      user.location || '',
      user._count.listings,
      user._count.favorites,
      user._count.rentalBookings,
      user.createdAt.toISOString(),
      user.lastLoginAt ? user.lastLoginAt.toISOString() : ''
    ])

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}