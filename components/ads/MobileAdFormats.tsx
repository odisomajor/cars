'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  Gift,
  Star,
  ExternalLink,
  Heart,
  Share2,
  MessageCircle,
  Eye,
  Clock,
  Zap,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AdContent {
  id: string
  title: string
  description: string
  imageUrl?: string
  videoUrl?: string
  callToAction: string
  landingUrl: string
  brand: string
  duration?: number
  reward?: {
    type: 'coins' | 'premium' | 'discount'
    amount: number
    description: string
  }
}

interface MobileAdFormatsProps {
  className?: string
  onAdClick?: (adId: string) => void
  onAdComplete?: (adId: string) => void
  onAdSkip?: (adId: string) => void
  onAdClose?: (adId: string) => void
}

// Sample ad content
const SAMPLE_ADS: AdContent[] = [
  {
    id: '1',
    title: 'Luxury Car Rental',
    description: 'Experience premium vehicles for your special occasions',
    imageUrl: '/api/placeholder/400/300',
    callToAction: 'Book Now',
    landingUrl: '/rentals/luxury',
    brand: 'Premium Rentals'
  },
  {
    id: '2',
    title: 'Car Insurance Deals',
    description: 'Save up to 40% on your car insurance with our partners',
    imageUrl: '/api/placeholder/400/300',
    callToAction: 'Get Quote',
    landingUrl: '/insurance',
    brand: 'InsureAuto'
  },
  {
    id: '3',
    title: 'Electric Vehicle Showcase',
    description: 'Discover the future of driving with our EV collection',
    videoUrl: '/api/placeholder/video/ev-showcase.mp4',
    callToAction: 'Explore EVs',
    landingUrl: '/listings?type=electric',
    brand: 'EcoWheels',
    duration: 30,
    reward: {
      type: 'coins',
      amount: 100,
      description: '100 coins for watching'
    }
  }
]

export const MobileAdFormats: React.FC<MobileAdFormatsProps> = ({
  className = '',
  onAdClick,
  onAdComplete,
  onAdSkip,
  onAdClose
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [showInterstitial, setShowInterstitial] = useState(false)
  const [showRewarded, setShowRewarded] = useState(false)
  const [showNative, setShowNative] = useState(true)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Demo Controls */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Mobile Ad Format Demo</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setShowInterstitial(true)}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Show Interstitial
            </Button>
            <Button
              size="sm"
              onClick={() => setShowRewarded(true)}
              className="flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Show Rewarded Ad
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNative(!showNative)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showNative ? 'Hide' : 'Show'} Native Ads
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banner Ad */}
      <MobileBannerAd
        ad={SAMPLE_ADS[0]}
        onAdClick={onAdClick}
      />

      {/* Native Ads */}
      {showNative && (
        <div className="space-y-4">
          <MobileNativeAd
            ad={SAMPLE_ADS[1]}
            variant="feed"
            onAdClick={onAdClick}
          />
          <MobileNativeAd
            ad={SAMPLE_ADS[0]}
            variant="content"
            onAdClick={onAdClick}
          />
        </div>
      )}

      {/* Interstitial Ad */}
      {showInterstitial && (
        <MobileInterstitialAd
          ad={SAMPLE_ADS[currentAdIndex]}
          onClose={() => {
            setShowInterstitial(false)
            onAdClose?.(SAMPLE_ADS[currentAdIndex].id)
          }}
          onAdClick={onAdClick}
        />
      )}

      {/* Rewarded Video Ad */}
      {showRewarded && (
        <MobileRewardedAd
          ad={SAMPLE_ADS[2]}
          onClose={() => {
            setShowRewarded(false)
            onAdClose?.(SAMPLE_ADS[2].id)
          }}
          onComplete={() => {
            onAdComplete?.(SAMPLE_ADS[2].id)
            toast.success('Reward earned: 100 coins!')
          }}
          onSkip={onAdSkip}
          onAdClick={onAdClick}
        />
      )}
    </div>
  )
}

// Mobile Banner Ad Component
interface MobileBannerAdProps {
  ad: AdContent
  onAdClick?: (adId: string) => void
  size?: 'small' | 'medium' | 'large'
}

const MobileBannerAd: React.FC<MobileBannerAdProps> = ({
  ad,
  onAdClick,
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClick = () => {
    onAdClick?.(ad.id)
    window.open(ad.landingUrl, '_blank')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  const sizeClasses = {
    small: 'h-16',
    medium: 'h-20',
    large: 'h-24'
  }

  return (
    <div className={cn(
      'relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden cursor-pointer',
      sizeClasses[size]
    )}>
      <div className="absolute top-1 right-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="flex items-center h-full p-3" onClick={handleClick}>
        {ad.imageUrl && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden mr-3">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">{ad.title}</h4>
          <p className="text-white/80 text-xs truncate">{ad.description}</p>
        </div>
        
        <Button
          size="sm"
          className="ml-2 bg-white text-blue-600 hover:bg-gray-100 text-xs px-3 py-1 h-auto"
        >
          {ad.callToAction}
        </Button>
      </div>
      
      <div className="absolute bottom-1 left-1">
        <Badge variant="secondary" className="text-xs px-1 py-0">
          Ad
        </Badge>
      </div>
    </div>
  )
}

// Mobile Native Ad Component
interface MobileNativeAdProps {
  ad: AdContent
  variant: 'feed' | 'content' | 'card'
  onAdClick?: (adId: string) => void
}

const MobileNativeAd: React.FC<MobileNativeAdProps> = ({
  ad,
  variant,
  onAdClick
}) => {
  const handleClick = () => {
    onAdClick?.(ad.id)
    window.open(ad.landingUrl, '_blank')
  }

  if (variant === 'feed') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  Sponsored
                </Badge>
                <span className="text-xs text-gray-500">{ad.brand}</span>
              </div>
              
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">{ad.title}</h4>
              <p className="text-gray-600 text-xs mb-2 line-clamp-2">{ad.description}</p>
              
              <div className="flex items-center justify-between">
                <Button size="sm" className="text-xs px-3 py-1 h-auto">
                  {ad.callToAction}
                </Button>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Heart className="w-4 h-4" />
                  <Share2 className="w-4 h-4" />
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'content') {
    return (
      <div className="bg-gray-50 rounded-lg p-4 cursor-pointer" onClick={handleClick}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Advertisement
          </Badge>
          <span className="text-xs text-gray-500">{ad.brand}</span>
        </div>
        
        <div className="aspect-video rounded-lg overflow-hidden mb-3">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h4 className="font-semibold mb-1">{ad.title}</h4>
        <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
        
        <Button className="w-full">
          {ad.callToAction}
        </Button>
      </div>
    )
  }

  return null
}

// Mobile Interstitial Ad Component
interface MobileInterstitialAdProps {
  ad: AdContent
  onClose: () => void
  onAdClick?: (adId: string) => void
}

const MobileInterstitialAd: React.FC<MobileInterstitialAdProps> = ({
  ad,
  onClose,
  onAdClick
}) => {
  const [countdown, setCountdown] = useState(5)
  const [canClose, setCanClose] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanClose(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleClick = () => {
    onAdClick?.(ad.id)
    window.open(ad.landingUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-lg overflow-hidden">
        {/* Close Button */}
        <div className="absolute top-2 right-2 z-10">
          {canClose ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <div className="h-8 w-8 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {countdown}
            </div>
          )}
        </div>

        {/* Ad Content */}
        <div className="cursor-pointer" onClick={handleClick}>
          <div className="aspect-square">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Sponsored
              </Badge>
              <span className="text-xs text-gray-500">{ad.brand}</span>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
            <p className="text-gray-600 mb-4">{ad.description}</p>
            
            <Button className="w-full" size="lg">
              {ad.callToAction}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile Rewarded Ad Component
interface MobileRewardedAdProps {
  ad: AdContent
  onClose: () => void
  onComplete: () => void
  onSkip?: (adId: string) => void
  onAdClick?: (adId: string) => void
}

const MobileRewardedAd: React.FC<MobileRewardedAdProps> = ({
  ad,
  onClose,
  onComplete,
  onSkip,
  onAdClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ad.duration || 30)
  const [canSkip, setCanSkip] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          setProgress(((ad.duration || 30) - newTime) / (ad.duration || 30) * 100)
          
          if (newTime <= 0) {
            onComplete()
            return 0
          }
          
          if (newTime <= (ad.duration || 30) - 5) {
            setCanSkip(true)
          }
          
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, ad.duration, onComplete])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSkip = () => {
    if (canSkip) {
      onSkip?.(ad.id)
      onClose()
    }
  }

  const handleClick = () => {
    onAdClick?.(ad.id)
    window.open(ad.landingUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold">Rewarded Ad</span>
          {ad.reward && (
            <Badge variant="secondary" className="text-xs">
              +{ad.reward.amount} {ad.reward.type}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <Clock className="w-4 h-4 inline mr-1" />
            {timeLeft}s
          </div>
          
          {canSkip && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleSkip}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {ad.videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={ad.videoUrl}
            muted={isMuted}
            onClick={handleClick}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={handleClick}>
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
        
        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/50 rounded-lg p-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-600 rounded-full h-1 mb-3">
              <div 
                className="bg-yellow-400 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/50 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{ad.title}</h3>
            <p className="text-sm text-gray-300">{ad.description}</p>
          </div>
          
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500"
            onClick={handleClick}
          >
            {ad.callToAction}
          </Button>
        </div>
        
        {ad.reward && (
          <div className="mt-2 text-center text-sm text-yellow-400">
            Watch to earn {ad.reward.description}
          </div>
        )}
      </div>
    </div>
  )
}

export {
  MobileBannerAd,
  MobileNativeAd,
  MobileInterstitialAd,
  MobileRewardedAd
}

export default MobileAdFormats