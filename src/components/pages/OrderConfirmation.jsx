import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '../layout/Container';
import { CheckCircleIcon, TruckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import confetti from 'canvas-confetti';

const API_URL = "http://localhost:8000";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    triggerConfetti();
  }, [orderId]);

  const triggerConfetti = () => {
    // Paper bomb effect - multiple bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#3B82F6', '#10B981']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#F59E0B', '#EF4444']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#8B5CF6', '#EC4899']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#8B5CF6', '#EC4899']
    });
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data?.data) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Order Confirmed! 🎉
              </h1>
              <p className="text-blue-100">
                Thank you for your purchase
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Order Summary */}
              {order && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
                    <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Your Items</span>
                  </div>
                  
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ×{item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-blue-600">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Status */}
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-6 py-3 bg-blue-50 dark:bg-gray-700/50 rounded-lg">
                <TruckIcon className="w-5 h-5 text-blue-600" />
                <span>Your order is being processed</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/my-orders"
                  className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Track My Order
                </Link>

                <Link
                  to="/products"
                  className="block w-full py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 text-center rounded-xl font-semibold transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import Container from '../../components/layout/Container';
// import { 
//   CheckCircleIcon, 
//   TruckIcon, 
//   ShoppingBagIcon,
//   MapPinIcon,
//   CreditCardIcon,
//   CalendarIcon,
//   ArrowLeftIcon
// } from '@heroicons/react/24/outline';
// import { getOrderById } from '../API/api-Order';
// import { toast } from 'react-toastify';

// const formatCurrency = (value) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     maximumFractionDigits: 0
//   }).format(Number(value) || 0);
// };

// const getImageUrl = (image) => {
//   if (!image) return null;
  
//   if (image.startsWith('http')) {
//     return image;
//   }
  
//   if (image.startsWith('products/')) {
//     return `http://localhost:8000/storage/${image}`;
//   }
  
//   return `http://localhost:8000/storage/products/${image}`;
// };

// const getStatusStep = (status) => {
//   const steps = ['pending', 'processing', 'completed', 'delivered'];
//   return steps.indexOf(status);
// };

// export default function OrderConfirmation() {
//   const { orderId } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrderDetails();
//   }, [orderId]);

//   const fetchOrderDetails = async () => {
//     try {
//       const response = await getOrderById(orderId);
      
//       console.log('Order details response:', response); // Debug log
      
//       if (response?.success && response?.data) {
//         setOrder(response.data);
//       } else if (response?.data) {
//         setOrder(response.data);
//       } else {
//         toast.error('Order not found');
//       }
//     } catch (error) {
//       console.error('Error fetching order:', error);
//       toast.error('Failed to load order details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
//           <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
//         <Container>
//           <div className="max-w-2xl mx-auto text-center">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
//               <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//                 Order Not Found
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 The order you're looking for doesn't exist or you don't have permission to view it.
//               </p>
//               <Link
//                 to="/products"
//                 className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
//               >
//                 Continue Shopping
//               </Link>
//             </div>
//           </div>
//         </Container>
//       </div>
//     );
//   }

//   // Calculate dates
//   const orderDate = new Date(order.created_at);
//   const deliveryDate = new Date(orderDate);
//   deliveryDate.setDate(deliveryDate.getDate() + 5);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <Container>
//         {/* Back Button */}
//         <Link
//           to="/my-orders"
//           className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
//         >
//           <ArrowLeftIcon className="w-4 h-4" />
//           Back to Orders
//         </Link>

//         <div className="max-w-4xl mx-auto">
//           {/* Success Message */}
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <CheckCircleIcon className="w-12 h-12 text-green-600" />
//               </div>
              
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
//                 Order Confirmed!
//               </h1>
              
//               <p className="text-gray-600 dark:text-gray-400 mb-2">
//                 Thank you for your order. Your order has been confirmed and will be shipped soon.
//               </p>
              
//               <p className="text-lg font-semibold text-gray-900 dark:text-white">
//                 Order ID: <span className="text-blue-600">#{order.id}</span>
//               </p>
//             </div>

//             {/* Order Timeline */}
//             <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between">
//                 {['pending', 'processing', 'completed', 'delivered'].map((step, index) => {
//                   const currentStepIndex = getStatusStep(order.status);
//                   const isCompleted = index <= currentStepIndex;
//                   const isCurrent = index === currentStepIndex;
                  
//                   let bgColor = 'bg-gray-200 dark:bg-gray-700';
//                   let textColor = 'text-gray-500 dark:text-gray-400';
                  
//                   if (isCompleted) {
//                     bgColor = 'bg-green-500';
//                     textColor = 'text-green-600';
//                   }
                  
//                   if (isCurrent && order.status === 'processing') {
//                     bgColor = 'bg-blue-500';
//                   }
                  
//                   return (
//                     <div key={step} className="text-center flex-1">
//                       <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${bgColor} text-white mb-2`}>
//                         {isCompleted ? (
//                           <CheckCircleIcon className="w-5 h-5" />
//                         ) : (
//                           <span>{index + 1}</span>
//                         )}
//                       </div>
//                       <p className={`text-xs font-medium capitalize ${textColor}`}>
//                         {step}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Order Details */}
//           <div className="grid md:grid-cols-2 gap-6 mb-6">
//             {/* Shipping Address */}
//             {order.shipping_address && (
//               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                   <MapPinIcon className="w-5 h-5 text-blue-600" />
//                   Shipping Address
//                 </h2>

//                 <div className="space-y-1">
//                   <p className="font-medium text-gray-900 dark:text-white">
//                     {order.shipping_address.full_name}
//                   </p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     {order.shipping_address.address_line1}
//                     {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
//                   </p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
//                   </p>
//                   {order.shipping_address.landmark && (
//                     <p className="text-gray-600 dark:text-gray-400">
//                       Landmark: {order.shipping_address.landmark}
//                     </p>
//                   )}
//                   <p className="text-gray-600 dark:text-gray-400 mt-2">
//                     📞 {order.shipping_address.phone}
//                   </p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     ✉️ {order.shipping_address.email}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Order Info */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                 Order Information
//               </h2>

//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Order Date</span>
//                   <span className="font-medium text-gray-900 dark:text-white">
//                     {orderDate.toLocaleDateString('en-IN', {
//                       day: 'numeric',
//                       month: 'long',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
//                   <span className="font-medium text-gray-900 dark:text-white capitalize">
//                     {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
//                   </span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Order Status</span>
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
//                     order.status === 'completed' || order.status === 'delivered'
//                       ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
//                       : order.status === 'processing'
//                       ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
//                       : order.status === 'cancelled'
//                       ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
//                       : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
//                   }`}>
//                     {order.status}
//                   </span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-400">Expected Delivery</span>
//                   <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
//                     <CalendarIcon className="w-4 h-4" />
//                     {deliveryDate.toLocaleDateString('en-IN', { 
//                       day: 'numeric', 
//                       month: 'short',
//                       year: 'numeric'
//                     })}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Order Items */}
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//               Order Items
//             </h2>

//             <div className="space-y-4">
//               {(order.items || []).map((item, index) => {
//                 const itemImage = item.image || item.image_url;
//                 const imageUrl = itemImage 
//                   ? getImageUrl(itemImage)
//                   : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=64`;
                
//                 return (
//                   <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
//                     <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
//                       <img
//                         src={imageUrl}
//                         alt={item.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=64`;
//                         }}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <p className="font-medium text-gray-900 dark:text-white">
//                         {item.name}
//                       </p>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Quantity: {item.quantity} × {formatCurrency(item.price)}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-blue-600 dark:text-blue-400">
//                         {formatCurrency(item.total || item.price * item.quantity)}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Order Summary */}
//             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
//                   <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
//                   <span className="text-gray-900 dark:text-white">
//                     {order.delivery_charge === 0 ? 'Free' : formatCurrency(order.delivery_charge)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-lg font-bold pt-2">
//                   <span className="text-gray-900 dark:text-white">Total</span>
//                   <span className="text-blue-600 dark:text-blue-400">{formatCurrency(order.total)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4">
//             <Link
//               to="/my-orders"
//               className="flex-1 text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
//             >
//               View All Orders
//             </Link>
            
//             <Link
//               to="/products"
//               className="flex-1 text-center py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// }