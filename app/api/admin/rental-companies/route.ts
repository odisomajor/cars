import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const verificationStatus = searchParams.get('verificationStatus')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (verificationStatus && verificationStatus !== 'ALL') {
      where.verificationStatus = verificationStatus
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { businessLicense: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch companies with related data
    const companies = await prisma.rentalCompany.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            listings: true,
            bookings: true,
            vehicles: true
          }
        },
        verificationDocuments: {
          select: {
            id: true,
            type: true,
            status: true,
            url: true,
            uploadedAt: true,
            verifiedAt: true,
            rejectionReason: true
          }
        }
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.rentalCompany.count({ where })

    // Calculate verification statistics
    const stats = await prisma.rentalCompany.groupBy({
      by: ['verificationStatus'],
      _count: {
        verificationStatus: true
      }
    })

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: stats.map(stat => ({
        status: stat.verificationStatus,
        count: stat._count.verificationStatus
      }))
    })

  } catch (error) {
    console.error('Error fetching rental companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      userId, 
      name, 
      email, 
      phone, 
      address, 
      businessLicense, 
      taxId, 
      description,
      verificationStatus = 'PENDING'
    } = body

    // Validate required fields
    if (!userId || !name || !email || !businessLicense) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, email, businessLicense' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if company already exists for this user
    const existingCompany = await prisma.rentalCompany.findUnique({
      where: { userId }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Rental company already exists for this user' },
        { status: 400 }
      )
    }

    // Create rental company
    const company = await prisma.rentalCompany.create({
      data: {
        userId,
        name,
        email,
        phone,
        address,
        businessLicense,
        taxId,
        description,
        verificationStatus,
        isVerified: verificationStatus === 'APPROVED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        },
        _count: {
          select: {
            listings: true,
            bookings: true,
            vehicles: true
          }
        }
      }
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'CREATE_RENTAL_COMPANY',
        resourceType: 'RENTAL_COMPANY',
        resourceId: company.id,
        details: {
          companyName: name,
          verificationStatus,
          businessLicense
        }
      }
    })

    return NextResponse.json({ company }, { status: 201 })

  } catch (error) {
    console.error('Error creating rental company:', error)
    return NextResponse.json(
      { error: 'Failed to create rental company' },
      { status: 500 }
    )
  }
}