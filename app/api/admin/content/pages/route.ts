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

    const pages = await prisma.contentPage.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error fetching pages:", error)
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
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      isPublished = true
    } = body

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPage = await prisma.contentPage.findUnique({
      where: { slug }
    })

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      )
    }

    const page = await prisma.contentPage.create({
      data: {
        slug,
        title,
        content,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || '',
        isPublished
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error("Error creating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}