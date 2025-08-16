'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Clock, Save, RefreshCw, AlertCircle, Check } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns'

interface PricingRule {
  id: string
  name: string
  startDate: string
  endDate: string
  pricePerDay: number
  multiplier?: number
  isActive: boolean
  priority: number
}

interface BookedDate {
  date: string
  bookingId: string
  customerName: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
}

interface CalendarDay {
  date: Date
  price: number
  isBooked: boolean
  isBlocked: boolean
  isToday: boolean
  isPast: boolean
  booking?: BookedDate
}

interface RentalPricingCalendarProps {
  vehicleId: string
  basePricePerDay: number
  onPriceUpdate?: (date: string, price: number) => void
  onAvailabilityUpdate?: (date: string, isAvailable: boolean) => void
}

export default function RentalPricingCalendar({ 
  vehicleId, 
  basePricePerDay, 
  onPriceUpdate, 
  onAvailabilityUpdate 
}: RentalPricingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [bulkPrice, setBulkPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())
  const [showPricingRules, setShowPricingRules] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    startDate: '',
    endDate: '',
    pricePerDay: basePricePerDay,
    isActive: true
  })

  useEffect(() => {
    loadCalendarData()
    // Set up real-time sync every 30 seconds
    const syncInterval = setInterval(() => {
      syncAvailability()
    }, 30000)

    return () => clearInterval(syncInterval)
  }, [currentMonth, vehicleId])

  const loadCalendarData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockPricingRules: PricingRule[] = [
        {
          id: '1',
          name: 'Weekend Premium',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          pricePerDay: basePricePerDay * 1.3,
          multiplier: 1.3,
          isActive: true,
          priority: 1
        },
        {
          id: '2',
          name: 'Holiday Season',
          startDate: '2024-12-20',
          endDate: '2024-01-05',
          pricePerDay: basePricePerDay * 1.5,
          multiplier: 1.5,
          isActive: true,
          priority: 2
        }
      ]

      const mockBookedDates: BookedDate[] = [
        {
          date: '2024-01-15',
          bookingId: 'book-001',
          customerName: 'John Doe',
          status: 'CONFIRMED'
        },
        {
          date: '2024-01-16',
          bookingId: 'book-001',
          customerName: 'John Doe',
          status: 'CONFIRMED'
        },
        {
          date: '2024-01-20',
          bookingId: 'book-002',
          customerName: 'Jane Smith',
          status: 'PENDING'
        }
      ]

      setPricingRules(mockPricingRules)
      setBookedDates(mockBookedDates)
      generateCalendarDays(mockPricingRules, mockBookedDates)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCalendarDays = (rules: PricingRule[], booked: BookedDate[]) => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    const calendarDays: CalendarDay[] = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const booking = booked.find(b => b.date === dateStr)
      const price = calculatePriceForDate(date, rules)

      return {
        date,
        price,
        isBooked: !!booking && booking.status !== 'CANCELLED',
        isBlocked: false, // Add logic for blocked dates
        isToday: isToday(date),
        isPast: isBefore(date, new Date()),
        booking
      }
    })

    setCalendarDays(calendarDays)
  }

  const calculatePriceForDate = (date: Date, rules: PricingRule[]): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    let price = basePricePerDay

    // Apply pricing rules in priority order
    const applicableRules = rules
      .filter(rule => rule.isActive && dateStr >= rule.startDate && dateStr <= rule.endDate)
      .sort((a, b) => b.priority - a.priority)

    if (applicableRules.length > 0) {
      const rule = applicableRules[0]
      price = rule.multiplier ? basePricePerDay * rule.multiplier : rule.pricePerDay
    }

    // Weekend premium (if no specific rule)
    if (applicableRules.length === 0 && (date.getDay() === 0 || date.getDay() === 6)) {
      price = basePricePerDay * 1.2
    }

    return Math.round(price)
  }

  const syncAvailability = async (showLoading = false) => {
    if (showLoading) setIsSyncing(true)
    
    try {
      const response = await fetch(`/api/rental/availability/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          dateRange: {
            start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
            end: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update booked dates with real-time data
        if (result.bookedDates) {
          setBookedDates(result.bookedDates)
        }
        
        // Update pricing rules if changed
        if (result.pricingRules) {
          setPricingRules(result.pricingRules)
        }
        
        // Regenerate calendar with updated data
        generateCalendarDays(result.pricingRules || pricingRules, result.bookedDates || bookedDates)
        
        if (showLoading) {
          console.log(`Availability synced successfully. Updated ${result.updatedCount || 0} dates.`)
        }
      } else {
        console.warn('Sync response not OK:', response.status)
      }
      
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Error syncing availability:', error)
      // Don't show error to user for background sync failures unless manual
      if (showLoading) {
        alert('Failed to sync availability. Please try again.')
      }
    } finally {
      if (showLoading) setIsSyncing(false)
    }
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || day.isBooked) return

    const isSelected = selectedDates.some(d => isSameDay(d, day.date))
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, day.date)))
    } else {
      setSelectedDates([...selectedDates, day.date])
    }
  }

  const applyBulkPricing = async () => {
    if (!bulkPrice || selectedDates.length === 0) return

    setIsSaving(true)
    try {
      const price = parseFloat(bulkPrice)
      // Mock API call to update prices
      for (const date of selectedDates) {
        const dateStr = format(date, 'yyyy-MM-dd')
        onPriceUpdate?.(dateStr, price)
      }

      // Update local state
      const updatedDays = calendarDays.map(day => {
        if (selectedDates.some(d => isSameDay(d, day.date))) {
          return { ...day, price: price }
        }
        return day
      })
      setCalendarDays(updatedDays)
      setSelectedDates([])
      setBulkPrice('')
    } catch (error) {
      console.error('Error applying bulk pricing:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addPricingRule = async () => {
    if (!newRule.name || !newRule.startDate || !newRule.endDate) return

    try {
      const rule: PricingRule = {
        id: Date.now().toString(),
        ...newRule,
        priority: pricingRules.length + 1
      }

      const updatedRules = [...pricingRules, rule]
      setPricingRules(updatedRules)
      generateCalendarDays(updatedRules, bookedDates)
      
      setNewRule({
        name: '',
        startDate: '',
        endDate: '',
        pricePerDay: basePricePerDay,
        isActive: true
      })
    } catch (error) {
      console.error('Error adding pricing rule:', error)
    }
  }

  const toggleRuleStatus = (ruleId: string) => {
    const updatedRules = pricingRules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    )
    setPricingRules(updatedRules)
    generateCalendarDays(updatedRules, bookedDates)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getDayClassName = (day: CalendarDay) => {
    let className = 'w-full h-16 p-2 border border-gray-200 cursor-pointer transition-colors '
    
    if (day.isPast) {
      className += 'bg-gray-50 text-gray-400 cursor-not-allowed '
    } else if (day.isBooked) {
      className += 'bg-red-100 text-red-800 cursor-not-allowed '
    } else if (selectedDates.some(d => isSameDay(d, day.date))) {
      className += 'bg-blue-100 border-blue-500 '
    } else if (day.isToday) {
      className += 'bg-yellow-50 border-yellow-500 '
    } else {
      className += 'hover:bg-gray-50 '
    }

    return className
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Pricing & Availability Calendar</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4" />
              <span>Last sync: {format(lastSyncTime, 'HH:mm')}</span>
            </div>
            <button
              onClick={() => syncAvailability(true)}
              disabled={isSyncing || isLoading}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Previous
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedDates.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedDates.length} dates selected
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="Price per day"
                    className="w-32 px-3 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyBulkPricing}
                    disabled={!bulkPrice || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Apply</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedDates([])}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Pricing Rules Toggle */}
        <button
          onClick={() => setShowPricingRules(!showPricingRules)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <DollarSign className="w-4 h-4" />
          <span>Manage Pricing Rules</span>
        </button>
      </div>

      {/* Pricing Rules Panel */}
      {showPricingRules && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Rules</h3>
          
          {/* Add New Rule */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Rule name"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newRule.startDate}
                onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newRule.endDate}
                onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newRule.pricePerDay}
                onChange={(e) => setNewRule({ ...newRule, pricePerDay: parseFloat(e.target.value) })}
                placeholder="Price per day"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addPricingRule}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Add Rule
              </button>
            </div>
          </div>

          {/* Existing Rules */}
          <div className="space-y-2">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{rule.name}</p>
                    <p className="text-sm text-gray-600">
                      {rule.startDate} to {rule.endDate} • {formatCurrency(rule.pricePerDay)}/day
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleRuleStatus(rule.id)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    rule.isActive 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={getDayClassName(day)}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {format(day.date, 'd')}
                    </span>
                    {day.isBooked && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(day.price)}
                  </div>
                  {day.booking && (
                    <div className="text-xs text-red-600 mt-1 truncate">
                      {day.booking.customerName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 rounded"></div>
            <span>Past</span>
          </div>
        </div>
      </div>
    </div>
  )
}