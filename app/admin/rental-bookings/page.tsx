'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminNavigation } from '@/components/admin/AdminNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Car, 
  Clock, 
  DollarSign, 
  Eye, 
  Filter, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Search, 
  Shield, 
  User, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface RentalBooking {
  id: string
  bookingNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
  startDate: string
  endDate: string
  totalDays: number
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paymentMethod: 'STRIPE' | 'MPESA' | 'BANK_TRANSFER'
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    image?: string
  }
  rentalListing: {
    id: string
    title: string
    make: string
    model: string
    year: number
    pricePerDay: number
    location: string
    images: string[]
  }
  rentalCompany: {
    id: string
    name: string
    email: string
    phone: string
    isVerified: boolean
  }
  dispute?: {
    id: string
    reason: string
    description: string
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
    createdAt: string
  }
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  active: number
  completed: number
  cancelled: number
  disputed: number
  totalRevenue: number
  monthlyRevenue: number
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-orange-100 text-orange-800'
}

const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800'
}

export default function RentalBookingManagement() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<RentalBooking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin privileges required.')
    }
  }, [user, authLoading, router])

  // Fetch booking data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchBookingData()
    }
  }, [user])

  const fetchBookingData = async () => {
    try {
      setLoading(true)
      const [bookingsRes, statsRes] = await Promise.all([
        fetch('/api/admin/rental-bookings'),
        fetch('/api/admin/rental-bookings/stats')
      ])

      if (bookingsRes.ok && statsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const statsData = await statsRes.json()
        setBookings(bookingsData.bookings)
        setStats(statsData.stats)
      } else {
        toast.error('Failed to load booking data')
      }
    } catch (error) {
      console.error('Error fetching booking data:', error)
      toast.error('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/rental-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Booking status updated successfully')
        fetchBookingData()
        setShowDetailsModal(false)
      } else {
        toast.error('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateDispute = async () => {
    if (!selectedBooking || !disputeReason.trim() || !disputeDescription.trim()) {
      toast.error('Please fill in all dispute fields')
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/rental-bookings/${selectedBooking.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason,
          description: disputeDescription
        })
      })

      if (response.ok) {
        toast.success('Dispute created successfully')
        fetchBookingData()
        setShowDisputeModal(false)
        setDisputeReason('')
        setDisputeDescription('')
      } else {
        toast.error('Failed to create dispute')
      }
    } catch (error) {
      console.error('Error creating dispute:', error)
      toast.error('Failed to create dispute')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.rentalListing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.rentalCompany.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
    const matchesPayment = paymentFilter === 'ALL' || booking.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rental Booking Management</h1>
            <p className="text-gray-600 mt-2">Manage rental bookings and resolve disputes</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-bold">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="text-xl font-bold">{stats.confirmed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Car className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-xl font-bold">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xl font-bold">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Cancelled</p>
                      <p className="text-xl font-bold">{stats.cancelled}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Disputed</p>
                      <p className="text-xl font-bold">{stats.disputed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Payments</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={fetchBookingData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Bookings ({filteredBookings.length})</CardTitle>
              <CardDescription>Manage and monitor all rental bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Booking</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Vehicle</th>
                      <th className="text-left p-4 font-medium">Company</th>
                      <th className="text-left p-4 font-medium">Dates</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{booking.bookingNumber}</p>
                            <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {booking.customer.image && (
                              <img 
                                src={booking.customer.image} 
                                alt={booking.customer.name}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            )}
                            <div>
                              <p className="font-medium">{booking.customer.name}</p>
                              <p className="text-sm text-gray-500">{booking.customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{booking.rentalListing.title}</p>
                            <p className="text-sm text-gray-500">
                              {booking.rentalListing.year} {booking.rentalListing.make} {booking.rentalListing.model}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div>
                              <p className="font-medium">{booking.rentalCompany.name}</p>
                              {booking.rentalCompany.isVerified && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm">{formatDate(booking.startDate)}</p>
                            <p className="text-sm text-gray-500">to {formatDate(booking.endDate)}</p>
                            <p className="text-xs text-gray-500">{booking.totalDays} days</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={STATUS_COLORS[booking.status]}>
                            {booking.status}
                          </Badge>
                          {booking.dispute && (
                            <Badge variant="outline" className="ml-1 text-orange-600">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Dispute
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={PAYMENT_STATUS_COLORS[booking.paymentStatus]}>
                            {booking.paymentStatus}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowDetailsModal(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking?.bookingNumber} - {selectedBooking?.customer.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Number:</span>
                      <span className="font-medium">{selectedBooking.bookingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={STATUS_COLORS[selectedBooking.status]}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge className={PAYMENT_STATUS_COLORS[selectedBooking.paymentStatus]}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.totalAmount)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Rental Period</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(selectedBooking.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{formatDate(selectedBooking.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-medium">{selectedBooking.totalDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.rentalListing.pricePerDay)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Customer & Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedBooking.customer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 text-gray-400">@</span>
                      <span>{selectedBooking.customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedBooking.customer.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Rental Company</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="font-medium">{selectedBooking.rentalCompany.name}</span>
                        {selectedBooking.rentalCompany.isVerified && (
                          <Shield className="w-4 h-4 ml-2 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 text-gray-400">@</span>
                      <span>{selectedBooking.rentalCompany.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedBooking.rentalCompany.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Info */}
              <div>
                <h4 className="font-semibold mb-3">Vehicle Information</h4>
                <div className="flex items-start space-x-4">
                  {selectedBooking.rentalListing.images[0] && (
                    <img 
                      src={selectedBooking.rentalListing.images[0]} 
                      alt={selectedBooking.rentalListing.title}
                      className="w-24 h-18 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{selectedBooking.rentalListing.title}</h5>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.rentalListing.year} {selectedBooking.rentalListing.make} {selectedBooking.rentalListing.model}
                    </p>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedBooking.rentalListing.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dispute Info */}
              {selectedBooking.dispute && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Active Dispute
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Reason:</span>
                      <span className="font-medium">{selectedBooking.dispute.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Status:</span>
                      <Badge variant="outline" className="text-orange-600">
                        {selectedBooking.dispute.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-orange-700">Description:</span>
                      <p className="mt-1 text-orange-800">{selectedBooking.dispute.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedBooking && (
              <>
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'CONFIRMED')}
                      disabled={actionLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'CANCELLED')}
                      disabled={actionLoading}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </>
                )}
                
                {selectedBooking.status === 'CONFIRMED' && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'ACTIVE')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Mark as Active
                  </Button>
                )}
                
                {selectedBooking.status === 'ACTIVE' && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'COMPLETED')}
                    disabled={actionLoading}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                
                {!selectedBooking.dispute && ['CONFIRMED', 'ACTIVE'].includes(selectedBooking.status) && (
                  <Button 
                    onClick={() => setShowDisputeModal(true)}
                    disabled={actionLoading}
                    variant="outline"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Create Dispute
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dispute</DialogTitle>
            <DialogDescription>
              Create a dispute for booking {selectedBooking?.bookingNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dispute Reason</label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dispute reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VEHICLE_CONDITION">Vehicle Condition Issues</SelectItem>
                  <SelectItem value="NO_SHOW">Customer No-Show</SelectItem>
                  <SelectItem value="DAMAGE_CLAIM">Damage Claim</SelectItem>
                  <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                  <SelectItem value="POLICY_VIOLATION">Policy Violation</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Provide detailed description of the dispute..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleCreateDispute}
              disabled={actionLoading || !disputeReason.trim() || !disputeDescription.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Create Dispute
            </Button>
            <Button variant="outline" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}