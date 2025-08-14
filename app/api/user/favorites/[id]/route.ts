import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const favoriteId = params.id

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favorite.findUnique({
      where: {
        id: favoriteId,
      },
    })

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    if (favorite.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this favorite' },
        { status: 403 }
      )
    }

    // Delete the favorite
    await prisma.favorite.delete({
      where: {
        id: favoriteId,
      },
    })

    return NextResponse.json({
      message: 'Favorite removed successfully',
    })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}