'use client'

import { useEffect } from 'react'

interface VehicleStructuredDataProps {
  listing: {
    id: string
    title: string
    description: string
    price: number
    currency?: string
    make: string
    model: string
    year: number
    mileage?: number
    fuelType: string
    transmission: string
    condition: string
    bodyType: string
    images: string[]
    location?: {
      city: string
      country: string
    }
    seller?: {
      name: string
      type: 'DEALER' | 'PRIVATE'
      phone?: string
      email?: string
    }
    createdAt: string
    updatedAt: string
  }
  type: 'SALE' | 'RENTAL'
}

interface OrganizationStructuredDataProps {
  organization: {
    name: string
    url: string
    logo: string
    description: string
    address?: {
      streetAddress: string
      addressLocality: string
      addressCountry: string
      postalCode?: string
    }
    contactPoint?: {
      telephone: string
      email: string
      contactType: string
    }
    sameAs?: string[]
  }
}

interface WebsiteStructuredDataProps {
  website: {
    name: string
    url: string
    description: string
    searchAction?: {
      target: string
      queryInput: string
    }
  }
}

export function VehicleStructuredData({ listing, type }: VehicleStructuredDataProps) {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'
    
    const structuredData = type === 'SALE' ? {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      '@id': `${baseUrl}/cars/${listing.id}`,
      name: listing.title,
      description: listing.description,
      brand: {
        '@type': 'Brand',
        name: listing.make
      },
      model: listing.model,
      vehicleModelDate: listing.year.toString(),
      mileageFromOdometer: listing.mileage ? {
        '@type': 'QuantitativeValue',
        value: listing.mileage,
        unitCode: 'KMT'
      } : undefined,
      fuelType: listing.fuelType.toLowerCase(),
      vehicleTransmission: listing.transmission.toLowerCase(),
      vehicleCondition: `https://schema.org/${listing.condition === 'NEW' ? 'NewCondition' : 'UsedCondition'}`,
      bodyType: listing.bodyType.toLowerCase(),
      image: listing.images,
      offers: {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: listing.currency || 'KES',
        availability: 'https://schema.org/InStock',
        seller: listing.seller ? {
          '@type': listing.seller.type === 'DEALER' ? 'AutoDealer' : 'Person',
          name: listing.seller.name,
          telephone: listing.seller.phone,
          email: listing.seller.email
        } : undefined,
        validFrom: listing.createdAt,
        url: `${baseUrl}/cars/${listing.id}`
      },
      location: listing.location ? {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.location.city,
          addressCountry: listing.location.country
        }
      } : undefined,
      dateCreated: listing.createdAt,
      dateModified: listing.updatedAt
    } : {
      '@context': 'https://schema.org',
      '@type': 'RentalCarReservation',
      '@id': `${baseUrl}/hire/${listing.id}`,
      reservationFor: {
        '@type': 'RentalCar',
        name: listing.title,
        description: listing.description,
        brand: {
          '@type': 'Brand',
          name: listing.make
        },
        model: listing.model,
        vehicleModelDate: listing.year.toString(),
        fuelType: listing.fuelType.toLowerCase(),
        vehicleTransmission: listing.transmission.toLowerCase(),
        bodyType: listing.bodyType.toLowerCase(),
        image: listing.images
      },
      provider: listing.seller ? {
        '@type': 'RentalCarAgency',
        name: listing.seller.name,
        telephone: listing.seller.phone,
        email: listing.seller.email
      } : undefined,
      pickupLocation: listing.location ? {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: listing.location.city,
          addressCountry: listing.location.country
        }
      } : undefined,
      totalPrice: {
        '@type': 'PriceSpecification',
        price: listing.price,
        priceCurrency: listing.currency || 'KES',
        unitText: 'per day'
      },
      url: `${baseUrl}/hire/${listing.id}`,
      dateCreated: listing.createdAt,
      dateModified: listing.updatedAt
    }

    // Remove undefined properties
    const cleanStructuredData = JSON.parse(JSON.stringify(structuredData))

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(cleanStructuredData)
    script.id = `structured-data-${listing.id}`
    
    // Remove existing script if it exists
    const existingScript = document.getElementById(`structured-data-${listing.id}`)
    if (existingScript) {
      existingScript.remove()
    }
    
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(`structured-data-${listing.id}`)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [listing, type])

  return null
}

// Main StructuredData component that combines all structured data
export default function StructuredData() {
  return (
    <>
      <WebsiteStructuredData 
        website={{
          name: 'Kenya Car Marketplace',
          url: 'https://kenyacarmarketplace.com',
          description: 'The leading automotive marketplace in Kenya. Buy, sell, and rent cars with ease.',
          searchAction: {
            target: 'https://kenyacarmarketplace.com/search?q={search_term_string}',
            queryInput: 'required name=search_term_string'
          }
        }}
      />
      <OrganizationStructuredData 
        organization={{
          name: 'Kenya Car Marketplace',
          url: 'https://kenyacarmarketplace.com',
          logo: 'https://kenyacarmarketplace.com/icon-512x512.png',
          description: 'The leading automotive marketplace in Kenya. Buy, sell, and rent cars with ease.',
          address: {
            streetAddress: 'Nairobi CBD',
            addressLocality: 'Nairobi',
            addressCountry: 'Kenya'
          },
          contactPoint: {
            telephone: '+254-700-000-000',
            contactType: 'Customer Service',
            email: 'support@kenyacarmarketplace.com'
          },
          sameAs: [
            'https://facebook.com/kenyacarmarketplace',
            'https://twitter.com/kenyacarmarket',
            'https://instagram.com/kenyacarmarketplace'
          ]
        }}
      />
    </>
  )
}

export function OrganizationStructuredData({ organization }: OrganizationStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      logo: organization.logo,
      description: organization.description,
      address: organization.address ? {
        '@type': 'PostalAddress',
        streetAddress: organization.address.streetAddress,
        addressLocality: organization.address.addressLocality,
        addressCountry: organization.address.addressCountry,
        postalCode: organization.address.postalCode
      } : undefined,
      contactPoint: organization.contactPoint ? {
        '@type': 'ContactPoint',
        telephone: organization.contactPoint.telephone,
        email: organization.contactPoint.email,
        contactType: organization.contactPoint.contactType
      } : undefined,
      sameAs: organization.sameAs
    }

    // Remove undefined properties
    const cleanStructuredData = JSON.parse(JSON.stringify(structuredData))

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(cleanStructuredData)
    script.id = 'organization-structured-data'
    
    // Remove existing script if it exists
    const existingScript = document.getElementById('organization-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById('organization-structured-data')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [organization])

  return null
}

export function WebsiteStructuredData({ website }: WebsiteStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name,
      url: website.url,
      description: website.description,
      potentialAction: website.searchAction ? {
        '@type': 'SearchAction',
        target: website.searchAction.target,
        'query-input': website.searchAction.queryInput
      } : undefined
    }

    // Remove undefined properties
    const cleanStructuredData = JSON.parse(JSON.stringify(structuredData))

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(cleanStructuredData)
    script.id = 'website-structured-data'
    
    // Remove existing script if it exists
    const existingScript = document.getElementById('website-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById('website-structured-data')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [website])

  return null
}