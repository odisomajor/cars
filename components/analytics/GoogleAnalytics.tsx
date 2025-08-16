'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export default function GoogleAnalytics({ 
  measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID 
}: GoogleAnalyticsProps) {
  useEffect(() => {
    if (measurementId && typeof window !== 'undefined') {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments)
      }
      
      // Make gtag available globally
      window.gtag = gtag
      
      // Initialize GA
      gtag('js', new Date())
      gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        // Enhanced ecommerce settings
        custom_map: {
          dimension1: 'user_type', // buyer, seller, dealer
          dimension2: 'listing_type', // sale, rental
          dimension3: 'car_brand',
          dimension4: 'price_range',
          dimension5: 'location'
        }
      })
      
      // Track initial page view
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
    }
  }, [measurementId])

  if (!measurementId) {
    console.warn('Google Analytics: No measurement ID provided')
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              custom_map: {
                dimension1: 'user_type',
                dimension2: 'listing_type', 
                dimension3: 'car_brand',
                dimension4: 'price_range',
                dimension5: 'location'
              }
            });
          `,
        }}
      />
    </>
  )
}

// Analytics tracking utilities
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.origin + url
    })
  }
}

export const trackCarView = (carId: string, brand: string, model: string, price: number, type: 'sale' | 'rental') => {
  trackEvent('view_item', {
    item_id: carId,
    item_name: `${brand} ${model}`,
    item_category: type,
    item_brand: brand,
    price: price,
    currency: 'KES'
  })
}

export const trackCarInquiry = (carId: string, brand: string, model: string, price: number, inquiryType: 'call' | 'message' | 'email') => {
  trackEvent('generate_lead', {
    item_id: carId,
    item_name: `${brand} ${model}`,
    item_brand: brand,
    price: price,
    currency: 'KES',
    method: inquiryType
  })
}

export const trackSearch = (searchTerm: string, filters?: Record<string, any>) => {
  trackEvent('search', {
    search_term: searchTerm,
    ...filters
  })
}

export const trackListingCreation = (listingType: 'sale' | 'rental', tier: 'basic' | 'featured' | 'premium' | 'spotlight') => {
  trackEvent('create_listing', {
    listing_type: listingType,
    tier: tier
  })
}

export const trackBooking = (carId: string, brand: string, model: string, bookingType: 'viewing' | 'test_drive') => {
  trackEvent('book_appointment', {
    item_id: carId,
    item_name: `${brand} ${model}`,
    item_brand: brand,
    booking_type: bookingType
  })
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}