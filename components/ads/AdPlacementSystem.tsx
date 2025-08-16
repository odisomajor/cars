'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Play,
  Image as ImageIcon,
  Type,
  BarChart3,
  Settings,
  Pause,
  RefreshCw,
  Target,
  Users,
  Clock,
  MapPin,
  Filter,
  Zap,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AdUnit {
  id: string
  name: string
  type: 'banner' | 'interstitial' | 'native' | 'video' | 'rewarded'
  format: 'mobile' | 'tablet' | 'desktop' | 'responsive'
  size: string
  position: string
  status: 'active' | 'paused' | 'draft'
  targeting: {
    demographics: string[]
    interests: string[]
    locations: string[]
    devices: string[]
  }
  performance: {
    impressions: number
    clicks: number
    ctr: number
    revenue: number
    cpm: number
  }
  content: {
    title?: string
    description?: string
    imageUrl?: string
    videoUrl?: string
    callToAction?: string
    landingUrl?: string
  }
  schedule: {
    startDate: Date
    endDate?: Date
    budget: number
    dailyBudget: number
  }
}

interface AdPlacementSystemProps {
  className?: string
}

const AD_TYPES = [
  { value: 'banner', label: 'Banner Ad', icon: ImageIcon },
  { value: 'interstitial', label: 'Interstitial', icon: Monitor },
  { value: 'native', label: 'Native Ad', icon: Type },
  { value: 'video', label: 'Video Ad', icon: Play },
  { value: 'rewarded', label: 'Rewarded Ad', icon: Star }
]

const AD_FORMATS = [
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'responsive', label: 'Responsive', icon: RefreshCw }
]

const AD_SIZES = {
  banner: ['320x50', '320x100', '728x90', '970x250', '300x250'],
  interstitial: ['320x480', '768x1024', '1024x768'],
  native: ['responsive'],
  video: ['320x240', '640x480', '1280x720'],
  rewarded: ['320x480', '768x1024']
}

const AD_POSITIONS = [
  'header',
  'sidebar',
  'content-top',
  'content-middle',
  'content-bottom',
  'footer',
  'floating',
  'overlay'
]

export const AdPlacementSystem: React.FC<AdPlacementSystemProps> = ({
  className = ''
}) => {
  const [adUnits, setAdUnits] = useState<AdUnit[]>([])
  const [selectedAdUnit, setSelectedAdUnit] = useState<AdUnit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview')

  useEffect(() => {
    fetchAdUnits()
  }, [])

  const fetchAdUnits = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAdUnits: AdUnit[] = [
        {
          id: '1',
          name: 'Homepage Banner',
          type: 'banner',
          format: 'responsive',
          size: '728x90',
          position: 'header',
          status: 'active',
          targeting: {
            demographics: ['25-45'],
            interests: ['cars', 'automotive'],
            locations: ['US', 'CA'],
            devices: ['mobile', 'desktop']
          },
          performance: {
            impressions: 45230,
            clicks: 892,
            ctr: 1.97,
            revenue: 234.50,
            cpm: 5.18
          },
          content: {
            title: 'Find Your Dream Car',
            description: 'Browse thousands of quality vehicles',
            imageUrl: '/api/placeholder/728/90',
            callToAction: 'Browse Now',
            landingUrl: '/listings'
          },
          schedule: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            budget: 5000,
            dailyBudget: 50
          }
        },
        {
          id: '2',
          name: 'Mobile Interstitial',
          type: 'interstitial',
          format: 'mobile',
          size: '320x480',
          position: 'overlay',
          status: 'active',
          targeting: {
            demographics: ['18-35'],
            interests: ['luxury cars', 'sports cars'],
            locations: ['US'],
            devices: ['mobile']
          },
          performance: {
            impressions: 12450,
            clicks: 623,
            ctr: 5.01,
            revenue: 892.30,
            cpm: 71.70
          },
          content: {
            title: 'Premium Car Rentals',
            description: 'Luxury vehicles for special occasions',
            imageUrl: '/api/placeholder/320/480',
            callToAction: 'Rent Now',
            landingUrl: '/rentals/luxury'
          },
          schedule: {
            startDate: new Date('2024-01-15'),
            budget: 2000,
            dailyBudget: 25
          }
        }
      ]
      
      setAdUnits(mockAdUnits)
    } catch (error) {
      console.error('Failed to fetch ad units:', error)
      toast.error('Failed to load ad units')
    } finally {
      setLoading(false)
    }
  }

  const createAdUnit = async (adUnit: Partial<AdUnit>) => {
    setIsCreating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newAdUnit: AdUnit = {
        id: Date.now().toString(),
        name: adUnit.name || 'New Ad Unit',
        type: adUnit.type || 'banner',
        format: adUnit.format || 'responsive',
        size: adUnit.size || '300x250',
        position: adUnit.position || 'sidebar',
        status: 'draft',
        targeting: adUnit.targeting || {
          demographics: [],
          interests: [],
          locations: [],
          devices: []
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          revenue: 0,
          cpm: 0
        },
        content: adUnit.content || {},
        schedule: adUnit.schedule || {
          startDate: new Date(),
          budget: 1000,
          dailyBudget: 10
        }
      }
      
      setAdUnits(prev => [...prev, newAdUnit])
      toast.success('Ad unit created successfully')
      setActiveTab('manage')
    } catch (error) {
      toast.error('Failed to create ad unit')
    } finally {
      setIsCreating(false)
    }
  }

  const updateAdUnitStatus = async (id: string, status: 'active' | 'paused' | 'draft') => {
    try {
      setAdUnits(prev => prev.map(unit => 
        unit.id === id ? { ...unit, status } : unit
      ))
      toast.success(`Ad unit ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'saved as draft'}`)
    } catch (error) {
      toast.error('Failed to update ad unit status')
    }
  }

  const getTotalRevenue = () => {
    return adUnits.reduce((total, unit) => total + unit.performance.revenue, 0)
  }

  const getTotalImpressions = () => {
    return adUnits.reduce((total, unit) => total + unit.performance.impressions, 0)
  }

  const getAverageCTR = () => {
    const totalClicks = adUnits.reduce((total, unit) => total + unit.performance.clicks, 0)
    const totalImpressions = getTotalImpressions()
    return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  }

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Placement System</h1>
          <p className="text-gray-600">Manage and optimize your advertising campaigns</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
          >
            <Target className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
          <Button
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+12.5%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Impressions</p>
                    <p className="text-2xl font-bold">{getTotalImpressions().toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+8.3%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average CTR</p>
                    <p className="text-2xl font-bold">{getAverageCTR().toFixed(2)}%</p>
                  </div>
                  <MousePointer className="w-8 h-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">+2.1%</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Ads</p>
                    <p className="text-2xl font-bold">{adUnits.filter(u => u.status === 'active').length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600">of {adUnits.length} total</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Units Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Unit Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adUnits.map((unit) => {
                  const TypeIcon = AD_TYPES.find(t => t.value === unit.type)?.icon || ImageIcon
                  const FormatIcon = AD_FORMATS.find(f => f.value === unit.format)?.icon || Monitor
                  
                  return (
                    <div key={unit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className="w-4 h-4 text-gray-600" />
                            <FormatIcon className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold">{unit.name}</h3>
                            <Badge 
                              variant={unit.status === 'active' ? 'default' : unit.status === 'paused' ? 'secondary' : 'outline'}
                            >
                              {unit.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Impressions:</span>
                              <span className="font-semibold ml-1">{unit.performance.impressions.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Clicks:</span>
                              <span className="font-semibold ml-1">{unit.performance.clicks}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">CTR:</span>
                              <span className="font-semibold ml-1">{unit.performance.ctr}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-semibold ml-1">${unit.performance.revenue}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">CPM:</span>
                              <span className="font-semibold ml-1">${unit.performance.cpm}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAdUnitStatus(unit.id, unit.status === 'active' ? 'paused' : 'active')}
                          >
                            {unit.status === 'active' ? (
                              <><Pause className="w-4 h-4 mr-1" /> Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-1" /> Activate</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAdUnit(unit)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Ad Tab */}
      {activeTab === 'create' && (
        <AdCreationForm
          onSubmit={createAdUnit}
          isCreating={isCreating}
        />
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <AdManagement
          adUnits={adUnits}
          onUpdateStatus={updateAdUnitStatus}
          onSelectUnit={setSelectedAdUnit}
        />
      )}

      {/* Ad Unit Editor Modal */}
      {selectedAdUnit && (
        <AdUnitEditor
          adUnit={selectedAdUnit}
          onClose={() => setSelectedAdUnit(null)}
          onSave={(updatedUnit) => {
            setAdUnits(prev => prev.map(unit => 
              unit.id === updatedUnit.id ? updatedUnit : unit
            ))
            setSelectedAdUnit(null)
            toast.success('Ad unit updated successfully')
          }}
        />
      )}
    </div>
  )
}

// Ad Creation Form Component
interface AdCreationFormProps {
  onSubmit: (adUnit: Partial<AdUnit>) => void
  isCreating: boolean
}

const AdCreationForm: React.FC<AdCreationFormProps> = ({ onSubmit, isCreating }) => {
  const [formData, setFormData] = useState<Partial<AdUnit>>({
    name: '',
    type: 'banner',
    format: 'responsive',
    size: '300x250',
    position: 'sidebar',
    targeting: {
      demographics: [],
      interests: [],
      locations: [],
      devices: []
    },
    content: {
      title: '',
      description: '',
      callToAction: '',
      landingUrl: ''
    },
    schedule: {
      startDate: new Date(),
      budget: 1000,
      dailyBudget: 10
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Ad Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Ad Unit Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Homepage Banner"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Ad Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="size">Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_SIZES[formData.type as keyof typeof AD_SIZES]?.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_POSITIONS.map(position => (
                    <SelectItem key={position} value={position}>
                      {position.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Ad Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.content?.title || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, title: e.target.value }
                  }))}
                  placeholder="Find Your Dream Car"
                />
              </div>
              
              <div>
                <Label htmlFor="cta">Call to Action</Label>
                <Input
                  id="cta"
                  value={formData.content?.callToAction || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, callToAction: e.target.value }
                  }))}
                  placeholder="Browse Now"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.content?.description || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: { ...prev.content, description: e.target.value }
                }))}
                placeholder="Browse thousands of quality vehicles"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="landingUrl">Landing URL</Label>
              <Input
                id="landingUrl"
                value={formData.content?.landingUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: { ...prev.content, landingUrl: e.target.value }
                }))}
                placeholder="/listings"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Budget & Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Total Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.schedule?.budget || 0}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule!, budget: Number(e.target.value) }
                  }))}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                <Input
                  id="dailyBudget"
                  type="number"
                  value={formData.schedule?.dailyBudget || 0}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule!, dailyBudget: Number(e.target.value) }
                  }))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ad Unit'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Ad Management Component
interface AdManagementProps {
  adUnits: AdUnit[]
  onUpdateStatus: (id: string, status: 'active' | 'paused' | 'draft') => void
  onSelectUnit: (unit: AdUnit) => void
}

const AdManagement: React.FC<AdManagementProps> = ({
  adUnits,
  onUpdateStatus,
  onSelectUnit
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'ctr' | 'impressions'>('revenue')

  const filteredUnits = adUnits
    .filter(unit => filter === 'all' || unit.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'revenue':
          return b.performance.revenue - a.performance.revenue
        case 'ctr':
          return b.performance.ctr - a.performance.ctr
        case 'impressions':
          return b.performance.impressions - a.performance.impressions
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ad Units</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Sort by Revenue</SelectItem>
            <SelectItem value="ctr">Sort by CTR</SelectItem>
            <SelectItem value="impressions">Sort by Impressions</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{unit.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={unit.status === 'active' ? 'default' : unit.status === 'paused' ? 'secondary' : 'outline'}
                  >
                    {unit.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {unit.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                    {unit.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {unit.status}
                  </Badge>
                  <Badge variant="outline">
                    {unit.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold ml-1">${unit.performance.revenue}</span>
                </div>
                <div>
                  <span className="text-gray-600">CTR:</span>
                  <span className="font-semibold ml-1">{unit.performance.ctr}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Impressions:</span>
                  <span className="font-semibold ml-1">{unit.performance.impressions.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">CPM:</span>
                  <span className="font-semibold ml-1">${unit.performance.cpm}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(unit.id, unit.status === 'active' ? 'paused' : 'active')}
                  className="flex-1"
                >
                  {unit.status === 'active' ? (
                    <><Pause className="w-4 h-4 mr-1" /> Pause</>
                  ) : (
                    <><Play className="w-4 h-4 mr-1" /> Activate</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectUnit(unit)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Ad Unit Editor Component (placeholder)
interface AdUnitEditorProps {
  adUnit: AdUnit
  onClose: () => void
  onSave: (unit: AdUnit) => void
}

const AdUnitEditor: React.FC<AdUnitEditorProps> = ({ adUnit, onClose, onSave }) => {
  // This would be a modal/dialog component for editing ad units
  // For now, just close and show a toast
  React.useEffect(() => {
    toast.info('Ad unit editor would open here')
    onClose()
  }, [])

  return null
}

export default AdPlacementSystem