import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster as HotToaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import StructuredData from '@/components/seo/StructuredData'
import PerformanceOptimizer from '@/components/seo/PerformanceOptimizer'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import CoreWebVitals from '@/components/analytics/CoreWebVitals'
import Script from 'next/script'

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
    'Kisumu cars',
    'car rental Kenya'
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
  manifest: '/manifest.json',
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
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CarMarket KE',
    'mobile-web-app-capable': 'yes',
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
        {/* Enhanced Analytics & Performance Monitoring */}
        <GoogleAnalytics />
        <CoreWebVitals reportWebVitals={true} debug={process.env.NODE_ENV === 'development'} />
        
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
        {/* <PerformanceOptimizer 
          enableAnalytics={true}
          enableLazyLoading={true}
          enableImageOptimization={true}
          enableResourceHints={true}
        /> */}
        <StructuredData />
        <SessionProvider>
          <div id="root">
            {children}
          </div>
          <HotToaster
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
          <SonnerToaster position="top-center" />
        </SessionProvider>
        

        
        {/* Service Worker Registration */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}