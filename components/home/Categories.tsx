'use client'
import Link from 'next/link'

export default function Categories() {
  const categories = [
    {
      name: 'SUVs',
      count: '2,450+',
      image: '🚙',
      href: '/cars?category=suv',
      description: 'Perfect for families and adventures'
    },
    {
      name: 'Sedans',
      count: '3,200+',
      image: '🚗',
      href: '/cars?category=sedan',
      description: 'Comfortable and fuel-efficient'
    },
    {
      name: 'Car Hire',
      count: '180+',
      image: '🔑',
      href: '/hire',
      description: 'Rent a car for your journey'
    },
    {
      name: 'Hatchbacks',
      count: '1,800+',
      image: '🚕',
      href: '/cars?category=hatchback',
      description: 'Compact and city-friendly'
    },
    {
      name: 'Pickup Trucks',
      count: '950+',
      image: '🛻',
      href: '/cars?category=pickup',
      description: 'Built for work and play'
    },
    {
      name: 'Luxury Cars',
      count: '650+',
      image: '🏎️',
      href: '/cars?category=luxury',
      description: 'Premium vehicles for discerning buyers'
    },
    {
      name: 'Commercial',
      count: '420+',
      image: '🚚',
      href: '/cars?category=commercial',
      description: 'Vans, trucks, and business vehicles'
    }
  ]

  const popularBrands = [
    { name: 'Toyota', count: '4,200+', logo: 'T' },
    { name: 'Nissan', count: '2,800+', logo: 'N' },
    { name: 'Honda', count: '1,900+', logo: 'H' },
    { name: 'Mazda', count: '1,200+', logo: 'M' },
    { name: 'Mercedes-Benz', count: '850+', logo: 'MB' },
    { name: 'BMW', count: '720+', logo: 'BMW' },
    { name: 'Mitsubishi', count: '680+', logo: 'Mit' },
    { name: 'Subaru', count: '520+', logo: 'S' }
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Categories Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-base text-secondary-600 max-w-2xl mx-auto">
              Find the perfect vehicle type that matches your lifestyle and needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group card-hover p-4 text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.image}
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-secondary-600 text-xs mb-2">
                  {category.description}
                </p>
                <div className="text-primary-600 font-medium text-sm">
                  {category.count} available
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Brands Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-3">
              Popular Brands
            </h2>
            <p className="text-base text-secondary-600 max-w-2xl mx-auto">
              Shop from the most trusted automotive brands in Kenya
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {popularBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/cars?brand=${brand.name.toLowerCase()}`}
                className="group card-hover p-3 text-center transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-xs">
                    {brand.logo}
                  </span>
                </div>
                <h3 className="font-medium text-secondary-900 mb-1 group-hover:text-primary-600 transition-colors text-xs">
                  {brand.name}
                </h3>
                <p className="text-xs text-secondary-600">
                  {brand.count}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/brands"
              className="inline-flex items-center bg-white border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-6 py-2 rounded-md font-medium transition-all text-sm"
            >
              View All Brands
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}