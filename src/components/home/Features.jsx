import { ShieldCheckIcon, TruckIcon, TagIcon } from '@heroicons/react/24/outline'
import Container from '../layout/Container'

export default function Features() {
  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'On orders over $50'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure transactions'
    },
    {
      icon: TagIcon,
      title: 'Best Price',
      description: 'Price match guarantee'
    }
  ]

  return (
    <section className="py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}