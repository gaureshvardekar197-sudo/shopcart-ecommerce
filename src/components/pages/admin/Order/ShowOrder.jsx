// pages/admin/orders/ShowOrder.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Package,
  Phone,
  Mail,
  User,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Home,
  Building,
  Printer,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  MapPin
} from "lucide-react";
import { getAdminOrderById, updateOrderStatus, deleteOrder } from "../../../API/api-Order";
import { toast } from "react-toastify";

const ShowOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    shipping: true,
    billing: true,
    items: true,
    timeline: true
  });

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'processing', label: 'Processing', color: 'indigo' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'refunded', label: 'Refunded', color: 'gray' },
    { value: 'failed', label: 'Failed', color: 'red' }
  ];

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrderById(id);
      
      console.log('Order response:', response);
      
      let orderData = null;
      if (response?.success && response?.data) {
        orderData = response.data;
      } else if (response?.data) {
        orderData = response.data;
      } else if (response) {
        orderData = response;
      }
      
      setOrder(orderData);
      setNewStatus(orderData?.status);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load order');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setStatusLoading(true);
      const response = await updateOrderStatus(id, newStatus);
      
      if (response?.success) {
        toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
        fetchOrder();
        setShowStatusModal(false);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      setDeleteLoading(true);
      await deleteOrder(id);
      toast.success('Order deleted successfully');
      navigate('/admin/orders');
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      toast.error("Delete failed: " + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };



  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper functions
  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status?.replace(/_/g, ' ') || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      refunded: 'bg-gray-50 text-gray-700 border-gray-200',
      failed: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      default:
        return <Package className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    if (image.startsWith('/storage/')) {
      return `${baseUrl}${image}`;
    }
    
    if (image.startsWith('storage/')) {
      return `${baseUrl}/${image}`;
    }
    
    if (image.startsWith('products/')) {
      return `${baseUrl}/storage/${image}`;
    }
    
    return `${baseUrl}/storage/products/${image}`;
  };

  const getCustomerName = () => {
    if (!order) return 'N/A';
    if (order.customer?.name) return order.customer.name;
    if (order.shipping_address?.full_name) return order.shipping_address.full_name;
    if (order.user?.name) return order.user.name;
    return 'N/A';
  };

  const getCustomerEmail = () => {
    if (!order) return 'N/A';
    if (order.shipping_address?.email) return order.shipping_address.email;
    if (order.customer?.email) return order.customer.email;
    if (order.user?.email) return order.user.email;
    return 'N/A';
  };

  const getCustomerPhone = () => {
    if (!order) return 'N/A';
    if (order.shipping_address?.phone) return order.shipping_address.phone;
    if (order.customer?.phone) return order.customer.phone;
    if (order.user?.phone) return order.user.phone;
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed for mobile */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/admin/orders"
                className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  Order #{order.id}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage order details</p>
              </div>
            </div>
            
            {/* Status Badge - Mobile optimized */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Action Buttons - Scrollable on mobile */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap sm:overflow-visible">
            {/* <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </button> */}
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Update Status</span>
              <span className="sm:hidden">Status</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{deleteLoading ? 'Deleting...' : 'Delete'}</span>
              <span className="sm:hidden">{deleteLoading ? '...' : 'Del'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Order Summary Card - Always visible on mobile */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm mb-1">Order Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(order.total)}</p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:gap-6 gap-4">
                <div>
                  <p className="text-blue-100 text-xs mb-1">Items</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">{order.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs mb-1">Payment</p>
                  <p className="text-sm sm:text-base font-semibold text-white capitalize truncate">
                    {order.payment_method === 'cod' ? 'COD' : order.payment_method}
                  </p>
                </div>
                <div className="col-span-2 sm:col-auto">
                  <p className="text-blue-100 text-xs mb-1">Order Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Grid - Changes based on screen size */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Takes full width on mobile, 2/3 on laptop */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Information - Collapsible on mobile */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => toggleSection('customer')}
              >
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Customer Information
                </h2>
                <button className="lg:hidden">
                  {expandedSections.customer ? 
                    <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </button>
              </div>
              
              {(expandedSections.customer || window.innerWidth >= 1024) && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                      <p className="font-medium text-sm sm:text-base text-gray-900 break-words">{getCustomerName()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="text-xs text-gray-500 mb-1 block">Email</label>
                      <p className="font-medium text-sm sm:text-base text-gray-900 break-all">{getCustomerEmail()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                      <p className="font-medium text-sm sm:text-base text-gray-900">{getCustomerPhone()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <label className="text-xs text-gray-500 mb-1 block">Customer Since</label>
                      <p className="font-medium text-sm sm:text-base text-gray-900">
                        {order.user?.created_at ? formatDate(order.user.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address - Collapsible on mobile */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => toggleSection('shipping')}
              >
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Shipping Address
                </h2>
                <button className="lg:hidden">
                  {expandedSections.shipping ? 
                    <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </button>
              </div>
              
              {(expandedSections.shipping || window.innerWidth >= 1024) && (
                <div className="p-4 sm:p-6">
                  {order.shipping_address ? (
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Home className="w-5 h-5 text-gray-400 hidden sm:block flex-shrink-0 mt-1" />
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {order.shipping_address.full_name}
                          </p>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            <p>{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && (
                              <p>{order.shipping_address.address_line2}</p>
                            )}
                            {order.shipping_address.landmark && (
                              <p className="text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {order.shipping_address.landmark}
                              </p>
                            )}
                            <p className="font-medium">
                              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.shipping_address.phone}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 break-all">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{order.shipping_address.email}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No shipping address available</p>
                  )}
                </div>
              )}
            </div>

            {/* Billing Address - Collapsible on mobile */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => toggleSection('billing')}
              >
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Billing Address
                </h2>
                <button className="lg:hidden">
                  {expandedSections.billing ? 
                    <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </button>
              </div>
              
              {(expandedSections.billing || window.innerWidth >= 1024) && (
                <div className="p-4 sm:p-6">
                  {order.billing_address ? (
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Building className="w-5 h-5 text-gray-400 hidden sm:block flex-shrink-0 mt-1" />
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {order.billing_address.full_name}
                          </p>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            <p>{order.billing_address.address_line1}</p>
                            {order.billing_address.address_line2 && (
                              <p>{order.billing_address.address_line2}</p>
                            )}
                            <p className="font-medium">
                              {order.billing_address.city}, {order.billing_address.state} - {order.billing_address.pincode}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.billing_address.phone}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 break-all">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{order.billing_address.email}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">Same as shipping address</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky lg:top-24">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Order Summary
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                    <span className="font-medium text-sm sm:text-base text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Delivery</span>
                    <span className="font-medium text-sm sm:text-base text-gray-900">
                      {order.delivery_charge > 0 ? formatCurrency(order.delivery_charge) : 'FREE'}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-xs sm:text-sm text-gray-600">Discount</span>
                      <span className="font-medium text-sm sm:text-base text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            {order.delivery_instructions && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-amber-50">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    Delivery Notes
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    {order.delivery_instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Section */}
        <div className="mt-4 sm:mt-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('items')}
            >
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Order Items ({order.items?.length || 0})
              </h2>
              <button className="lg:hidden">
                {expandedSections.items ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
            
            {(expandedSections.items || window.innerWidth >= 1024) && (
              <div className="p-4 sm:p-6">
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {order.items.map((item, index) => {
                      const imageUrl = getImageUrl(item.image) || getImageUrl(item.image_url);
                      
                      return (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                          {/* Product Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mx-auto sm:mx-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=80`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div>
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 text-center sm:text-left">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 text-center sm:text-left">
                                  ID: #{item.product_id}
                                </p>
                              </div>
                              <p className="text-base sm:text-lg font-bold text-blue-600 text-center sm:text-right">
                                {formatCurrency(item.total || item.price * item.quantity)}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mt-3">
                              <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200">
                                <Tag className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Price:</span>
                                <span className="text-xs font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200">
                                <Package className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Qty:</span>
                                <span className="text-xs font-semibold text-gray-900">{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500">No items found for this order</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-4 sm:mt-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('timeline')}
            >
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Order Timeline
              </h2>
              <button className="lg:hidden">
                {expandedSections.timeline ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
            
            {(expandedSections.timeline || window.innerWidth >= 1024) && (
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Order Placed */}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      {order.status !== 'pending' && (
                        <div className="absolute top-8 sm:top-10 left-4 sm:left-5 w-0.5 h-8 sm:h-12 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-3 sm:pb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">Order Placed</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Status Updates */}
                  {order.status !== 'pending' && (
                    <div className="flex gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getStatusColor(order.status).split(' ')[0]} rounded-full flex items-center justify-center`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          Status Updated to {getStatusLabel(order.status)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(order.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal - Responsive */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Update Order Status</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Order #{order.id}</p>
            </div>
            
            <div className="p-4 sm:p-6">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 rounded-b-xl">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={statusLoading}
                className="px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm w-full sm:w-auto order-1 sm:order-2"
              >
                {statusLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowOrder;