import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds, action } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 })
    }

    if (!['verify', 'unverify', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'verify':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isVerified: true
          }
        })
        break

      case 'unverify':
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds }
          },
          data: {
            isVerified: false
          }
        })
        break

      case 'delete':
        // First, delete related records
        await prisma.$transaction(async (tx) => {
          // Delete user favorites
          await tx.favorite.deleteMany({
            where: { userId: { in: userIds } }
          })

          // Delete user bookings
          await tx.rentalBooking.deleteMany({
            where: { userId: { in: userIds } }
          })

          // Delete user listings
          await tx.listing.deleteMany({
            where: { userId: { in: userIds } }
          })

          // Delete users
          result = await tx.user.deleteMany({
            where: { id: { in: userIds } }
          })
        })
        break
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed ${result?.count || userIds.length} users`,
      count: result?.count || userIds.length
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}