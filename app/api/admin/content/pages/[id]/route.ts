import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isPublished
    } = body

    // Check if slug already exists (excluding current page)
    if (slug) {
      const existingPage = await prisma.contentPage.findFirst({
        where: {
          slug,
          NOT: {
            id: params.id
          }
        }
      })

      if (existingPage) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        )
      }
    }

    const page = await prisma.contentPage.update({
      where: {
        id: params.id
      },
      data: {
        slug,
        title,
        content,
        metaTitle: metaTitle || title,
        metaDescription,
        isPublished
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const page = await prisma.contentPage.update({
      where: {
        id: params.id
      },
      data: body
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.contentPage.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}