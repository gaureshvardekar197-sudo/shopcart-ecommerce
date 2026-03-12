import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, LogOut, ChevronDown, Package, Users, Layers, ShoppingBag, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { getProducts } from '../API/api-products';
import { getUsers } from '../API/api-allUsers';
import { getAllOrders } from '../API/api-Order';
import { getCategories } from '../API/api-categories';

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
        usersData = Array.isArray(usersResponse) ? usersResponse : [];
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
        }
      } catch (error) {
        console.error('Error searching orders:', error);
      }
      
      const filteredOrders = ordersData.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toString().includes(searchQuery) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      // Search in categories
      let categoriesData = [];
      try {
        const token = localStorage.getItem('token');
        const categoriesResponse = await getCategories(token);
        if (categoriesResponse?.data) {
          categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
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

  const navigateTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setShowResults(false);
    setSearchQuery('');
  };

  const getResultCount = () => {
    return Object.values(searchResults).reduce((acc, curr) => acc + curr.length, 0);
  };

  const renderSearchResults = () => {
    const tabs = [
      { id: 'all', label: 'All', icon: null },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'categories', label: 'Categories', icon: Layers }
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
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
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
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <Package className="w-4 h-4" />
                    Products
                  </div>
                  {searchResults.products.map(product => (
                    <button
                      key={`product-${product.id}`}
                      onClick={() => navigateTo(`/admin/products/${product.id}`)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: #{product.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.orders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <ShoppingBag className="w-4 h-4" />
                    Orders
                  </div>
                  {searchResults.orders.map(order => (
                    <button
                      key={`order-${order.id}`}
                      onClick={() => navigateTo(`/admin/orders/${order.id}`)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{order.order_number || `#${order.id}`}</p>
                        <p className="text-xs text-gray-500">{order.customer?.name || 'N/A'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <Users className="w-4 h-4" />
                    Users
                  </div>
                  {searchResults.users.map(user => (
                    <button
                      key={`user-${user.id}`}
                      onClick={() => navigateTo(`/admin/users/${user.id}`)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <Layers className="w-4 h-4" />
                    Categories
                  </div>
                  {searchResults.categories.map(category => (
                    <button
                      key={`category-${category.id}`}
                      onClick={() => navigateTo(`/admin/categories/${category.id}`)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">ID: #{category.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {getResultCount() === 0 && !searchLoading && (
                <div className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
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
                        onClick={() => navigateTo(`/admin/products/${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">ID: #{item.id}</p>
                        </div>
                      </button>
                    );
                  } else if (activeTab === 'orders') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/admin/orders/${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.order_number || `#${item.id}`}</p>
                          <p className="text-xs text-gray-500">{item.customer?.name || 'N/A'}</p>
                        </div>
                      </button>
                    );
                  } else if (activeTab === 'users') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/admin/users/${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.email}</p>
                        </div>
                      </button>
                    );
                  } else if (activeTab === 'categories') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/admin/categories/${item.id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">ID: #{item.id}</p>
                        </div>
                      </button>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No {activeTab} found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {searchLoading && (
            <div className="py-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          )}
        </div>
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
              </div>
            )}

            {/* Right Section - User Profile with Dropdown */}
            <div className="flex items-center gap-3 relative">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-sm lg:text-base flex items-center gap-1">
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
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{adminName}</p>
                      <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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