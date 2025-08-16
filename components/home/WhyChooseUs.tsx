'use client'
import { Shield, Users, Search, Zap, Award, HeadphonesIcon } from 'lucide-react'

export default function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All cars are verified by our team to ensure authenticity and quality before listing.'
    },
    {
      icon: Users,
      title: 'Trusted Dealers',
      description: 'Work with certified dealers and verified private sellers across Kenya.'
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Find exactly what you\'re looking for with our powerful search and filter options.'
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'List your car in minutes or find your dream car with our streamlined process.'
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Competitive pricing with both free and premium listing options for sellers.'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our customer support team is always ready to help you with any questions.'
    }
  ]

  const stats = [
    { number: '12,450+', label: 'Cars Listed', sublabel: 'Active listings' },
    { number: '850+', label: 'Dealers', sublabel: 'Verified partners' },
    { number: '25,000+', label: 'Customers', sublabel: 'Happy buyers' },
    { number: '47', label: 'Cities', sublabel: 'Across Kenya' }
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-secondary-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-3">
            Why Choose Kenya Car Marketplace?
          </h2>
          <p className="text-base text-secondary-600 max-w-3xl mx-auto">
            We're committed to making car buying and selling in Kenya simple, safe, and transparent. 
            Here's what sets us apart from the competition.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-soft p-6 lg:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-2">
              Trusted by Thousands
            </h3>
            <p className="text-secondary-600 text-sm">
              Join Kenya's fastest-growing automotive marketplace
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-base font-semibold text-secondary-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-secondary-600">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 lg:p-8 text-white">
            <h3 className="text-xl lg:text-2xl font-bold mb-3">
              Ready to Find Your Perfect Car?
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto text-sm">
              Join thousands of satisfied customers who have found their dream cars through our platform. 
              Start your search today or list your car for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-2 rounded-md font-medium transition-all text-sm">
                Browse Cars
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-2 rounded-md font-medium transition-all text-sm">
                Sell Your Car
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}