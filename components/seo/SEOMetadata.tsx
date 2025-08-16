'use client'

import Head from 'next/head'
import { useEffect } from 'react'

interface SEOMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  ogTitle?: string
  ogDescription?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  articleAuthor?: string
  articlePublishedTime?: string
  articleModifiedTime?: string
  articleSection?: string
  articleTags?: string[]
  productPrice?: string
  productCurrency?: string
  productAvailability?: 'in stock' | 'out of stock' | 'preorder'
  productCondition?: 'new' | 'used' | 'refurbished'
  productBrand?: string
  robots?: string
  viewport?: string
  themeColor?: string
  msapplicationTileColor?: string
  alternateLanguages?: Array<{ hreflang: string; href: string }>
  jsonLd?: Record<string, any>
}

export default function SEOMetadata({
  title = 'Kenya Car Marketplace - Buy & Sell Cars Online',
  description = 'Find the best deals on new and used cars in Kenya. Browse thousands of listings, compare prices, and connect with verified dealers and private sellers.',
  keywords = ['cars Kenya', 'used cars', 'new cars', 'car dealership', 'buy car', 'sell car', 'automotive Kenya'],
  canonicalUrl,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterSite = '@KenyaCarMarket',
  twitterCreator,
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  productPrice,
  productCurrency = 'KES',
  productAvailability,
  productCondition,
  productBrand,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  viewport = 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor = '#1f2937',
  msapplicationTileColor = '#1f2937',
  alternateLanguages,
  jsonLd
}: SEOMetadataProps) {
  const finalTitle = title.includes('Kenya Car Marketplace') ? title : `${title} | Kenya Car Marketplace`
  const finalOgTitle = ogTitle || finalTitle
  const finalOgDescription = ogDescription || description
  const currentUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl
  const finalCanonicalUrl = canonicalUrl || currentUrl

  useEffect(() => {
    // Update document title
    document.title = finalTitle
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink && finalCanonicalUrl) {
      canonicalLink.setAttribute('href', finalCanonicalUrl)
    }
  }, [finalTitle, description, finalCanonicalUrl])

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content={viewport} />
      <meta name="theme-color" content={themeColor} />
      <meta name="msapplication-TileColor" content={msapplicationTileColor} />
      
      {/* Canonical URL */}
      {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={finalOgTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {finalCanonicalUrl && <meta property="og:url" content={finalCanonicalUrl} />}
      <meta property="og:site_name" content="Kenya Car Marketplace" />
      <meta property="og:locale" content="en_KE" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={finalOgTitle} />
      
      {/* Article Meta Tags */}
      {ogType === 'article' && (
        <>
          {articleAuthor && <meta property="article:author" content={articleAuthor} />}
          {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
          {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {articleTags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product Meta Tags */}
      {ogType === 'product' && (
        <>
          {productPrice && <meta property="product:price:amount" content={productPrice} />}
          {productCurrency && <meta property="product:price:currency" content={productCurrency} />}
          {productAvailability && <meta property="product:availability" content={productAvailability} />}
          {productCondition && <meta property="product:condition" content={productCondition} />}
          {productBrand && <meta property="product:brand" content={productBrand} />}
        </>
      )}
      
      {/* Alternate Language Links */}
      {alternateLanguages?.map((lang, index) => (
        <link key={index} rel="alternate" hrefLang={lang.hreflang} href={lang.href} />
      ))}
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Kenya Cars" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color={themeColor} />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      
      {/* Preconnect for Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  )
}

// Utility function to generate structured data for car listings
export const generateCarListingStructuredData = (car: {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  condition: 'new' | 'used'
  description: string
  images: string[]
  seller: {
    name: string
    type: 'dealer' | 'private'
    phone?: string
    location?: string
  }
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': `https://kenyacarmarketplace.com/cars/${car.id}`,
    name: `${car.year} ${car.make} ${car.model}`,
    description: car.description,
    brand: {
      '@type': 'Brand',
      name: car.make
    },
    model: car.model,
    vehicleModelDate: car.year.toString(),
    mileageFromOdometer: car.mileage ? {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitCode: 'KMT'
    } : undefined,
    vehicleCondition: car.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': car.seller.type === 'dealer' ? 'AutoDealer' : 'Person',
        name: car.seller.name,
        telephone: car.seller.phone,
        address: car.seller.location ? {
          '@type': 'PostalAddress',
          addressLocality: car.seller.location,
          addressCountry: 'KE'
        } : undefined
      }
    },
    image: car.images,
    url: `https://kenyacarmarketplace.com/cars/${car.id}`
  }
}

// Utility function to generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}