import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendPhoneVerificationSMS, generateVerificationCode, validatePhoneNumber, formatPhoneNumber } from "@/lib/sms"
import { z } from "zod"

const sendSMSSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
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
    const { phone } = sendSMSSchema.parse(body)

    // Validate phone number format
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please use a valid Kenyan phone number." },
        { status: 400 }
      )
    }

    // Format phone number to international format
    const formattedPhone = formatPhoneNumber(phone)

    // Check if user exists
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

    // Check if phone is already verified for this user
    if (user.phoneVerified && user.profile?.phone === formattedPhone) {
      return NextResponse.json(
        { error: "Phone number is already verified" },
        { status: 400 }
      )
    }

    // Check if another user has this phone number verified
    const existingUserWithPhone = await prisma.user.findFirst({
      where: {
        id: { not: session.user.id },
        profile: {
          phone: formattedPhone
        },
        phoneVerified: { not: null }
      }
    })

    if (existingUserWithPhone) {
      return NextResponse.json(
        { error: "This phone number is already verified by another user" },
        { status: 400 }
      )
    }

    // Generate verification code (6 digits)
    const verificationCode = generateVerificationCode()
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Update user with verification token
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneVerificationToken: verificationCode,
        phoneVerificationTokenExpiry: verificationTokenExpiry,
      },
    })

    // Update or create user profile with phone number
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { phone: formattedPhone },
      create: {
        userId: session.user.id,
        phone: formattedPhone,
      },
    })

    // Send SMS verification code
    try {
      await sendPhoneVerificationSMS(formattedPhone, verificationCode)
    } catch (smsError) {
      console.error("Failed to send SMS verification:", smsError)
      return NextResponse.json(
        { error: "Failed to send SMS verification code" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: "SMS verification code sent successfully",
        phone: formattedPhone
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

    console.error("Send SMS verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}