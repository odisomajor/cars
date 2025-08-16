'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Payout {
  id: string
  amount: number
  scheduledDate: string
  actualDate?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'check'
  description: string
  fees?: number
}

interface PayoutScheduleProps {
  payouts: Payout[]
  totalPending: number
  nextPayoutDate: string
  className?: string
  onRequestPayout?: () => void
  onUpdateSchedule?: (frequency: string) => void
}

const PayoutSchedule: React.FC<PayoutScheduleProps> = ({
  payouts,
  totalPending,
  nextPayoutDate,
  className,
  onRequestPayout,
  onUpdateSchedule
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
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
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer'
      case 'paypal':
        return 'PayPal'
      case 'stripe':
        return 'Stripe'
      case 'check':
        return 'Check'
      default:
        return method
    }
  }

  const filteredPayouts = payouts.filter(payout => {
    if (selectedPeriod === 'all') return true
    if (selectedPeriod === 'pending') return payout.status === 'pending'
    if (selectedPeriod === 'completed') return payout.status === 'completed'
    return true
  })

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payout Schedule
            </CardTitle>
            <CardDescription>
              Manage your payout schedule and history
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPending)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Next Payout</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {formatDate(nextPayoutDate)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-center">
              {onRequestPayout && (
                <Button onClick={onRequestPayout} size="sm" className="w-full">
                  Request Payout
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payout Schedule Settings */}
        {onUpdateSchedule && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Payout Frequency</h4>
            <Select onValueChange={onUpdateSchedule}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payout History */}
        <div className="space-y-3">
          <h4 className="font-medium">Payout History</h4>
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payouts found for the selected period.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payout.status)}
                    <div>
                      <div className="font-medium">{payout.description}</div>
                      <div className="text-sm text-gray-500">
                        {getMethodDisplay(payout.method)} • Scheduled: {formatDate(payout.scheduledDate)}
                        {payout.actualDate && (
                          <span> • Completed: {formatDate(payout.actualDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(payout.amount)}</div>
                    {payout.fees && (
                      <div className="text-xs text-gray-500">
                        Fee: {formatCurrency(payout.fees)}
                      </div>
                    )}
                    <Badge className={cn('text-xs mt-1', getStatusColor(payout.status))}>
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PayoutSchedule