import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema
const exportSchema = z.object({
  format: z.enum(['csv', 'pdf', 'excel']).default('csv'),
  vehicleIds: z.array(z.string()).optional(),
  includeBookings: z.boolean().default(false),
  includeMaintenance: z.boolean().default(false),
  includeFinancials: z.boolean().default(false),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional()
})

// Helper function to convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  )
  return [csvHeaders, ...csvRows].join('\n')
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

// Helper function to format date
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE')
}

// POST /api/rental/fleet/export - Export fleet data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { format, vehicleIds, includeBookings, includeMaintenance, includeFinancials, dateRange } = exportSchema.parse(body)

    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
      listingType: 'rental'
    }

    if (vehicleIds && vehicleIds.length > 0) {
      whereClause.id = { in: vehicleIds }
    }

    if (dateRange?.from || dateRange?.to) {
      whereClause.createdAt = {}
      if (dateRange.from) whereClause.createdAt.gte = new Date(dateRange.from)
      if (dateRange.to) whereClause.createdAt.lte = new Date(dateRange.to)
    }

    // Fetch vehicle data with related information
    const vehicles = await db.listing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        rentalBookings: includeBookings ? {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        } : false,
        maintenanceRecords: includeMaintenance ? {
          orderBy: { date: 'desc' }
        } : false,
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Basic vehicle information
      const vehicleHeaders = [
        'ID',
        'Title',
        'Make',
        'Model',
        'Year',
        'Category',
        'Status',
        'Location',
        'Daily Rate',
        'Weekly Rate',
        'Monthly Rate',
        'Mileage',
        'Fuel Type',
        'Transmission',
        'Seats',
        'Doors',
        'Air Conditioning',
        'GPS',
        'Bluetooth',
        'Total Bookings',
        'Average Rating',
        'Created Date',
        'Last Updated'
      ]

      if (includeFinancials) {
        vehicleHeaders.push('Total Revenue', 'Monthly Revenue')
      }

      const vehicleData = await Promise.all(vehicles.map(async (vehicle) => {
        const totalBookings = vehicle.rentalBookings?.length || 0
        const averageRating = vehicle.reviews.length > 0 
          ? vehicle.reviews.reduce((sum, review) => sum + review.rating, 0) / vehicle.reviews.length
          : 0

        let totalRevenue = 0
        let monthlyRevenue = 0

        if (includeFinancials && vehicle.rentalBookings) {
          totalRevenue = vehicle.rentalBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
          
          const currentMonth = new Date()
          currentMonth.setDate(1)
          const nextMonth = new Date(currentMonth)
          nextMonth.setMonth(nextMonth.getMonth() + 1)
          
          monthlyRevenue = vehicle.rentalBookings
            .filter(booking => {
              const bookingDate = new Date(booking.createdAt)
              return bookingDate >= currentMonth && bookingDate < nextMonth
            })
            .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
        }

        const row: any = {
          'ID': vehicle.id,
          'Title': vehicle.title,
          'Make': vehicle.make,
          'Model': vehicle.model,
          'Year': vehicle.year,
          'Category': vehicle.category,
          'Status': vehicle.status,
          'Location': vehicle.location,
          'Daily Rate': formatCurrency(vehicle.rentalDailyRate || 0),
          'Weekly Rate': formatCurrency(vehicle.rentalWeeklyRate || 0),
          'Monthly Rate': formatCurrency(vehicle.rentalMonthlyRate || 0),
          'Mileage': vehicle.mileage || 0,
          'Fuel Type': vehicle.fuelType,
          'Transmission': vehicle.transmission,
          'Seats': vehicle.seats || 0,
          'Doors': vehicle.doors || 0,
          'Air Conditioning': vehicle.airConditioning ? 'Yes' : 'No',
          'GPS': vehicle.gps ? 'Yes' : 'No',
          'Bluetooth': vehicle.bluetooth ? 'Yes' : 'No',
          'Total Bookings': totalBookings,
          'Average Rating': averageRating.toFixed(1),
          'Created Date': formatDate(vehicle.createdAt),
          'Last Updated': formatDate(vehicle.updatedAt)
        }

        if (includeFinancials) {
          row['Total Revenue'] = formatCurrency(totalRevenue)
          row['Monthly Revenue'] = formatCurrency(monthlyRevenue)
        }

        return row
      }))

      let csvContent = convertToCSV(vehicleData, vehicleHeaders)

      // Add bookings data if requested
      if (includeBookings) {
        csvContent += '\n\n--- BOOKINGS DATA ---\n'
        const bookingHeaders = [
          'Booking ID',
          'Vehicle ID',
          'Vehicle Title',
          'Customer Name',
          'Customer Email',
          'Customer Phone',
          'Start Date',
          'End Date',
          'Total Amount',
          'Status',
          'Created Date'
        ]

        const bookingData: any[] = []
        vehicles.forEach(vehicle => {
          if (vehicle.rentalBookings) {
            vehicle.rentalBookings.forEach(booking => {
              bookingData.push({
                'Booking ID': booking.id,
                'Vehicle ID': vehicle.id,
                'Vehicle Title': vehicle.title,
                'Customer Name': booking.user.name || 'N/A',
                'Customer Email': booking.user.email || 'N/A',
                'Customer Phone': booking.user.phone || 'N/A',
                'Start Date': formatDate(booking.startDate),
                'End Date': formatDate(booking.endDate),
                'Total Amount': formatCurrency(booking.totalAmount || 0),
                'Status': booking.status,
                'Created Date': formatDate(booking.createdAt)
              })
            })
          }
        })

        if (bookingData.length > 0) {
          csvContent += convertToCSV(bookingData, bookingHeaders)
        }
      }

      // Add maintenance data if requested
      if (includeMaintenance) {
        csvContent += '\n\n--- MAINTENANCE DATA ---\n'
        const maintenanceHeaders = [
          'Record ID',
          'Vehicle ID',
          'Vehicle Title',
          'Maintenance Type',
          'Description',
          'Date',
          'Cost',
          'Status'
        ]

        const maintenanceData: any[] = []
        vehicles.forEach(vehicle => {
          if (vehicle.maintenanceRecords) {
            vehicle.maintenanceRecords.forEach(record => {
              maintenanceData.push({
                'Record ID': record.id,
                'Vehicle ID': vehicle.id,
                'Vehicle Title': vehicle.title,
                'Maintenance Type': record.type,
                'Description': record.description,
                'Date': formatDate(record.date),
                'Cost': formatCurrency(record.cost || 0),
                'Status': record.status
              })
            })
          }
        })

        if (maintenanceData.length > 0) {
          csvContent += convertToCSV(maintenanceData, maintenanceHeaders)
        }
      }

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fleet-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // For PDF format (simplified implementation)
    if (format === 'pdf') {
      // This would typically use a PDF library like puppeteer or jsPDF
      // For now, return a simple HTML that can be converted to PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fleet Export Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1, h2 { color: #333; }
            .summary { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Fleet Export Report</h1>
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Vehicles: ${vehicles.length}</p>
            <p>Export Date: ${new Date().toLocaleDateString()}</p>
            <p>Generated by: ${session.user.name || session.user.email}</p>
          </div>
          
          <h2>Vehicle Details</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Make/Model</th>
                <th>Year</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                <th>Daily Rate</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.map(vehicle => `
                <tr>
                  <td>${vehicle.title}</td>
                  <td>${vehicle.make} ${vehicle.model}</td>
                  <td>${vehicle.year}</td>
                  <td>${vehicle.category}</td>
                  <td>${vehicle.status}</td>
                  <td>${vehicle.location}</td>
                  <td>${formatCurrency(vehicle.rentalDailyRate || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="fleet-export-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Unsupported export format' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Export error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to export fleet data' },
      { status: 500 }
    )
  }
}

// GET /api/rental/fleet/export - Get export options
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleIds = searchParams.get('vehicleIds')?.split(',') || []

    // Get basic stats for the export
    const whereClause: any = {
      userId: session.user.id,
      listingType: 'rental'
    }

    if (vehicleIds.length > 0) {
      whereClause.id = { in: vehicleIds }
    }

    const [vehicleCount, bookingCount, maintenanceCount] = await Promise.all([
      db.listing.count({ where: whereClause }),
      db.rentalBooking.count({
        where: {
          listing: whereClause
        }
      }),
      db.maintenanceRecord.count({
        where: {
          listing: whereClause
        }
      })
    ])

    return NextResponse.json({
      exportOptions: {
        formats: [
          { value: 'csv', label: 'CSV', description: 'Comma-separated values file' },
          { value: 'pdf', label: 'PDF', description: 'Portable document format' },
          { value: 'excel', label: 'Excel', description: 'Microsoft Excel format (coming soon)', disabled: true }
        ],
        includeOptions: [
          { value: 'bookings', label: 'Include Bookings', description: `${bookingCount} booking records` },
          { value: 'maintenance', label: 'Include Maintenance', description: `${maintenanceCount} maintenance records` },
          { value: 'financials', label: 'Include Financial Data', description: 'Revenue and earnings data' }
        ]
      },
      stats: {
        vehicleCount,
        bookingCount,
        maintenanceCount
      }
    })

  } catch (error) {
    console.error('Export options error:', error)
    return NextResponse.json(
      { error: 'Failed to get export options' },
      { status: 500 }
    )
  }
}