'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Car, Search, Heart, User, Home, Clock } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }
    const handleOffline = () => {
      setIsOnline(false)
      setLastOnline(new Date())
    }

    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setLastOnline(new Date())
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const formatLastOnline = () => {
    if (!lastOnline) return ''
    const now = new Date()
    const diff = now.getTime() - lastOnline.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return '1 hour ago'
    return `${hours} hours ago`
  }

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
            </div>
            <CardTitle className="text-green-600">Back Online!</CardTitle>
            <CardDescription>
              Your connection has been restored. You can now browse all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            <p className="text-sm text-green-600">
              All features are now available. Your offline actions will be synced.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-gray-800">You're Offline</CardTitle>
          <CardDescription>
            No internet connection detected. Some features may not be available.
          </CardDescription>
          {lastOnline && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
              <Clock className="w-3 h-3" />
              Last online: {formatLastOnline()}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-3">Available offline features:</p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-xs">Cached listings</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Search className="w-4 h-4 text-green-600" />
                <span className="text-xs">Search history</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Heart className="w-4 h-4 text-red-600" />
                <span className="text-xs">Saved favorites</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-xs">Profile data</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection {retryCount > 0 && `(${retryCount})`}
            </Button>
            
            <div className="grid grid-cols-3 gap-2">
              <Link href="/" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  <Home className="w-4 h-4 mb-1" />
                  <span className="text-xs">Home</span>
                </Button>
              </Link>
              <Link href="/cars" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  <Car className="w-4 h-4 mb-1" />
                  <span className="text-xs">Cars</span>
                </Button>
              </Link>
              <Link href="/hire" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  <Search className="w-4 h-4 mb-1" />
                  <span className="text-xs">Rentals</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">
                🚀 Progressive Web App
              </p>
              <p className="text-xs text-blue-600">
                Kenya Car Marketplace works offline! Your actions will sync automatically when you're back online.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <p>Tip: Add this app to your home screen for the best experience!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}