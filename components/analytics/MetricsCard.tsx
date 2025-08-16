'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
  className?: string
  format?: 'currency' | 'percentage' | 'number'
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  description,
  change,
  changeType,
  icon,
  className,
  format = 'number'
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500'
      case 'decrease':
        return 'text-red-500'
      case 'neutral':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-2">
            {getTrendIcon()}
            <span className={cn('text-xs font-medium', getTrendColor())}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricsCard