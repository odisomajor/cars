import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let settings = await prisma.siteSettings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: "CarDealership Pro",
          siteDescription: "Find your perfect car with our comprehensive dealership platform",
          contactEmail: "contact@cardealership.com",
          contactPhone: "+1 (555) 123-4567",
          address: "123 Auto Street, Car City, CC 12345",
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: ""
          },
          seoSettings: {
            defaultTitle: "CarDealership Pro - Find Your Perfect Car",
            defaultDescription: "Browse thousands of quality used cars from trusted dealers. Find your perfect vehicle with detailed listings, photos, and competitive prices.",
            keywords: "used cars, car dealership, auto sales, vehicles, car buying"
          }
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      siteName,
      siteDescription,
      contactEmail,
      contactPhone,
      address,
      socialLinks,
      seoSettings
    } = body

    // Find existing settings or create new ones
    let settings = await prisma.siteSettings.findFirst()
    
    if (settings) {
      settings = await prisma.siteSettings.update({
        where: {
          id: settings.id
        },
        data: {
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          address,
          socialLinks: socialLinks || {},
          seoSettings: seoSettings || {}
        }
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          address,
          socialLinks: socialLinks || {},
          seoSettings: seoSettings || {}
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}