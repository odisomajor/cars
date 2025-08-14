import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Kenya Car Marketplace - Buy & Sell Cars Online',
    template: '%s | Kenya Car Marketplace'
  },
  description: 'Kenya\'s premier online marketplace for buying and selling new and used cars. Find the best deals on vehicles from trusted dealers and private sellers across Kenya.',
  keywords: [
    'Kenya cars',
    'buy cars Kenya',
    'sell cars Kenya',
    'used cars Kenya',
    'new cars Kenya',
    'car marketplace Kenya',
    'vehicles Kenya',
    'auto dealers Kenya',
    'Nairobi cars',
    'Mombasa cars',
    'Kisumu cars'
  ],
  authors: [{ name: 'Kenya Car Marketplace Team' }],
  creator: 'Kenya Car Marketplace',
  publisher: 'Kenya Car Marketplace',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kenyacarmarketplace.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://kenyacarmarketplace.com',
    siteName: 'Kenya Car Marketplace',
    title: 'Kenya Car Marketplace - Buy & Sell Cars Online',
    description: 'Kenya\'s premier online marketplace for buying and selling new and used cars. Find the best deals on vehicles from trusted dealers and private sellers across Kenya.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kenya Car Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kenya Car Marketplace - Buy & Sell Cars Online',
    description: 'Kenya\'s premier online marketplace for buying and selling new and used cars.',
    images: ['/og-image.jpg'],
    creator: '@kenyacarmarket',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
          suppressHydrationWarning={true}
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
          crossOrigin="anonymous"
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Kenya Car Marketplace",
              "url": "https://kenyacarmarketplace.com",
              "description": "Kenya's premier online marketplace for buying and selling new and used cars.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://kenyacarmarketplace.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
          suppressHydrationWarning={true}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Kenya Car Marketplace",
              "url": "https://kenyacarmarketplace.com",
              "logo": "https://kenyacarmarketplace.com/logo.png",
              "description": "Kenya's premier online marketplace for buying and selling new and used cars.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KE",
                "addressLocality": "Nairobi"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+254-XXX-XXXX",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://facebook.com/kenyacarmarketplace",
                "https://twitter.com/kenyacarmarket",
                "https://instagram.com/kenyacarmarketplace"
              ]
            })
          }}
          suppressHydrationWarning={true}
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <div id="root">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SessionProvider>
        
        {/* Google AdSense Auto Ads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-YOUR_ADSENSE_ID",
                enable_page_level_ads: true
              });
            `,
          }}
          suppressHydrationWarning={true}
        />
      </body>
    </html>
  )
}