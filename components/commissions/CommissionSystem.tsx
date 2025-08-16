'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  Users,
  Percent,
  Calculator,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Commission {
  id: string
  bookingId: string
  rentalCompanyId: string
  rentalCompanyName: string
  vehicleId: string
  vehicleName: string
  bookingAmount: number
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'processed' | 'paid' | 'disputed'
  bookingDate: Date
  rentalStartDate: Date
  rentalEndDate: Date
  paymentMethod: 'stripe' | 'mpesa' | 'bank_transfer'
  customerName: string
  customerEmail: string
  notes?: string
  processedDate?: Date
  paidDate?: Date
}

interface CommissionStats {
  totalCommissions: number
  pendingCommissions: number
  processedCommissions: number
  paidCommissions: number
  monthlyGrowth: number
  averageCommissionRate: number
  totalBookings: number
  topPerformingCompanies: {
    id: string
    name: string
    commissions: number
    bookings: number
  }[]
  monthlyTrends: {
    month: string
    commissions: number
    bookings: number
  }[]
}

interface CommissionRule {
  id: string
  name: string
  description: string
  vehicleType: 'all' | 'economy' | 'compact' | 'midsize' | 'fullsize' | 'luxury' | 'suv' | 'truck'
  rentalDuration: 'all' | 'daily' | 'weekly' | 'monthly'
  commissionRate: number
  minimumBookingAmount?: number
  maximumCommissionAmount?: number
  isActive: boolean
  priority: number
  createdDate: Date
  lastModified: Date
}

interface CommissionSystemProps {
  className?: string
  userRole?: 'admin' | 'manager' | 'viewer'
}

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'comm_001',
    bookingId: 'book_001',
    rentalCompanyId: 'comp_001',
    rentalCompanyName: 'Premium Car Rentals',
    vehicleId: 'veh_001',
    vehicleName: '2023 BMW X5',
    bookingAmount: 1200,
    commissionRate: 15,
    commissionAmount: 180,
    status: 'processed',
    bookingDate: new Date('2024-01-15'),
    rentalStartDate: new Date('2024-01-20'),
    rentalEndDate: new Date('2024-01-25'),
    paymentMethod: 'stripe',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    processedDate: new Date('2024-01-16')
  },
  {
    id: 'comm_002',
    bookingId: 'book_002',
    rentalCompanyId: 'comp_002',
    rentalCompanyName: 'City Car Share',
    vehicleId: 'veh_002',
    vehicleName: '2023 Toyota Camry',
    bookingAmount: 450,
    commissionRate: 12,
    commissionAmount: 54,
    status: 'pending',
    bookingDate: new Date('2024-01-18'),
    rentalStartDate: new Date('2024-01-22'),
    rentalEndDate: new Date('2024-01-24'),
    paymentMethod: 'mpesa',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com'
  },
  {
    id: 'comm_003',
    bookingId: 'book_003',
    rentalCompanyId: 'comp_001',
    rentalCompanyName: 'Premium Car Rentals',
    vehicleId: 'veh_003',
    vehicleName: '2023 Mercedes C-Class',
    bookingAmount: 800,
    commissionRate: 15,
    commissionAmount: 120,
    status: 'paid',
    bookingDate: new Date('2024-01-10'),
    rentalStartDate: new Date('2024-01-15'),
    rentalEndDate: new Date('2024-01-18'),
    paymentMethod: 'stripe',
    customerName: 'Mike Davis',
    customerEmail: 'mike@example.com',
    processedDate: new Date('2024-01-11'),
    paidDate: new Date('2024-01-12')
  }
]

const MOCK_COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'rule_001',
    name: 'Luxury Vehicle Commission',
    description: 'Higher commission rate for luxury vehicles',
    vehicleType: 'luxury',
    rentalDuration: 'all',
    commissionRate: 18,
    minimumBookingAmount: 500,
    isActive: true,
    priority: 1,
    createdDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'rule_002',
    name: 'Standard Vehicle Commission',
    description: 'Standard commission rate for regular vehicles',
    vehicleType: 'all',
    rentalDuration: 'all',
    commissionRate: 12,
    isActive: true,
    priority: 2,
    createdDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-10')
  },
  {
    id: 'rule_003',
    name: 'Weekly Rental Bonus',
    description: 'Bonus commission for weekly rentals',
    vehicleType: 'all',
    rentalDuration: 'weekly',
    commissionRate: 15,
    minimumBookingAmount: 300,
    isActive: true,
    priority: 1,
    createdDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-05')
  }
]

export const CommissionSystem: React.FC<CommissionSystemProps> = ({
  className = '',
  userRole = 'admin'
}) => {
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS)
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(MOCK_COMMISSION_RULES)
  const [loading, setLoading] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<string>('30')
  const [activeTab, setActiveTab] = useState('overview')

  const stats: CommissionStats = {
    totalCommissions: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    pendingCommissions: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0),
    processedCommissions: commissions.filter(c => c.status === 'processed').reduce((sum, c) => sum + c.commissionAmount, 0),
    paidCommissions: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
    monthlyGrowth: 12.5,
    averageCommissionRate: commissions.reduce((sum, c) => sum + c.commissionRate, 0) / commissions.length,
    totalBookings: commissions.length,
    topPerformingCompanies: [
      { id: 'comp_001', name: 'Premium Car Rentals', commissions: 300, bookings: 15 },
      { id: 'comp_002', name: 'City Car Share', commissions: 180, bookings: 12 },
      { id: 'comp_003', name: 'Budget Rentals', commissions: 120, bookings: 8 }
    ],
    monthlyTrends: [
      { month: 'Jan', commissions: 2500, bookings: 45 },
      { month: 'Feb', commissions: 2800, bookings: 52 },
      { month: 'Mar', commissions: 3200, bookings: 58 },
      { month: 'Apr', commissions: 2900, bookings: 48 },
      { month: 'May', commissions: 3500, bookings: 62 },
      { month: 'Jun', commissions: 3800, bookings: 68 }
    ]
  }

  const filteredCommissions = commissions.filter(commission => {
    const matchesStatus = filterStatus === 'all' || commission.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      commission.rentalCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleProcessCommission = async (commissionId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCommissions(prev => prev.map(c => 
        c.id === commissionId 
          ? { ...c, status: 'processed', processedDate: new Date() }
          : c
      ))
      toast.success('Commission processed successfully')
    } catch (error) {
      toast.error('Failed to process commission')
    } finally {
      setLoading(false)
    }
  }

  const handlePayCommission = async (commissionId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCommissions(prev => prev.map(c => 
        c.id === commissionId 
          ? { ...c, status: 'paid', paidDate: new Date() }
          : c
      ))
      toast.success('Commission paid successfully')
    } catch (error) {
      toast.error('Failed to pay commission')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Commission['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Commission['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processed': return <CheckCircle className="w-4 h-4" />
      case 'paid': return <Wallet className="w-4 h-4" />
      case 'disputed': return <AlertCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission System</h1>
          <p className="text-gray-600">Manage rental booking commissions and payouts</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {userRole === 'admin' && (
            <Button size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                    <p className="text-2xl font-bold">${stats.totalCommissions.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.monthlyGrowth}%</span>
                  <span className="text-gray-600 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">${stats.pendingCommissions.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(stats.pendingCommissions / stats.totalCommissions) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processed</p>
                    <p className="text-2xl font-bold">${stats.processedCommissions.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(stats.processedCommissions / stats.totalCommissions) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Out</p>
                    <p className="text-2xl font-bold">${stats.paidCommissions.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Wallet className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(stats.paidCommissions / stats.totalCommissions) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performing Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPerformingCompanies.map((company, index) => (
                  <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-sm text-gray-600">{company.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${company.commissions}</p>
                      <p className="text-sm text-gray-600">commissions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by company, vehicle, or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Booking</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Vehicle</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Commission</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommissions.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{commission.bookingId}</p>
                            <p className="text-sm text-gray-600">{commission.customerName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{commission.rentalCompanyName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{commission.vehicleName}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold">${commission.bookingAmount}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">${commission.commissionAmount}</p>
                            <p className="text-sm text-gray-600">{commission.commissionRate}%</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={cn('flex items-center gap-1 w-fit', getStatusColor(commission.status))}>
                            {getStatusIcon(commission.status)}
                            {commission.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{commission.bookingDate.toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {userRole === 'admin' && commission.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleProcessCommission(commission.id)}
                                disabled={loading}
                              >
                                Process
                              </Button>
                            )}
                            {userRole === 'admin' && commission.status === 'processed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePayCommission(commission.id)}
                                disabled={loading}
                              >
                                Pay
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Commission Rules</h2>
              <p className="text-gray-600">Configure commission rates and conditions</p>
            </div>
            {userRole === 'admin' && (
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {commissionRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{rule.description}</p>
                    </div>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Commission Rate:</span>
                      <span className="font-semibold">{rule.commissionRate}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vehicle Type:</span>
                      <span className="font-medium capitalize">{rule.vehicleType}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rental Duration:</span>
                      <span className="font-medium capitalize">{rule.rentalDuration}</span>
                    </div>
                    
                    {rule.minimumBookingAmount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Min. Booking:</span>
                        <span className="font-medium">${rule.minimumBookingAmount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className="font-medium">{rule.priority}</span>
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyTrends.map((trend, index) => (
                    <div key={trend.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">${trend.commissions}</p>
                          <p className="text-xs text-gray-600">{trend.bookings} bookings</p>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(trend.commissions / 4000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Commission Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Commission Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="booking-amount">Booking Amount ($)</Label>
                    <Input id="booking-amount" type="number" placeholder="Enter booking amount" />
                  </div>
                  
                  <div>
                    <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                    <Input id="commission-rate" type="number" placeholder="Enter commission rate" />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Commission:</span>
                      <span className="text-xl font-bold text-green-600">$0.00</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommissionSystem