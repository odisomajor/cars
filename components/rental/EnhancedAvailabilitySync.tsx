'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Calendar,
  Activity,
  Settings,
  Zap,
  Database,
  Sync,
  TrendingUp,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'

interface SyncStatus {
  isOnline: boolean
  lastSync: string
  nextSync: string
  syncInterval: number
  autoSync: boolean
  syncInProgress: boolean
  failedAttempts: number
  totalSyncs: number
  successRate: number
}

interface VehicleAvailability {
  vehicleId: string
  vehicleName: string
  lastUpdated: string
  syncStatus: 'synced' | 'pending' | 'error' | 'conflict'
  conflictCount: number
  bookingCount: number
  availableDays: number
  revenue: number
}

interface SyncConflict {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  conflictType: 'double_booking' | 'pricing_mismatch' | 'availability_conflict'
  description: string
  localValue: any
  remoteValue: any
  resolved: boolean
}

interface EnhancedAvailabilitySyncProps {
  vehicleIds?: string[]
  onSyncComplete?: (results: any) => void
  className?: string
}

const SYNC_INTERVALS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
  { value: 900000, label: '15 minutes' },
  { value: 1800000, label: '30 minutes' },
  { value: 3600000, label: '1 hour' }
]

export default function EnhancedAvailabilitySync({
  vehicleIds = [],
  onSyncComplete,
  className = ''
}: EnhancedAvailabilitySyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: '',
    nextSync: '',
    syncInterval: 300000, // 5 minutes default
    autoSync: true,
    syncInProgress: false,
    failedAttempts: 0,
    totalSyncs: 0,
    successRate: 100
  })

  const [vehicleAvailability, setVehicleAvailability] = useState<VehicleAvailability[]>([])
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([])
  const [syncProgress, setSyncProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('status')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // WebSocket connection for real-time updates
  const [ws, setWs] = useState<WebSocket | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws/availability`
      
      const websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('WebSocket connected for availability sync')
        setWs(websocket)
      }
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setWs(null)
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (syncStatus.autoSync) {
            // Reinitialize connection
          }
        }, 5000)
      }
      
      return () => {
        websocket.close()
      }
    }
  }, [])

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'availability_update':
        updateVehicleAvailability(data.vehicleId, data.availability)
        break
      case 'booking_created':
      case 'booking_cancelled':
        triggerSync([data.vehicleId])
        break
      case 'sync_conflict':
        addSyncConflict(data.conflict)
        break
      case 'sync_status':
        updateSyncStatus(data.status)
        break
    }
  }

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      if (syncStatus.autoSync) {
        triggerSync()
      }
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncStatus.autoSync])

  // Auto-sync interval
  useEffect(() => {
    if (!syncStatus.autoSync || !syncStatus.isOnline) return

    const interval = setInterval(() => {
      triggerSync()
    }, syncStatus.syncInterval)

    return () => clearInterval(interval)
  }, [syncStatus.autoSync, syncStatus.isOnline, syncStatus.syncInterval])

  // Update next sync time
  useEffect(() => {
    if (syncStatus.autoSync && syncStatus.lastSync) {
      const nextSyncTime = new Date(new Date(syncStatus.lastSync).getTime() + syncStatus.syncInterval)
      setSyncStatus(prev => ({ ...prev, nextSync: nextSyncTime.toISOString() }))
    }
  }, [syncStatus.lastSync, syncStatus.syncInterval, syncStatus.autoSync])

  // Trigger sync for specific vehicles or all
  const triggerSync = useCallback(async (specificVehicleIds?: string[]) => {
    if (syncStatus.syncInProgress) return

    const vehiclesToSync = specificVehicleIds || vehicleIds
    if (vehiclesToSync.length === 0) return

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }))
    setSyncProgress(0)

    try {
      const response = await fetch('/api/rental/availability/enhanced-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleIds: vehiclesToSync,
          fullSync: !specificVehicleIds // Full sync if no specific vehicles
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update vehicle availability
        setVehicleAvailability(result.vehicleAvailability || [])
        
        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          setSyncConflicts(prev => [...prev, ...result.conflicts])
          toast.warning(`${result.conflicts.length} sync conflicts detected`)
        }
        
        // Update sync status
        setSyncStatus(prev => ({
          ...prev,
          syncInProgress: false,
          lastSync: new Date().toISOString(),
          failedAttempts: 0,
          totalSyncs: prev.totalSyncs + 1,
          successRate: ((prev.totalSyncs * prev.successRate / 100) + 1) / (prev.totalSyncs + 1) * 100
        }))
        
        setSyncProgress(100)
        onSyncComplete?.(result)
        
        if (result.updatedCount > 0) {
          toast.success(`Synchronized ${result.updatedCount} vehicles`)
        }
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        failedAttempts: prev.failedAttempts + 1,
        totalSyncs: prev.totalSyncs + 1,
        successRate: (prev.totalSyncs * prev.successRate / 100) / (prev.totalSyncs + 1) * 100
      }))
      
      toast.error('Failed to synchronize availability')
    }
  }, [vehicleIds, syncStatus.syncInProgress, onSyncComplete])

  // Update vehicle availability
  const updateVehicleAvailability = (vehicleId: string, availability: any) => {
    setVehicleAvailability(prev => 
      prev.map(vehicle => 
        vehicle.vehicleId === vehicleId 
          ? { ...vehicle, ...availability, lastUpdated: new Date().toISOString() }
          : vehicle
      )
    )
  }

  // Add sync conflict
  const addSyncConflict = (conflict: SyncConflict) => {
    setSyncConflicts(prev => {
      const existing = prev.find(c => c.id === conflict.id)
      if (existing) return prev
      return [...prev, conflict]
    })
  }

  // Update sync status
  const updateSyncStatus = (status: Partial<SyncStatus>) => {
    setSyncStatus(prev => ({ ...prev, ...status }))
  }

  // Resolve conflict
  const resolveConflict = async (conflictId: string, resolution: 'local' | 'remote') => {
    try {
      const response = await fetch('/api/rental/availability/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId, resolution })
      })

      if (response.ok) {
        setSyncConflicts(prev => 
          prev.map(conflict => 
            conflict.id === conflictId 
              ? { ...conflict, resolved: true }
              : conflict
          )
        )
        toast.success('Conflict resolved successfully')
      }
    } catch (error) {
      toast.error('Failed to resolve conflict')
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sync className="h-5 w-5" />
              Real-time Availability Sync
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={syncStatus.isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
                {syncStatus.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Button
                onClick={() => triggerSync()}
                disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {syncStatus.syncInProgress ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="font-medium">{formatTimeAgo(syncStatus.lastSync)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="font-medium">{syncStatus.successRate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Syncs</p>
              <p className="font-medium">{syncStatus.totalSyncs}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Conflicts</p>
              <p className="font-medium text-red-600">{syncConflicts.filter(c => !c.resolved).length}</p>
            </div>
          </div>
          
          {syncStatus.syncInProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Synchronizing...</span>
                <span className="text-sm font-medium">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sync Status</p>
                    <p className="font-medium">
                      {syncStatus.syncInProgress ? 'Syncing...' : 'Ready'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Sync</p>
                    <p className="font-medium">
                      {syncStatus.autoSync ? formatTimeAgo(syncStatus.nextSync) : 'Manual'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance</p>
                    <p className="font-medium">
                      {syncStatus.failedAttempts === 0 ? 'Excellent' : 
                       syncStatus.failedAttempts < 3 ? 'Good' : 'Poor'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleAvailability.map(vehicle => (
              <Card key={vehicle.vehicleId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{vehicle.vehicleName}</h3>
                    <Badge 
                      variant={vehicle.syncStatus === 'synced' ? 'default' : 
                              vehicle.syncStatus === 'error' ? 'destructive' : 'secondary'}
                    >
                      {vehicle.syncStatus === 'synced' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {vehicle.syncStatus === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                      {vehicle.syncStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {vehicle.syncStatus === 'conflict' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {vehicle.syncStatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span>{formatTimeAgo(vehicle.lastUpdated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span>{vehicle.bookingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Days:</span>
                      <span>{vehicle.availableDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${vehicle.revenue.toLocaleString()}</span>
                    </div>
                    {vehicle.conflictCount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Conflicts:</span>
                        <span>{vehicle.conflictCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => triggerSync([vehicle.vehicleId])}
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    disabled={syncStatus.syncInProgress}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Vehicle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {syncConflicts.filter(c => !c.resolved).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Conflicts</h3>
                <p className="text-gray-600">All availability data is synchronized successfully.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {syncConflicts.filter(c => !c.resolved).map(conflict => (
                <Card key={conflict.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{conflict.vehicleName}</h3>
                        <p className="text-sm text-gray-600">{conflict.date}</p>
                      </div>
                      <Badge variant="destructive">
                        {conflict.conflictType.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-4">{conflict.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-800">Local Value</p>
                        <p className="text-sm text-blue-600">
                          {JSON.stringify(conflict.localValue)}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded">
                        <p className="text-sm font-medium text-orange-800">Remote Value</p>
                        <p className="text-sm text-orange-600">
                          {JSON.stringify(conflict.remoteValue)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => resolveConflict(conflict.id, 'local')}
                        size="sm"
                        variant="outline"
                      >
                        Use Local
                      </Button>
                      <Button
                        onClick={() => resolveConflict(conflict.id, 'remote')}
                        size="sm"
                        variant="outline"
                      >
                        Use Remote
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Auto Sync</Label>
                  <p className="text-sm text-gray-600">Automatically sync availability data</p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={syncStatus.autoSync}
                  onCheckedChange={(checked) => 
                    setSyncStatus(prev => ({ ...prev, autoSync: checked }))
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="sync-interval">Sync Interval</Label>
                <Select 
                  value={syncStatus.syncInterval.toString()}
                  onValueChange={(value) => 
                    setSyncStatus(prev => ({ ...prev, syncInterval: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYNC_INTERVALS.map(interval => (
                      <SelectItem key={interval.value} value={interval.value.toString()}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="advanced-settings">Advanced Settings</Label>
                  <p className="text-sm text-gray-600">Show advanced configuration options</p>
                </div>
                <Switch
                  id="advanced-settings"
                  checked={showAdvancedSettings}
                  onCheckedChange={setShowAdvancedSettings}
                />
              </div>
              
              {showAdvancedSettings && (
                <div className="space-y-4 p-4 bg-gray-50 rounded">
                  <div>
                    <Label>WebSocket Connection</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={ws ? 'default' : 'destructive'}>
                        {ws ? 'Connected' : 'Disconnected'}
                      </Badge>
                      {!ws && (
                        <Button size="sm" variant="outline">
                          Reconnect
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Sync Statistics</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-gray-600">Failed Attempts:</p>
                        <p className="font-medium">{syncStatus.failedAttempts}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Syncs:</p>
                        <p className="font-medium">{syncStatus.totalSyncs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}