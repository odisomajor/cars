'use client'

import Head from 'next/head'
import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  structuredData?: object
  noIndex?: boolean
  noFollow?: boolean
  alternateUrls?: {
    hreflang: string
    href: string
  }[]
  breadcrumbs?: {
    name: string
    url: string
  }[]
}

export default function SEOOptimizer({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
  noFollow = false,
  alternateUrls = [],
  breadcrumbs = []
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'
  const fullTitle = title.includes('Kenya Car Marketplace') ? title : `${title} | Kenya Car Marketplace`
  const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl)
  const fullOgImage = ogImage || `${baseUrl}/og-image.jpg`

  useEffect(() => {
    // Update document title
    document.title = fullTitle

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const newMetaDescription = document.createElement('meta')
      newMetaDescription.name = 'description'
      newMetaDescription.content = description
      document.head.appendChild(newMetaDescription)
    }

    // Update keywords
    if (keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords.join(', '))
      } else {
        const newMetaKeywords = document.createElement('meta')
        newMetaKeywords.name = 'keywords'
        newMetaKeywords.content = keywords.join(', ')
        document.head.appendChild(newMetaKeywords)
      }
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullCanonicalUrl)
    } else {
      const newCanonicalLink = document.createElement('link')
      newCanonicalLink.rel = 'canonical'
      newCanonicalLink.href = fullCanonicalUrl
      document.head.appendChild(newCanonicalLink)
    }

    // Update robots meta
    const robotsContent = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`
    const robotsMeta = document.querySelector('meta[name="robots"]')
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robotsContent)
    } else {
      const newRobotsMeta = document.createElement('meta')
      newRobotsMeta.name = 'robots'
      newRobotsMeta.content = robotsContent
      document.head.appendChild(newRobotsMeta)
    }

    // Update Open Graph tags
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: fullCanonicalUrl },
      { property: 'og:image', content: fullOgImage },
      { property: 'og:site_name', content: 'Kenya Car Marketplace' },
      { property: 'og:locale', content: 'en_KE' }
    ]

    ogTags.forEach(({ property, content }) => {
      const existingTag = document.querySelector(`meta[property="${property}"]`)
      if (existingTag) {
        existingTag.setAttribute('content', content)
      } else {
        const newTag = document.createElement('meta')
        newTag.setAttribute('property', property)
        newTag.setAttribute('content', content)
        document.head.appendChild(newTag)
      }
    })

    // Update Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: fullOgImage },
      { name: 'twitter:site', content: '@kenyacarmarket' },
      { name: 'twitter:creator', content: '@kenyacarmarket' }
    ]

    twitterTags.forEach(({ name, content }) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`)
      if (existingTag) {
        existingTag.setAttribute('content', content)
      } else {
        const newTag = document.createElement('meta')
        newTag.setAttribute('name', name)
        newTag.setAttribute('content', content)
        document.head.appendChild(newTag)
      }
    })

    // Add alternate language URLs
    alternateUrls.forEach(({ hreflang, href }) => {
      const existingLink = document.querySelector(`link[hreflang="${hreflang}"]`)
      if (existingLink) {
        existingLink.setAttribute('href', href)
      } else {
        const newLink = document.createElement('link')
        newLink.rel = 'alternate'
        newLink.hreflang = hreflang
        newLink.href = href
        document.head.appendChild(newLink)
      }
    })

    // Add structured data
    if (structuredData) {
      const existingScript = document.getElementById('dynamic-structured-data')
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'dynamic-structured-data'
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    // Add breadcrumb structured data
    if (breadcrumbs.length > 0) {
      const breadcrumbStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`
        }))
      }

      const existingBreadcrumbScript = document.getElementById('breadcrumb-structured-data')
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove()
      }

      const breadcrumbScript = document.createElement('script')
      breadcrumbScript.type = 'application/ld+json'
      breadcrumbScript.id = 'breadcrumb-structured-data'
      breadcrumbScript.textContent = JSON.stringify(breadcrumbStructuredData)
      document.head.appendChild(breadcrumbScript)
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, twitterCard, structuredData, noIndex, noFollow, alternateUrls, breadcrumbs])

  return null
}

// Utility function to generate SEO-friendly URLs
export function generateSEOUrl(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 60) // Limit length
  
  return `${slug}-${id}`
}

// Utility function to generate meta description from content
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim()
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  return cleanContent.substring(0, maxLength - 3).trim() + '...'
}

// Utility function to extract keywords from content
export function extractKeywords(content: string, existingKeywords: string[] = []): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']
  
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const extractedKeywords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
  
  return [...new Set([...existingKeywords, ...extractedKeywords])]
}