import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, LogOut, ChevronDown, Package, Users, Layers, ShoppingBag, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { getProducts } from '../API/api-products';
import { getUsers } from '../API/api-allUsers';
import { getAllOrders } from '../API/api-Order';
import { getCategories } from '../API/api-categories';
import Swal from 'sweetalert2'; // Make sure to import Swal

const AdminHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    products: [],
    users: [],
    orders: [],
    categories: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Helper function for formatting role (copy from AdminUsers)
  const formatRole = (role) => {
    if (role === undefined || role === null) return 'user';
    
    if (role === 1 || role === "1" || role === "admin") {
      return 'admin';
    }
    
    if (role === 0 || role === "0" || role === "user") {
      return 'user';
    }
    
    return role.toString().toLowerCase();
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminName(user.name || 'Admin User');
        setAdminEmail(user.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Handle click outside to close search results
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults({ products: [], users: [], orders: [], categories: [] });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      // Search in products
      const productsResponse = await getProducts();
      let productsData = [];
      if (productsResponse?.data) {
        productsData = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      } else if (Array.isArray(productsResponse)) {
        productsData = productsResponse;
      }
      
      const filteredProducts = productsData.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id?.toString().includes(searchQuery) ||
        product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      // Search in users
      let usersData = [];
      try {
        const usersResponse = await getUsers();
        if (usersResponse?.data) {
          usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        } else if (Array.isArray(usersResponse)) {
          usersData = usersResponse;
        } else if (usersResponse?.users) {
          usersData = Array.isArray(usersResponse.users) ? usersResponse.users : [];
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
      
      const filteredUsers = usersData.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toString().includes(searchQuery)
      ).slice(0, 5);

      // Search in orders
      let ordersData = [];
      try {
        const ordersResponse = await getAllOrders();
        if (ordersResponse?.data) {
          ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        } else if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse?.orders) {
          ordersData = Array.isArray(ordersResponse.orders) ? ordersResponse.orders : [];
        }
      } catch (error) {
        console.error('Error searching orders:', error);
      }
      
      const filteredOrders = ordersData.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toString().includes(searchQuery) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      // Search in categories
      let categoriesData = [];
      try {
        const categoriesResponse = await getCategories();
        if (categoriesResponse?.data) {
          categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
        } else if (Array.isArray(categoriesResponse)) {
          categoriesData = categoriesResponse;
        } else if (categoriesResponse?.categories) {
          categoriesData = Array.isArray(categoriesResponse.categories) ? categoriesResponse.categories : [];
        }
      } catch (error) {
        console.error('Error searching categories:', error);
      }
      
      const filteredCategories = categoriesData.filter(category => 
        category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.id?.toString().includes(searchQuery)
      ).slice(0, 5);

      setSearchResults({
        products: filteredProducts,
        users: filteredUsers,
        orders: filteredOrders,
        categories: filteredCategories
      });
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const getUserInitials = () => {
    if (adminName) {
      return adminName.charAt(0).toUpperCase();
    }
    return 'A';
  };

  // NEW: Handle viewing user details with SweetAlert2 modal
  const handleViewUser = (user) => {
    const formattedRole = formatRole(user.role);
    
    Swal.fire({
      title: '<span style="font-size: 24px; font-weight: 600; color: #1f2937; display: flex; align-items: center; justify-content: center; gap: 8px;"><span style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 30px; font-size: 14px; font-weight: 500;">User Profile</span></span>',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 450px; margin: 0 auto;">
          <!-- Profile Card -->
          <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <!-- Cover Image -->
            <div style="height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
            
            <!-- Profile Info -->
            <div style="text-align: center; margin-top: -40px; padding: 0 20px 20px;">
              <!-- Avatar -->
              <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span style="font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <!-- Name and ID -->
              <h2 style="margin: 10px 0 5px; font-size: 22px; font-weight: 700; color: #1f2937;">${user.name}</h2>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
                <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 30px; font-size: 12px; color: #4b5563; font-weight: 500;">
                  ID: #${user.id}
                </span>
                <span style="background: ${formattedRole === 'admin' ? '#ede9fe' : '#dbeafe'}; padding: 4px 12px; border-radius: 30px; font-size: 12px; color: ${formattedRole === 'admin' ? '#7c3aed' : '#2563eb'}; font-weight: 500;">
                  ${formattedRole === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>

              <!-- Info Grid -->
              <div style="display: grid; grid-template-columns: 1fr; gap: 12px; text-align: left; background: #f9fafb; padding: 16px; border-radius: 12px;">
                <!-- Email -->
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div style="flex: 1;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Email Address</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">${user.email}</p>
                  </div>
                </div>

                <!-- Phone -->
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12" y2="18"/>
                    </svg>
                  </div>
                  <div style="flex: 1;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Phone Number</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">${user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <!-- Joined Date -->
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 36px; height: 36px; background: #fed7aa; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2410c" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div style="flex: 1;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Joined Date</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                      ${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Close',
    confirmButtonColor: '#3b82f6',
    showCancelButton: false,
    showCloseButton: true,
    closeButtonHtml: '×',
    width: '500px',
    padding: '20px',
    background: '#ffffff',
    backdrop: 'rgba(0,0,0,0.4)',
    allowOutsideClick: true,
    allowEscapeKey: true
  });
  
  setShowResults(false);
  setSearchQuery('');
};

  // Update the navigation functions
  const navigateToProduct = (product) => {
    navigate(`/admin/products/${product.id}`);
    setShowResults(false);
    setSearchQuery('');
    setSearchOpen(false);
  };

  // Changed: Now opens modal instead of navigating
  const navigateToUser = (user) => {
    handleViewUser(user);
    // Keep the search results open? Or close them?
    // setShowResults(false);
    // setSearchQuery('');
    // setSearchOpen(false);
  };

  const navigateToOrder = (order) => {
    navigate(`/admin/orders/${order.id}`);
    setShowResults(false);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const navigateToCategory = (category) => {
    navigate(`/admin/categories/${category.id}`);
    setShowResults(false);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const getResultCount = () => {
    return Object.values(searchResults).reduce((acc, curr) => acc + curr.length, 0);
  };

  const renderSearchResults = () => {
    const tabs = [
      { id: 'all', label: 'All Results', icon: null, color: 'blue' },
      { id: 'products', label: 'Products', icon: Package, color: 'blue' },
      { id: 'orders', label: 'Orders', icon: ShoppingBag, color: 'green' },
      { id: 'users', label: 'Users', icon: Users, color: 'purple' },
      { id: 'categories', label: 'Categories', icon: Layers, color: 'yellow' }
    ];

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const count = tab.id === 'all' 
              ? getResultCount() 
              : searchResults[tab.id]?.length || 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? `text-${tab.color}-600 border-b-2 border-${tab.color}-600 bg-white`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-400'}`} />}
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-600`
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-96 p-2">
          {activeTab === 'all' ? (
            // Show all results grouped
            <div className="space-y-4">
              {searchResults.products.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase">Products</span>
                    </div>
                    <span className="text-xs text-blue-600">{searchResults.products.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchResults.products.map(product => (
                      <button
                        key={`products-${product.id}`}
                        onClick={() => navigateToProduct(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: #{product.id}</span>
                            <span>•</span>
                            <span>₹{product.selling_price || product.price}</span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.orders.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-green-50">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700 uppercase">Orders</span>
                    </div>
                    <span className="text-xs text-green-600">{searchResults.orders.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchResults.orders.map(order => (
                      <button
                        key={`order-${order.id}`}
                        onClick={() => navigateToOrder(order)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <ShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{order.order_number || `Order #${order.id}`}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{order.customer?.name || order.user?.name || 'N/A'}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'}`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.users.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-purple-50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700 uppercase">Users</span>
                    </div>
                    <span className="text-xs text-purple-600">{searchResults.users.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchResults.users.map(user => (
                      <button
                        key={`user-${user.id}`}
                        onClick={() => navigateToUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <span className="text-purple-600 font-medium text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{user.email}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                              ${user.role === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.role === 1 ? 'Admin' : 'Customer'}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.categories.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-semibold text-yellow-700 uppercase">Categories</span>
                    </div>
                    <span className="text-xs text-yellow-600">{searchResults.categories.length} found</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchResults.categories.map(category => (
                      <button
                        key={`category-${category.id}`}
                        onClick={() => navigateToCategory(category)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                          <Layers className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: #{category.id}</span>
                            {category.product_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{category.product_count} products</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {getResultCount() === 0 && !searchLoading && (
                <div className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-1">No results found</p>
                  <p className="text-sm text-gray-500">We couldn't find anything matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            // Show only selected tab results
            <div className="space-y-1">
              {searchResults[activeTab]?.length > 0 ? (
                searchResults[activeTab].map(item => {
                  if (activeTab === 'products') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToProduct(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: #{item.id}</span>
                            <span>•</span>
                            <span>₹{item.selling_price || item.price}</span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  } else if (activeTab === 'orders') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToOrder(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <ShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.order_number || `Order #${item.id}`}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{item.customer?.name || item.user?.name || 'N/A'}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                              ${item.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'}`}>
                              {item.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  } else if (activeTab === 'users') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToUser(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <span className="text-purple-600 font-medium text-sm">
                            {item.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{item.email}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                              ${item.role === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {item.role === 1 ? 'Admin' : 'Customer'}
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  } else if (activeTab === 'categories') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToCategory(item)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                          <Layers className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ID: #{item.id}</span>
                            {item.product_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{item.product_count} products</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No {activeTab} found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {searchLoading && (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Searching...</p>
            </div>
          )}
        </div>

        {/* View All Results Link */}
        {getResultCount() > 0 && (
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <button
              onClick={() => {
                navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
                setShowResults(false);
                setSearchQuery('');
              }}
              className="w-full px-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View all results for "{searchQuery}"
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <div className="hidden lg:block relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, orders, users, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showResults && renderSearchResults()}
              </div>
            </div>

            {/* Center Section - Logo for Mobile */}
            <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
              <div className="w-14 h-10 rounded-md overflow-hidden border-2 border-gray-500">
                <img 
                  src={logo} 
                  alt="ShopCart Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Mobile Search Bar */}
            {searchOpen && (
              <div className="lg:hidden fixed top-0 left-0 right-0 bg-white px-4 py-3 border-b border-gray-200 z-50">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products, orders, users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {showResults && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    {renderSearchResults()}
                  </div>
                )}
              </div>
            )}

            {/* Right Section - User Profile with Dropdown */}
            <div className="flex items-center gap-3 relative">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-sm lg:text-base flex items-center gap-1 text-gray-800">
                      {adminName}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {adminEmail || 'Administrator'}
                    </p>
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{adminName}</p>
                      <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;