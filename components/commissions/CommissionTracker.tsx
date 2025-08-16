'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  Car,
  Percent
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommissionData {
  id: string
  dealId: string
  customerName: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    price: number
  }
  saleDate: string
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid' | 'disputed'
  payoutDate?: string
  notes?: string
}

interface CommissionGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  reward?: string
  status: 'active' | 'completed' | 'expired'
}

interface CommissionTrackerProps {
  commissions: CommissionData[]
  goals: CommissionGoal[]
  totalEarnings: number
  pendingEarnings: number
  monthlyTarget?: number
  onViewDetails?: (commissionId: string) => void
  onDisputeCommission?: (commissionId: string) => void
  className?: string
}

const CommissionTracker: React.FC<CommissionTrackerProps> = ({
  commissions,
  goals,
  totalEarnings,
  pendingEarnings,
  monthlyTarget,
  onViewDetails,
  onDisputeCommission,
  className
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedStatus, setSelectedStatus] = useState('all')

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
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'approved':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'disputed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'disputed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filterCommissions = () => {
    return commissions.filter(commission => {
      const matchesPeriod = selectedPeriod === 'all' || 
        (selectedPeriod === 'month' && new Date(commission.saleDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === 'quarter' && new Date(commission.saleDate) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
        (selectedPeriod === 'year' && new Date(commission.saleDate) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      
      const matchesStatus = selectedStatus === 'all' || commission.status === selectedStatus
      
      return matchesPeriod && matchesStatus
    })
  }

  const filteredCommissions = filterCommissions()
  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const averageCommission = filteredCommissions.length > 0 ? totalCommissions / filteredCommissions.length : 0
  const monthlyProgress = monthlyTarget ? (totalCommissions / monthlyTarget) * 100 : 0

  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Commission Tracker
            </CardTitle>
            <CardDescription>
              Track your sales commissions and performance goals
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Total Earnings</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalEarnings)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(pendingEarnings)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Average</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(averageCommission)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Sales Count</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredCommissions.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Progress */}
            {monthlyTarget && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Target Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {formatCurrency(totalCommissions)} / {formatCurrency(monthlyTarget)}</span>
                      <span>{Math.round(monthlyProgress)}%</span>
                    </div>
                    <Progress value={Math.min(monthlyProgress, 100)} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {monthlyProgress >= 100 ? '🎉 Target achieved!' : 
                       `${formatCurrency(monthlyTarget - totalCommissions)} remaining to reach target`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Commissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCommissions.slice(0, 5).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(commission.status)}
                        <div>
                          <div className="font-medium">
                            {commission.vehicleInfo.year} {commission.vehicleInfo.make} {commission.vehicleInfo.model}
                          </div>
                          <div className="text-sm text-gray-600">
                            {commission.customerName} • {formatDate(commission.saleDate)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(commission.commissionAmount)}
                        </div>
                        <Badge className={cn('text-xs', getStatusColor(commission.status))}>
                          {commission.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <div className="space-y-3">
              {filteredCommissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No commissions found for the selected filters.
                </div>
              ) : (
                filteredCommissions.map((commission) => (
                  <Card key={commission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(commission.status)}
                          <div>
                            <div className="font-medium">
                              {commission.vehicleInfo.year} {commission.vehicleInfo.make} {commission.vehicleInfo.model}
                            </div>
                            <div className="text-sm text-gray-600">
                              Customer: {commission.customerName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Sale Date: {formatDate(commission.saleDate)} • 
                              Vehicle Price: {formatCurrency(commission.vehicleInfo.price)} • 
                              Rate: {commission.commissionRate}%
                            </div>
                            {commission.payoutDate && (
                              <div className="text-xs text-green-600">
                                Paid on: {formatDate(commission.payoutDate)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(commission.commissionAmount)}
                          </div>
                          <Badge className={cn('text-xs mb-2', getStatusColor(commission.status))}>
                            {commission.status.toUpperCase()}
                          </Badge>
                          <div className="flex gap-1">
                            {onViewDetails && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(commission.id)}
                              >
                                Details
                              </Button>
                            )}
                            {onDisputeCommission && commission.status !== 'disputed' && commission.status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDisputeCommission(commission.id)}
                              >
                                Dispute
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {commission.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-gray-600">
                            <strong>Notes:</strong> {commission.notes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {/* Active Goals */}
            <div className="space-y-4">
              <h4 className="font-medium">Active Goals</h4>
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active goals. Set some targets to track your progress!
                </div>
              ) : (
                activeGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const isExpired = new Date(goal.deadline) < new Date()
                  
                  return (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{goal.title}</div>
                            <div className="text-sm text-gray-600">
                              Deadline: {formatDate(goal.deadline)}
                              {goal.reward && ` • Reward: ${goal.reward}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </div>
                            <Badge className={cn('text-xs', 
                              isExpired ? 'bg-red-100 text-red-800' : 
                              progress >= 100 ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'
                            )}>
                              {isExpired ? 'EXPIRED' : progress >= 100 ? 'COMPLETED' : 'ACTIVE'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Completed Goals
                </h4>
                <div className="space-y-2">
                  {completedGoals.slice(0, 3).map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{goal.title}</div>
                            <div className="text-sm text-gray-600">
                              Completed • {formatCurrency(goal.targetAmount)} achieved
                            </div>
                          </div>
                          <Award className="h-5 w-5 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CommissionTracker