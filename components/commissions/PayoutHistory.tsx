'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  Calendar, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Smartphone,
  Filter,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PayoutRecord {
  id: string
  payoutDate: string
  amount: number
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled'
  paymentMethod: {
    type: 'bank_transfer' | 'paypal' | 'check' | 'direct_deposit'
    details: string
  }
  commissionIds: string[]
  transactionId?: string
  processingFee?: number
  netAmount: number
  notes?: string
  expectedDate?: string
  failureReason?: string
}

interface PayoutSummary {
  totalPaid: number
  totalPending: number
  totalProcessing: number
  averagePayoutAmount: number
  lastPayoutDate?: string
  nextPayoutDate?: string
}

interface PayoutHistoryProps {
  payouts: PayoutRecord[]
  summary: PayoutSummary
  onDownloadStatement?: (payoutId: string) => void
  onViewDetails?: (payoutId: string) => void
  onRetryPayout?: (payoutId: string) => void
  className?: string
}

const PayoutHistory: React.FC<PayoutHistoryProps> = ({
  payouts,
  summary,
  onDownloadStatement,
  onViewDetails,
  onRetryPayout,
  className
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
      case 'direct_deposit':
        return <Building2 className="h-4 w-4" />
      case 'paypal':
        return <Smartphone className="h-4 w-4" />
      case 'check':
        return <Receipt className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodDisplay = (method: PayoutRecord['paymentMethod']) => {
    const typeMap = {
      bank_transfer: 'Bank Transfer',
      direct_deposit: 'Direct Deposit',
      paypal: 'PayPal',
      check: 'Check'
    }
    return typeMap[method.type] || method.type
  }

  const filterPayouts = () => {
    return payouts.filter(payout => {
      const matchesPeriod = selectedPeriod === 'all' || 
        (selectedPeriod === '30d' && new Date(payout.payoutDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === '90d' && new Date(payout.payoutDate) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === '1y' && new Date(payout.payoutDate) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      
      const matchesStatus = selectedStatus === 'all' || payout.status === selectedStatus
      const matchesMethod = selectedMethod === 'all' || payout.paymentMethod.type === selectedMethod
      
      return matchesPeriod && matchesStatus && matchesMethod
    })
  }

  const filteredPayouts = filterPayouts()
  const totalFiltered = filteredPayouts.reduce((sum, payout) => sum + payout.netAmount, 0)
  const averageFiltered = filteredPayouts.length > 0 ? totalFiltered / filteredPayouts.length : 0

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout History
            </CardTitle>
            <CardDescription>
              Track your commission payouts and payment history
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Total Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalPaid)}
              </div>
              {summary.lastPayoutDate && (
                <div className="text-xs text-gray-500 mt-1">
                  Last: {formatDate(summary.lastPayoutDate)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.totalPending)}
              </div>
              {summary.nextPayoutDate && (
                <div className="text-xs text-gray-500 mt-1">
                  Next: {formatDate(summary.nextPayoutDate)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalProcessing)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Average</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.averagePayoutAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtered Summary */}
        {(selectedPeriod !== 'all' || selectedStatus !== 'all' || selectedMethod !== 'all') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtered Results</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {filteredPayouts.length} payouts • {formatCurrency(totalFiltered)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Average: {formatCurrency(averageFiltered)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payout Records */}
        <div className="space-y-3">
          <h4 className="font-medium">Payout Records</h4>
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payout records found for the selected filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPayouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payout.status)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {getPaymentMethodIcon(payout.paymentMethod.type)}
                            {getPaymentMethodDisplay(payout.paymentMethod)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payout.paymentMethod.details}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Date: {formatDate(payout.payoutDate)} • 
                            Commissions: {payout.commissionIds.length}
                            {payout.transactionId && ` • ID: ${payout.transactionId}`}
                          </div>
                          {payout.expectedDate && payout.status === 'pending' && (
                            <div className="text-xs text-blue-600">
                              Expected: {formatDate(payout.expectedDate)}
                            </div>
                          )}
                          {payout.failureReason && (
                            <div className="text-xs text-red-600">
                              Failure: {payout.failureReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatCurrency(payout.netAmount)}
                        </div>
                        {payout.processingFee && (
                          <div className="text-xs text-gray-500">
                            Fee: {formatCurrency(payout.processingFee)}
                          </div>
                        )}
                        <Badge className={cn('text-xs mb-2', getStatusColor(payout.status))}>
                          {payout.status.toUpperCase()}
                        </Badge>
                        <div className="flex gap-1">
                          {onViewDetails && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(payout.id)}
                            >
                              Details
                            </Button>
                          )}
                          {onDownloadStatement && payout.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadStatement(payout.id)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          {onRetryPayout && payout.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRetryPayout(payout.id)}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {payout.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          <strong>Notes:</strong> {payout.notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PayoutHistory