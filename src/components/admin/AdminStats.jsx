import React, { useState, useEffect } from 'react';
import { 
  Layers,
  ShoppingBag,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getProducts } from '../API/api-products';
import { getCategories } from '../API/api-categories';
import { getUsers } from '../API/api-allUsers';
import { getAllOrders } from '../API/api-Order';
import Swal from 'sweetalert2';

const AdminStats = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0
  });

  // Helper function to extract array from response
  const extractArray = (response, defaultValue = []) => {
    if (!response) return defaultValue;
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.orders && Array.isArray(response.orders)) return response.orders;
    if (response.categories && Array.isArray(response.categories)) return response.categories;
    if (response.products && Array.isArray(response.products)) return response.products;
    if (response.users && Array.isArray(response.users)) return response.users;
    return defaultValue;
  };

  // Fetch all stats data
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Fetch all data in parallel with better error handling
      const [productsResult, categoriesResult, usersResult, ordersResult] = await Promise.allSettled([
        getProducts(token),
        getCategories(token),
        getUsers(),
        getAllOrders()
      ]);

      // Process products data
      let products = [];
      if (productsResult.status === 'fulfilled' && productsResult.value) {
        products = extractArray(productsResult.value);
      }
      console.log('Processed products count:', products.length);

      // Process categories data
      let categories = [];
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value) {
        categories = extractArray(categoriesResult.value);
      }
      console.log('Processed categories count:', categories.length);

      // Process users data
      let users = [];
      if (usersResult.status === 'fulfilled' && usersResult.value) {
        users = extractArray(usersResult.value);
      }
      console.log('Processed users count:', users.length);

      // Process orders data - CRITICAL FIX
      let orders = [];
      if (ordersResult.status === 'fulfilled' && ordersResult.value) {
        orders = extractArray(ordersResult.value);
        console.log('Raw orders data:', ordersResult.value);
        console.log('Extracted orders array:', orders);
      } else if (ordersResult.status === 'rejected') {
        console.error('Orders fetch failed:', ordersResult.reason);
      }
      console.log('Processed orders count:', orders.length);

      // Store previous stats before updating
      setPreviousStats(stats);

      // Calculate total orders from products as backup if orders array is empty
      const ordersFromProducts = products.reduce((sum, product) => {
        return sum + (product.sold_count || 0);
      }, 0);

      // Use orders.length if available, otherwise use ordersFromProducts
      const totalOrders = orders.length > 0 ? orders.length : ordersFromProducts;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalUsers: users.length,
        totalOrders: totalOrders
      });

      console.log('Final stats:', {
        products: products.length,
        categories: categories.length,
        users: users.length,
        orders: totalOrders
      });

    } catch (error) {
      console.error('Error in fetchStats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load statistics',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchStats();
    }
  }, [refreshTrigger]);

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growth) => {
    return growth > 0 ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />;
  };

  const getGrowthColor = (growth) => {
    return growth > 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const getGradientColor = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600'
    ];
    return gradients[index % gradients.length];
  };

  const getIconBgColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600',
      'bg-amber-100 text-amber-600'
    ];
    return colors[index % colors.length];
  };

  const statsData = [
    {
      id: 1,
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: Layers,
      description: 'Active categories',
      gradient: getGradientColor(0),
      iconColor: getIconBgColor(0)
    },
    {
      id: 2,
      title: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBag,
      description: 'Items in inventory',
      gradient: getGradientColor(1),
      iconColor: getIconBgColor(1)
    },
    {
      id: 3,
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered customers',
      gradient: getGradientColor(2),
      iconColor: getIconBgColor(2)
    },
    {
      id: 4,
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: 'Completed orders',
      gradient: getGradientColor(3),
      iconColor: getIconBgColor(3)
    }
  ];

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const growth = calculateGrowth(
          Object.values(stats)[index], 
          Object.values(previousStats)[index]
        );
        
        return (
          <div
            key={stat.id}
            className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            
            {/* Top section with icon and menu */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconColor} shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Growth indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                growth > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {getGrowthIcon(growth)}
                <span>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                </p>
                
                {/* Mini sparkline/trend indicator */}
                <div className="flex items-center gap-1">
                  <div className={`text-xs ${getGrowthColor(growth)}`}>
                    {growth > 0 ? '↑' : '↓'}
                  </div>
                </div>
              </div>

              {/* Description and trend */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{stat.description}</p>
                
                {/* Progress bar */}
                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-purple-500' :
                      index === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (stat.value / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bottom accent border */}
            <div className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;