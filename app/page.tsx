import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import FeaturedCars from '@/components/home/FeaturedCars'
import Categories from '@/components/home/Categories'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import AdBanner from '@/components/ads/AdBanner'

export const metadata: Metadata = {
  title: 'Kenya Car Marketplace - Buy & Sell Cars Online',
  description: 'Find the best deals on new and used cars in Kenya. Browse thousands of vehicles from trusted dealers and private sellers. Free listings available.',
  openGraph: {
    title: 'Kenya Car Marketplace - Buy & Sell Cars Online',
    description: 'Find the best deals on new and used cars in Kenya. Browse thousands of vehicles from trusted dealers and private sellers.',
    url: 'https://kenyacarmarketplace.com',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Kenya Car Marketplace Homepage',
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Ad Banner */}
      <AdBanner 
        type="header" 
        className="ad-banner-header"
        placeholder="Header Advertisement (728x90)"
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Cars Section */}
        <section className="section-padding bg-secondary-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <FeaturedCars />
              </div>
              
              {/* Sidebar Ad Banner */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <AdBanner 
                    type="sidebar" 
                    className="ad-banner-sidebar mb-8"
                    placeholder="Sidebar Advertisement (300x250)"
                  />
                  
                  {/* Quick Stats */}
                  <div className="card p-4">
                    <h3 className="text-base font-semibold mb-3">Marketplace Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-secondary-600 text-sm">Total Cars</span>
                        <span className="font-semibold text-sm">12,450+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600 text-sm">Active Dealers</span>
                        <span className="font-semibold text-sm">850+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600 text-sm">Cities Covered</span>
                        <span className="font-semibold text-sm">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600 text-sm">Happy Customers</span>
                        <span className="font-semibold text-sm">25,000+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <Categories />
        
        {/* Why Choose Us Section */}
        <WhyChooseUs />
      </main>
      
      <Footer />
      
      {/* Footer Ad Banner */}
      <AdBanner 
        type="footer" 
        className="ad-banner-footer"
        placeholder="Footer Advertisement (728x90)"
      />
    </div>
  )
}