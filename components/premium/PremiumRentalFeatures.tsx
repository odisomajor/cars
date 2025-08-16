'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  Zap, 
  Star, 
  Calendar as CalendarIcon, 
  MapPin, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Car,
  CreditCard,
  Phone,
  Mail,
  User,
  Crown,
  TrendingUp,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

interface RentalListing {
  id: string
  title: string
  make: string
  model: string
  year: number
  images: string[]
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  location: string
  features: string[]
  listingType: 'BASIC' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
  instantBooking: boolean
  minimumRental: number
  maximumRental: number
  availability: {
    available: boolean
    nextAvailable?: Date
    bookedDates: Date[]
  }
  owner: {
    id: string
    name: string
    avatar?: string
    rating: number
    responseTime: string
    verified: boolean
  }
}

interface BookingRequest {
  startDate: Date
  endDate: Date
  totalDays: number
  totalCost: number
  customerInfo: {
    name: string
    email: string
    phone: string
    licenseNumber: string
    message?: string
  }
}

// Instant Booking Component
interface InstantBookingProps {
  listing: RentalListing
  onBookingComplete?: (booking: BookingRequest) => void
  className?: string
}

export const InstantBooking: React.FC<InstantBookingProps> = ({
  listing,
  onBookingComplete,
  className = ''
}) => {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    message: ''
  })
  const [isBooking, setIsBooking] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0
  const totalCost = calculateRentalCost(listing, totalDays)

  const handleInstantBook = async () => {
    if (!startDate || !endDate || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (totalDays < listing.minimumRental) {
      toast.error(`Minimum rental period is ${listing.minimumRental} days`)
      return
    }

    if (totalDays > listing.maximumRental) {
      toast.error(`Maximum rental period is ${listing.maximumRental} days`)
      return
    }

    setIsBooking(true)
    try {
      const booking: BookingRequest = {
        startDate,
        endDate,
        totalDays,
        totalCost,
        customerInfo
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onBookingComplete?.(booking)
      toast.success('Booking confirmed! You will receive a confirmation email shortly.')
      setShowBookingForm(false)
    } catch (error) {
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  if (!listing.instantBooking) {
    return (
      <Card className={cn('border-gray-200', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            <Clock className="w-5 h-5 mr-2" />
            <span>Contact owner for booking</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-green-200 bg-green-50/30', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-green-700">
            <Zap className="w-5 h-5 mr-2" />
            Instant Booking Available
          </CardTitle>
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Instant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => 
                    date < new Date() || 
                    listing.availability.bookedDates.some(bookedDate => 
                      format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => 
                    !startDate ||
                    date <= startDate || 
                    listing.availability.bookedDates.some(bookedDate => 
                      format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {totalDays > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Rental Period:</span>
              <span className="font-semibold">{totalDays} days</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Daily Rate:</span>
              <span className="font-semibold">${listing.dailyRate}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Cost:</span>
                <span className="text-xl font-bold text-green-600">${totalCost}</span>
              </div>
            </div>
          </div>
        )}

        {!showBookingForm ? (
          <Button 
            onClick={() => setShowBookingForm(true)}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!startDate || !endDate || totalDays < listing.minimumRental}
          >
            <Zap className="w-4 h-4 mr-2" />
            Book Instantly
          </Button>
        ) : (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Complete Your Booking</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="license">Driver's License</Label>
                <Input
                  id="license"
                  value={customerInfo.licenseNumber}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="DL123456789"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Special Requests (Optional)</Label>
              <Textarea
                id="message"
                value={customerInfo.message}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBookingForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInstantBook}
                disabled={isBooking}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isBooking ? (
                  <>
                    <Timer className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Priority Placement Indicator
interface PriorityPlacementProps {
  listingType: 'BASIC' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
  position?: number
  totalListings?: number
  className?: string
}

export const PriorityPlacement: React.FC<PriorityPlacementProps> = ({
  listingType,
  position,
  totalListings,
  className = ''
}) => {
  const getPriorityInfo = () => {
    switch (listingType) {
      case 'SPOTLIGHT':
        return {
          icon: Crown,
          label: 'Spotlight Priority',
          description: 'Highest visibility - Top of all searches',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      case 'PREMIUM':
        return {
          icon: Zap,
          label: 'Premium Priority',
          description: 'Enhanced visibility - Priority placement',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'FEATURED':
        return {
          icon: Star,
          label: 'Featured Priority',
          description: 'Good visibility - Featured section',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      default:
        return null
    }
  }

  const priorityInfo = getPriorityInfo()
  if (!priorityInfo) return null

  const Icon = priorityInfo.icon

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      priorityInfo.bgColor,
      priorityInfo.borderColor,
      className
    )}>
      <div className="flex items-center">
        <Icon className={cn('w-5 h-5 mr-2', priorityInfo.color)} />
        <div>
          <div className={cn('font-semibold', priorityInfo.color)}>
            {priorityInfo.label}
          </div>
          <div className="text-sm text-gray-600">
            {priorityInfo.description}
          </div>
        </div>
      </div>
      
      {position && totalListings && (
        <div className="text-right">
          <div className={cn('font-bold', priorityInfo.color)}>#{position}</div>
          <div className="text-xs text-gray-500">of {totalListings}</div>
        </div>
      )}
    </div>
  )
}

// Premium Rental Features Summary
interface PremiumRentalSummaryProps {
  listing: RentalListing
  className?: string
}

export const PremiumRentalSummary: React.FC<PremiumRentalSummaryProps> = ({
  listing,
  className = ''
}) => {
  const features = [
    {
      icon: Zap,
      label: 'Instant Booking',
      available: listing.instantBooking,
      description: 'Book immediately without waiting for approval'
    },
    {
      icon: Shield,
      label: 'Verified Owner',
      available: listing.owner.verified,
      description: 'Identity and documents verified'
    },
    {
      icon: Star,
      label: 'High Rating',
      available: listing.owner.rating >= 4.5,
      description: `${listing.owner.rating}/5.0 rating`
    },
    {
      icon: Clock,
      label: 'Quick Response',
      available: listing.owner.responseTime === 'within 1 hour',
      description: `Responds ${listing.owner.responseTime}`
    }
  ]

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Premium Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={cn(
                    'w-4 h-4 mr-2',
                    feature.available ? 'text-green-600' : 'text-gray-400'
                  )} />
                  <div>
                    <div className={cn(
                      'font-medium',
                      feature.available ? 'text-gray-900' : 'text-gray-500'
                    )}>
                      {feature.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {feature.description}
                    </div>
                  </div>
                </div>
                {feature.available ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate rental cost
function calculateRentalCost(listing: RentalListing, days: number): number {
  if (days >= 30 && listing.monthlyRate) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    return (months * listing.monthlyRate) + (remainingDays * listing.dailyRate)
  }
  
  if (days >= 7 && listing.weeklyRate) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    return (weeks * listing.weeklyRate) + (remainingDays * listing.dailyRate)
  }
  
  return days * listing.dailyRate
}

export type { RentalListing, BookingRequest }