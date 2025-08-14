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
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
            Why Choose Kenya Car Marketplace?
          </h2>
          <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
            We're committed to making car buying and selling in Kenya simple, safe, and transparent. 
            Here's what sets us apart from the competition.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-soft p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
              Trusted by Thousands
            </h3>
            <p className="text-secondary-600">
              Join Kenya's fastest-growing automotive marketplace
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-secondary-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-secondary-600">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Find Your Perfect Car?
            </h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have found their dream cars through our platform. 
              Start your search today or list your car for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg">
                Browse Cars
              </button>
              <button className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
                Sell Your Car
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}