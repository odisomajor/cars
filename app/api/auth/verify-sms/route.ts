import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifySMSSchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits").max(6, "Verification code must be 6 digits"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code } = verifySMSSchema.parse(body)

    // Find user with verification token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if verification token exists
    if (!user.phoneVerificationToken) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new code." },
        { status: 400 }
      )
    }

    // Check if verification token has expired
    if (!user.phoneVerificationTokenExpiry || user.phoneVerificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      )
    }

    // Check if verification code matches
    if (user.phoneVerificationToken !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Mark phone as verified and clear verification tokens
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneVerified: new Date(),
        phoneVerificationToken: null,
        phoneVerificationTokenExpiry: null,
      },
    })

    return NextResponse.json(
      { 
        message: "Phone number verified successfully",
        phoneVerified: true,
        phone: user.profile?.phone
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("SMS verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}