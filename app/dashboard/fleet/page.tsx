'use client'

import { useState } from 'react'
import { Car, Calendar, FileText, BarChart3, Settings, Plus } from 'lucide-react'
import Link from 'next/link'
import RentalFleetDashboard from '@/components/RentalFleetDashboard'
import RentalPricingCalendar from '@/components/RentalPricingCalendar'
import RentalTermsSetup from '@/components/RentalTermsSetup'

type TabType = 'overview' | 'pricing' | 'terms' | 'analytics'

export default function FleetManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1')

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Fleet Overview',
      icon: Car,
      description: 'Manage your rental vehicle fleet'
    },
    {
      id: 'pricing' as TabType,
      name: 'Pricing & Calendar',
      icon: Calendar,
      description: 'Set pricing and manage availability'
    },
    {
      id: 'terms' as TabType,
      name: 'Terms & Conditions',
      icon: FileText,
      description: 'Configure rental policies'
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: BarChart3,
      description: 'View performance metrics'
    }
  ]

  const handlePriceUpdate = (date: string, price: number) => {
    console.log('Price updated:', { date, price })
    // Implement API call to update pricing
  }

  const handleAvailabilityUpdate = (date: string, isAvailable: boolean) => {
    console.log('Availability updated:', { date, isAvailable })
    // Implement API call to update availability
  }

  const handleTermsSave = (terms: any[]) => {
    console.log('Terms saved:', terms)
    // Implement API call to save terms
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
                <p className="text-sm text-gray-600">Manage your rental vehicle operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/listings/create?type=rental"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </Link>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Fleet Overview</h2>
              <p className="text-gray-600">Monitor and manage all your rental vehicles in one place.</p>
            </div>
            <RentalFleetDashboard />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Pricing & Availability Calendar</h2>
              <p className="text-gray-600">Set dynamic pricing and manage vehicle availability with real-time sync.</p>
            </div>
            
            {/* Vehicle Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Toyota Corolla 2023 - KES 3,500/day</option>
                <option value="2">Honda CR-V 2022 - KES 6,500/day</option>
                <option value="3">Mercedes C-Class 2023 - KES 12,000/day</option>
              </select>
            </div>

            <RentalPricingCalendar
              vehicleId={selectedVehicleId}
              basePricePerDay={3500}
              onPriceUpdate={handlePriceUpdate}
              onAvailabilityUpdate={handleAvailabilityUpdate}
            />
          </div>
        )}

        {activeTab === 'terms' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Terms & Conditions Setup</h2>
              <p className="text-gray-600">Configure rental policies and terms that apply to your fleet.</p>
            </div>
            <RentalTermsSetup
              companyId="company-1"
              onSave={handleTermsSave}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Fleet Analytics</h2>
              <p className="text-gray-600">Analyze your fleet performance and revenue metrics.</p>
            </div>
            
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Revenue chart will be displayed here</p>
                    <p className="text-sm text-gray-400">Integration with charting library needed</p>
                  </div>
                </div>
              </div>

              {/* Utilization Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Utilization</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Utilization chart will be displayed here</p>
                    <p className="text-sm text-gray-400">Integration with charting library needed</p>
                  </div>
                </div>
              </div>

              {/* Top Performing Vehicles */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Vehicles</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Toyota Corolla 2023', revenue: 125000, bookings: 25, utilization: 85 },
                    { name: 'Honda CR-V 2022', revenue: 98000, bookings: 18, utilization: 78 },
                    { name: 'Mercedes C-Class 2023', revenue: 156000, bookings: 15, utilization: 92 }
                  ].map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">{vehicle.bookings} bookings • {vehicle.utilization}% utilization</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            minimumFractionDigits: 0
                          }).format(vehicle.revenue)}
                        </p>
                        <p className="text-sm text-gray-600">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {[
                    { customer: 'John Doe', vehicle: 'Toyota Corolla', dates: 'Jan 15-18', amount: 10500, status: 'confirmed' },
                    { customer: 'Jane Smith', vehicle: 'Honda CR-V', dates: 'Jan 20-22', amount: 13000, status: 'pending' },
                    { customer: 'Mike Johnson', vehicle: 'Mercedes C-Class', dates: 'Jan 25-27', amount: 24000, status: 'confirmed' }
                  ].map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer}</p>
                        <p className="text-sm text-gray-600">{booking.vehicle} • {booking.dates}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            minimumFractionDigits: 0
                          }).format(booking.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}