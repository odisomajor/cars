import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    // Extract and validate form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = parseInt(formData.get('year') as string)
    const pricePerDay = parseFloat(formData.get('pricePerDay') as string)
    const mileage = formData.get('mileage') ? parseInt(formData.get('mileage') as string) : null
    const condition = formData.get('condition') as string
    const fuelType = formData.get('fuelType') as string
    const transmission = formData.get('transmission') as string
    const bodyType = formData.get('bodyType') as string
    const color = formData.get('color') as string
    const location = formData.get('location') as string
    const engineSize = formData.get('engineSize') as string
    const features = formData.get('features') as string
    const listingPackage = formData.get('listingPackage') as string
    const status = formData.get('status') as string
    const rentalCategory = formData.get('rentalCategory') as string
    const availableFrom = formData.get('availableFrom') as string
    const availableTo = formData.get('availableTo') as string
    const minRentalDays = formData.get('minRentalDays') ? parseInt(formData.get('minRentalDays') as string) : null
    const maxRentalDays = formData.get('maxRentalDays') ? parseInt(formData.get('maxRentalDays') as string) : null

    // Validate required fields
    if (!title || !make || !model || !year || !pricePerDay || !location || !condition || !fuelType || !transmission) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle image uploads
    const imageUrls: string[] = []
    const imageFields = Array.from(formData.keys()).filter(key => key.startsWith('image_'))
    
    for (const fieldName of imageFields) {
      const file = formData.get(fieldName) as File
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        fs.writeFileSync(filepath, buffer)
        imageUrls.push(`/uploads/${filename}`)
      }
    }

    // Calculate expiration date based on listing type and status
    let expiresAt: Date | null = null
    if (status === 'active') {
      const now = new Date()
      switch (listingPackage) {
        case 'free':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
          break
        case 'featured':
          expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days
          break
        case 'premium':
          expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
          break
        case 'spotlight':
          expiresAt = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000) // 120 days
          break
      }
    }

    // Create rental listing
    const createdListing = await prisma.rentalListing.create({
      data: {
        title,
        description,
        make,
        model,
        year,
        pricePerDay,
        mileage,
        condition,
        fuelType,
        transmission,
        bodyType,
        color,
        location,
        engineSize,
        images: JSON.stringify(imageUrls),
        features,
        rentalCategory,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        minRentalDays,
        maxRentalDays,
        listingType: listingPackage,
        isDraft: status === 'draft',
        isActive: status === 'active',
        expiresAt,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Rental listing created successfully',
      listing: createdListing
    })

  } catch (error) {
    console.error('Error creating rental listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}