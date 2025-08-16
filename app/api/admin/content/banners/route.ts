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

    const banners = await prisma.banner.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      title,
      description,
      imageUrl,
      linkUrl,
      position,
      startDate,
      endDate,
      isActive = true
    } = body

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: "Title, image URL, and position are required" },
        { status: 400 }
      )
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        clickCount: 0,
        impressionCount: 0
      }
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}