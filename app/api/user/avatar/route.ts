import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
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
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Process and optimize image with Sharp
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create optimized versions
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toBuffer()
    
    // Create thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toBuffer()
    
    // Save optimized image
    await writeFile(filePath, optimizedBuffer)
    
    // Save thumbnail
    const thumbnailFileName = `thumb_${fileName}`
    const thumbnailPath = join(uploadsDir, thumbnailFileName)
    await writeFile(thumbnailPath, thumbnailBuffer)
    
    const avatarUrl = `/uploads/avatars/${fileName}`
    const thumbnailUrl = `/uploads/avatars/${thumbnailFileName}`

    // Update or create user profile with avatar
    if (user.profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { 
          avatar: avatarUrl,
          avatarThumbnail: thumbnailUrl
        }
      })
    } else {
      await prisma.profile.create({
        data: {
          userId: user.id,
          avatar: avatarUrl,
          avatarThumbnail: thumbnailUrl
        }
      })
    }

    // Also update the user's image field for NextAuth compatibility
    await prisma.user.update({
      where: { id: user.id },
      data: { image: avatarUrl }
    })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
      thumbnailUrl,
      optimized: true
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove avatar from profile and user
    if (user.profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { avatar: null }
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null }
    })

    return NextResponse.json({
      message: 'Avatar removed successfully'
    })
  } catch (error) {
    console.error('Avatar removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}