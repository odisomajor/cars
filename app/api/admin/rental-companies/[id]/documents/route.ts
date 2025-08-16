import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const documents = await prisma.verificationDocument.findMany({
      where: { rentalCompanyId: params.id },
      include: {
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Error fetching verification documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification documents' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, url, filename, fileSize, mimeType } = body

    // Validate required fields
    if (!type || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: type, url' },
        { status: 400 }
      )
    }

    // Validate document type
    const validTypes = [
      'BUSINESS_LICENSE',
      'TAX_CERTIFICATE',
      'INSURANCE_CERTIFICATE',
      'IDENTITY_DOCUMENT',
      'BANK_STATEMENT',
      'VEHICLE_REGISTRATION',
      'OTHER'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = await prisma.rentalCompany.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Rental company not found' },
        { status: 404 }
      )
    }

    // Create verification document
    const document = await prisma.verificationDocument.create({
      data: {
        rentalCompanyId: params.id,
        type,
        url,
        filename,
        fileSize,
        mimeType,
        status: 'PENDING',
        uploadedAt: new Date()
      },
      include: {
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPLOAD_VERIFICATION_DOCUMENT',
        resourceType: 'VERIFICATION_DOCUMENT',
        resourceId: document.id,
        details: {
          companyId: params.id,
          documentType: type,
          filename
        }
      }
    })

    return NextResponse.json({ document }, { status: 201 })

  } catch (error) {
    console.error('Error creating verification document:', error)
    return NextResponse.json(
      { error: 'Failed to create verification document' },
      { status: 500 }
    )
  }
}