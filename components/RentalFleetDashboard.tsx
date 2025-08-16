'use client'

import { useState, useEffect } from 'react'
import { Calendar, Car, DollarSign, Users, TrendingUp, Settings, Plus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface FleetVehicle {
  id: string
  title: string
  make: string
  model: string
  year: number
  category: string
  pricePerDay: number
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'BOOKED'
  bookings: number
  revenue: number
  utilization: number
  nextBooking?: {
    startDate: string
    endDate: string
    customerName: string
  }
  images: string[]
  location: string
}

interface FleetStats {
  totalVehicles: number
  activeVehicles: number
  totalBookings: number
  totalRevenue: number
  averageUtilization: number
  monthlyGrowth: number
}

export default function RentalFleetDashboard() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [stats, setStats] = useState<FleetStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageUtilization: 0,
    monthlyGrowth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchFleetData()
  }, [])

  const fetchFleetData = async () => {
    try {
      setIsLoading(true)
      // Mock data - replace with actual API call
      const mockVehicles: FleetVehicle[] = [
        {
          id: '1',
          title: 'Toyota Corolla 2023',
          make: 'Toyota',
          model: 'Corolla',
          year: 2023,
          category: 'ECONOMY',
          pricePerDay: 3500,
          status: 'ACTIVE',
          bookings: 15,
          revenue: 52500,
          utilization: 75,
          nextBooking: {
            startDate: '2024-01-15',
            endDate: '2024-01-18',
            customerName: 'John Doe'
          },
          images: ['/api/placeholder/300/200'],
          location: 'Nairobi CBD'
        },
        {
          id: '2',
          title: 'Honda CR-V 2022',
          make: 'Honda',
          model: 'CR-V',
          year: 2022,
          category: 'SUV',
          pricePerDay: 6500,
          status: 'BOOKED',
          bookings: 12,
          revenue: 78000,
          utilization: 80,
          images: ['/api/placeholder/300/200'],
          location: 'Westlands'
        }
      ]

      const mockStats: FleetStats = {
        totalVehicles: 25,
        activeVehicles: 22,
        totalBookings: 156,
        totalRevenue: 1250000,
        averageUtilization: 72,
        monthlyGrowth: 15
      }

      setVehicles(mockVehicles)
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching fleet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      case 'BOOKED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const categoryMatch = selectedCategory === 'all' || vehicle.category === selectedCategory
    const statusMatch = selectedStatus === 'all' || vehicle.status === selectedStatus
    return categoryMatch && statusMatch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
              <p className="text-gray-600 mt-2">Manage your rental vehicle fleet</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/listings/create?type=rental"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </Link>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              </div>
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeVehicles}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageUtilization}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="ECONOMY">Economy</option>
                <option value="COMPACT">Compact</option>
                <option value="MIDSIZE">Midsize</option>
                <option value="FULLSIZE">Fullsize</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxury</option>
                <option value="VAN">Van</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="BOOKED">Booked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{vehicle.title}</h3>
                    <p className="text-sm text-gray-600">{vehicle.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(vehicle.pricePerDay)}</p>
                    <p className="text-sm text-gray-600">per day</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{vehicle.bookings}</p>
                    <p className="text-xs text-gray-600">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.revenue)}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{vehicle.utilization}%</p>
                    <p className="text-xs text-gray-600">Utilization</p>
                  </div>
                </div>

                {vehicle.nextBooking && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Next Booking</p>
                    <p className="text-xs text-blue-700">
                      {vehicle.nextBooking.customerName} • {new Date(vehicle.nextBooking.startDate).toLocaleDateString()} - {new Date(vehicle.nextBooking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/listings/edit/${vehicle.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <Link
                    href={`/rentals/${vehicle.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first rental vehicle to your fleet.</p>
            <Link
              href="/dashboard/listings/create?type=rental"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}