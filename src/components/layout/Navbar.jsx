// Navbar.jsx
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
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar'; 

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
  
  const { wishlistCount, refreshWishlist } = useWishlist();
  const { cartCount, refreshCart } = useCart();
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories();
    checkLoginStatus();
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, []);

  const handleLogin = () => {
    checkLoginStatus();
    refreshWishlist();
    refreshCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsAdmin(false);
    setUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

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
      
      let categoriesData = []
      if (res.data && res.data.data) {
        categoriesData = res.data.data
      } else if (res.data && res.data.categories) {
        categoriesData = res.data.categories
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data
      }
      
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

  const handleStorageChange = (e) => {
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

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    return 'U'
  }

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
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white animate-pulse">
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
                <SearchBar />
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

              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110"
                onClick={() => refreshWishlist()}
              >
                {wishlistCount > 0 ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
                {wishlistCount > 0 && <Badge count={wishlistCount} />}
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110"
                onClick={() => refreshCart()}
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

                    {/* User Dropdown - Without User Info Card */}
                    {userDropdownOpen && (
                      <>
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
                          {/* Dropdown Items - No user info card here */}
                          <Link
                            to="/my-account"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <UserIcon className="h-4 w-4" />
                            My Account
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              refreshWishlist();
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

                          <div className="border-t dark:border-gray-700 my-1"></div>

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Logout
                          </button>
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
              <SearchBar />
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
                
                {/* Mobile Auth Section - Without User Info Card */}
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
                        refreshWishlist();
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
                        refreshCart();
                        setIsMenuOpen(false);
                      }}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Cart ({cartCount})</span>
                    </Link>
                  </div>
                  
                  {isLoggedIn ? (
                    <div className="mt-4 space-y-2">
                      {/* Mobile Menu Links - No user info card here */}
                      <Link
                        to="/my-account"
                        className="flex items-center gap-3 py-3 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span>My Account</span>
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 py-3 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                        onClick={() => {
                          refreshWishlist();
                          setIsMenuOpen(false);
                        }}
                      >
                        <HeartIcon className="h-5 w-5" />
                        <span>Wishlist ({wishlistCount})</span>
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