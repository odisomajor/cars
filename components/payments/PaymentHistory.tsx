'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface Payment {
  id: string
  paymentIntentId?: string
  merchantRequestID?: string
  amount: number
  currency: string
  provider: 'stripe' | 'mpesa'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  listingType: string
  createdAt: string
  updatedAt: string
  listing?: {
    id: string
    title: string
    make: string
    model: string
  }
  metadata?: Record<string, any>
}

interface PaymentHistoryProps {
  userId?: string
  showListingInfo?: boolean
  limit?: number
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  userId,
  showListingInfo = true,
  limit,
}) => {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState<string | null>(null)

  useEffect(() => {
    if (user || userId) {
      fetchPayments()
    }
  }, [user, userId, statusFilter, providerFilter])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (providerFilter !== 'all') params.append('provider', providerFilter)
      if (limit) params.append('limit', limit.toString())
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/payments/history?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments')
      }

      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setError(error instanceof Error ? error.message : 'Failed to load payment history')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPaymentStatus = async (paymentId: string) => {
    try {
      setRefreshing(paymentId)
      
      const response = await fetch(`/api/payments/status/${paymentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh payment status')
      }

      // Update the payment in the list
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: data.status, updatedAt: new Date().toISOString() }
          : payment
      ))

      toast.success('Payment status updated')
    } catch (error) {
      console.error('Error refreshing payment status:', error)
      toast.error('Failed to refresh payment status')
    } finally {
      setRefreshing(null)
    }
  }

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      succeeded: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      canceled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  const getProviderIcon = (provider: Payment['provider']) => {
    return provider === 'stripe' ? (
      <CreditCard className="h-4 w-4 text-blue-600" />
    ) : (
      <Smartphone className="h-4 w-4 text-green-600" />
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatListingType = (listingType: string) => {
    return listingType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Amount', 'Currency', 'Provider', 'Status', 'Listing Type', 'Payment ID'].join(','),
      ...payments.map(payment => [
        format(new Date(payment.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        payment.amount / 100,
        payment.currency.toUpperCase(),
        payment.provider.toUpperCase(),
        payment.status.toUpperCase(),
        formatListingType(payment.listingType),
        payment.id
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!user && !userId) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view payment history.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPayments}
              disabled={payments.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayments}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Provider:</label>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading payment history...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && payments.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' || providerFilter !== 'all'
                ? 'No payments match your current filters.'
                : 'You haven\'t made any payments yet.'}
            </p>
          </div>
        )}

        {/* Payments Table */}
        {!isLoading && !error && payments.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listing Type</TableHead>
                  {showListingInfo && <TableHead>Listing</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-gray-500">
                          {format(new Date(payment.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getProviderIcon(payment.provider)}
                        <span className="capitalize">{payment.provider}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatListingType(payment.listingType)}
                      </Badge>
                    </TableCell>
                    {showListingInfo && (
                      <TableCell>
                        {payment.listing ? (
                          <div className="text-sm">
                            <div className="font-medium">{payment.listing.title}</div>
                            <div className="text-gray-500">
                              {payment.listing.make} {payment.listing.model}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {payment.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshPaymentStatus(payment.id)}
                            disabled={refreshing === payment.id}
                          >
                            {refreshing === payment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement payment details modal
                            toast.info('Payment details modal coming soon')
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentHistory