import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from './Container'
import logo from '../../assets/logo.jpg';
import axios from 'axios';
import { 
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  ChevronDownIcon,
  Bars3Icon,
  InformationCircleIcon,
  CubeIcon,
  TagIcon,
  XMarkIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

const API_URL = "http://localhost:8000";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories();
    loadWishlistCount();
    loadCartCount();
    checkLoginStatus();
    
    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from other components
    window.addEventListener('addToWishlist', loadWishlistCount);
    window.addEventListener('removeFromWishlist', loadWishlistCount);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('addToWishlist', loadWishlistCount);
      window.removeEventListener('removeFromWishlist', loadWishlistCount);
    };
  }, []);

  // Check dark mode preference on mount
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await axios.get(`${API_URL}/api/categories`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      // Extract categories from response
      let categoriesData = []
      if (res.data && res.data.data) {
        categoriesData = res.data.data
      } else if (res.data && res.data.categories) {
        categoriesData = res.data.categories
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data
      }
      
      // Filter only active categories
      const activeCategories = categoriesData.filter(cat => 
        cat.status === 1 || cat.status === true
      )
      
      setCategories(activeCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadWishlistCount = () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // For authenticated users, we might want to fetch from API
        // But for now, we'll use localStorage for consistency
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const wishlist = JSON.parse(savedWishlist);
          setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        } else {
          setWishlistCount(0);
        }
      } else {
        // For non-authenticated users, just use localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const wishlist = JSON.parse(savedWishlist);
          setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        } else {
          setWishlistCount(0);
        }
      }
    } catch (error) {
      console.error('Error parsing wishlist:', error);
      setWishlistCount(0);
    }
  }

  const loadCartCount = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        if (Array.isArray(cart)) {
          const totalQuantity = cart.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            return sum + quantity;
          }, 0);
          setCartCount(totalQuantity);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error parsing cart:', error);
      setCartCount(0);
    }
  }

  const handleWishlistUpdate = (event) => {
    if (event.detail && event.detail.count !== undefined) {
      setWishlistCount(event.detail.count);
    } else {
      loadWishlistCount();
    }
  }

  const handleCartUpdate = (event) => {
    if (event.detail && event.detail.count !== undefined) {
      setCartCount(event.detail.count);
    } else if (event.detail && event.detail.cart) {
      const totalQuantity = event.detail.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(totalQuantity);
    } else {
      loadCartCount();
    }
  }

  const handleStorageChange = (e) => {
    if (e.key === 'wishlist') {
      loadWishlistCount();
    }
    if (e.key === 'cart') {
      loadCartCount();
    }
    if (e.key === 'token' || e.key === 'user') {
      checkLoginStatus();
    }
  }

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
        
        // Check if user is admin (role === 1)
        const role = Number(parsedUser.role)
        setIsAdmin(role === 1)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsLoggedIn(false)
        setUser(null)
        setIsAdmin(false)
      }
    } else {
      setIsLoggedIn(false)
      setUser(null)
      setIsAdmin(false)
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    setIsLoggedIn(false)
    setUser(null)
    setIsAdmin(false)
    setUserDropdownOpen(false)
    setIsMenuOpen(false)
    
    // Reset counts on logout
    loadWishlistCount();
    loadCartCount();
    
    navigate('/')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.split(' ')[0]
    }
    return 'User'
  }

  const navigation = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'About', path: '/about', icon: InformationCircleIcon },
    { 
      name: 'Categories', 
      path: '/categories',
      icon: CubeIcon,
      dropdown: categories.length > 0 ? categories.map(cat => ({
        name: cat.name,
        path: `/category/${cat.slug || cat.id}`,
        icon: TagIcon
      })) : [
        { name: 'Loading...', path: '#', icon: TagIcon }
      ]
    },
    { 
      name: 'Products', 
      path: '/products',
      icon: CubeIcon,
    },
    { name: 'Contact', path: '/contact', icon: PhoneIcon }
  ]

  const Badge = ({ count }) => (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
      {count > 99 ? '99+' : count}
    </span>
  )

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <Container>
          <div className="flex h-16 items-center justify-between">
            
            {/* Left - Logo & Mobile Menu */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-1 text-gray-600 dark:text-gray-400"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

              <Link to="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="ShopCart Logo" 
                  className="h-20 w-100 object-contain"
                />
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.dropdown ? (
                    <div className="relative">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.name}
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>

                      {activeDropdown === item.name && (
                        <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                          {loadingCategories && item.name === 'Categories' ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              Loading categories...
                            </div>
                          ) : (
                            item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                {subItem.name}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right - Search & Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-64 rounded-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Wishlist - FIXED: Added onClick to refresh count */}
              <Link 
                to="/wishlist" 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => {
                  loadWishlistCount();
                }}
              >
                {wishlistCount > 0 ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
                {wishlistCount > 0 && <Badge count={wishlistCount} />}
              </Link>

              {/* Cart - with onClick to refresh count */}
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => loadCartCount()}
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && <Badge count={cartCount} />}
              </Link>

              {/* User Menu - Desktop */}
              <div className="hidden sm:block relative">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 rounded-full border dark:border-gray-700 pl-1 pr-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {getUserInitials()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getUserDisplayName()}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* User Dropdown */}
                    {userDropdownOpen && (
                      <>
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {user?.email || ''}
                            </p>
                          </div>

                          {/* Dropdown Items */}
                          <div className="py-1">
                            <Link
                              to="/wishlist"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                loadWishlistCount();
                              }}
                            >
                              <HeartIcon className="h-4 w-4" />
                              My Wishlist ({wishlistCount})
                            </Link>
                            <Link
                              to="/my-orders"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <ClipboardDocumentListIcon className="h-4 w-4" />
                              My Orders
                            </Link>

                            {isAdmin && (
                              <Link
                                to="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setUserDropdownOpen(false)}
                              >
                                <Cog6ToothIcon className="h-4 w-4" />
                                Admin Dashboard
                              </Link>
                            )}

                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </div>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4 pt-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
          </div>
        </Container>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-gray-900 overflow-y-auto">
            <Container>
              <div className="py-4 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <details className="group">
                        <summary className="flex items-center justify-between py-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.name}
                          </div>
                          <ChevronDownIcon className="h-4 w-4 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="ml-4 mt-1 space-y-2 border-l dark:border-gray-700 pl-4">
                          {loadingCategories && item.name === 'Categories' ? (
                            <div className="py-2 text-sm text-gray-500 dark:text-gray-400">
                              Loading categories...
                            </div>
                          ) : (
                            item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                {subItem.name}
                              </Link>
                            ))
                          )}
                        </div>
                      </details>
                    ) : (
                      <Link
                        to={item.path}
                        className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="pt-4 mt-4 border-t dark:border-gray-700">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-3 w-full py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3"
                  >
                    {darkMode ? (
                      <>
                        <SunIcon className="h-5 w-5 text-yellow-500" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-5 w-5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  
                  {/* Wishlist & Cart Mobile Links */}
                  <div className="flex items-center justify-between px-3 py-3">
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        loadWishlistCount();
                        setIsMenuOpen(false);
                      }}
                    >
                      {wishlistCount > 0 ? (
                        <HeartIconSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span>Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        loadCartCount();
                        setIsMenuOpen(false);
                      }}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Cart ({cartCount})</span>
                    </Link>
                  </div>
                  
                  {isLoggedIn ? (
                    <div className="mt-4 space-y-2">
                      {/* User Info Card */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                              {getUserInitials()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 py-3 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 py-3 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                        <span>My Orders</span>
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 py-3 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="h-5 w-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full py-3 px-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-2"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <Link
                        to="/login"
                        className="block w-full text-center py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full text-center py-3 px-4 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navbar;