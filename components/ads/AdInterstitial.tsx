'use client'

import React, { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdInterstitialProps {
  isOpen: boolean
  onClose: () => void
  adContent: {
    title: string
    description: string
    imageUrl?: string
    ctaText: string
    ctaUrl: string
    advertiser: string
  }
  autoCloseDelay?: number
  showSkipButton?: boolean
  skipDelay?: number
  className?: string
}

const AdInterstitial: React.FC<AdInterstitialProps> = ({
  isOpen,
  onClose,
  adContent,
  autoCloseDelay,
  showSkipButton = true,
  skipDelay = 5,
  className
}) => {
  const [countdown, setCountdown] = useState(skipDelay)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    // Start countdown for skip button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Auto close if specified
    let autoCloseTimer: NodeJS.Timeout
    if (autoCloseDelay) {
      autoCloseTimer = setTimeout(() => {
        onClose()
      }, autoCloseDelay * 1000)
    }

    return () => {
      clearInterval(timer)
      if (autoCloseTimer) clearTimeout(autoCloseTimer)
    }
  }, [isOpen, skipDelay, autoCloseDelay, onClose])

  useEffect(() => {
    if (isOpen) {
      setCountdown(skipDelay)
      setCanSkip(false)
    }
  }, [isOpen, skipDelay])

  const handleCtaClick = () => {
    window.open(adContent.ctaUrl, '_blank')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <Card className={cn('w-full max-w-md mx-4', className)}>
        <CardContent className="p-6">
          {/* Close button */}
          {showSkipButton && (
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={!canSkip}
                className="p-1 h-8 w-8"
              >
                {canSkip ? (
                  <X className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{countdown}</span>
                )}
              </Button>
            </div>
          )}

          {/* Ad content */}
          <div className="text-center space-y-4">
            {adContent.imageUrl && (
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={adContent.imageUrl}
                  alt={adContent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {adContent.title}
              </h3>
              <p className="text-gray-600">
                {adContent.description}
              </p>
            </div>

            <Button
              onClick={handleCtaClick}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {adContent.ctaText}
            </Button>

            <p className="text-xs text-gray-400">
              Ad by {adContent.advertiser}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdInterstitial