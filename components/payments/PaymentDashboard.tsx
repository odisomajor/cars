'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PaymentHistory from './PaymentHistory'
import PaymentModal from './PaymentModal'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface PaymentSummary {
  total: number
  succeeded: number
  pending: number
  failed: number
  totalAmount: number
}

interface PaymentStats {
  thisMonth: {
    amount: number
    count: number
  }
  lastMonth: {
    amount: number
    count: number
  }
  growth: {
    amount: number
    count: number
  }
}

const PaymentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPaymentData()
    }
  }, [user])

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch payment summary
      const summaryResponse = await fetch('/api/payments/history')
      const summaryData = await summaryResponse.json()

      if (!summaryResponse.ok) {
        throw new Error(summaryData.error || 'Failed to fetch payment summary')
      }

      setSummary(summaryData.summary)

      // Fetch payment statistics
      const statsResponse = await fetch('/api/payments/stats')
      const statsData = await statsResponse.json()

      if (statsResponse.ok) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load payment data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view your payment dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="text-gray-600">Manage your payments and listing upgrades</p>
        </div>
        <Button onClick={() => setShowPaymentModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upgrade Listing
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading payment data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dashboard Content */}
      {!isLoading && !error && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Spent */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.totalAmount)}
                </div>
                {stats && (
                  <p className={`text-xs ${getGrowthColor(stats.growth.amount)}`}>
                    {formatPercentage(stats.growth.amount)} from last month
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
                {stats && (
                  <p className={`text-xs ${getGrowthColor(stats.growth.count)}`}>
                    {formatPercentage(stats.growth.count)} from last month
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Successful Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summary.succeeded}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.total > 0 
                    ? `${((summary.succeeded / summary.total) * 100).toFixed(1)}% success rate`
                    : 'No payments yet'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.pending > 0 ? 'Awaiting confirmation' : 'No pending payments'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(stats.thisMonth.amount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Amount spent this month
                      </p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">
                        {stats.thisMonth.count} payments
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Number of transactions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Amount Growth</span>
                        <span className={`text-sm font-bold ${getGrowthColor(stats.growth.amount)}`}>
                          {formatPercentage(stats.growth.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        vs. last month: {formatCurrency(stats.lastMonth.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Payment Growth</span>
                        <span className={`text-sm font-bold ${getGrowthColor(stats.growth.count)}`}>
                          {formatPercentage(stats.growth.count)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        vs. last month: {stats.lastMonth.count} payments
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment History */}
          <PaymentHistory limit={10} />
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          fetchPaymentData() // Refresh data after successful payment
        }}
      />
    </div>
  )
}

export default PaymentDashboard