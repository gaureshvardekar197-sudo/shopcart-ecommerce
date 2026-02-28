import Container from '../layout/Container'
import { 
  CheckCircleIcon,
  UsersIcon,
  TrophyIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

function About() {
  const values = [
    {
      icon: CheckCircleIcon,
      title: 'Quality First',
      description: 'We source only the highest quality products from trusted suppliers.'
    },
    {
      icon: UsersIcon,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do.'
    },
    {
      icon: TrophyIcon,
      title: 'Excellence',
      description: 'Striving for excellence in every aspect of our business.'
    },
    {
      icon: HeartIcon,
      title: 'Integrity',
      description: 'Honest and transparent in all our dealings.'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '10K+', label: 'Products' },
    { number: '150+', label: 'Brands' },
    { number: '24/7', label: 'Support' }
  ]

  const team = [
    { name: 'Alex Johnson', role: 'Founder & CEO' },
    { name: 'Maria Garcia', role: 'Head of Operations' },
    { name: 'David Chen', role: 'CTO' },
    { name: 'Sarah Miller', role: 'Head of Marketing' }
  ]

  return (
    <Container>
      <div className="py-4 md:py-4">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About ShopCart
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're more than just an e-commerce platform. We're here to make your shopping experience better.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 md:mb-16">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Our Mission
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              To provide exceptional value through quality products, outstanding service, 
              and an unforgettable shopping experience for everyone.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Story
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Founded in 2020, ShopCart started with a simple mission: to make online 
              shopping easier, more accessible, and more enjoyable for everyone.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              What began as a small startup has grown into a trusted e-commerce platform, 
              serving thousands of customers with quality products and excellent service.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ShopCart in Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Team
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
            A dedicated group of professionals passionate about delivering the best 
            shopping experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-10 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Shop With Us?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of satisfied customers and experience the ShopCart difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Shopping
            </a>
            <a 
              href="/contact" 
              className="inline-block border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default About