'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface RentalVehicle {
  id: string
  title: string
  make: string
  model: string
  year: number
  category: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  location: string
  status: 'available' | 'rented' | 'maintenance' | 'inactive'
  images: string[]
  features: string[]
  mileage: number
  fuelType: string
  transmission: string
  seats: number
  doors: number
  airConditioning: boolean
  gps: boolean
  bluetooth: boolean
  totalBookings: number
  totalRevenue: number
  averageRating: number
  lastServiceDate: string
  nextServiceDue: string
  insuranceExpiry: string
  registrationExpiry: string
  currentBooking?: {
    id: string
    customerName: string
    startDate: string
    endDate: string
    totalAmount: number
  }
  upcomingBookings: {
    id: string
    customerName: string
    startDate: string
    endDate: string
    totalAmount: number
  }[]
  maintenanceHistory: {
    id: string
    date: string
    type: string
    description: string
    cost: number
  }[]
  createdAt: string
  updatedAt: string
}

interface FleetStats {
  totalVehicles: number
  availableVehicles: number
  rentedVehicles: number
  maintenanceVehicles: number
  inactiveVehicles: number
  totalRevenue: number
  monthlyRevenue: number
  averageUtilization: number
  averageRating: number
  totalBookings: number
  pendingMaintenance: number
  expiringDocuments: number
}

interface EnhancedRentalFleetDashboardProps {
  companyId?: string
  isAdmin?: boolean
  isMobile?: boolean
}

const VEHICLE_CATEGORIES = [
  'Economy',
  'Compact',
  'Mid-size',
  'Full-size',
  'Premium',
  'Luxury',
  'SUV',
  'Van',
  'Truck',
  'Convertible',
  'Sports'
]

const VEHICLE_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  rented: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800'
}

const VEHICLE_STATUS_ICONS = {
  available: CheckCircle,
  rented: Users,
  maintenance: AlertTriangle,
  inactive: XCircle
}

export default function EnhancedRentalFleetDashboard({ 
  companyId, 
  isAdmin = false,
  isMobile = false 
}: EnhancedRentalFleetDashboardProps) {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([])
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedVehicle, setSelectedVehicle] = useState<RentalVehicle | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)

  // Fetch fleet data
  useEffect(() => {
    fetchFleetData()
  }, [companyId, statusFilter, categoryFilter, locationFilter, dateRange])

  const fetchFleetData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(companyId && { companyId }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(locationFilter !== 'all' && { location: locationFilter }),
        ...(dateRange?.from && { fromDate: dateRange.from.toISOString() }),
        ...(dateRange?.to && { toDate: dateRange.to.toISOString() })
      })

      const [vehiclesResponse, statsResponse] = await Promise.all([
        fetch(`/api/rental/fleet?${params}`),
        fetch(`/api/rental/fleet/stats?${params}`)
      ])

      if (vehiclesResponse.ok && statsResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        const statsData = await statsResponse.json()
        setVehicles(vehiclesData.vehicles || [])
        setFleetStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = searchTerm === '' || 
        vehicle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof RentalVehicle]
      const bValue = b[sortBy as keyof RentalVehicle]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    )
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedVehicles.length === 0) return

    try {
      const response = await fetch('/api/rental/fleet/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          vehicleIds: selectedVehicles
        })
      })

      if (response.ok) {
        await fetchFleetData()
        setSelectedVehicles([])
        setShowBulkActions(false)
      }
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  // Export fleet data
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/rental/fleet/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleIds: selectedVehicles })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fleet-report.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading fleet data...</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", isMobile && "px-4")}>
      {/* Fleet Statistics */}
      {fleetStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Vehicles</p>
                  <p className="text-2xl font-bold">{fleetStats.totalVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-2xl font-bold">{fleetStats.availableVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Rented</p>
                  <p className="text-2xl font-bold">{fleetStats.rentedVehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Monthly Revenue</p>
                  <p className="text-2xl font-bold">KES {fleetStats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Utilization</p>
                  <p className="text-2xl font-bold">{fleetStats.averageUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Maintenance</p>
                  <p className="text-2xl font-bold">{fleetStats.pendingMaintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {VEHICLE_CATEGORIES.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedVehicles.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(true)}
            >
              Actions ({selectedVehicles.length})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setShowAddVehicle(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Vehicle Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}>
        {filteredVehicles.map((vehicle) => {
          const StatusIcon = VEHICLE_STATUS_ICONS[vehicle.status]
          
          return (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleVehicleSelect(vehicle.id)}
                      className="rounded"
                    />
                    <Badge className={VEHICLE_STATUS_COLORS[vehicle.status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {vehicle.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Handle edit */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {vehicle.images[0] ? (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{vehicle.title}</h3>
                  <p className="text-sm text-gray-600">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {vehicle.location}
                    </span>
                    <span className="font-semibold text-green-600">
                      KES {vehicle.dailyRate}/day
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{vehicle.totalBookings} bookings</span>
                    <span>★ {vehicle.averageRating.toFixed(1)}</span>
                  </div>

                  {vehicle.currentBooking && (
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <p className="font-medium">Current Rental:</p>
                      <p>{vehicle.currentBooking.customerName}</p>
                      <p>Until {format(new Date(vehicle.currentBooking.endDate), 'MMM dd')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <Button onClick={() => setShowAddVehicle(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Vehicle
          </Button>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVehicle.title}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {/* Vehicle details content */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Make & Model</Label>
                    <p>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p>{selectedVehicle.category}</p>
                  </div>
                  <div>
                    <Label>Daily Rate</Label>
                    <p>KES {selectedVehicle.dailyRate}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={VEHICLE_STATUS_COLORS[selectedVehicle.status]}>
                      {selectedVehicle.status}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bookings">
                {/* Bookings content */}
                <div className="space-y-4">
                  <h4 className="font-medium">Upcoming Bookings</h4>
                  {selectedVehicle.upcomingBookings.map(booking => (
                    <div key={booking.id} className="border p-3 rounded">
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd')}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        KES {booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="maintenance">
                {/* Maintenance content */}
                <div className="space-y-4">
                  <h4 className="font-medium">Maintenance History</h4>
                  {selectedVehicle.maintenanceHistory.map(maintenance => (
                    <div key={maintenance.id} className="border p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{maintenance.type}</p>
                          <p className="text-sm text-gray-600">{maintenance.description}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(maintenance.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <p className="font-medium text-red-600">
                          KES {maintenance.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics">
                {/* Analytics content */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Total Revenue</h4>
                      <p className="text-2xl font-bold text-green-600">
                        KES {selectedVehicle.totalRevenue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Total Bookings</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedVehicle.totalBookings}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions ({selectedVehicles.length} vehicles)</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkAction('activate')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate Selected
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkAction('deactivate')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate Selected
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBulkAction('maintenance')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark for Maintenance
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}