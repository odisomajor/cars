'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevenueSource {
  id: string
  name: string
  amount: number
  percentage: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  color: string
  description?: string
}

interface RevenueBreakdownProps {
  totalRevenue: number
  sources: RevenueSource[]
  period: string
  className?: string
}

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  totalRevenue,
  sources,
  period,
  className
}) => {
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
  }

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500'
      case 'decrease':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Breakdown
        </CardTitle>
        <CardDescription>
          Revenue sources for {period}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Revenue */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        {/* Revenue Sources */}
        <div className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="font-medium">{source.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Percent className="h-3 w-3 mr-1" />
                    {source.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(source.amount)}
                  </div>
                  {source.change !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(source.changeType)}
                      <span className={getTrendColor(source.changeType)}>
                        {source.change > 0 ? '+' : ''}{source.change}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Progress 
                value={source.percentage} 
                className="h-2"
                style={{
                  '--progress-background': source.color
                } as React.CSSProperties}
              />
              
              {source.description && (
                <p className="text-xs text-gray-500 ml-5">
                  {source.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {sources.filter(s => s.changeType === 'increase').length}
            </div>
            <div className="text-xs text-gray-600">Growing Sources</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {sources.length}
            </div>
            <div className="text-xs text-gray-600">Total Sources</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RevenueBreakdown