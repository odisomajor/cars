import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kenyacarmarketplace.com'
    const currentDate = new Date().toISOString()
    const urls: SitemapUrl[] = []

    // Static high-priority pages
    const staticPages = [
      { path: '', priority: 1.0, changefreq: 'daily' as const },
      { path: '/cars', priority: 0.9, changefreq: 'daily' as const },
      { path: '/hire', priority: 0.9, changefreq: 'daily' as const },
      { path: '/search', priority: 0.8, changefreq: 'weekly' as const },
      { path: '/sell', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/about', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
      { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
      { path: '/create-listing', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/create-rental-listing', priority: 0.6, changefreq: 'monthly' as const },
    ]

    staticPages.forEach(page => {
      urls.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority
      })
    })

    // Get all active car listings with additional data
    const cars = await prisma.car.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        updatedAt: true,
        make: true,
        model: true,
        year: true,
        createdAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get all active rental listings
    const rentals = await prisma.rentalListing.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get unique car makes and models for category pages
    const carMakes = await prisma.car.findMany({
      where: { status: 'ACTIVE' },
      select: { make: true },
      distinct: ['make']
    })

    const carModels = await prisma.car.findMany({
      where: { status: 'ACTIVE' },
      select: { make: true, model: true },
      distinct: ['make', 'model']
    })

    // Add car listings
    cars.forEach(car => {
      const daysSinceUpdate = Math.floor((Date.now() - car.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
      const changefreq = daysSinceUpdate < 7 ? 'daily' : daysSinceUpdate < 30 ? 'weekly' : 'monthly'
      
      urls.push({
        loc: `${baseUrl}/cars/${car.id}`,
        lastmod: car.updatedAt.toISOString(),
        changefreq: changefreq as any,
        priority: 0.8
      })
    })

    // Add rental listings
    rentals.forEach(rental => {
      const daysSinceUpdate = Math.floor((Date.now() - rental.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
      const changefreq = daysSinceUpdate < 7 ? 'daily' : daysSinceUpdate < 30 ? 'weekly' : 'monthly'
      
      urls.push({
        loc: `${baseUrl}/hire/${rental.id}`,
        lastmod: rental.updatedAt.toISOString(),
        changefreq: changefreq as any,
        priority: 0.8
      })
    })

    // Add car make category pages
    carMakes.forEach(car => {
      urls.push({
        loc: `${baseUrl}/cars/make/${encodeURIComponent(car.make.toLowerCase())}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.7
      })
    })

    // Add car model category pages (limit to prevent too many URLs)
    carModels.slice(0, 100).forEach(car => {
      urls.push({
        loc: `${baseUrl}/cars/make/${encodeURIComponent(car.make.toLowerCase())}/model/${encodeURIComponent(car.model.toLowerCase())}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.6
      })
    })

    // Add search pages for popular queries
    const popularSearches = [
      'toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi',
      'under-1000000', 'under-2000000', 'under-3000000',
      'nairobi', 'mombasa', 'kisumu', 'nakuru',
      'automatic', 'manual', '4wd', 'hybrid'
    ]

    popularSearches.forEach(search => {
      urls.push({
        loc: `${baseUrl}/search?q=${encodeURIComponent(search)}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.5
      })
    })

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}