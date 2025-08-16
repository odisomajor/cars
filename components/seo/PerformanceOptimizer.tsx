'use client'

import { useEffect, useState } from 'react'
// import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalsMetrics {
  CLS: number | null
  INP: number | null
  FCP: number | null
  LCP: number | null
  TTFB: number | null
}

interface PerformanceOptimizerProps {
  enableAnalytics?: boolean
  enableLazyLoading?: boolean
  enableImageOptimization?: boolean
  enableResourceHints?: boolean
}

export default function PerformanceOptimizer({
  enableAnalytics = true,
  enableLazyLoading = true,
  enableImageOptimization = true,
  enableResourceHints = true
}: PerformanceOptimizerProps) {
  const [isClient, setIsClient] = useState(false)
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    CLS: null,
    INP: null,
    FCP: null,
    LCP: null,
    TTFB: null
  })

  useEffect(() => {
    setIsClient(true)
    setIsDevelopment(process.env.NODE_ENV === 'development')
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (enableAnalytics && typeof window !== 'undefined') {
      // Collect Web Vitals metrics
      // onCLS((metric) => {
      //   setMetrics(prev => ({ ...prev, CLS: metric.value }))
      //   sendToAnalytics('CLS', metric.value)
      // })

      // onINP((metric) => {
      //   setMetrics(prev => ({ ...prev, INP: metric.value }))
      //   sendToAnalytics('INP', metric.value)
      // })

      // onFCP((metric) => {
      //   setMetrics(prev => ({ ...prev, FCP: metric.value }))
      //   sendToAnalytics('FCP', metric.value)
      // })

      // onLCP((metric) => {
      //   setMetrics(prev => ({ ...prev, LCP: metric.value }))
      //   sendToAnalytics('LCP', metric.value)
      // })

      // onTTFB((metric) => {
      //   setMetrics(prev => ({ ...prev, TTFB: metric.value }))
      //   sendToAnalytics('TTFB', metric.value)
      // })
    }

    if (enableLazyLoading) {
      // Enable native lazy loading for images
      const images = document.querySelectorAll('img[data-src]')
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.getAttribute('data-src')
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
            }
          }
        })
      })

      images.forEach(img => imageObserver.observe(img))

      return () => {
        images.forEach(img => imageObserver.unobserve(img))
      }
    }

    if (enableResourceHints) {
      // Add resource hints for better performance
      addResourceHints()
    }

    if (enableImageOptimization) {
      // Optimize images on the fly
      optimizeImages()
    }
  }, [enableAnalytics, enableLazyLoading, enableImageOptimization, enableResourceHints])

  const sendToAnalytics = (metricName: string, value: number) => {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metricName, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true
      })
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metric: metricName,
        value,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(console.error)
  }

  const addResourceHints = () => {
    const hints = [
      // DNS prefetch for external domains
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//pagead2.googlesyndication.com' },
      
      // Preconnect for critical resources
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      
      // Prefetch for likely next pages
      { rel: 'prefetch', href: '/cars' },
      { rel: 'prefetch', href: '/hire' },
      { rel: 'prefetch', href: '/search' }
    ]

    hints.forEach(hint => {
      const existingLink = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)
      if (!existingLink) {
        const link = document.createElement('link')
        link.rel = hint.rel
        link.href = hint.href
        if ('crossorigin' in hint) {
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      }
    })
  }

  const optimizeImages = () => {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy'
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async'
      }

      // Add proper alt text if missing
      if (!img.hasAttribute('alt')) {
        img.alt = 'Car image'
      }
    })
  }

  return (
    <>
      {isMounted && isDevelopment && enableAnalytics && isClient && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div className="font-semibold mb-1">Web Vitals</div>
          <div>CLS: {metrics.CLS?.toFixed(3) || 'N/A'}</div>
          <div>INP: {metrics.INP ? `${Math.round(metrics.INP)}ms` : 'N/A'}</div>
          <div>FCP: {metrics.FCP ? `${Math.round(metrics.FCP)}ms` : 'N/A'}</div>
          <div>LCP: {metrics.LCP ? `${Math.round(metrics.LCP)}ms` : 'N/A'}</div>
          <div>TTFB: {metrics.TTFB ? `${Math.round(metrics.TTFB)}ms` : 'N/A'}</div>
        </div>
      )}
    </>
  )
}

// Utility function to preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    { href: '/fonts/poppins.woff2', as: 'font', type: 'font/woff2' },
    { href: '/images/hero-bg.webp', as: 'image' },
    { href: '/api/listings/featured', as: 'fetch' }
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.type) {
      link.type = resource.type
    }
    if (resource.as === 'font') {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

// Utility function to optimize third-party scripts
export function optimizeThirdPartyScripts() {
  if (typeof window === 'undefined') return

  // Delay non-critical scripts until user interaction
  const delayedScripts = [
    'https://www.googletagmanager.com/gtag/js'
  ]

  let userInteracted = false
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

  const loadDelayedScripts = () => {
    if (userInteracted) return
    userInteracted = true

    delayedScripts.forEach(src => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      document.head.appendChild(script)
    })

    events.forEach(event => {
      window.removeEventListener(event, loadDelayedScripts, { passive: true })
    })
  }

  events.forEach(event => {
    window.addEventListener(event, loadDelayedScripts, { passive: true })
  })

  // Fallback: load after 5 seconds
  setTimeout(loadDelayedScripts, 5000)
}

// Utility function to implement service worker for caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}