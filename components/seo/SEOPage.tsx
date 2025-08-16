'use client'

import { useEffect } from 'react'
import Head from 'next/head'
import { usePathname } from 'next/navigation'
import StructuredData from './StructuredData'
import LocalSEO from './LocalSEO'
import PerformanceOptimizer from './PerformanceOptimizer'

interface SEOPageProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  noIndex?: boolean
  structuredData?: any
  localBusiness?: boolean
  location?: {
    city?: string
    county?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  lastModified?: string
  publishedTime?: string
  author?: string
  category?: string
  tags?: string[]
  price?: {
    amount: number
    currency: string
  }
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  condition?: 'New' | 'Used' | 'Refurbished'
  brand?: string
  model?: string
  year?: number
  children: React.ReactNode
}

export default function SEOPage({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  ogType = 'website',
  noIndex = false,
  structuredData,
  localBusiness = false,
  location,
  breadcrumbs = [],
  lastModified,
  publishedTime,
  author,
  category,
  tags = [],
  price,
  availability,
  condition,
  brand,
  model,
  year,
  children
}: SEOPageProps) {
  const pathname = usePathname()
  const baseUrl = 'https://kenyacarmarketplace.com'
  const fullUrl = canonicalUrl || `${baseUrl}${pathname}`
  
  // Generate page-specific title and description
  const pageTitle = title ? `${title} | Kenya Car Marketplace` : 'Kenya Car Marketplace - Buy, Sell & Rent Cars'
  const pageDescription = description || 'The leading automotive marketplace in Kenya. Buy, sell, and rent cars with ease. Find your perfect vehicle from trusted dealers and private sellers.'
  
  // Generate keywords
  const allKeywords = [
    ...keywords,
    'cars Kenya',
    'buy car Kenya',
    'sell car Kenya',
    'car rental Kenya',
    'used cars',
    'new cars',
    'automotive marketplace'
  ]
  
  if (location?.city) {
    allKeywords.push(`cars ${location.city}`, `buy car ${location.city}`, `sell car ${location.city}`)
  }
  
  if (brand) {
    allKeywords.push(`${brand} Kenya`, `${brand} cars Kenya`)
  }
  
  if (model) {
    allKeywords.push(`${brand} ${model} Kenya`, `${model} Kenya`)
  }
  
  if (year) {
    allKeywords.push(`${year} cars Kenya`, `${year} ${brand} Kenya`)
  }
  
  // Generate structured data
  const generateStructuredData = () => {
    const data: any[] = []
    
    // Website schema
    data.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kenya Car Marketplace',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    })
    
    // Breadcrumbs
    if (breadcrumbs.length > 0) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`
        }))
      })
    }
    
    // Product schema for car listings
    if (brand && model && price) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${year ? year + ' ' : ''}${brand} ${model}`,
        description: pageDescription,
        brand: {
          '@type': 'Brand',
          name: brand
        },
        model: model,
        productionDate: year?.toString(),
        offers: {
          '@type': 'Offer',
          price: price.amount,
          priceCurrency: price.currency,
          availability: `https://schema.org/${availability || 'InStock'}`,
          itemCondition: `https://schema.org/${condition || 'Used'}Condition`,
          seller: {
            '@type': 'Organization',
            name: 'Kenya Car Marketplace'
          }
        },
        category: 'Vehicle',
        url: fullUrl
      })
    }
    
    // Article schema for blog posts
    if (ogType === 'article' && publishedTime) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: pageDescription,
        author: {
          '@type': 'Person',
          name: author || 'Kenya Car Marketplace Team'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Kenya Car Marketplace',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/icon-512x512.png`
          }
        },
        datePublished: publishedTime,
        dateModified: lastModified || publishedTime,
        mainEntityOfPage: fullUrl,
        keywords: allKeywords.join(', '),
        articleSection: category,
        url: fullUrl
      })
    }
    
    // Custom structured data
    if (structuredData) {
      data.push(structuredData)
    }
    
    return data
  }
  
  // Track page view for analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageTitle,
        page_location: fullUrl,
        custom_map: {
          dimension1: category,
          dimension2: location?.city,
          dimension3: brand,
          dimension4: model
        }
      })
    }
  }, [pageTitle, fullUrl, category, location?.city, brand, model])
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={allKeywords.join(', ')} />
        <link rel="canonical" href={fullUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={ogType} />
        <meta property="og:site_name" content="Kenya Car Marketplace" />
        <meta property="og:locale" content="en_KE" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        
        {/* Article specific meta */}
        {ogType === 'article' && publishedTime && (
          <>
            <meta property="article:published_time" content={publishedTime} />
            {lastModified && <meta property="article:modified_time" content={lastModified} />}
            {author && <meta property="article:author" content={author} />}
            {category && <meta property="article:section" content={category} />}
            {tags.map(tag => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* Product specific meta */}
        {price && (
          <>
            <meta property="product:price:amount" content={price.amount.toString()} />
            <meta property="product:price:currency" content={price.currency} />
            {availability && <meta property="product:availability" content={availability} />}
            {condition && <meta property="product:condition" content={condition} />}
          </>
        )}
        
        {/* Geo meta tags */}
        {location?.coordinates && (
          <>
            <meta name="geo.position" content={`${location.coordinates.lat};${location.coordinates.lng}`} />
            <meta name="geo.placename" content={location.city || 'Kenya'} />
            <meta name="geo.region" content={location.county || 'Kenya'} />
          </>
        )}
        
        {/* Robots */}
        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        )}
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
      </Head>
      
      {/* Performance Optimizer */}
      <PerformanceOptimizer />
      
      {/* Local SEO */}
      {localBusiness && location && (
        <LocalSEO
          businessName="Kenya Car Marketplace"
          city={location.city}
          county={location.county}
          coordinates={location.coordinates}
        />
      )}
      
      {/* Page Content */}
      {children}
    </>
  )
}

// Utility function to generate SEO-friendly URLs
export function generateSEOUrl(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Utility function to generate meta description from content
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  
  if (cleanContent.length <= maxLength) {
    return cleanContent
  }
  
  const truncated = cleanContent.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

// Utility function to extract keywords from content
export function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']
  
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
  
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}