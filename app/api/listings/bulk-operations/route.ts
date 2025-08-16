import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface BulkOperationRequest {
  operation: string
  listingIds: string[]
  data?: Record<string, any>
}

interface BulkOperationResult {
  successCount: number
  errorCount: number
  errors: { itemId: string; error: string }[]
  results: any[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: BulkOperationRequest = await request.json()
    const { operation, listingIds, data = {} } = body

    if (!operation || !listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Verify user owns all listings
    const userListings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id
      },
      select: { id: true, type: true }
    })

    const userRentalListings = await prisma.rentalListing.findMany({
      where: {
        id: { in: listingIds },
        userId: session.user.id
      },
      select: { id: true }
    })

    const ownedListingIds = [...userListings.map(l => l.id), ...userRentalListings.map(l => l.id)]
    const unauthorizedIds = listingIds.filter(id => !ownedListingIds.includes(id))

    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized access to some listings' },
        { status: 403 }
      )
    }

    const result: BulkOperationResult = {
      successCount: 0,
      errorCount: 0,
      errors: [],
      results: []
    }

    // Execute bulk operation based on type
    switch (operation) {
      case 'activate':
        result = await handleActivateOperation(listingIds, session.user.id)
        break
      
      case 'deactivate':
        result = await handleDeactivateOperation(listingIds, session.user.id)
        break
      
      case 'delete':
        result = await handleDeleteOperation(listingIds, session.user.id)
        break
      
      case 'update_price':
        result = await handleUpdatePriceOperation(listingIds, session.user.id, data)
        break
      
      case 'update_location':
        result = await handleUpdateLocationOperation(listingIds, session.user.id, data)
        break
      
      case 'extend_expiry':
        result = await handleExtendExpiryOperation(listingIds, session.user.id, data)
        break
      
      case 'upgrade_listing':
        result = await handleUpgradeListingOperation(listingIds, session.user.id, data)
        break
      
      default:
        return NextResponse.json(
          { error: 'Unsupported operation' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleActivateOperation(listingIds: string[], userId: string): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  try {
    // Update regular listings
    const regularListings = await prisma.listing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        status: 'active',
        updatedAt: new Date()
      }
    })

    // Update rental listings
    const rentalListings = await prisma.rentalListing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })

    result.successCount = regularListings.count + rentalListings.count
    result.results = [{ regularListings: regularListings.count, rentalListings: rentalListings.count }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleDeactivateOperation(listingIds: string[], userId: string): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  try {
    // Update regular listings
    const regularListings = await prisma.listing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    })

    // Update rental listings
    const rentalListings = await prisma.rentalListing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    result.successCount = regularListings.count + rentalListings.count
    result.results = [{ regularListings: regularListings.count, rentalListings: rentalListings.count }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleDeleteOperation(listingIds: string[], userId: string): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  try {
    // Delete regular listings
    const regularListings = await prisma.listing.deleteMany({
      where: {
        id: { in: listingIds },
        userId: userId
      }
    })

    // Delete rental listings
    const rentalListings = await prisma.rentalListing.deleteMany({
      where: {
        id: { in: listingIds },
        userId: userId
      }
    })

    result.successCount = regularListings.count + rentalListings.count
    result.results = [{ regularListings: regularListings.count, rentalListings: rentalListings.count }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleUpdatePriceOperation(listingIds: string[], userId: string, data: Record<string, any>): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  const { priceAction, priceValue } = data
  if (!priceAction || !priceValue) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: 'Missing price action or value' }]
    return result
  }

  try {
    // Get current listings to calculate new prices
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      select: { id: true, price: true }
    })

    const rentalListings = await prisma.rentalListing.findMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      select: { id: true, dailyRate: true }
    })

    // Update regular listings
    for (const listing of listings) {
      let newPrice = listing.price
      
      switch (priceAction) {
        case 'set_fixed':
          newPrice = parseFloat(priceValue)
          break
        case 'increase_percent':
          newPrice = listing.price * (1 + parseFloat(priceValue) / 100)
          break
        case 'decrease_percent':
          newPrice = listing.price * (1 - parseFloat(priceValue) / 100)
          break
        case 'increase_amount':
          newPrice = listing.price + parseFloat(priceValue)
          break
        case 'decrease_amount':
          newPrice = listing.price - parseFloat(priceValue)
          break
      }

      await prisma.listing.update({
        where: { id: listing.id },
        data: { 
          price: Math.max(0, newPrice),
          updatedAt: new Date()
        }
      })
    }

    // Update rental listings
    for (const listing of rentalListings) {
      let newRate = listing.dailyRate
      
      switch (priceAction) {
        case 'set_fixed':
          newRate = parseFloat(priceValue)
          break
        case 'increase_percent':
          newRate = listing.dailyRate * (1 + parseFloat(priceValue) / 100)
          break
        case 'decrease_percent':
          newRate = listing.dailyRate * (1 - parseFloat(priceValue) / 100)
          break
        case 'increase_amount':
          newRate = listing.dailyRate + parseFloat(priceValue)
          break
        case 'decrease_amount':
          newRate = listing.dailyRate - parseFloat(priceValue)
          break
      }

      await prisma.rentalListing.update({
        where: { id: listing.id },
        data: { 
          dailyRate: Math.max(0, newRate),
          updatedAt: new Date()
        }
      })
    }

    result.successCount = listings.length + rentalListings.length
    result.results = [{ regularListings: listings.length, rentalListings: rentalListings.length }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleUpdateLocationOperation(listingIds: string[], userId: string, data: Record<string, any>): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  const { location } = data
  if (!location) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: 'Missing location' }]
    return result
  }

  try {
    // Update regular listings
    const regularListings = await prisma.listing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        location: location,
        updatedAt: new Date()
      }
    })

    // Update rental listings
    const rentalListings = await prisma.rentalListing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        location: location,
        updatedAt: new Date()
      }
    })

    result.successCount = regularListings.count + rentalListings.count
    result.results = [{ regularListings: regularListings.count, rentalListings: rentalListings.count }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleExtendExpiryOperation(listingIds: string[], userId: string, data: Record<string, any>): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  const { extensionDays } = data
  if (!extensionDays || isNaN(parseInt(extensionDays))) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: 'Invalid extension days' }]
    return result
  }

  try {
    const extensionMs = parseInt(extensionDays) * 24 * 60 * 60 * 1000

    // Get current listings to extend their expiry dates
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      select: { id: true, expiresAt: true }
    })

    const rentalListings = await prisma.rentalListing.findMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      select: { id: true, expiresAt: true }
    })

    // Update regular listings
    for (const listing of listings) {
      const currentExpiry = listing.expiresAt || new Date()
      const newExpiry = new Date(currentExpiry.getTime() + extensionMs)
      
      await prisma.listing.update({
        where: { id: listing.id },
        data: { 
          expiresAt: newExpiry,
          updatedAt: new Date()
        }
      })
    }

    // Update rental listings
    for (const listing of rentalListings) {
      const currentExpiry = listing.expiresAt || new Date()
      const newExpiry = new Date(currentExpiry.getTime() + extensionMs)
      
      await prisma.rentalListing.update({
        where: { id: listing.id },
        data: { 
          expiresAt: newExpiry,
          updatedAt: new Date()
        }
      })
    }

    result.successCount = listings.length + rentalListings.length
    result.results = [{ regularListings: listings.length, rentalListings: rentalListings.length }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

async function handleUpgradeListingOperation(listingIds: string[], userId: string, data: Record<string, any>): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
    results: []
  }

  const { newListingType } = data
  if (!newListingType || !['FEATURED', 'PREMIUM', 'SPOTLIGHT'].includes(newListingType)) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: 'Invalid listing type' }]
    return result
  }

  try {
    // Update regular listings
    const regularListings = await prisma.listing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        listingType: newListingType,
        updatedAt: new Date()
      }
    })

    // Update rental listings
    const rentalListings = await prisma.rentalListing.updateMany({
      where: {
        id: { in: listingIds },
        userId: userId
      },
      data: {
        listingType: newListingType,
        updatedAt: new Date()
      }
    })

    result.successCount = regularListings.count + rentalListings.count
    result.results = [{ regularListings: regularListings.count, rentalListings: rentalListings.count }]
  } catch (error) {
    result.errorCount = listingIds.length
    result.errors = [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
  }

  return result
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}