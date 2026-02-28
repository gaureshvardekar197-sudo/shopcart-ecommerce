import { Link } from 'react-router-dom'
import Container from '../layout/Container'
import { 
  FireIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid'

function Deals() {
  const deals = [
    {
      id: 1,
      name: 'Wireless Noise-Canceling Headphones',
      price: 89.99,
      originalPrice: 149.99,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      category: 'Electronics',
      rating: 4.5,
      reviews: 328,
      timeLeft: '02:45:33',
      popular: true
    },
    {
      id: 2,
      name: 'Smart Watch Pro Series 8',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      category: 'Electronics',
      rating: 4.8,
      reviews: 156,
      timeLeft: '05:22:15',
      popular: true
    },
    {
      id: 3,
      name: 'Gaming Laptop RTX 4070',
      price: 899.99,
      originalPrice: 1299.99,
      discount: 31,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
      category: 'Computers',
      rating: 4.7,
      reviews: 89,
      timeLeft: '01:15:42',
      popular: true
    },
    {
      id: 4,
      name: 'Professional DSLR Camera',
      price: 499.99,
      originalPrice: 799.99,
      discount: 38,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      category: 'Photography',
      rating: 4.6,
      reviews: 342,
      timeLeft: '08:10:25'
    },
    {
      id: 5,
      name: '10" Tablet with Stylus',
      price: 299.99,
      originalPrice: 449.99,
      discount: 33,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      category: 'Electronics',
      rating: 4.4,
      reviews: 214,
      timeLeft: '12:30:00'
    },
    {
      id: 6,
      name: 'Bluetooth Speaker',
      price: 79.99,
      originalPrice: 129.99,
      discount: 38,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
      category: 'Audio',
      rating: 4.3,
      reviews: 189,
      timeLeft: '06:45:18'
    }
  ]

  const popularDeals = deals.filter(deal => deal.popular)
  const otherDeals = deals.filter(deal => !deal.popular)

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    return `${hours}h ${minutes}m`
  }

  return (
    <Container>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full mb-4">
            <FireIcon className="w-5 h-5" />
            <span className="font-bold">FLASH SALE</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Today's Best Deals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Limited time offers on premium products. Shop now before they're gone!
          </p>
        </div>

        {/* Popular Deals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Most Popular
            </h2>
            <Link 
              to="/deals/all" 
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularDeals.map(deal => (
              <div key={deal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{deal.discount}%
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      <ClockIcon className="w-4 h-4" />
                      {formatTime(deal.timeLeft)}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{deal.category}</span>
                    <div className="flex items-center gap-1">
                      <SolidStarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{deal.rating}</span>
                      <span className="text-gray-400 text-sm">({deal.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {deal.name}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${deal.price}
                      </div>
                      <div className="text-gray-500 line-through text-sm">
                        ${deal.originalPrice}
                      </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Save ${(deal.originalPrice - deal.price).toFixed(2)}
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Deals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            More Great Deals
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherDeals.map(deal => (
              <div key={deal.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                <div className="flex">
                  <div className="w-1/3">
                    <img 
                      src={deal.image} 
                      alt={deal.name}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded">
                        -{deal.discount}%
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <ClockIcon className="w-3 h-3" />
                        {formatTime(deal.timeLeft)}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                      {deal.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(deal.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({deal.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${deal.price}
                        </span>
                        <span className="text-gray-500 line-through text-sm ml-2">
                          ${deal.originalPrice}
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <ShoppingCartIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Don't Miss Out!</h3>
          <p className="mb-6 opacity-90">
            Subscribe to get daily deal alerts delivered to your inbox
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-80 mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Deals