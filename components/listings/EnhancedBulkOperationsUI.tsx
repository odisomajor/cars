'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  MapPin,
  Car,
  Truck
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  location: string
  status: 'active' | 'inactive' | 'draft' | 'expired' | 'sold'
  listingType: 'BASIC' | 'FEATURED' | 'PREMIUM' | 'SPOTLIGHT'
  type: 'sale' | 'rental'
  images: string[]
  views: number
  favorites: number
  createdAt: string
  expiresAt: string
  isRental?: boolean
}

interface BulkOperation {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  action: string
  requiresConfirmation: boolean
  supportedTypes: ('sale' | 'rental')[]
  fields?: {
    name: string
    type: 'text' | 'number' | 'select' | 'textarea' | 'date'
    label: string
    required?: boolean
    options?: string[]
    placeholder?: string
  }[]
}

interface BulkOperationResult {
  operationId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  totalItems: number
  processedItems: number
  successCount: number
  errorCount: number
  errors: { itemId: string; error: string }[]
  startedAt: string
  completedAt?: string
  estimatedTimeRemaining?: number
}

interface EnhancedBulkOperationsUIProps {
  listings: Listing[]
  selectedListings: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onOperationComplete?: (result: BulkOperationResult) => void
  className?: string
}

const BULK_OPERATIONS: BulkOperation[] = [
  {
    id: 'activate',
    name: 'Activate Listings',
    description: 'Make selected listings active and visible',
    icon: <Play className="h-4 w-4" />,
    action: 'activate',
    requiresConfirmation: false,
    supportedTypes: ['sale', 'rental']
  },
  {
    id: 'deactivate',
    name: 'Deactivate Listings',
    description: 'Hide selected listings from public view',
    icon: <Pause className="h-4 w-4" />,
    action: 'deactivate',
    requiresConfirmation: true,
    supportedTypes: ['sale', 'rental']
  },
  {
    id: 'delete',
    name: 'Delete Listings',
    description: 'Permanently remove selected listings',
    icon: <Trash2 className="h-4 w-4" />,
    action: 'delete',
    requiresConfirmation: true,
    supportedTypes: ['sale', 'rental']
  },
  {
    id: 'update_price',
    name: 'Update Pricing',
    description: 'Bulk update prices for selected listings',
    icon: <DollarSign className="h-4 w-4" />,
    action: 'update_price',
    requiresConfirmation: true,
    supportedTypes: ['sale', 'rental'],
    fields: [
      {
        name: 'priceAction',
        type: 'select',
        label: 'Price Action',
        required: true,
        options: ['set_fixed', 'increase_percent', 'decrease_percent', 'increase_amount', 'decrease_amount']
      },
      {
        name: 'priceValue',
        type: 'number',
        label: 'Value',
        required: true,
        placeholder: 'Enter amount or percentage'
      }
    ]
  },
  {
    id: 'update_location',
    name: 'Update Location',
    description: 'Change location for selected listings',
    icon: <MapPin className="h-4 w-4" />,
    action: 'update_location',
    requiresConfirmation: false,
    supportedTypes: ['sale', 'rental'],
    fields: [
      {
        name: 'location',
        type: 'text',
        label: 'New Location',
        required: true,
        placeholder: 'Enter new location'
      }
    ]
  },
  {
    id: 'extend_expiry',
    name: 'Extend Expiry',
    description: 'Extend expiration date for selected listings',
    icon: <Calendar className="h-4 w-4" />,
    action: 'extend_expiry',
    requiresConfirmation: false,
    supportedTypes: ['sale', 'rental'],
    fields: [
      {
        name: 'extensionDays',
        type: 'number',
        label: 'Extension Days',
        required: true,
        placeholder: 'Number of days to extend'
      }
    ]
  },
  {
    id: 'upgrade_listing',
    name: 'Upgrade Listing Type',
    description: 'Upgrade selected listings to premium tiers',
    icon: <Star className="h-4 w-4" />,
    action: 'upgrade_listing',
    requiresConfirmation: true,
    supportedTypes: ['sale', 'rental'],
    fields: [
      {
        name: 'newListingType',
        type: 'select',
        label: 'New Listing Type',
        required: true,
        options: ['FEATURED', 'PREMIUM', 'SPOTLIGHT']
      }
    ]
  }
]

export default function EnhancedBulkOperationsUI({
  listings,
  selectedListings,
  onSelectionChange,
  onOperationComplete,
  className = ''
}: EnhancedBulkOperationsUIProps) {
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null)
  const [operationData, setOperationData] = useState<Record<string, any>>({})
  const [currentOperation, setCurrentOperation] = useState<BulkOperationResult | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rental'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft' | 'expired'>('all')
  const [showPreview, setShowPreview] = useState(false)

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || listing.type === filterType
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  // Get selected listings data
  const selectedListingsData = listings.filter(listing => selectedListings.includes(listing.id))

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredListings.map(listing => listing.id))
    }
  }

  // Handle individual selection
  const handleSelectListing = (listingId: string) => {
    if (selectedListings.includes(listingId)) {
      onSelectionChange(selectedListings.filter(id => id !== listingId))
    } else {
      onSelectionChange([...selectedListings, listingId])
    }
  }

  // Handle operation execution
  const executeOperation = async () => {
    if (!selectedOperation || selectedListings.length === 0) return

    const operationId = `op_${Date.now()}`
    const newOperation: BulkOperationResult = {
      operationId,
      status: 'running',
      progress: 0,
      totalItems: selectedListings.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      startedAt: new Date().toISOString()
    }

    setCurrentOperation(newOperation)
    setShowBulkModal(false)

    try {
      const response = await fetch('/api/listings/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: selectedOperation.action,
          listingIds: selectedListings,
          data: operationData
        })
      })

      if (response.ok) {
        const result = await response.json()
        const completedOperation: BulkOperationResult = {
          ...newOperation,
          status: 'completed',
          progress: 100,
          processedItems: selectedListings.length,
          successCount: result.successCount || selectedListings.length,
          errorCount: result.errorCount || 0,
          errors: result.errors || [],
          completedAt: new Date().toISOString()
        }
        setCurrentOperation(completedOperation)
        onOperationComplete?.(completedOperation)
      } else {
        throw new Error('Operation failed')
      }
    } catch (error) {
      const failedOperation: BulkOperationResult = {
        ...newOperation,
        status: 'failed',
        progress: 0,
        processedItems: 0,
        successCount: 0,
        errorCount: selectedListings.length,
        errors: [{ itemId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }],
        completedAt: new Date().toISOString()
      }
      setCurrentOperation(failedOperation)
    }
  }

  // Get available operations for selected listings
  const getAvailableOperations = () => {
    if (selectedListings.length === 0) return []
    
    const selectedTypes = new Set(selectedListingsData.map(listing => listing.type))
    return BULK_OPERATIONS.filter(op => 
      op.supportedTypes.some(type => selectedTypes.has(type))
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bulk Operations
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedListings.length} selected
              </Badge>
              {selectedListings.length > 0 && (
                <Button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Execute Operations
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="rental">Rentals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                Select All ({filteredListings.length} listings)
              </span>
            </div>
            {selectedListings.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Preview'} Selection
              </Button>
            )}
          </div>

          {/* Listings grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <Card key={listing.id} className={`cursor-pointer transition-all ${
                selectedListings.includes(listing.id) 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={() => handleSelectListing(listing.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {listing.type === 'rental' ? 
                          <Truck className="h-4 w-4 text-blue-600" /> : 
                          <Car className="h-4 w-4 text-green-600" />
                        }
                        <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>{listing.make} {listing.model} ({listing.year})</p>
                        <p className="font-medium">${listing.price.toLocaleString()}</p>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={listing.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {listing.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {listing.listingType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection preview */}
      {showPreview && selectedListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Listings Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedListingsData.map(listing => (
                <div key={listing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{listing.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{listing.type}</Badge>
                    <Badge variant="secondary" className="text-xs">{listing.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current operation status */}
      {currentOperation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentOperation.status === 'running' && <Clock className="h-5 w-5 animate-spin" />}
              {currentOperation.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {currentOperation.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
              Operation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={currentOperation.progress} className="w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Items</p>
                  <p className="font-medium">{currentOperation.totalItems}</p>
                </div>
                <div>
                  <p className="text-gray-600">Processed</p>
                  <p className="font-medium">{currentOperation.processedItems}</p>
                </div>
                <div>
                  <p className="text-gray-600">Success</p>
                  <p className="font-medium text-green-600">{currentOperation.successCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Errors</p>
                  <p className="font-medium text-red-600">{currentOperation.errorCount}</p>
                </div>
              </div>
              {currentOperation.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {currentOperation.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk operations modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
            <DialogDescription>
              Choose an operation to perform on {selectedListings.length} selected listings
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="operations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="operations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableOperations().map(operation => (
                  <Card 
                    key={operation.id} 
                    className={`cursor-pointer transition-all ${
                      selectedOperation?.id === operation.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedOperation(operation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded">
                          {operation.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{operation.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {operation.description}
                          </p>
                          {operation.requiresConfirmation && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Requires confirmation
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Operation fields */}
              {selectedOperation?.fields && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Operation Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOperation.fields.map(field => (
                      <div key={field.name}>
                        <Label htmlFor={field.name}>{field.label}</Label>
                        {field.type === 'select' ? (
                          <Select 
                            value={operationData[field.name] || ''}
                            onValueChange={(value) => setOperationData(prev => ({ ...prev, [field.name]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option.replace('_', ' ').toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'textarea' ? (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            value={operationData[field.name] || ''}
                            onChange={(e) => setOperationData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          />
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={operationData[field.name] || ''}
                            onChange={(e) => setOperationData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOperation ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded">
                        {selectedOperation.icon}
                        <div>
                          <h3 className="font-medium">{selectedOperation.name}</h3>
                          <p className="text-sm text-gray-600">{selectedOperation.description}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Affected Listings ({selectedListings.length}):</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {selectedListingsData.map(listing => (
                            <div key={listing.id} className="text-sm p-2 bg-gray-50 rounded">
                              {listing.title}
                            </div>
                          ))}
                        </div>
                      </div>
                      {Object.keys(operationData).length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Parameters:</h4>
                          <div className="space-y-1">
                            {Object.entries(operationData).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Select an operation to see preview</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeOperation}
              disabled={!selectedOperation || selectedListings.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Execute Operation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}