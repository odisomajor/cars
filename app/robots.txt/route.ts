import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kenyacarmarketplace.com'
  
  const robotsTxt = `# Kenya Car Marketplace - Robots.txt
# Generated: ${new Date().toISOString()}

# Global rules for all crawlers
User-agent: *
Allow: /

# Disallow sensitive and non-public areas
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /auth/
Disallow: /profile/
Disallow: /settings/
Disallow: /favorites/
Disallow: /my-listings/
Disallow: /verification/
Disallow: /checkout/
Disallow: /payment/
Disallow: /webhook/
Disallow: /tmp/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*
Disallow: /*?*gclid*
Disallow: /*?*ref=*
Disallow: /search?*sort=*
Disallow: /search?*page=*

# Allow important public pages
Allow: /cars
Allow: /cars/
Allow: /hire
Allow: /hire/
Allow: /search
Allow: /sell
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /create-listing
Allow: /create-rental-listing
Allow: /sitemap.xml
Allow: /robots.txt
Allow: /manifest.json
Allow: /favicon.ico

# Allow static assets
Allow: /images/
Allow: /icons/
Allow: /_next/static/

# Crawl delay (be respectful)
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Google-specific rules
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /auth/
Disallow: /profile/
Disallow: /settings/
Disallow: /favorites/
Disallow: /my-listings/
Disallow: /verification/
Disallow: /checkout/
Disallow: /payment/
Disallow: /webhook/
Crawl-delay: 1

# Bing-specific rules
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /auth/
Disallow: /profile/
Disallow: /settings/
Disallow: /favorites/
Disallow: /my-listings/
Disallow: /verification/
Disallow: /checkout/
Disallow: /payment/
Disallow: /webhook/
Crawl-delay: 1

# Yandex-specific rules
User-agent: YandexBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /auth/
Crawl-delay: 2

# Facebook crawler (for Open Graph)
User-agent: facebookexternalhit
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# Twitter crawler (for Twitter Cards)
User-agent: Twitterbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# LinkedIn crawler
User-agent: LinkedInBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# WhatsApp crawler
User-agent: WhatsApp
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# Block aggressive crawlers and scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MajesticSEO
Disallow: /

User-agent: BLEXBot
Disallow: /

# Block AI training crawlers (optional - uncomment if desired)
# User-agent: GPTBot
# Disallow: /
# 
# User-agent: ChatGPT-User
# Disallow: /
# 
# User-agent: CCBot
# Disallow: /
# 
# User-agent: anthropic-ai
# Disallow: /
# 
# User-agent: Claude-Web
# Disallow: /

# Additional sitemaps (if you have multiple)
# Sitemap: ${baseUrl}/sitemap-cars.xml
# Sitemap: ${baseUrl}/sitemap-rentals.xml
# Sitemap: ${baseUrl}/sitemap-news.xml
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}