// import { Link } from 'react-router-dom'
// import Container from '../layout/Container'
// import { 
//   StarIcon, 
//   ArrowRightIcon, 
//   ShoppingBagIcon,
//   DevicePhoneMobileIcon,
//   HomeIcon,
//   SparklesIcon,
//   ShieldCheckIcon,
//   TruckIcon,
//   TagIcon
// } from '@heroicons/react/24/outline'
// import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

// function Home() {
//   const featuredProducts = [
//     {
//       id: 1,
//       name: 'Wireless Noise-Canceling Headphones',
//       price: 89.99,
//       originalPrice: 129.99,
//       rating: 4.5,
//       reviews: 328,
//       image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
//       category: 'Electronics',
//       badge: 'Best Seller'
//     },
//     {
//       id: 2,
//       name: 'Smart Watch Pro Series',
//       price: 299.99,
//       originalPrice: 399.99,
//       rating: 4.8,
//       reviews: 156,
//       image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
//       category: 'Electronics',
//       badge: 'New'
//     },
//     {
//       id: 3,
//       name: 'Premium Leather Backpack',
//       price: 79.99,
//       rating: 4.3,
//       reviews: 89,
//       image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
//       category: 'Fashion',
//       badge: 'Trending'
//     },
//     {
//       id: 4,
//       name: 'Ergonomic Office Chair',
//       price: 249.99,
//       rating: 4.7,
//       reviews: 215,
//       image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
//       category: 'Home',
//       badge: 'Sale'
//     }
//   ]

//   const categories = [
//     { 
//       id: 1, 
//       name: 'Electronics', 
//       count: 245, 
//       icon: DevicePhoneMobileIcon,
//       color: 'bg-blue-100 text-blue-600',
//       gradient: 'from-blue-500 to-cyan-500'
//     },
//     { 
//       id: 2, 
//       name: 'Fashion', 
//       count: 320, 
//       icon: ShoppingBagIcon,
//       color: 'bg-pink-100 text-pink-600',
//       gradient: 'from-pink-500 to-rose-500'
//     },
//     { 
//       id: 3, 
//       name: 'Home & Living', 
//       count: 178, 
//       icon: HomeIcon,
//       color: 'bg-green-100 text-green-600',
//       gradient: 'from-green-500 to-emerald-500'
//     },
//     { 
//       id: 4, 
//       name: 'Sports & Fitness', 
//       count: 96, 
//       icon: SparklesIcon,
//       color: 'bg-orange-100 text-orange-600',
//       gradient: 'from-orange-500 to-amber-500'
//     }
//   ]

//   const features = [
//     {
//       icon: TruckIcon,
//       title: 'Free Shipping',
//       description: 'On orders over $50'
//     },
//     {
//       icon: ShieldCheckIcon,
//       title: 'Secure Payment',
//       description: '100% secure transactions'
//     },
//     {
//       icon: TagIcon,
//       title: 'Best Price',
//       description: 'Price match guarantee'
//     }
//   ]

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900">
//       {/* Hero Section */}
//       {/* <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white">
//         <div className="absolute inset-0 bg-black/10" />
//         <Container>
//           <div className="relative py-24 md:py-32">
//             <div className="max-w-2xl">
//               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
//                 <span className="text-sm font-medium">🎉 Summer Sale: Up to 50% OFF</span>
//               </div>
//               <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
//                 Discover Amazing
//                 <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
//                   Products & Deals
//                 </span>
//               </h1>
//               <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
//                 Shop the latest trends in electronics, fashion, home decor and more. 
//                 Quality products at unbeatable prices.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link to="/products">
//                   <button className="group flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105">
//                     Start Shopping
//                     <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </Link>
//                 <Link to="/deals">
//                   <button className="group flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
//                     View Deals
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </Container>
//       </section> */}

//       {/* Features */}
//       <section className="py-12">
//         <Container>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
//                 <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
//                   <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg text-gray-900 dark:text-white">{feature.title}</h3>
//                   <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Container>
//       </section>

//       {/* Categories */}
//       <section className="py-16">
//         <Container>
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Shop by Category
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Browse through our wide range of categories to find exactly what you're looking for
//             </p>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {categories.map(category => {
//               const Icon = category.icon
//               return (
//                 <Link 
//                   key={category.id} 
//                   to={`/category/${category.name.toLowerCase()}`}
//                   className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                 >
//                   <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
//                   <div className="p-8 text-center">
//                     <div className={`${category.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
//                       <Icon className="w-10 h-10" />
//                     </div>
//                     <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
//                       {category.name}
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-400">
//                       {category.count} items
//                     </p>
//                   </div>
//                 </Link>
//               )
//             })}
//           </div>
//         </Container>
//       </section>

//       {/* Featured Products */}
//       <section className="py-16 bg-white dark:bg-gray-900">
//         <Container>
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
//                 Featured Products
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Handpicked selection of our best products
//               </p>
//             </div>
//             <Link to="/products">
//               <button className="group flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
//                 View All Products
//                 <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </button>
//             </Link>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//             {featuredProducts.map(product => (
//               <div 
//                 key={product.id} 
//                 className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
//               >
//                 {/* Product Image */}
//                 <div className="relative overflow-hidden">
//                   <img 
//                     src={product.image} 
//                     alt={product.name} 
//                     className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
//                   />
//                   {product.badge && (
//                     <div className="absolute top-4 left-4">
//                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                         product.badge === 'Best Seller' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
//                         product.badge === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
//                         product.badge === 'Sale' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
//                         'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
//                       }`}>
//                         {product.badge}
//                       </span>
//                     </div>
//                   )}
//                   {product.originalPrice && (
//                     <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
//                       Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
//                     </div>
//                   )}
//                   <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700">
//                     <ShoppingBagIcon className="w-5 h-5" />
//                   </button>
//                 </div>

//                 {/* Product Info */}
//                 <div className="p-6">
//                   <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
//                   <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
//                     {product.name}
//                   </h3>
                  
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="flex">
//                       {[...Array(5)].map((_, i) => (
//                         <StarIconSolid 
//                           key={i} 
//                           className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
//                         />
//                       ))}
//                     </div>
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       ({product.reviews} reviews)
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-2xl font-bold text-gray-900 dark:text-white">
//                         ${product.price}
//                       </span>
//                       {product.originalPrice && (
//                         <span className="text-gray-500 line-through ml-2">
//                           ${product.originalPrice}
//                         </span>
//                       )}
//                     </div>
//                     <button className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
//                       Add to Cart
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Container>
//       </section>

//       {/* Newsletter */}
//       <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
//         <Container>
//           <div className="max-w-3xl mx-auto text-center">
//             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
//               <SparklesIcon className="w-5 h-5" />
//               <span className="text-sm font-medium">Exclusive Offers</span>
//             </div>
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Get 15% Off Your First Order
//             </h2>
//             <p className="text-gray-300 mb-8 max-w-xl mx-auto">
//               Subscribe to our newsletter and be the first to know about new arrivals, 
//               exclusive offers, and insider deals.
//             </p>
//             <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//               <input 
//                 type="email" 
//                 placeholder="Enter your email"
//                 className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-gray-400"
//                 required
//               />
//               <button 
//                 type="submit"
//                 className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
//               >
//                 Subscribe
//               </button>
//             </form>
//             <p className="text-sm text-gray-400 mt-4">
//               By subscribing, you agree to our Privacy Policy
//             </p>
//           </div>
//         </Container>
//       </section>
//     </div>
//   )
// }

// export default Home


import React from 'react'
import Hero from '../home/Hero'
import Features from '../home/Features'
import Categories from '../home/Categories'
import FeaturedProducts from '../home/FeaturedProducts'

function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <Hero />
      <Features />
      <Categories />
      <FeaturedProducts />
    </div>
  )
}

export default Home
