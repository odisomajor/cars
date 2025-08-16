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
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'conversations' or 'messages'

    if (type === 'conversations' || !conversationId) {
      // Get user's conversations
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          buyer: {
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
          seller: {
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
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              status: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              read: true
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: userId },
                  read: false
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit,
        skip: offset
      })

      const formattedConversations = conversations.map(conv => {
        const otherUser = conv.buyerId === userId ? conv.seller : conv.buyer
        const lastMessage = conv.messages[0]
        
        return {
          id: conv.id,
          listingId: conv.listingId,
          listing: conv.listing ? {
            id: conv.listing.id,
            title: conv.listing.title,
            price: conv.listing.price,
            image: conv.listing.images?.[0] || null,
            status: conv.listing.status
          } : null,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
            businessName: otherUser.profile?.businessName,
            isVerified: otherUser.profile?.isVerified || false
          },
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            timestamp: lastMessage.createdAt.toISOString(),
            isFromMe: lastMessage.senderId === userId,
            read: lastMessage.read
          } : null,
          unreadCount: conv._count.messages,
          updatedAt: conv.updatedAt.toISOString()
        }
      })

      // Get total conversations count
      const totalCount = await prisma.conversation.count({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      return NextResponse.json({
        conversations: formattedConversations,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      })
    } else {
      // Get messages for a specific conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              status: true
            }
          }
        }
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          conversationId: conversationId,
          senderId: { not: userId },
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      })

      const formattedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          image: message.sender.image
        },
        isFromMe: message.senderId === userId,
        read: message.read,
        readAt: message.readAt?.toISOString()
      }))

      const otherUser = conversation.buyerId === userId ? conversation.seller : conversation.buyer

      return NextResponse.json({
        conversation: {
          id: conversation.id,
          listingId: conversation.listingId,
          listing: conversation.listing,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image
          }
        },
        messages: formattedMessages.reverse(), // Reverse to show oldest first
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit
        }
      })
    }

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// Send a message
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
    const { conversationId, listingId, receiverId, content, messageType = 'text' } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    let conversation

    if (conversationId) {
      // Verify user is part of the conversation
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found or access denied' },
          { status: 404 }
        )
      }
    } else if (listingId && receiverId) {
      // Create or find existing conversation
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { userId: true, status: true }
      })

      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }

      if (listing.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Cannot message about inactive listing' },
          { status: 400 }
        )
      }

      // Determine buyer and seller
      const buyerId = listing.userId === userId ? receiverId : userId
      const sellerId = listing.userId === userId ? userId : receiverId

      // Find or create conversation
      conversation = await prisma.conversation.upsert({
        where: {
          listingId_buyerId_sellerId: {
            listingId,
            buyerId,
            sellerId
          }
        },
        create: {
          listingId,
          buyerId,
          sellerId
        },
        update: {
          updatedAt: new Date()
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Either conversationId or (listingId and receiverId) is required' },
        { status: 400 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: content.trim(),
        messageType,
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    })

    // Create notification for the receiver
    const receiverId_final = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId
    
    await prisma.notification.create({
      data: {
        userId: receiverId_final,
        type: 'message',
        title: 'New Message',
        message: `${message.sender.name} sent you a message`,
        listingId: conversation.listingId,
        data: JSON.stringify({
          conversationId: conversation.id,
          messageId: message.id,
          senderId: userId
        }),
        read: false
      }
    }).catch(error => {
      // Notification creation is optional
      console.warn('Failed to create message notification:', error)
    })

    // Here you could also trigger push notifications, email notifications, etc.
    // await sendPushNotification(receiverId_final, {
    //   title: 'New Message',
    //   body: content.substring(0, 100),
    //   data: { conversationId: conversation.id }
    // })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        sender: message.sender,
        isFromMe: true,
        read: false
      },
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// Mark messages as read or delete conversation
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
    const { action, conversationId, messageIds } = await request.json()

    if (action === 'mark_read') {
      if (conversationId) {
        // Mark all messages in conversation as read
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            read: false
          },
          data: {
            read: true,
            readAt: new Date()
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Messages marked as read'
        })
      } else if (messageIds && Array.isArray(messageIds)) {
        // Mark specific messages as read
        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
            senderId: { not: userId },
            read: false
          },
          data: {
            read: true,
            readAt: new Date()
          }
        })

        return NextResponse.json({
          success: true,
          message: `${messageIds.length} messages marked as read`
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Update messages error:', error)
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    )
  }
}

// Delete conversation or messages
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
    const conversationId = searchParams.get('conversationId')
    const messageIds = searchParams.get('messageIds')?.split(',') || []

    if (conversationId) {
      // Verify user is part of the conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found or access denied' },
          { status: 404 }
        )
      }

      // Delete all messages in the conversation
      await prisma.message.deleteMany({
        where: { conversationId }
      })

      // Delete the conversation
      await prisma.conversation.delete({
        where: { id: conversationId }
      })

      return NextResponse.json({
        success: true,
        message: 'Conversation deleted'
      })
    } else if (messageIds.length > 0) {
      // Delete specific messages (only if user is the sender)
      const deletedCount = await prisma.message.deleteMany({
        where: {
          id: { in: messageIds },
          senderId: userId
        }
      })

      return NextResponse.json({
        success: true,
        message: `${deletedCount.count} messages deleted`
      })
    }

    return NextResponse.json(
      { error: 'No conversation or messages specified for deletion' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Delete messages error:', error)
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    )
  }
}