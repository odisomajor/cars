'use client'

import { useEffect, useCallback } from 'react'
// import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import { trackEvent } from './GoogleAnalytics'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

interface CoreWebVitalsProps {
  reportWebVitals?: boolean
  debug?: boolean
}

export default function CoreWebVitals({ 
  reportWebVitals = true, 
  debug = false 
}: CoreWebVitalsProps) {
  const sendToAnalytics = useCallback(async (metric: WebVitalMetric) => {
    if (!reportWebVitals) return

    const body = {
      metrics: [{
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
      }],
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    if (debug) {
      console.log('Web Vital:', body)
    }

    // Send to Google Analytics
    trackEvent('web_vital', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      custom_parameter_1: metric.navigationType
    })

    // Send to custom analytics endpoint
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (error) {
      if (debug) {
        console.error('Failed to send web vital to analytics:', error)
      }
    }
  }, [reportWebVitals, debug])

  useEffect(() => {
    if (!reportWebVitals) return

    // Collect all Core Web Vitals
    // onCLS(sendToAnalytics)
    // onFCP(sendToAnalytics)
    // onLCP(sendToAnalytics)
    // onTTFB(sendToAnalytics)
    
    // Get INP (Interaction to Next Paint) - newer metric replacing FID
    // onINP(sendToAnalytics)

    // Additional performance monitoring
    if (typeof window !== 'undefined' && window.performance) {
      // Monitor navigation timing
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationTiming) {
        const metrics = {
          dns_lookup: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
          tcp_connection: navigationTiming.connectEnd - navigationTiming.connectStart,
          server_response: navigationTiming.responseStart - navigationTiming.requestStart,
          dom_processing: navigationTiming.domContentLoadedEventStart - navigationTiming.responseEnd,
          resource_loading: navigationTiming.loadEventStart - navigationTiming.domContentLoadedEventEnd
        }

        // Track navigation timing metrics
        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            trackEvent('navigation_timing', {
              metric_name: name,
              metric_value: Math.round(value)
            })
          }
        })
      }

      // Monitor resource loading performance
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            
            // Track slow resources (> 1 second)
            if (resourceEntry.duration > 1000) {
              trackEvent('slow_resource', {
                resource_name: resourceEntry.name,
                resource_type: resourceEntry.initiatorType,
                duration: Math.round(resourceEntry.duration),
                size: resourceEntry.transferSize || 0
              })
            }
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['resource'] })
      } catch (error) {
        if (debug) {
          console.warn('Performance Observer not supported:', error)
        }
      }

      // Cleanup observer on unmount
      return () => {
        observer.disconnect()
      }
    }
  }, [sendToAnalytics, reportWebVitals, debug])

  return null
}

// Utility functions for performance monitoring
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
  const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')

  return {
    // Navigation timing
    dns: navigation ? Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) : 0,
    tcp: navigation ? Math.round(navigation.connectEnd - navigation.connectStart) : 0,
    request: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : 0,
    response: navigation ? Math.round(navigation.responseEnd - navigation.responseStart) : 0,
    dom: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0,
    load: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
    
    // Paint timing
    fcp: fcp ? Math.round(fcp.startTime) : 0,
    lcp: lcp ? Math.round(lcp.startTime) : 0,
    
    // Memory usage (if available)
    memory: (performance as any).memory ? {
      used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
    } : null
  }
}

export const trackPerformanceIssue = (issue: string, details?: Record<string, any>) => {
  trackEvent('performance_issue', {
    issue_type: issue,
    ...details,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ''
  })
}

export const trackUserTiming = (name: string, startTime: number, endTime?: number) => {
  const duration = endTime ? endTime - startTime : performance.now() - startTime
  
  trackEvent('user_timing', {
    timing_name: name,
    duration: Math.round(duration)
  })
  
  // Also use Performance API
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }
}