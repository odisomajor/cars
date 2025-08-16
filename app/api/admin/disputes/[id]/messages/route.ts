import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check if dispute exists
    const dispute = await prisma.rentalBookingDispute.findUnique({
      where: { id: params.id }
    })

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId: params.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Error fetching dispute messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dispute messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, attachments, isInternal = false } = body

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Check if dispute exists
    const dispute = await prisma.rentalBookingDispute.findUnique({
      where: { id: params.id }
    })

    if (!dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      )
    }

    // Create message
    const disputeMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: params.id,
        senderId: session.user.id,
        message: message.trim(),
        attachments: attachments || [],
        isInternal,
        createdAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    })

    // Update dispute's last activity
    await prisma.rentalBookingDispute.update({
      where: { id: params.id },
      data: {
        updatedAt: new Date(),
        // If dispute is open, move to in progress when admin responds
        status: dispute.status === 'OPEN' ? 'IN_PROGRESS' : dispute.status
      }
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'ADD_DISPUTE_MESSAGE',
        resourceType: 'DISPUTE_MESSAGE',
        resourceId: disputeMessage.id,
        details: {
          disputeId: params.id,
          messageLength: message.length,
          isInternal,
          hasAttachments: (attachments && attachments.length > 0)
        }
      }
    })

    // TODO: Send notification to relevant parties (customer, rental company)
    // if (!isInternal) {
    //   await sendDisputeMessageNotification(dispute, disputeMessage)
    // }

    return NextResponse.json({ message: disputeMessage }, { status: 201 })

  } catch (error) {
    console.error('Error creating dispute message:', error)
    return NextResponse.json(
      { error: 'Failed to create dispute message' },
      { status: 500 }
    )
  }
}