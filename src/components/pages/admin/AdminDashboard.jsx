import React, { useState, useEffect } from 'react';
import { 
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../admin/AdminLayout';
import AdminStats from '../../admin/AdminStats';
import { getProducts } from '../../API/api-products';
import { getUsers } from '../../API/api-allUsers';
import { getAllOrders } from '../../API/api-Order'; // Import orders API
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false); // Changed initial state to false
  const [refreshStats, setRefreshStats] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    topProducts: [],
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      avgOrderValue: 0
    }
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch data in parallel with better error handling
      const [productsResponse, usersResponse, ordersResponse] = await Promise.allSettled([
        getProducts(token),
        getUsers(),
        getAllOrders()
      ]);

      // Process products data
      let products = [];
      if (productsResponse.status === 'fulfilled' && productsResponse.value) {
        if (Array.isArray(productsResponse.value)) {
          products = productsResponse.value;
        } else if (productsResponse.value.data && Array.isArray(productsResponse.value.data)) {
          products = productsResponse.value.data;
        }
      }

      // Process users data
      let users = [];
      if (usersResponse.status === 'fulfilled' && usersResponse.value) {
        if (Array.isArray(usersResponse.value)) {
          users = usersResponse.value;
        } else if (usersResponse.value.data && Array.isArray(usersResponse.value.data)) {
          users = usersResponse.value.data;
        }
      }

      // Process orders data
      let orders = [];
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value) {
        if (Array.isArray(ordersResponse.value)) {
          orders = ordersResponse.value;
        } else if (ordersResponse.value.data && Array.isArray(ordersResponse.value.data)) {
          orders = ordersResponse.value.data;
        } else if (ordersResponse.value.orders && Array.isArray(ordersResponse.value.orders)) {
          orders = ordersResponse.value.orders;
        }
      }

      // Calculate total revenue and orders
      const totalRevenue = products.reduce((sum, product) => {
        return sum + ((product.selling_price || product.price || 0) * (product.qty || 0));
      }, 0);

      // Use actual orders count if available, otherwise use sold_count
      const totalOrders = orders.length > 0 ? orders.length : 
        products.reduce((sum, product) => {
          return sum + (product.sold_count || 0);
        }, 0);

      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top products by sales
      const topProducts = [...products]
        .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          sales: product.sold_count || 0,
          revenue: ((product.selling_price || product.price || 0) * (product.sold_count || 0)),
          growth: product.trending ? '+15.2%' : '+8.3%',
          image: product.image_url || `https://via.placeholder.com/40?text=${product.name?.charAt(0)}`
        }));

      setDashboardData({
        topProducts,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts: products.length,
          totalUsers: users.length,
          avgOrderValue
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load dashboard data',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDashboardData();
    setRefreshStats(prev => prev + 1);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6">
        {/* Welcome Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Pass refresh trigger */}
        <AdminStats key={refreshStats} refreshTrigger={refreshStats} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;