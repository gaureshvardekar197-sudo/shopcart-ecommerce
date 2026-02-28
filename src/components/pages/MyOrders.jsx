import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/layout/Container';
import { 
  ShoppingBagIcon, 
  CalendarIcon, 
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getMyOrders } from '../API/api-Order';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
      icon: ClockIcon,
      label: 'Pending'
    },
    confirmed: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      icon: CheckCircleIcon,
      label: 'Confirmed'
    },
    processing: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      icon: TruckIcon,
      label: 'Processing'
    },
    shipped: { 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', 
      icon: TruckIcon,
      label: 'Shipped'
    },
    out_for_delivery: { 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
      icon: TruckIcon,
      label: 'Out for Delivery'
    },
    delivered: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
      icon: CheckCircleIcon,
      label: 'Delivered'
    },
    completed: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
      icon: CheckCircleIcon,
      label: 'Completed'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      icon: XCircleIcon,
      label: 'Cancelled'
    },
    refunded: { 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
      icon: XCircleIcon,
      label: 'Refunded'
    },
    failed: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      icon: XCircleIcon,
      label: 'Failed'
    }
  };

  return statusConfig[status] || statusConfig.pending;
};

const getImageUrl = (image) => {
  if (!image) return null;
  
  // If it's already a full URL
  if (image.startsWith('http')) {
    return image;
  }
  
  // If it's a storage path
  if (image.startsWith('products/')) {
    return `http://localhost:8000/storage/${image}`;
  }
  
  // If it's just the filename
  return `http://localhost:8000/storage/products/${image}`;
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

// MyOrders.jsx - Update just the fetchOrders function
const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await getMyOrders();
    
    console.log('Orders response:', response);
    
    // Handle different response structures
    let ordersData = [];
    
    if (response) {
      // If response has data property with orders array
      if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }
      // If response is directly an array
      else if (Array.isArray(response)) {
        ordersData = response;
      }
      // If response has success and data
      else if (response.success && response.data) {
        ordersData = response.data;
      }
      // If response has orders property
      else if (response.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      }
    }
    
    console.log('Processed orders:', ordersData);
    
    if (ordersData.length === 0) {
      toast.info('No orders found');
    }
    
    setOrders(ordersData);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Better error messages
    if (error.response) {
      if (error.response.status === 401) {
        toast.error('Please login to view orders');
      } else if (error.response.status === 404) {
        toast.error('Orders endpoint not found');
      } else {
        toast.error('Failed to load orders');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your orders...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Container>
        {/* Header with Refresh Button */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and track all your orders
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Tabs - FIXED: Added all status options */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filter.replace('_', ' ')} orders found.`}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusBadge(order.status).icon;
              const statusConfig = getStatusBadge(order.status);
              
              // FIXED: Handle missing items
              const items = order.items || [];
              
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-white">
                          #{order.id || order.order_number || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                        <p className="flex items-center gap-1 text-gray-900 dark:text-white">
                          <CalendarIcon className="w-4 h-4" />
                          {order.created_at 
                            ? new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{statusConfig.label}</span>
                        </span>
                      </div>
                      
                      <Link
                        to={`/order-details/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview - FIXED: Handle empty items */}
                  <div className="p-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Items ({items.length || 0})
                    </p>
                    
                    {items.length > 0 ? (
                      <div className="space-y-3">
                        {items.slice(0, 3).map((item, index) => {
                          const itemImage = item.image || item.image_url;
                          const imageUrl = itemImage 
                            ? getImageUrl(itemImage)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Product')}&background=3B82F6&color=fff&size=48`;
                          
                          return (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={imageUrl}
                                  alt={item.name || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Product')}&background=3B82F6&color=fff&size=48`;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name || 'Product'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Qty: {item.quantity || 0}</span>
                                  <span>×</span>
                                  <span>{formatCurrency(item.price || 0)}</span>
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.total || (item.price * item.quantity) || 0)}
                              </div>
                            </div>
                          );
                        })}
                        {items.length > 3 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{items.length - 3} more items
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No items details available</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCardIcon className="w-4 h-4" />
                        <span>Payment Method:</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || 'N/A')}
                        </span>
                      </div>
                      
                      {order.delivery_instructions && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          📝 {order.delivery_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}