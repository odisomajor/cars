import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

// Mobile image upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  compressionQuality: 85,
  thumbnailSize: { width: 300, height: 200 },
  mediumSize: { width: 800, height: 600 },
  largeSize: { width: 1200, height: 900 }
}

interface UploadResponse {
  success: boolean
  images?: {
    original: string
    thumbnail: string
    medium: string
    large: string
    filename: string
    size: number
  }[]
  error?: string
  message?: string
}

// Verify JWT token for mobile requests
function verifyMobileToken(request: NextRequest): { userId: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.type !== 'access') {
      return null
    }
    return { userId: decoded.userId, role: decoded.role }
  } catch (error) {
    return null
  }
}

// Create directory if it doesn't exist
async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

// Compress and resize image
async function processImage(
  buffer: Buffer,
  filename: string,
  userId: string
): Promise<{
  original: string
  thumbnail: string
  medium: string
  large: string
  filename: string
  size: number
}> {
  const fileId = uuidv4()
  const ext = path.extname(filename).toLowerCase()
  const baseName = `${fileId}_${Date.now()}`
  
  // Create user-specific upload directory
  const userUploadDir = path.join(process.cwd(), 'public', 'uploads', 'listings', userId)
  await ensureDirectoryExists(userUploadDir)

  const originalFilename = `${baseName}_original${ext}`
  const thumbnailFilename = `${baseName}_thumb.webp`
  const mediumFilename = `${baseName}_medium.webp`
  const largeFilename = `${baseName}_large.webp`

  const originalPath = path.join(userUploadDir, originalFilename)
  const thumbnailPath = path.join(userUploadDir, thumbnailFilename)
  const mediumPath = path.join(userUploadDir, mediumFilename)
  const largePath = path.join(userUploadDir, largeFilename)

  try {
    // Process original image (compress but keep original size)
    const originalProcessed = await sharp(buffer)
      .jpeg({ quality: UPLOAD_CONFIG.compressionQuality })
      .toBuffer()
    
    await writeFile(originalPath, originalProcessed)

    // Create thumbnail
    await sharp(buffer)
      .resize(UPLOAD_CONFIG.thumbnailSize.width, UPLOAD_CONFIG.thumbnailSize.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath)

    // Create medium size
    await sharp(buffer)
      .resize(UPLOAD_CONFIG.mediumSize.width, UPLOAD_CONFIG.mediumSize.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: UPLOAD_CONFIG.compressionQuality })
      .toFile(mediumPath)

    // Create large size
    await sharp(buffer)
      .resize(UPLOAD_CONFIG.largeSize.width, UPLOAD_CONFIG.largeSize.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: UPLOAD_CONFIG.compressionQuality })
      .toFile(largePath)

    return {
      original: `/uploads/listings/${userId}/${originalFilename}`,
      thumbnail: `/uploads/listings/${userId}/${thumbnailFilename}`,
      medium: `/uploads/listings/${userId}/${mediumFilename}`,
      large: `/uploads/listings/${userId}/${largeFilename}`,
      filename: originalFilename,
      size: originalProcessed.length
    }
  } catch (error) {
    console.error('Image processing error:', error)
    throw new Error('Failed to process image')
  }
}

// POST /api/mobile/upload - Upload and process images for mobile
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return NextResponse.json(
        { success: false, error: `Maximum ${UPLOAD_CONFIG.maxFiles} files allowed` },
        { status: 400 }
      )
    }

    const processedImages = []
    const errors = []

    for (const file of files) {
      try {
        // Validate file type
        if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
          errors.push(`Invalid file type: ${file.name}. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`)
          continue
        }

        // Validate file size
        if (file.size > UPLOAD_CONFIG.maxFileSize) {
          errors.push(`File too large: ${file.name}. Maximum size: ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`)
          continue
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Process image
        const processedImage = await processImage(buffer, file.name, auth.userId)
        processedImages.push(processedImage)

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        errors.push(`Failed to process: ${file.name}`)
      }
    }

    const response: UploadResponse = {
      success: processedImages.length > 0,
      images: processedImages,
      message: `Successfully uploaded ${processedImages.length} image(s)`
    }

    if (errors.length > 0) {
      response.message += `. Errors: ${errors.join(', ')}`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Mobile upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// GET /api/mobile/upload - Get upload configuration and limits
export async function GET(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      config: {
        maxFileSize: UPLOAD_CONFIG.maxFileSize,
        maxFiles: UPLOAD_CONFIG.maxFiles,
        allowedTypes: UPLOAD_CONFIG.allowedTypes,
        compressionQuality: UPLOAD_CONFIG.compressionQuality,
        imageSizes: {
          thumbnail: UPLOAD_CONFIG.thumbnailSize,
          medium: UPLOAD_CONFIG.mediumSize,
          large: UPLOAD_CONFIG.largeSize
        }
      },
      limits: {
        maxFileSizeMB: UPLOAD_CONFIG.maxFileSize / (1024 * 1024),
        maxFiles: UPLOAD_CONFIG.maxFiles,
        supportedFormats: UPLOAD_CONFIG.allowedTypes.map(type => type.split('/')[1])
      }
    })

  } catch (error) {
    console.error('Upload config error:', error)
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/mobile/upload - Delete uploaded images
export async function DELETE(request: NextRequest) {
  try {
    const auth = verifyMobileToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imagePaths = searchParams.getAll('images')

    if (!imagePaths || imagePaths.length === 0) {
      return NextResponse.json(
        { error: 'No image paths provided' },
        { status: 400 }
      )
    }

    const deletedImages = []
    const errors = []

    for (const imagePath of imagePaths) {
      try {
        // Validate that the image belongs to the user
        if (!imagePath.includes(`/uploads/listings/${auth.userId}/`)) {
          errors.push(`Unauthorized access to image: ${imagePath}`)
          continue
        }

        const fullPath = path.join(process.cwd(), 'public', imagePath)
        
        // Delete all variants of the image
        const baseName = path.basename(imagePath, path.extname(imagePath))
        const variants = ['_original', '_thumb', '_medium', '_large']
        
        for (const variant of variants) {
          const variantPath = fullPath.replace(baseName, baseName.replace(/_original$/, '') + variant)
          try {
            await import('fs/promises').then(fs => fs.unlink(variantPath))
          } catch (error) {
            // File might not exist, ignore error
          }
        }

        deletedImages.push(imagePath)

      } catch (error) {
        console.error(`Error deleting image ${imagePath}:`, error)
        errors.push(`Failed to delete: ${imagePath}`)
      }
    }

    return NextResponse.json({
      success: deletedImages.length > 0,
      deletedImages,
      message: `Successfully deleted ${deletedImages.length} image(s)`,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Mobile image deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    )
  }
}