import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
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
    const { status, rejectionReason, adminNotes } = body

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid document status' },
        { status: 400 }
      )
    }

    // Check if document exists
    const existingDocument = await prisma.verificationDocument.findFirst({
      where: {
        id: params.documentId,
        rentalCompanyId: params.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Verification document not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status
      
      if (status === 'APPROVED') {
        updateData.verifiedAt = new Date()
        updateData.verifiedById = session.user.id
        updateData.rejectionReason = null
      } else if (status === 'REJECTED' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
        updateData.verifiedAt = null
        updateData.verifiedById = null
      }
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    // Update document
    const updatedDocument = await prisma.verificationDocument.update({
      where: { id: params.documentId },
      data: updateData,
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

    // Check if all required documents are approved and update company status
    if (status === 'APPROVED') {
      const allDocuments = await prisma.verificationDocument.findMany({
        where: { rentalCompanyId: params.id }
      })

      const requiredDocTypes = ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'INSURANCE_CERTIFICATE']
      const approvedRequiredDocs = allDocuments.filter(doc => 
        requiredDocTypes.includes(doc.type) && doc.status === 'APPROVED'
      )

      // If all required documents are approved, update company verification status
      if (approvedRequiredDocs.length >= requiredDocTypes.length) {
        await prisma.rentalCompany.update({
          where: { id: params.id },
          data: {
            verificationStatus: 'APPROVED',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: session.user.id
          }
        })
      }
    }

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'VERIFY_DOCUMENT',
        resourceType: 'VERIFICATION_DOCUMENT',
        resourceId: params.documentId,
        details: {
          companyId: params.id,
          documentType: existingDocument.type,
          previousStatus: existingDocument.status,
          newStatus: status,
          rejectionReason,
          adminNotes
        }
      }
    })

    return NextResponse.json({ document: updatedDocument })

  } catch (error) {
    console.error('Error updating verification document:', error)
    return NextResponse.json(
      { error: 'Failed to update verification document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Check if document exists
    const existingDocument = await prisma.verificationDocument.findFirst({
      where: {
        id: params.documentId,
        rentalCompanyId: params.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Verification document not found' },
        { status: 404 }
      )
    }

    // Delete document
    await prisma.verificationDocument.delete({
      where: { id: params.documentId }
    })

    // Log the admin action
    await prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_VERIFICATION_DOCUMENT',
        resourceType: 'VERIFICATION_DOCUMENT',
        resourceId: params.documentId,
        details: {
          companyId: params.id,
          documentType: existingDocument.type,
          filename: existingDocument.filename
        }
      }
    })

    return NextResponse.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Error deleting verification document:', error)
    return NextResponse.json(
      { error: 'Failed to delete verification document' },
      { status: 500 }
    )
  }
}