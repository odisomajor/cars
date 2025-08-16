import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: {
    id: string
  }
}

// Resolve report
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
    const { status, resolution } = body

    // Validate status
    if (!['RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be RESOLVED or DISMISSED." },
        { status: 400 }
      )
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
        resolvedBy: session.user.id
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send notification to report submitter
    // This could be implemented with email service or in-app notifications

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error resolving report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get report details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { id } = params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            images: true,
            make: true,
            model: true,
            year: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}