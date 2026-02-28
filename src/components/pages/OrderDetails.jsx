// pages/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '../../components/layout/Container';
import { 
  ShoppingBagIcon, 
  CalendarIcon, 
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowLeftIcon,
  HomeModernIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getOrderById } from '../API/api-Order';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
      icon: ClockIcon,
      label: 'Pending',
      bg: 'bg-yellow-50 dark:bg-yellow-900/10',
      border: 'border-yellow-200 dark:border-yellow-800',
      progress: 0
    },
    confirmed: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      icon: CheckCircleIcon,
      label: 'Confirmed',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      progress: 25
    },
    processing: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      icon: TruckIcon,
      label: 'Processing',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      progress: 50
    },
    shipped: { 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', 
      icon: TruckIcon,
      label: 'Shipped',
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      border: 'border-purple-200 dark:border-purple-800',
      progress: 75
    },
    out_for_delivery: { 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
      icon: TruckIcon,
      label: 'Out for Delivery',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-200 dark:border-orange-800',
      progress: 90
    },
    delivered: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
      icon: CheckCircleIcon,
      label: 'Delivered',
      bg: 'bg-green-50 dark:bg-green-900/10',
      border: 'border-green-200 dark:border-green-800',
      progress: 100
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      icon: XCircleIcon,
      label: 'Cancelled',
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-200 dark:border-red-800',
      progress: 0
    },
    refunded: { 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
      icon: XCircleIcon,
      label: 'Refunded',
      bg: 'bg-gray-50 dark:bg-gray-900/10',
      border: 'border-gray-200 dark:border-gray-800',
      progress: 0
    },
    failed: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      icon: XCircleIcon,
      label: 'Failed',
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-200 dark:border-red-800',
      progress: 0
    }
  };

  return statusConfig[status] || statusConfig.pending;
};

const getImageUrl = (image) => {
  if (!image) return null;
  
  if (image.startsWith('http')) {
    return image;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  if (image.startsWith('products/')) {
    return `${baseUrl}/storage/${image}`;
  }
  
  if (image.startsWith('/storage/')) {
    return `${baseUrl}${image}`;
  }
  
  return `${baseUrl}/storage/products/${image}`;
};

const getAddressIcon = (type) => {
  return type === 'home' ? HomeModernIcon : BuildingOfficeIcon;
};

// Progress Bar Component
const OrderProgress = ({ progress }) => {
  if (progress === undefined || progress === 0) return null;
  
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
      <div 
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(id);
      
      let orderData = null;
      
      if (response?.success && response?.data) {
        orderData = response.data;
      } else if (response?.data) {
        orderData = response.data;
      } else if (response) {
        orderData = response;
      }
      
      setOrder(orderData);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading order details...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center py-12 px-4">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Order not found
            </h3>
            <Link
              to="/orders"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const statusConfig = getStatusBadge(order.status);
  const StatusIcon = statusConfig.icon;
  const items = order.items || [];
  const shippingAddress = order.shipping_address || {};
  const billingAddress = order.billing_address || {};
  const ShippingIcon = getAddressIcon(shippingAddress.address_type);
  const BillingIcon = getAddressIcon(billingAddress.address_type);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <Link
            to="/my-orders"
            className="flex items-center text-gray-600 dark:text-gray-300"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Order Details</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      <Container>
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden sm:flex sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/my-orders"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h1>
          </div>
        </div>

        {/* Order Header Card - Mobile Optimized */}
        <div className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 sm:p-3 rounded-full ${statusConfig.color.split(' ')[0]} flex-shrink-0`}>
                <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status:</p>
                  <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Order #{order.id}
                </p>
                <OrderProgress progress={statusConfig.progress} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg sm:p-0 sm:bg-transparent">
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary Card - Visible only on mobile */}
        <div className="block sm:hidden mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <CreditCardIcon className="w-4 h-4" />
              Order Summary
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.delivery_charge > 0 ? formatCurrency(order.delivery_charge) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-2">
                <CreditCardIcon className="w-3 h-3" />
                <span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Order Items Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Items ({items.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => {
                  const itemImage = item.image || item.image_url;
                  const imageUrl = itemImage 
                    ? getImageUrl(itemImage)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=128`;
                  
                  return (
                    <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=128`;
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between gap-2">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ID: #{item.product_id}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(item.total || item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              ₹{formatCurrency(item.price)} × {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Timeline - Mobile Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Timeline
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 mt-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        Order Placed
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {order.status !== 'pending' && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 mt-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Status: {statusConfig.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(order.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Addresses (Hidden on mobile, visible on tablet/desktop) */}
          <div className="hidden sm:block space-y-4 sm:space-y-6">
            {/* Desktop Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Order Summary
                </h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.delivery_charge > 0 ? formatCurrency(order.delivery_charge) : 'Free'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <CreditCardIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delivery Address
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <ShippingIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {shippingAddress.full_name}
                    </p>
                    <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p className="truncate">{shippingAddress.address_line1}</p>
                      {shippingAddress.address_line2 && <p className="truncate">{shippingAddress.address_line2}</p>}
                      <p className="truncate">
                        {shippingAddress.city}, {shippingAddress.state}
                      </p>
                      <p className="font-medium">{shippingAddress.pincode}</p>
                    </div>
                    
                    <div className="mt-2 sm:mt-3 space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <PhoneIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{shippingAddress.phone}</span>
                      </div>
                      {shippingAddress.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <EnvelopeIcon className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-900 dark:text-white truncate">{shippingAddress.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            {billingAddress && Object.keys(billingAddress).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Billing Address
                  </h2>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <BillingIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {billingAddress.full_name}
                      </p>
                      <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <p className="truncate">{billingAddress.address_line1}</p>
                        {billingAddress.address_line2 && <p className="truncate">{billingAddress.address_line2}</p>}
                        <p className="truncate">
                          {billingAddress.city}, {billingAddress.state}
                        </p>
                        <p className="font-medium">{billingAddress.pincode}</p>
                      </div>
                      
                      <div className="mt-2 sm:mt-3 space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <PhoneIcon className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">{billingAddress.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Instructions */}
            {order.delivery_instructions && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Delivery Notes
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    📝 {order.delivery_instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Address Section - Visible only on mobile */}
        <div className="block sm:hidden mt-4 space-y-4">
          {/* Shipping Address - Mobile */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TruckIcon className="w-4 h-4" />
                Delivery Address
              </h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-start gap-2">
                <ShippingIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {shippingAddress.full_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {shippingAddress.address_line1}
                    {shippingAddress.address_line2 && `, ${shippingAddress.address_line2}`}
                    {shippingAddress.landmark && <span className="block">Landmark: {shippingAddress.landmark}</span>}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3 text-gray-500" />
                      {shippingAddress.phone}
                    </span>
                    {shippingAddress.email && (
                      <span className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3 text-gray-500" />
                        <span className="truncate">{shippingAddress.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address - Mobile */}
          {billingAddress && Object.keys(billingAddress).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4" />
                  Billing Address
                </h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <BillingIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {billingAddress.full_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {billingAddress.address_line1}
                      {billingAddress.address_line2 && `, ${billingAddress.address_line2}`}
                      <br />
                      {billingAddress.city}, {billingAddress.state} - {billingAddress.pincode}
                    </p>
                    
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3 text-gray-500" />
                        {billingAddress.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Instructions - Mobile */}
          {order.delivery_instructions && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Delivery Notes
                </h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  📝 {order.delivery_instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}