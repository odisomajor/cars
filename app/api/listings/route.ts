import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, "Price must be positive"),
  mileage: z.number().min(0, "Mileage must be positive"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  color: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  condition: z.string().min(1, "Condition is required"),
  engineSize: z.string().optional(),
  features: z.array(z.string()).default([]),
  listingType: z.enum(["free", "featured", "premium", "spotlight"]).default("free")
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Extract form fields
    const data = {
      title: formData.get("title") as string,
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string),
      price: parseInt(formData.get("price") as string),
      mileage: parseInt(formData.get("mileage") as string),
      fuelType: formData.get("fuelType") as string,
      transmission: formData.get("transmission") as string,
      bodyType: formData.get("bodyType") as string,
      color: formData.get("color") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      condition: formData.get("condition") as string,
      engineSize: formData.get("engineSize") as string,
      features: JSON.parse(formData.get("features") as string || "[]"),
      listingType: formData.get("listingType") as "free" | "featured" | "premium" | "spotlight"
    }

    // Validate the data
    const validatedData = listingSchema.parse(data)

    // Handle image uploads
    const images = formData.getAll("images") as File[]
    const imageUrls: string[] = []

    if (images.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads", "listings")
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }

      // Process each image
      for (const image of images) {
        if (image.size > 0) {
          const bytes = await image.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Generate unique filename
          const fileExtension = image.name.split('.').pop()
          const fileName = `${uuidv4()}.${fileExtension}`
          const filePath = join(uploadsDir, fileName)
          
          // Save file
          await writeFile(filePath, buffer)
          
          // Store relative URL
          imageUrls.push(`/uploads/listings/${fileName}`)
        }
      }
    }

    // Calculate listing expiration based on type
    const now = new Date()
    let expiresAt: Date
    
    switch (validatedData.listingType) {
      case "free":
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
        break
      case "featured":
        expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days
        break
      case "premium":
        expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
        break
      case "spotlight":
        expiresAt = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000) // 120 days
        break
      default:
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    // Create the listing in the database
    const listing = await prisma.listing.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        images: JSON.stringify(imageUrls),
        features: JSON.stringify(validatedData.features),
        status: "active",
        expiresAt,
        views: 0,
        contactCount: 0,
        createdAt: now,
        updatedAt: now
      }
    })

    return NextResponse.json({
      id: listing.id,
      message: "Listing created successfully"
    })

  } catch (error) {
    console.error("Error creating listing:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const make = searchParams.get("make")
    const model = searchParams.get("model")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const location = searchParams.get("location")
    const bodyType = searchParams.get("bodyType")
    const fuelType = searchParams.get("fuelType")
    const transmission = searchParams.get("transmission")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "active",
      expiresAt: {
        gt: new Date()
      }
    }

    if (make) where.make = { contains: make, mode: "insensitive" }
    if (model) where.model = { contains: model, mode: "insensitive" }
    if (location) where.location = { contains: location, mode: "insensitive" }
    if (bodyType) where.bodyType = bodyType
    if (fuelType) where.fuelType = fuelType
    if (transmission) where.transmission = transmission
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseInt(minPrice)
      if (maxPrice) where.price.lte = parseInt(maxPrice)
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === "price") {
      orderBy.price = sortOrder
    } else if (sortBy === "year") {
      orderBy.year = sortOrder
    } else if (sortBy === "mileage") {
      orderBy.mileage = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get listings with user information
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}