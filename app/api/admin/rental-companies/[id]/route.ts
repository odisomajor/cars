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

    const company = await prisma.rentalCompany.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
            lastLoginAt: true
          }
        },
        listings: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            pricePerDay: true,
            status: true,
            isActive: true,
            createdAt: true,
            images: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        vehicles: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        verificationDocuments: {
          select: {
            id: true,
            type: true,
            status: true,
            url: true,
            uploadedAt: true,
            verifiedAt: true,
            rejectionReason: true,
            verifiedBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { uploadedAt: 'desc' }
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

    if (!company) {
      return NextResponse.json(
        { error: 'Rental company not found' },
        { status: 404 }
      )
    }

    // Get revenue statistics
    const revenueStats = await prisma.rentalBooking.aggregate({
      where: {
        rentalCompanyId: params.id,
        paymentStatus: 'PAID'
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as bookings,
        SUM("totalAmount") as revenue
      FROM "RentalBooking"
      WHERE "rentalCompanyId" = ${params.id}
        AND "paymentStatus" = 'PAID'
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `

    return NextResponse.json({ 
      company: {
        ...company,
        stats: {
          totalRevenue: revenueStats._sum.totalAmount || 0,
          totalPaidBookings: revenueStats._count || 0,
          monthlyRevenue
        }
      }
    })

  } catch (error) {
    console.error('Error fetching rental company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental company' },
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
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      verificationStatus, 
      isVerified, 
      rejectionReason, 
      adminNotes,
      name,
      email,
      phone,
      address,
      description
    } = body

    // Validate verification status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']
    if (verificationStatus && !validStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Invalid verification status' },
        { status: 400 }
      )
    }

    // Check if company exists
    const existingCompany = await prisma.rentalCompany.findUnique({
      where: { id: params.id }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Rental company not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (address) updateData.address = address
    if (description) updateData.description = description
    if (adminNotes) updateData.adminNotes = adminNotes

    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus
      updateData.isVerified = verificationStatus === 'APPROVED'
      
      if (verificationStatus === 'APPROVED') {
        updateData.verifiedAt = new Date()
        updateData.verifiedBy = session.user.id
      } else if (verificationStatus === 'REJECTED' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }
    }

    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified
    }

    // Update company
    const updatedCompany = await prisma.rentalCompany.update({
      where: { id: params.id },
      data: updateData,
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

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_RENTAL_COMPANY',
        resourceType: 'RENTAL_COMPANY',
        resourceId: params.id,
        details: {
          previousStatus: existingCompany.verificationStatus,
          newStatus: verificationStatus,
          rejectionReason,
          adminNotes
        }
      }
    })

    // Send notification email if status changed
    if (verificationStatus && verificationStatus !== existingCompany.verificationStatus) {
      // TODO: Implement email notification service
      console.log(`Verification status changed for company ${updatedCompany.name}: ${verificationStatus}`)
    }

    return NextResponse.json({ company: updatedCompany })

  } catch (error) {
    console.error('Error updating rental company:', error)
    return NextResponse.json(
      { error: 'Failed to update rental company' },
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
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check if company exists
    const existingCompany = await prisma.rentalCompany.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ['CONFIRMED', 'ACTIVE']
                }
              }
            }
          }
        }
      }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Rental company not found' },
        { status: 404 }
      )
    }

    // Check for active bookings
    if (existingCompany._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with active bookings' },
        { status: 400 }
      )
    }

    // Delete company and related data
    await prisma.$transaction(async (tx) => {
      // Delete verification documents
      await tx.verificationDocument.deleteMany({
        where: { rentalCompanyId: params.id }
      })

      // Delete vehicles
      await tx.rentalVehicle.deleteMany({
        where: { rentalCompanyId: params.id }
      })

      // Delete listings
      await tx.rentalListing.deleteMany({
        where: { rentalCompanyId: params.id }
      })

      // Delete completed/cancelled bookings
      await tx.rentalBooking.deleteMany({
        where: {
          rentalCompanyId: params.id,
          status: {
            in: ['COMPLETED', 'CANCELLED']
          }
        }
      })

      // Delete the company
      await tx.rentalCompany.delete({
        where: { id: params.id }
      })
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_RENTAL_COMPANY',
        resourceType: 'RENTAL_COMPANY',
        resourceId: params.id,
        details: {
          companyName: existingCompany.name,
          verificationStatus: existingCompany.verificationStatus
        }
      }
    })

    return NextResponse.json({ message: 'Rental company deleted successfully' })

  } catch (error) {
    console.error('Error deleting rental company:', error)
    return NextResponse.json(
      { error: 'Failed to delete rental company' },
      { status: 500 }
    )
  }
}