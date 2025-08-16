'use client'

import { useEffect } from 'react'

interface LocalSEOProps {
  businessName: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode?: string
    addressCountry: string
  }
  phone?: string
  email?: string
  website: string
  openingHours?: string[]
  priceRange?: string
  servesArea?: string[]
  businessType?: 'AutoDealer' | 'CarRental' | 'AutomotiveMarketplace'
  coordinates?: {
    latitude: number
    longitude: number
  }
  reviews?: {
    aggregateRating: number
    reviewCount: number
  }
}

const KENYAN_CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Kisii', 'Kilifi', 'Lamu', 'Embu', 'Isiolo', 'Wajir', 'Marsabit', 'Lodwar'
]

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi',
  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
]

export default function LocalSEO({
  businessName,
  address,
  phone,
  email,
  website,
  openingHours = [],
  priceRange = '$$',
  servesArea = KENYAN_CITIES,
  businessType = 'AutomotiveMarketplace',
  coordinates,
  reviews
}: LocalSEOProps) {
  useEffect(() => {
    // Create local business structured data
    const localBusinessData = {
      '@context': 'https://schema.org',
      '@type': businessType,
      name: businessName,
      url: website,
      telephone: phone,
      email: email,
      priceRange: priceRange,
      address: address ? {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress,
        addressLocality: address.addressLocality,
        addressRegion: address.addressRegion,
        postalCode: address.postalCode,
        addressCountry: address.addressCountry
      } : undefined,
      geo: coordinates ? {
        '@type': 'GeoCoordinates',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      } : undefined,
      openingHoursSpecification: openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: extractDayOfWeek(hours),
        opens: extractOpenTime(hours),
        closes: extractCloseTime(hours)
      })),
      areaServed: servesArea.map(area => ({
        '@type': 'City',
        name: area,
        containedInPlace: {
          '@type': 'Country',
          name: 'Kenya'
        }
      })),
      aggregateRating: reviews ? {
        '@type': 'AggregateRating',
        ratingValue: reviews.aggregateRating,
        reviewCount: reviews.reviewCount
      } : undefined,
      sameAs: [
        'https://www.facebook.com/kenyacarmarketplace',
        'https://twitter.com/kenyacarmarket',
        'https://www.instagram.com/kenyacarmarketplace',
        'https://www.linkedin.com/company/kenya-car-marketplace'
      ]
    }

    // Remove undefined properties
    const cleanLocalBusinessData = JSON.parse(JSON.stringify(localBusinessData))

    // Add local business structured data
    const existingScript = document.getElementById('local-business-structured-data')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'local-business-structured-data'
    script.textContent = JSON.stringify(cleanLocalBusinessData)
    document.head.appendChild(script)

    // Add geo meta tags
    if (coordinates) {
      const geoTags = [
        { name: 'geo.region', content: 'KE' },
        { name: 'geo.placename', content: address?.addressLocality || 'Kenya' },
        { name: 'geo.position', content: `${coordinates.latitude};${coordinates.longitude}` },
        { name: 'ICBM', content: `${coordinates.latitude}, ${coordinates.longitude}` }
      ]

      geoTags.forEach(({ name, content }) => {
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
    }

    return () => {
      const scriptToRemove = document.getElementById('local-business-structured-data')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [businessName, address, phone, email, website, openingHours, priceRange, servesArea, businessType, coordinates, reviews])

  return null
}

// Utility functions for parsing opening hours
function extractDayOfWeek(hoursString: string): string[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const foundDays = days.filter(day => hoursString.toLowerCase().includes(day.toLowerCase()))
  return foundDays.length > 0 ? foundDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
}

function extractOpenTime(hoursString: string): string {
  const timeMatch = hoursString.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
  return timeMatch ? timeMatch[1] : '09:00'
}

function extractCloseTime(hoursString: string): string {
  const times = hoursString.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi)
  return times && times.length > 1 ? times[1] : '17:00'
}

// Component for generating location-specific pages
export function LocationSpecificSEO({ city, county }: { city: string; county?: string }) {
  useEffect(() => {
    const locationData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Cars for Sale in ${city}, Kenya`,
      description: `Find the best deals on new and used cars in ${city}, Kenya. Browse thousands of vehicles from trusted dealers and private sellers.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'}/search?location=${encodeURIComponent(city)}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Kenya Car Marketplace',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'
      },
      about: {
        '@type': 'Place',
        name: city,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: county || 'Kenya',
          containedInPlace: {
            '@type': 'Country',
            name: 'Kenya'
          }
        }
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Search Cars',
            item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'}/search`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `Cars in ${city}`,
            item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'}/search?location=${encodeURIComponent(city)}`
          }
        ]
      }
    }

    const existingScript = document.getElementById(`location-seo-${city.toLowerCase()}`)
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = `location-seo-${city.toLowerCase()}`
    script.textContent = JSON.stringify(locationData)
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(`location-seo-${city.toLowerCase()}`)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [city, county])

  return null
}

// Export city and county data for use in other components
export { KENYAN_CITIES, KENYAN_COUNTIES }