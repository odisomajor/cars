'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Smartphone,
  Monitor,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  Eye,
  MousePointer,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Star,
  Heart,
  Share2,
  Download,
  Gift,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  Crown,
  Award,
  Percent,
  ShoppingBag,
  Camera,
  Video,
  Image as ImageIcon,
  FileText,
  Music,
  Headphones,
  Gamepad2,
  Coffee,
  Utensils,
  Home,
  Building,
  Briefcase,
  GraduationCap,
  Plane,
  ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MobileAd {
  id: string
  title: string
  description: string
  imageUrl: string
  videoUrl?: string
  actionText: string
  actionUrl: string
  advertiser: string
  category: string
  format: 'banner' | 'native' | 'interstitial' | 'rewarded' | 'video'
  placement: 'top' | 'bottom' | 'inline' | 'fullscreen' | 'overlay'
  targetAudience: string[]
  budget: number
  bidAmount: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  isActive: boolean
  startDate: Date
  endDate: Date
  createdAt: Date
}

interface AdPerformance {
  adId: string
  date: string
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpm: number
  viewability: number
  completionRate?: number
}

interface MobileAdIntegrationProps {
  className?: string
  placement?: 'top' | 'bottom' | 'inline' | 'fullscreen' | 'overlay'
  format?: 'banner' | 'native' | 'interstitial' | 'rewarded' | 'video'
  showControls?: boolean
  autoPlay?: boolean
  muted?: boolean
  onAdClick?: (ad: MobileAd) => void
  onAdImpression?: (ad: MobileAd) => void
  onAdComplete?: (ad: MobileAd) => void
}

const MOCK_ADS: MobileAd[] = [
  {
    id: 'ad_001',
    title: 'Premium Car Rental - 50% Off',
    description: 'Book luxury cars at unbeatable prices. Limited time offer!',
    imageUrl: '/images/ads/premium-rental.jpg',
    videoUrl: '/videos/ads/premium-rental.mp4',
    actionText: 'Book Now',
    actionUrl: '/rentals/premium',
    advertiser: 'LuxuryRentals Co.',
    category: 'Automotive',
    format: 'native',
    placement: 'inline',
    targetAudience: ['premium_users', 'car_enthusiasts'],
    budget: 5000,
    bidAmount: 2.50,
    impressions: 12500,
    clicks: 375,
    conversions: 45,
    revenue: 1125,
    ctr: 3.0,
    cpm: 90,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    createdAt: new Date('2023-12-15')
  },
  {
    id: 'ad_002',
    title: 'Download CarFinder App',
    description: 'Find your perfect car with our AI-powered search. Get the app now!',
    imageUrl: '/images/ads/app-download.jpg',
    actionText: 'Download Free',
    actionUrl: '/app/download',
    advertiser: 'CarFinder Inc.',
    category: 'Mobile App',
    format: 'banner',
    placement: 'bottom',
    targetAudience: ['mobile_users', 'car_buyers'],
    budget: 3000,
    bidAmount: 1.80,
    impressions: 8750,
    clicks: 262,
    conversions: 89,
    revenue: 472,
    ctr: 3.0,
    cpm: 54,
    isActive: true,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-10'),
    createdAt: new Date('2024-01-05')
  },
  {
    id: 'ad_003',
    title: 'Win a Tesla Model 3!',
    description: 'Complete this survey and enter to win a brand new Tesla Model 3',
    imageUrl: '/images/ads/tesla-giveaway.jpg',
    videoUrl: '/videos/ads/tesla-giveaway.mp4',
    actionText: 'Enter Contest',
    actionUrl: '/contests/tesla-giveaway',
    advertiser: 'Tesla Motors',
    category: 'Contest',
    format: 'rewarded',
    placement: 'fullscreen',
    targetAudience: ['all_users'],
    budget: 10000,
    bidAmount: 5.00,
    impressions: 25000,
    clicks: 1250,
    conversions: 2500,
    revenue: 12500,
    ctr: 5.0,
    cpm: 400,
    isActive: true,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    createdAt: new Date('2024-01-10')
  }
]

const AD_PERFORMANCE: AdPerformance[] = [
  {
    adId: 'ad_001',
    date: '2024-01-18',
    impressions: 1250,
    clicks: 37,
    conversions: 4,
    revenue: 92.50,
    ctr: 2.96,
    cpm: 74,
    viewability: 85.2,
    completionRate: 78.5
  },
  {
    adId: 'ad_002',
    date: '2024-01-18',
    impressions: 875,
    clicks: 26,
    conversions: 8,
    revenue: 46.80,
    ctr: 2.97,
    cpm: 53.5,
    viewability: 92.1
  },
  {
    adId: 'ad_003',
    date: '2024-01-18',
    impressions: 2500,
    clicks: 125,
    conversions: 250,
    revenue: 1250,
    ctr: 5.0,
    cpm: 500,
    viewability: 96.8,
    completionRate: 89.2
  }
]

export const MobileBannerAd: React.FC<{ ad: MobileAd; onAdClick?: (ad: MobileAd) => void; onAdImpression?: (ad: MobileAd) => void }> = ({ 
  ad, 
  onAdClick, 
  onAdImpression 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [hasImpressed, setHasImpressed] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasImpressed && adRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasImpressed(true)
            onAdImpression?.(ad)
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(adRef.current)
      return () => observer.disconnect()
    }
  }, [ad, hasImpressed, onAdImpression])

  const handleClick = () => {
    onAdClick?.(ad)
    window.open(ad.actionUrl, '_blank')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div 
      ref={adRef}
      className={cn(
        'relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg overflow-hidden shadow-lg',
        ad.placement === 'top' && 'mb-4',
        ad.placement === 'bottom' && 'mt-4 sticky bottom-4 z-50'
      )}
    >
      <div className="flex items-center p-4 cursor-pointer" onClick={handleClick}>
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <Car className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{ad.title}</h3>
          <p className="text-xs opacity-90 truncate">{ad.description}</p>
          <Badge variant="secondary" className="mt-1 text-xs">
            {ad.advertiser}
          </Badge>
        </div>
        
        <Button size="sm" variant="secondary" className="ml-3">
          {ad.actionText}
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="ml-2 p-1 h-auto text-white/70 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="absolute top-1 right-1">
        <Badge variant="outline" className="text-xs bg-black/20 border-white/30 text-white">
          Ad
        </Badge>
      </div>
    </div>
  )
}

export const MobileNativeAd: React.FC<{ ad: MobileAd; variant?: 'feed' | 'content'; onAdClick?: (ad: MobileAd) => void }> = ({ 
  ad, 
  variant = 'feed',
  onAdClick 
}) => {
  const handleClick = () => {
    onAdClick?.(ad)
    window.open(ad.actionUrl, '_blank')
  }

  if (variant === 'feed') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <div className="relative">
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
            Sponsored
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{ad.title}</h3>
            <Badge variant="outline" className="text-xs">
              {ad.category}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building className="w-4 h-4" />
              <span>{ad.advertiser}</span>
            </div>
            
            <Button size="sm">
              {ad.actionText}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={handleClick}>
      <div className="flex items-start gap-3">
        <img 
          src={ad.imageUrl} 
          alt={ad.title}
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-sm">{ad.title}</h4>
            <Badge variant="outline" className="text-xs ml-2">
              Ad
            </Badge>
          </div>
          
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">{ad.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{ad.advertiser}</span>
            <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto">
              {ad.actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MobileInterstitialAd: React.FC<{ 
  ad: MobileAd; 
  isOpen: boolean; 
  onClose: () => void; 
  onAdClick?: (ad: MobileAd) => void 
}> = ({ ad, isOpen, onClose, onAdClick }) => {
  const [countdown, setCountdown] = useState(5)
  const [canClose, setCanClose] = useState(false)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanClose(true)
    }
  }, [isOpen, countdown])

  useEffect(() => {
    if (isOpen) {
      setCountdown(5)
      setCanClose(false)
    }
  }, [isOpen])

  const handleClick = () => {
    onAdClick?.(ad)
    window.open(ad.actionUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full overflow-hidden shadow-2xl">
        <div className="relative">
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-64 object-cover"
          />
          
          <div className="absolute top-2 right-2">
            {canClose ? (
              <Button 
                size="sm" 
                variant="secondary" 
                className="p-1 h-auto"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            ) : (
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                {countdown}s
              </div>
            )}
          </div>
          
          <Badge className="absolute top-2 left-2 bg-black/70 text-white text-xs">
            Advertisement
          </Badge>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
          <p className="text-gray-600 mb-4">{ad.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building className="w-4 h-4" />
              <span>{ad.advertiser}</span>
            </div>
            <Badge variant="outline">{ad.category}</Badge>
          </div>
          
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleClick}>
              {ad.actionText}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            {canClose && (
              <Button variant="outline" onClick={onClose}>
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const MobileRewardedAd: React.FC<{ 
  ad: MobileAd; 
  isOpen: boolean; 
  onClose: () => void; 
  onRewardEarned?: (reward: { type: string; amount: number }) => void;
  onAdClick?: (ad: MobileAd) => void 
}> = ({ ad, isOpen, onClose, onRewardEarned, onAdClick }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [reward] = useState({ type: 'coins', amount: 100 })
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0
      setProgress(0)
      setIsCompleted(false)
      setIsPlaying(false)
    }
  }, [isOpen])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
      
      if (progress >= 80 && !isCompleted) {
        setIsCompleted(true)
        onRewardEarned?.(reward)
        toast.success(`You earned ${reward.amount} ${reward.type}!`)
      }
    }
  }

  const handleClick = () => {
    onAdClick?.(ad)
    window.open(ad.actionUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <div className="flex items-center gap-3 text-white">
          <Gift className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium">Watch ad to earn {reward.amount} {reward.type}</span>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-white hover:bg-white/20"
          onClick={onClose}
          disabled={!isCompleted}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 relative">
        {ad.videoUrl ? (
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsCompleted(true)}
            poster={ad.imageUrl}
          >
            <source src={ad.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={ad.imageUrl} 
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Video Controls */}
        {ad.videoUrl && (
          <div className="absolute bottom-20 left-4 right-4">
            <div className="bg-black/70 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20 p-2"
                  onClick={isPlaying ? handlePause : handlePlay}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <div className="flex-1">
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <span className="text-white text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              
              {isCompleted && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Reward earned!</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Ad Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-lg p-4 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{ad.title}</h3>
              <Badge variant="outline" className="text-xs">
                {ad.advertiser}
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
            
            <Button className="w-full">
              {ad.actionText}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MobileAdIntegration: React.FC<MobileAdIntegrationProps> = ({
  className = '',
  placement = 'inline',
  format = 'native',
  showControls = true,
  autoPlay = false,
  muted = true,
  onAdClick,
  onAdImpression,
  onAdComplete
}) => {
  const [ads] = useState<MobileAd[]>(MOCK_ADS)
  const [currentAd, setCurrentAd] = useState<MobileAd | null>(null)
  const [showInterstitial, setShowInterstitial] = useState(false)
  const [showRewarded, setShowRewarded] = useState(false)
  const [adPerformance] = useState<AdPerformance[]>(AD_PERFORMANCE)
  const [activeTab, setActiveTab] = useState('ads')

  useEffect(() => {
    // Auto-select appropriate ad based on format and placement
    const suitableAds = ads.filter(ad => 
      ad.format === format && 
      ad.placement === placement && 
      ad.isActive
    )
    
    if (suitableAds.length > 0) {
      setCurrentAd(suitableAds[Math.floor(Math.random() * suitableAds.length)])
    }
  }, [ads, format, placement])

  const handleAdClick = (ad: MobileAd) => {
    onAdClick?.(ad)
    toast.success('Ad clicked! Redirecting...')
  }

  const handleAdImpression = (ad: MobileAd) => {
    onAdImpression?.(ad)
    console.log('Ad impression tracked:', ad.id)
  }

  const handleRewardEarned = (reward: { type: string; amount: number }) => {
    console.log('Reward earned:', reward)
  }

  const getTotalRevenue = () => {
    return adPerformance.reduce((sum, perf) => sum + perf.revenue, 0)
  }

  const getTotalImpressions = () => {
    return adPerformance.reduce((sum, perf) => sum + perf.impressions, 0)
  }

  const getTotalClicks = () => {
    return adPerformance.reduce((sum, perf) => sum + perf.clicks, 0)
  }

  const getAverageCTR = () => {
    const totalCTR = adPerformance.reduce((sum, perf) => sum + perf.ctr, 0)
    return totalCTR / adPerformance.length
  }

  if (!showControls && currentAd) {
    // Render just the ad component without controls
    switch (format) {
      case 'banner':
        return (
          <MobileBannerAd 
            ad={currentAd} 
            onAdClick={handleAdClick}
            onAdImpression={handleAdImpression}
          />
        )
      case 'native':
        return (
          <MobileNativeAd 
            ad={currentAd} 
            variant="feed"
            onAdClick={handleAdClick}
          />
        )
      case 'interstitial':
        return (
          <MobileInterstitialAd 
            ad={currentAd}
            isOpen={showInterstitial}
            onClose={() => setShowInterstitial(false)}
            onAdClick={handleAdClick}
          />
        )
      case 'rewarded':
        return (
          <MobileRewardedAd 
            ad={currentAd}
            isOpen={showRewarded}
            onClose={() => setShowRewarded(false)}
            onRewardEarned={handleRewardEarned}
            onAdClick={handleAdClick}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-8 h-8" />
            Mobile Ad Integration
          </h1>
          <p className="text-gray-600">Manage and optimize mobile ad formats for maximum revenue</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowInterstitial(true)}
            disabled={!ads.find(ad => ad.format === 'interstitial')}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Test Interstitial
          </Button>
          <Button 
            onClick={() => setShowRewarded(true)}
            disabled={!ads.find(ad => ad.format === 'rewarded')}
          >
            <Gift className="w-4 h-4 mr-2" />
            Test Rewarded
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ads">Ad Formats</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Ad Formats Tab */}
        <TabsContent value="ads" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
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
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clicks</p>
                    <p className="text-2xl font-bold">{getTotalClicks().toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MousePointer className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                    <p className="text-2xl font-bold">{getAverageCTR().toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Format Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Banner Ad Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Banner Ad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Compact banner ads that appear at the top or bottom of the screen</p>
                  
                  {ads.find(ad => ad.format === 'banner') && (
                    <MobileBannerAd 
                      ad={ads.find(ad => ad.format === 'banner')!} 
                      onAdClick={handleAdClick}
                      onAdImpression={handleAdImpression}
                    />
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Best for: Continuous visibility</span>
                    <Badge variant="outline">Non-intrusive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Native Ad Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Native Ad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Ads that blend naturally with your app's content</p>
                  
                  {ads.find(ad => ad.format === 'native') && (
                    <MobileNativeAd 
                      ad={ads.find(ad => ad.format === 'native')!} 
                      variant="content"
                      onAdClick={handleAdClick}
                    />
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Best for: User engagement</span>
                    <Badge variant="outline">High CTR</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interstitial Ad Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5" />
                  Interstitial Ad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Full-screen ads that appear at natural transition points</p>
                  
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      Full Screen Ad Preview
                    </div>
                    <Button 
                      className="mt-3" 
                      onClick={() => setShowInterstitial(true)}
                      disabled={!ads.find(ad => ad.format === 'interstitial')}
                    >
                      View Full Screen
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Best for: High impact</span>
                    <Badge variant="outline">Premium CPM</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewarded Ad Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Rewarded Ad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Users watch ads in exchange for in-app rewards</p>
                  
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white text-center">
                    <Gift className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold">Watch ad to earn 100 coins</p>
                    <Button 
                      variant="secondary" 
                      className="mt-3" 
                      onClick={() => setShowRewarded(true)}
                      disabled={!ads.find(ad => ad.format === 'rewarded')}
                    >
                      Start Rewarded Ad
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Best for: User retention</span>
                    <Badge variant="outline">High completion</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Format */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['banner', 'native', 'interstitial', 'rewarded'].map((format) => {
                    const formatAds = ads.filter(ad => ad.format === format)
                    const revenue = formatAds.reduce((sum, ad) => sum + ad.revenue, 0)
                    const percentage = (revenue / ads.reduce((sum, ad) => sum + ad.revenue, 0)) * 100
                    
                    return (
                      <div key={format} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            format === 'banner' && 'bg-blue-500',
                            format === 'native' && 'bg-green-500',
                            format === 'interstitial' && 'bg-purple-500',
                            format === 'rewarded' && 'bg-yellow-500'
                          )} />
                          <span className="capitalize font-medium">{format}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${revenue.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Ads */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((ad, index) => (
                      <div key={ad.id} className="flex items-center gap-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold',
                          index === 0 && 'bg-yellow-500',
                          index === 1 && 'bg-gray-400',
                          index === 2 && 'bg-orange-600'
                        )}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium text-sm">{ad.title}</p>
                          <p className="text-xs text-gray-500">{ad.advertiser}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-sm">${ad.revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{ad.ctr.toFixed(2)}% CTR</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ad</th>
                      <th className="text-left p-2">Format</th>
                      <th className="text-right p-2">Impressions</th>
                      <th className="text-right p-2">Clicks</th>
                      <th className="text-right p-2">CTR</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">CPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr key={ad.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{ad.title}</p>
                            <p className="text-xs text-gray-500">{ad.advertiser}</p>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {ad.format}
                          </Badge>
                        </td>
                        <td className="text-right p-2">{ad.impressions.toLocaleString()}</td>
                        <td className="text-right p-2">{ad.clicks.toLocaleString()}</td>
                        <td className="text-right p-2">{ad.ctr.toFixed(2)}%</td>
                        <td className="text-right p-2 font-semibold">${ad.revenue.toFixed(2)}</td>
                        <td className="text-right p-2">${ad.cpm.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ad Frequency */}
              <div>
                <h3 className="font-semibold mb-4">Ad Frequency</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="banner-frequency">Banner Ad Frequency</Label>
                    <Select defaultValue="always">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always Show</SelectItem>
                        <SelectItem value="every-page">Every Page</SelectItem>
                        <SelectItem value="every-3-pages">Every 3 Pages</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="interstitial-frequency">Interstitial Frequency</Label>
                    <Select defaultValue="every-5-actions">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="every-action">Every Action</SelectItem>
                        <SelectItem value="every-3-actions">Every 3 Actions</SelectItem>
                        <SelectItem value="every-5-actions">Every 5 Actions</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Ad Targeting */}
              <div>
                <h3 className="font-semibold mb-4">Ad Targeting</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location-targeting">Location-based Targeting</Label>
                    <Switch id="location-targeting" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interest-targeting">Interest-based Targeting</Label>
                    <Switch id="interest-targeting" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="behavioral-targeting">Behavioral Targeting</Label>
                    <Switch id="behavioral-targeting" />
                  </div>
                </div>
              </div>

              {/* Revenue Optimization */}
              <div>
                <h3 className="font-semibold mb-4">Revenue Optimization</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-optimization">Auto-optimize Ad Placement</Label>
                    <Switch id="auto-optimization" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="a-b-testing">Enable A/B Testing</Label>
                    <Switch id="a-b-testing" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="real-time-bidding">Real-time Bidding</Label>
                    <Switch id="real-time-bidding" />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interstitial Ad Modal */}
      {ads.find(ad => ad.format === 'interstitial') && (
        <MobileInterstitialAd 
          ad={ads.find(ad => ad.format === 'interstitial')!}
          isOpen={showInterstitial}
          onClose={() => setShowInterstitial(false)}
          onAdClick={handleAdClick}
        />
      )}

      {/* Rewarded Ad Modal */}
      {ads.find(ad => ad.format === 'rewarded') && (
        <MobileRewardedAd 
          ad={ads.find(ad => ad.format === 'rewarded')!}
          isOpen={showRewarded}
          onClose={() => setShowRewarded(false)}
          onRewardEarned={handleRewardEarned}
          onAdClick={handleAdClick}
        />
      )}
    </div>
  )
}

export { MobileAdIntegration }
export default MobileAdIntegration