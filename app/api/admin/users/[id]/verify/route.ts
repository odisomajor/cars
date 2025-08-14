import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifyUserSchema = z.object({
  isVerified: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { isVerified } = verifyUserSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    })

    return NextResponse.json(
      { 
        message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    console.error("Admin verify user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}