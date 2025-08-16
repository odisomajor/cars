import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender'
  entries?: PerformanceEntry[]
}

interface WebVitalPayload {
  metrics: WebVitalMetric[]
  url: string
  userAgent: string
  timestamp: number
  sessionId?: string
  userId?: string
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  connectionType?: string
  viewport?: {
    width: number
    height: number
  }
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string, userAgent: string): string {
  return `${ip}:${userAgent.slice(0, 50)}`
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return false
  }
  
  if (limit.count >= 10) { // Max 10 requests per minute
    return true
  }
  
  limit.count++
  return false
}

function validateMetric(metric: any): metric is WebVitalMetric {
  return (
    typeof metric === 'object' &&
    typeof metric.name === 'string' &&
    ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'].includes(metric.name) &&
    typeof metric.value === 'number' &&
    typeof metric.rating === 'string' &&
    ['good', 'needs-improvement', 'poor'].includes(metric.rating) &&
    typeof metric.delta === 'number' &&
    typeof metric.id === 'string' &&
    typeof metric.navigationType === 'string'
  )
}

function sanitizePayload(payload: any): WebVitalPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const {
    metrics,
    url,
    userAgent,
    timestamp,
    sessionId,
    userId,
    deviceType,
    connectionType,
    viewport
  } = payload

  // Validate required fields
  if (
    !Array.isArray(metrics) ||
    typeof url !== 'string' ||
    typeof userAgent !== 'string' ||
    typeof timestamp !== 'number'
  ) {
    return null
  }

  // Validate metrics
  const validMetrics = metrics.filter(validateMetric)
  if (validMetrics.length === 0) {
    return null
  }

  // Sanitize URL
  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null
    }
  } catch {
    return null
  }

  return {
    metrics: validMetrics,
    url: url.slice(0, 500), // Limit URL length
    userAgent: userAgent.slice(0, 200), // Limit user agent length
    timestamp,
    sessionId: sessionId ? String(sessionId).slice(0, 100) : undefined,
    userId: userId ? String(userId).slice(0, 100) : undefined,
    deviceType: deviceType && ['mobile', 'tablet', 'desktop'].includes(deviceType) ? deviceType : undefined,
    connectionType: connectionType ? String(connectionType).slice(0, 50) : undefined,
    viewport: viewport && typeof viewport.width === 'number' && typeof viewport.height === 'number' ? viewport : undefined
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || cfConnectingIP || 'unknown'
}

function logMetrics(payload: WebVitalPayload, clientIP: string) {
  // In production, send to your analytics service
  // Examples: Google Analytics, DataDog, New Relic, custom analytics
  
  console.log('Web Vitals Metrics:', {
    timestamp: new Date(payload.timestamp).toISOString(),
    url: payload.url,
    clientIP: clientIP.replace(/\d+$/, 'xxx'), // Anonymize IP
    deviceType: payload.deviceType,
    connectionType: payload.connectionType,
    viewport: payload.viewport,
    metrics: payload.metrics.map(metric => ({
      name: metric.name,
      value: Math.round(metric.value * 100) / 100, // Round to 2 decimal places
      rating: metric.rating,
      navigationType: metric.navigationType
    }))
  })

  // Example: Send to external analytics service
  // if (process.env.ANALYTICS_WEBHOOK_URL) {
  //   fetch(process.env.ANALYTICS_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       source: 'web-vitals',
  //       data: payload,
  //       clientIP: clientIP.replace(/\d+$/, 'xxx')
  //     })
  //   }).catch(console.error)
  // }
}

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Rate limiting
    const rateLimitKey = getRateLimitKey(clientIP, userAgent)
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse and validate payload
    const body = await request.json()
    console.log('Received payload:', JSON.stringify(body, null, 2))
    const payload = sanitizePayload(body)
    
    if (!payload) {
      console.log('Payload validation failed for:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    // Additional validation
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes
    
    if (Math.abs(now - payload.timestamp) > maxAge) {
      return NextResponse.json(
        { error: 'Timestamp too old or in future' },
        { status: 400 }
      )
    }

    // Extract useful information from user agent
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(payload.userAgent)
    const browser = extractBrowser(payload.userAgent)
    const os = extractOS(payload.userAgent)

    // Store each metric in the database
    for (const metric of payload.metrics) {
      await prisma.webVitalMetric.create({
        data: {
          metric: metric.name,
          value: metric.value,
          url: payload.url,
          userAgent: payload.userAgent,
          isMobile,
          browser,
          os,
          timestamp: new Date(payload.timestamp),
          rating: metric.rating,
          delta: metric.delta,
          metricId: metric.id,
          navigationType: metric.navigationType,
          sessionId: payload.sessionId,
          userId: payload.userId,
          deviceType: payload.deviceType,
          connectionType: payload.connectionType,
          viewportWidth: payload.viewport?.width,
          viewportHeight: payload.viewport?.height
        }
      })

      // Log critical performance issues
      if (shouldAlert(metric.name, metric.value)) {
        console.warn(`Performance Alert: ${metric.name} = ${metric.value} on ${payload.url}`, {
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: payload.url,
          userAgent: payload.userAgent,
          timestamp: payload.timestamp
        })
      }
    }

    // Log metrics for analytics
    logMetrics(payload, clientIP)

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        processed: payload.metrics.length,
        timestamp: now
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : request.headers.get('origin') || '',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    )
  } catch (error) {
    console.error('Error storing web vital metric:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const days = parseInt(searchParams.get('days') || '7')
    const url = searchParams.get('url')

    const whereClause: any = {
      timestamp: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    }

    if (metric) {
      whereClause.metric = metric
    }

    if (url) {
      whereClause.url = {
        contains: url
      }
    }

    const metrics = await prisma.webVitalMetric.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limit results
    })

    // Calculate statistics
    const stats = calculateStats(metrics)

    return NextResponse.json({
      metrics,
      stats,
      count: metrics.length
    })
  } catch (error) {
    console.error('Error fetching web vital metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

function extractOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  return 'Unknown'
}

function shouldAlert(metric: string, value: number): boolean {
  const thresholds = {
    CLS: 0.25, // Poor CLS threshold
    INP: 500,  // Poor INP threshold (ms)
    LCP: 4000, // Poor LCP threshold (ms)
    FCP: 3000, // Poor FCP threshold (ms)
    TTFB: 600  // Poor TTFB threshold (ms)
  }

  return value > (thresholds[metric as keyof typeof thresholds] || Infinity)
}

function calculateStats(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      average: 0,
      median: 0,
      p75: 0,
      p95: 0,
      min: 0,
      max: 0
    }
  }

  const values = metrics.map(m => m.value).sort((a, b) => a - b)
  const length = values.length

  return {
    average: values.reduce((sum, val) => sum + val, 0) / length,
    median: length % 2 === 0 
      ? (values[length / 2 - 1] + values[length / 2]) / 2
      : values[Math.floor(length / 2)],
    p75: values[Math.floor(length * 0.75)],
    p95: values[Math.floor(length * 0.95)],
    min: values[0],
    max: values[length - 1],
    count: length,
    byBrowser: groupBy(metrics, 'browser'),
    byOS: groupBy(metrics, 'os'),
    byDevice: {
      mobile: metrics.filter(m => m.isMobile).length,
      desktop: metrics.filter(m => !m.isMobile).length
    }
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : request.headers.get('origin') || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}

// Cleanup rate limit store periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, limit] of rateLimitStore.entries()) {
      if (now > limit.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

function groupBy(array: any[], key: string) {
  return array.reduce((groups, item) => {
    const group = item[key] || 'Unknown'
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}