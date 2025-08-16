'use client'

import { useEffect, useRef, useState } from 'react'

interface AdBannerProps {
  type: 'header' | 'sidebar' | 'footer'
  className?: string
  placeholder?: string
}

export default function AdBanner({ type, className = '', placeholder }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const isAdLoaded = useRef(false)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Set production mode on client side to avoid hydration mismatch
    setIsProduction(process.env.NODE_ENV === 'production')
    
    // Initialize Google AdSense ads when component mounts
    try {
      if (typeof window !== 'undefined' && 
          (window as any).adsbygoogle && 
          adRef.current && 
          !isAdLoaded.current) {
        
        // Check if the ad element already has ads
        const adElement = adRef.current.querySelector('ins.adsbygoogle')
        if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          isAdLoaded.current = true
        }
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  const getAdConfig = () => {
    switch (type) {
      case 'header':
        return {
          'data-ad-slot': 'YOUR_HEADER_AD_SLOT_ID',
          'data-ad-format': 'horizontal',
          style: { display: 'block', width: '728px', height: '60px' }
        }
      case 'sidebar':
        return {
          'data-ad-slot': 'YOUR_SIDEBAR_AD_SLOT_ID',
          'data-ad-format': 'rectangle',
          style: { display: 'block', width: '300px', height: '250px' }
        }
      case 'footer':
        return {
          'data-ad-slot': 'YOUR_FOOTER_AD_SLOT_ID',
          'data-ad-format': 'horizontal',
          style: { display: 'block', width: '728px', height: '60px' }
        }
      default:
        return {
          'data-ad-slot': 'YOUR_DEFAULT_AD_SLOT_ID',
          'data-ad-format': 'auto',
          style: { display: 'block' }
        }
    }
  }

  const adConfig = getAdConfig()

  return (
    <div ref={adRef} className={`flex justify-center ${className}`}>
      {/* Development/Preview Mode - Show placeholder */}
      {!isProduction ? (
        <div 
          className="ad-banner flex items-center justify-center text-center p-2"
          style={adConfig.style}
        >
          <div>
            <div className="text-secondary-500 font-medium mb-1 text-sm">
              {placeholder || 'Advertisement'}
            </div>
            <div className="text-xs text-secondary-400">
              Google Ads will appear here in production
            </div>
          </div>
        </div>
      ) : (
        /* Production Mode - Show actual Google Ads */
        <ins
          className="adsbygoogle"
          style={adConfig.style}
          data-ad-client="ca-pub-YOUR_ADSENSE_ID"
          data-ad-slot={adConfig['data-ad-slot']}
          data-ad-format={adConfig['data-ad-format']}
          data-full-width-responsive="true"
          suppressHydrationWarning={true}
        />
      )}
    </div>
  )
}

// Alternative component for responsive ads
export function ResponsiveAdBanner({ 
  className = '', 
  placeholder = 'Advertisement' 
}: { 
  className?: string
  placeholder?: string 
}) {
  const adRef = useRef<HTMLDivElement>(null)
  const isAdLoaded = useRef(false)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Set production mode on client side to avoid hydration mismatch
    setIsProduction(process.env.NODE_ENV === 'production')
    
    try {
      if (typeof window !== 'undefined' && 
          (window as any).adsbygoogle && 
          adRef.current && 
          !isAdLoaded.current) {
        
        // Check if the ad element already has ads
        const adElement = adRef.current.querySelector('ins.adsbygoogle')
        if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          isAdLoaded.current = true
        }
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div ref={adRef} className={`flex justify-center ${className}`}>
      {!isProduction ? (
        <div className="ad-banner w-full h-20 flex items-center justify-center text-center p-2">
          <div>
            <div className="text-secondary-500 font-medium mb-1 text-sm">
              {placeholder}
            </div>
            <div className="text-xs text-secondary-400">
              Responsive Google Ads will appear here in production
            </div>
          </div>
        </div>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_ADSENSE_ID"
          data-ad-slot="YOUR_RESPONSIVE_AD_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
          suppressHydrationWarning={true}
        />
      )}
    </div>
  )
}