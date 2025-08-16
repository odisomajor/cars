'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Car,
  Camera,
  Upload,
  Save,
  Send,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Image as ImageIcon,
  X,
  Plus,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react'
import { MobileCameraUpload } from './MobileCameraUpload'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface ListingFormData {
  // Basic Information
  title: string
  make: string
  model: string
  year: number | ''
  category: string
  condition: string
  bodyType: string
  
  // Technical Details
  mileage: number | ''
  fuelType: string
  transmission: string
  engineSize: string
  seats: number | ''
  doors: number | ''
  color: string
  
  // Features
  airConditioning: boolean
  gps: boolean
  bluetooth: boolean
  sunroof: boolean
  leatherSeats: boolean
  parkingSensors: boolean
  backupCamera: boolean
  
  // Pricing & Location
  price: number | ''
  location: string
  description: string
  
  // Rental Specific (if applicable)
  isRental: boolean
  rentalDailyRate: number | ''
  rentalWeeklyRate: number | ''
  rentalMonthlyRate: number | ''
  
  // Images
  images: string[]
  
  // Listing Type
  listingType: 'free' | 'featured' | 'premium'
  
  // Meta
  isDraft: boolean
  draftId?: string
}

interface MobileListingFormProps {
  initialData?: Partial<ListingFormData>
  onSubmit?: (data: ListingFormData) => Promise<void>
  onSaveDraft?: (data: ListingFormData) => Promise<void>
  isEditing?: boolean
  listingId?: string
}

const MAKES = [
  'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi',
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Peugeot', 'Renault',
  'Hyundai', 'Kia', 'Ford', 'Chevrolet', 'Land Rover', 'Jeep'
]

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT']
const CONDITIONS = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair']
const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible', 'Pickup', 'Van']
const CATEGORIES = ['Economy', 'Compact', 'Mid-size', 'Full-size', 'Luxury', 'Sports', 'SUV']

const STORAGE_KEY = 'mobile_listing_draft'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export function MobileListingForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isEditing = false,
  listingId
}: MobileListingFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    make: '',
    model: '',
    year: '',
    category: '',
    condition: '',
    bodyType: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    engineSize: '',
    seats: '',
    doors: '',
    color: '',
    airConditioning: false,
    gps: false,
    bluetooth: false,
    sunroof: false,
    leatherSeats: false,
    parkingSensors: false,
    backupCamera: false,
    price: '',
    location: '',
    description: '',
    isRental: false,
    rentalDailyRate: '',
    rentalWeeklyRate: '',
    rentalMonthlyRate: '',
    images: [],
    listingType: 'free',
    isDraft: true,
    ...initialData
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showCameraUpload, setShowCameraUpload] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const autoSaveRef = useRef<NodeJS.Timeout>()

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Car },
    { id: 'details', title: 'Details', icon: Settings },
    { id: 'features', title: 'Features', icon: CheckCircle },
    { id: 'pricing', title: 'Pricing', icon: DollarSign },
    { id: 'images', title: 'Images', icon: ImageIcon },
    { id: 'review', title: 'Review', icon: Send }
  ]

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(STORAGE_KEY)
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)
          setFormData(prev => ({ ...prev, ...draftData }))
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
  }, [isEditing])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }

    autoSaveRef.current = setTimeout(() => {
      saveDraftLocally()
    }, AUTO_SAVE_INTERVAL)

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [formData])

  const saveDraftLocally = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving draft locally:', error)
    }
  }

  const saveDraftToServer = async () => {
    if (!isOnline || !onSaveDraft) return

    setIsSaving(true)
    try {
      await onSaveDraft(formData)
      setLastSaved(new Date())
      // Clear local storage after successful server save
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error saving draft to server:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates)
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) errors.title = 'Title is required'
        if (!formData.make) errors.make = 'Make is required'
        if (!formData.model.trim()) errors.model = 'Model is required'
        if (!formData.year) errors.year = 'Year is required'
        if (!formData.category) errors.category = 'Category is required'
        break

      case 1: // Details
        if (!formData.condition) errors.condition = 'Condition is required'
        if (!formData.bodyType) errors.bodyType = 'Body type is required'
        if (!formData.fuelType) errors.fuelType = 'Fuel type is required'
        if (!formData.transmission) errors.transmission = 'Transmission is required'
        break

      case 3: // Pricing
        if (!formData.price) errors.price = 'Price is required'
        if (!formData.location.trim()) errors.location = 'Location is required'
        if (formData.isRental && !formData.rentalDailyRate) {
          errors.rentalDailyRate = 'Daily rate is required for rentals'
        }
        break

      case 4: // Images
        if (formData.images.length === 0) {
          errors.images = 'At least one image is required'
        }
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleImageUpload = (newImages: string[]) => {
    updateFormData({ images: [...formData.images, ...newImages] })
  }

  const handleImageRemove = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    updateFormData({ images: newImages })
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !onSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit({ ...formData, isDraft: false })
      // Clear local draft after successful submission
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error submitting listing:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCompletionPercentage = () => {
    const requiredFields = [
      'title', 'make', 'model', 'year', 'category', 'condition',
      'bodyType', 'fuelType', 'transmission', 'price', 'location'
    ]
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof ListingFormData]
      return value !== '' && value !== null && value !== undefined
    })
    const imageCompletion = formData.images.length > 0 ? 1 : 0
    return Math.round(((completedFields.length + imageCompletion) / (requiredFields.length + 1)) * 100)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., 2020 Toyota Camry - Excellent Condition"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Select value={formData.make} onValueChange={(value) => updateFormData({ make: value })}>
                  <SelectTrigger className={validationErrors.make ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAKES.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.make && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.make}</p>
                )}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => updateFormData({ model: e.target.value })}
                  placeholder="e.g., Camry"
                  className={validationErrors.model ? 'border-red-500' : ''}
                />
                {validationErrors.model && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.model}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateFormData({ year: parseInt(e.target.value) || '' })}
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className={validationErrors.year ? 'border-red-500' : ''}
                />
                {validationErrors.year && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.year}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
                  <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 1: // Details
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => updateFormData({ condition: value })}>
                  <SelectTrigger className={validationErrors.condition ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.condition && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.condition}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bodyType">Body Type *</Label>
                <Select value={formData.bodyType} onValueChange={(value) => updateFormData({ bodyType: value })}>
                  <SelectTrigger className={validationErrors.bodyType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.bodyType && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.bodyType}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select value={formData.fuelType} onValueChange={(value) => updateFormData({ fuelType: value })}>
                  <SelectTrigger className={validationErrors.fuelType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(fuel => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.fuelType && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.fuelType}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transmission">Transmission *</Label>
                <Select value={formData.transmission} onValueChange={(value) => updateFormData({ transmission: value })}>
                  <SelectTrigger className={validationErrors.transmission ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map(trans => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.transmission && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.transmission}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => updateFormData({ mileage: parseInt(e.target.value) || '' })}
                  placeholder="50000"
                />
              </div>

              <div>
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => updateFormData({ seats: parseInt(e.target.value) || '' })}
                  placeholder="5"
                  min="2"
                  max="9"
                />
              </div>

              <div>
                <Label htmlFor="doors">Doors</Label>
                <Input
                  id="doors"
                  type="number"
                  value={formData.doors}
                  onChange={(e) => updateFormData({ doors: parseInt(e.target.value) || '' })}
                  placeholder="4"
                  min="2"
                  max="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engineSize">Engine Size</Label>
                <Input
                  id="engineSize"
                  value={formData.engineSize}
                  onChange={(e) => updateFormData({ engineSize: e.target.value })}
                  placeholder="2.0L"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateFormData({ color: e.target.value })}
                  placeholder="White"
                />
              </div>
            </div>
          </div>
        )

      case 2: // Features
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Vehicle Features</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'airConditioning', label: 'Air Conditioning' },
                { key: 'gps', label: 'GPS Navigation' },
                { key: 'bluetooth', label: 'Bluetooth' },
                { key: 'sunroof', label: 'Sunroof' },
                { key: 'leatherSeats', label: 'Leather Seats' },
                { key: 'parkingSensors', label: 'Parking Sensors' },
                { key: 'backupCamera', label: 'Backup Camera' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={formData[key as keyof ListingFormData] as boolean}
                    onCheckedChange={(checked) => updateFormData({ [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 3: // Pricing
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Sale Price (KES) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => updateFormData({ price: parseInt(e.target.value) || '' })}
                placeholder="1500000"
                className={validationErrors.price ? 'border-red-500' : ''}
              />
              {validationErrors.price && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                placeholder="Nairobi, Kenya"
                className={validationErrors.location ? 'border-red-500' : ''}
              />
              {validationErrors.location && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.location}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="isRental"
                checked={formData.isRental}
                onCheckedChange={(checked) => updateFormData({ isRental: checked })}
              />
              <Label htmlFor="isRental">Also available for rental</Label>
            </div>

            {formData.isRental && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">Rental Rates</h4>
                
                <div>
                  <Label htmlFor="rentalDailyRate">Daily Rate (KES) *</Label>
                  <Input
                    id="rentalDailyRate"
                    type="number"
                    value={formData.rentalDailyRate}
                    onChange={(e) => updateFormData({ rentalDailyRate: parseInt(e.target.value) || '' })}
                    placeholder="5000"
                    className={validationErrors.rentalDailyRate ? 'border-red-500' : ''}
                  />
                  {validationErrors.rentalDailyRate && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.rentalDailyRate}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rentalWeeklyRate">Weekly Rate (KES)</Label>
                    <Input
                      id="rentalWeeklyRate"
                      type="number"
                      value={formData.rentalWeeklyRate}
                      onChange={(e) => updateFormData({ rentalWeeklyRate: parseInt(e.target.value) || '' })}
                      placeholder="30000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rentalMonthlyRate">Monthly Rate (KES)</Label>
                    <Input
                      id="rentalMonthlyRate"
                      type="number"
                      value={formData.rentalMonthlyRate}
                      onChange={(e) => updateFormData({ rentalMonthlyRate: parseInt(e.target.value) || '' })}
                      placeholder="100000"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Describe your vehicle's condition, history, and any additional details..."
                rows={4}
              />
            </div>
          </div>
        )

      case 4: // Images
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vehicle Images</h3>
              <Badge variant="outline">
                {formData.images.length}/10 images
              </Badge>
            </div>

            {validationErrors.images && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.images}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.images.length < 10 && (
                <Button
                  variant="outline"
                  className="aspect-square flex flex-col items-center justify-center"
                  onClick={() => setShowCameraUpload(true)}
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span className="text-sm">Add Photo</span>
                </Button>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        )

      case 5: // Review
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Review Your Listing</h3>
              <p className="text-gray-600">Please review all information before publishing</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {formData.images[0] && (
                    <img
                      src={formData.images[0]}
                      alt="Vehicle"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{formData.title}</h4>
                    <p className="text-sm text-gray-600">
                      {formData.year} {formData.make} {formData.model}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      KES {formData.price?.toLocaleString()}
                    </p>
                    {formData.isRental && (
                      <p className="text-sm text-blue-600">
                        Rental: KES {formData.rentalDailyRate}/day
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Condition:</span> {formData.condition}
              </div>
              <div>
                <span className="font-medium">Body Type:</span> {formData.bodyType}
              </div>
              <div>
                <span className="font-medium">Fuel:</span> {formData.fuelType}
              </div>
              <div>
                <span className="font-medium">Transmission:</span> {formData.transmission}
              </div>
              <div>
                <span className="font-medium">Location:</span> {formData.location}
              </div>
              <div>
                <span className="font-medium">Images:</span> {formData.images.length}
              </div>
            </div>

            <div>
              <Label>Listing Type</Label>
              <Select 
                value={formData.listingType} 
                onValueChange={(value: 'free' | 'featured' | 'premium') => updateFormData({ listingType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Listing</SelectItem>
                  <SelectItem value="featured">Featured Listing (+KES 1,000)</SelectItem>
                  <SelectItem value="premium">Premium Listing (+KES 2,500)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">
            {isEditing ? 'Edit Listing' : 'Create Listing'}
          </h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{getCompletionPercentage()}% complete</span>
          </div>
          <Progress value={getCompletionPercentage()} />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center space-y-1 cursor-pointer",
                  index === currentStep ? "text-blue-600" : "text-gray-400",
                  index < currentStep ? "text-green-600" : ""
                )}
                onClick={() => setCurrentStep(index)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  index === currentStep ? "border-blue-600 bg-blue-50" : 
                  index < currentStep ? "border-green-600 bg-green-50" : "border-gray-300"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs">{step.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <div className="flex space-x-2 flex-1">
                <Button
                  variant="outline"
                  onClick={saveDraftToServer}
                  disabled={!isOnline || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isOnline || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Upload Modal */}
      {showCameraUpload && (
        <MobileCameraUpload
          onImagesUploaded={handleImageUpload}
          onClose={() => setShowCameraUpload(false)}
          maxImages={10 - formData.images.length}
          onProgress={setUploadProgress}
        />
      )}
    </div>
  )
}