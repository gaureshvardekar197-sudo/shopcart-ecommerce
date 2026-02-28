// pages/admin/orders/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../API/api-Order';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Pagination from '../../../Common/Pagination'; // Adjust path as needed

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Payment methods
  const paymentMethods = ['cod', 'online', 'card', 'upi'];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      
      console.log('Orders response:', response);
      
      // Handle different response structures
      let ordersData = [];
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response?.success && response?.data) {
        ordersData = response.data;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      }
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load',
        text: 'Could not load orders. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...orders];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id?.toString().includes(searchLower) ||
        getCustomerName(order).toLowerCase().includes(searchLower) ||
        getCustomerPhone(order).toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.payment_method === paymentFilter);
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.getElementById('orders-table')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
    toast.success('Orders refreshed');
  };

  // Handle delete with SweetAlert
  const handleDelete = (order) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-center">
          <p class="mb-3">You are about to delete order:</p>
          <p class="font-bold text-lg text-red-600">"#${order.id}"</p>
          <p class="mt-3 text-sm text-gray-500">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#f8f9fa',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading
          Swal.fire({
            title: 'Deleting...',
            html: 'Please wait while we delete the order',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const response = await deleteOrder(order.id);
          
          Swal.close();
          
          if (response?.success || response?.data) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              html: `<p>Order <strong>#${order.id}</strong> has been deleted.</p>`,
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            fetchOrders(); // Refresh list
          } else {
            throw new Error('Delete failed');
          }
        } catch (error) {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: error.response?.data?.message || 'Could not delete order',
            confirmButtonColor: '#d33'
          });
        }
      }
    });
  };

  // Handle status update with SweetAlert
  const handleStatusUpdate = (order) => {
    const currentStatus = order.status || 'pending';
    
    Swal.fire({
      title: 'Update Order Status',
      html: `
        <div class="text-left">
          <p class="mb-3 text-gray-600">Order #${order.id}</p>
          <select id="status-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            ${statusOptions.map(opt => 
              `<option value="${opt.value}" ${opt.value === currentStatus ? 'selected' : ''}>
                ${opt.label}
              </option>`
            ).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel',
      preConfirm: async () => {
        const newStatus = document.getElementById('status-select').value;
        if (newStatus === currentStatus) {
          Swal.showValidationMessage('Please select a different status');
          return false;
        }
        return newStatus;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Updating...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const response = await updateOrderStatus(order.id, result.value);
          
          Swal.close();
          
          if (response?.success || response?.data) {
            Swal.fire({
              icon: 'success',
              title: 'Status Updated',
              text: `Order status changed to ${result.value.replace('_', ' ')}`,
              timer: 2000,
              showConfirmButton: false
            });
            fetchOrders();
          } else {
            throw new Error('Update failed');
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.message || 'Could not update status'
          });
        }
      }
    });
  };

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'shipped':
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCustomerName = (order) => {
    if (!order) return 'N/A';
    if (order.shipping_address?.full_name) return order.shipping_address.full_name;
    if (order.user?.name) return order.user.name;
    return 'N/A';
  };

  const getCustomerPhone = (order) => {
    if (!order) return 'N/A';
    if (order.shipping_address?.phone) return order.shipping_address.phone;
    return 'N/A';
  };

  const getCustomerEmail = (order) => {
    if (!order) return 'N/A';
    if (order.shipping_address?.email) return order.shipping_address.email;
    return 'N/A';
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Orders</h1>
        <button
          onClick={handleRefresh}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
            <p className="text-sm text-gray-500">Manage and track customer orders</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Total Orders */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm">Total Orders</p>
                <p className="text-lg lg:text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs lg:text-sm">Revenue</p>
                <p className="text-lg lg:text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-200" />
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs lg:text-sm">Pending</p>
                <p className="text-lg lg:text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-200" />
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs lg:text-sm">Delivered</p>
                <p className="text-lg lg:text-2xl font-bold">{deliveredOrders}</p>
              </div>
              <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="all">All Payments</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div id="orders-table" className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Payment</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-gray-900">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {getCustomerName(order).charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getCustomerName(order)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {getCustomerPhone(order)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {order.payment_method === 'cod' ? '💵 COD' : order.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status?.replace('_', ' ') || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* View Button */}
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Link>
                          
                          {/* Status Update Button */}
                          <button
                            onClick={() => handleStatusUpdate(order)}
                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Update status"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(order)}
                            className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrders;