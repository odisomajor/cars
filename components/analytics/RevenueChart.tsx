'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RevenueData {
  period: string
  revenue: number
  profit: number
  expenses: number
}

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
  description?: string
  showProfit?: boolean
  showExpenses?: boolean
  chartType?: 'line' | 'area'
  timeRange?: string
  onTimeRangeChange?: (range: string) => void
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Revenue Overview',
  description = 'Monthly revenue, profit, and expenses',
  showProfit = true,
  showExpenses = true,
  chartType = 'line',
  timeRange = '12m',
  onTimeRangeChange
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            {showProfit && (
              <Area
                type="monotone"
                dataKey="profit"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            )}
            {showExpenses && (
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="3"
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          {showProfit && (
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
          {showExpenses && (
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onTimeRangeChange && (
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

export default RevenueChart