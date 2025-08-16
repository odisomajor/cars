import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: {
    id: string
  }
}

// Update listing status (approve/reject)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status, rejectionReason } = body

    // Validate status
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED, REJECTED, or PENDING." },
        { status: 400 }
      )
    }

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Update listing status
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        moderatedAt: new Date(),
        moderatedBy: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isVerified: true
          }
        },
        reports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            favorites: true,
            views: true,
            reports: true
          }
        }
      }
    })

    // TODO: Send notification to listing owner
    // This could be implemented with email service or in-app notifications

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Error updating listing status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete listing
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if listing exists
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction([
      // Delete favorites
      prisma.favorite.deleteMany({
        where: { listingId: id }
      }),
      // Delete views
      prisma.view.deleteMany({
        where: { listingId: id }
      }),
      // Delete reports
      prisma.report.deleteMany({
        where: { listingId: id }
      }),
      // Delete bookings
      prisma.booking.deleteMany({
        where: { listingId: id }
      }),
      // Finally delete the listing
      prisma.listing.delete({
        where: { id }
      })
    ])

    // TODO: Send notification to listing owner
    // TODO: Delete associated images from storage

    return NextResponse.json({ 
      message: "Listing deleted successfully",
      deletedListing: {
        id: existingListing.id,
        title: existingListing.title,
        user: existingListing.user
      }
    })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}