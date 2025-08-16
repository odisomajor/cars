'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Receipt, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillingRecord {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank'
    last4?: string
    brand?: string
  }
  downloadUrl?: string
  items: Array<{
    description: string
    amount: number
    quantity?: number
  }>
  taxes?: number
  fees?: number
  total: number
}

interface BillingHistoryProps {
  records: BillingRecord[]
  onDownloadInvoice?: (recordId: string) => void
  onViewInvoice?: (recordId: string) => void
  onRequestRefund?: (recordId: string) => void
  className?: string
}

const BillingHistory: React.FC<BillingHistoryProps> = ({
  records,
  onDownloadInvoice,
  onViewInvoice,
  onRequestRefund,
  className
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount / 100) // Assuming amount is in cents
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
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
        return <Receipt className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodDisplay = (paymentMethod: BillingRecord['paymentMethod']) => {
    const { type, last4, brand } = paymentMethod
    if (type === 'card' && brand && last4) {
      return `${brand.toUpperCase()} •••• ${last4}`
    }
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const filterRecords = () => {
    return records.filter(record => {
      const matchesPeriod = selectedPeriod === 'all' || 
        (selectedPeriod === '30d' && new Date(record.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === '90d' && new Date(record.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === '1y' && new Date(record.date) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
      
      return matchesPeriod && matchesStatus
    })
  }

  const filteredRecords = filterRecords()
  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.total, 0)
  const paidAmount = filteredRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.total, 0)

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              View and manage your billing records and invoices
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Billed</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Total Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Records</span>
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {filteredRecords.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Records */}
        <div className="space-y-3">
          <h4 className="font-medium">Billing Records</h4>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No billing records found for the selected filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <div className="font-medium">
                            Invoice #{record.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(record.date)} • {getPaymentMethodDisplay(record.paymentMethod)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatCurrency(record.total)}
                        </div>
                        <Badge className={cn('text-xs mb-2', getStatusColor(record.status))}>
                          {record.status.toUpperCase()}
                        </Badge>
                        <div className="flex gap-1">
                          {onViewInvoice && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewInvoice(record.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {onDownloadInvoice && record.downloadUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadInvoice(record.id)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          {onRequestRefund && record.status === 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRequestRefund(record.id)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Invoice Items */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="space-y-1">
                        {record.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.description} {item.quantity && `(${item.quantity})`}</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                        {record.taxes && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Taxes</span>
                            <span>{formatCurrency(record.taxes)}</span>
                          </div>
                        )}
                        {record.fees && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Fees</span>
                            <span>{formatCurrency(record.fees)}</span>
                          </div>
                        )}
                      </div>
                    </div>
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

export default BillingHistory