import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "../layout/Container";
import { getProducts } from "../API/api-products";
import { getWishlist, addToWishlist, removeFromWishlist } from "../API/api-wishlist";
import { addToCart as apiAddToCart } from "../API/api-cart";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8000";

export default function CategoryProducts() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProducts();
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, [categorySlug]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserRole(userData.role);
        setIsAdmin(userData.role === 1);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsAdmin(false);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  const handleLogin = () => {
    checkAuth();
    loadWishlist();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsAdmin(false);
    setWishlist([]);
  };

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Error parsing wishlist:', error);
          setWishlist([]);
        }
      }
      return;
    }

    try {
      const response = await getWishlist();
      if (response && response.data && Array.isArray(response.data)) {
        setWishlist(response.data);
      } else if (Array.isArray(response)) {
        setWishlist(response);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await getProducts(token);
      const allProducts = res?.data || res || [];

      const filtered = allProducts.filter((product) => {
        if (product.category?.slug) {
          return product.category.slug === categorySlug;
        }
        if (product.category_slug) {
          return product.category_slug === categorySlug;
        }
        return false;
      });

      setProducts(filtered);

      if (filtered.length > 0) {
        setCategoryName(
          filtered[0]?.category?.name || filtered[0]?.category_name || ""
        );
      }

      await loadWishlist();
    } catch (error) {
      toast.error("Failed to load products", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product) => {
    if (product.image_url) {
      return product.image_url;
    }
    
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      if (product.image.startsWith('products/')) {
        return `${API_URL}/storage/${product.image}`;
      }
      return `${API_URL}/storage/products/${product.image}`;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=400&length=2`;
  };

  const getOriginalPrice = (product) => {
    if (!product) return null;
    
    const possibleFields = [
      'original_price', 'mrp', 'compare_at_price', 'regular_price',
      'old_price', 'list_price', 'retail_price', 'originalPrice',
      'MRP', 'comparePrice', 'original', 'price_old'
    ];
    
    for (const field of possibleFields) {
      const value = product[field];
      if (value && !isNaN(value) && Number(value) > 0) {
        return Number(value);
      }
    }
    return null;
  };

  const calculateDiscount = (product) => {
    const price = Number(product.selling_price || product.price || 0);
    const originalPrice = getOriginalPrice(product);
    
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Handle wishlist toggle with login redirect
  const toggleWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist', {
        position: "top-right",
        autoClose: 2000,
        icon: "🔐"
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to wishlist', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return;
    }

    const isInWishlist = wishlist.some(item => item.id === product.id);
    let updatedWishlist;

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product.id);
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot modify wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return;
        }
        
        updatedWishlist = wishlist.filter(item => item.id !== product.id);
        toast.success(`❤️ ${product.name} removed from wishlist`);
      } else {
        const response = await addToWishlist(product.id);
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return;
        }
        
        if (response && response.data) {
          updatedWishlist = [...wishlist, response.data];
        } else {
          updatedWishlist = [...wishlist, product];
        }
        toast.success(`❤️ ${product.name} added to wishlist`);
      }

      setWishlist(updatedWishlist);
      
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: updatedWishlist.length } 
      }));
    } catch (error) {
      console.error('Wishlist error:', error);
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot modify wishlist', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          onClick: () => window.location.href = '/login'
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserRole(null);
      } else {
        toast.error('Failed to update wishlist. Please try again.');
      }
    }
  };

  // Handle add to cart with login redirect
  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding to cart:', product);

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🛒 Please login to add items to cart', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to cart', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return;
    }
    
    if (!isAuthenticated) {
      // Handle non-authenticated users with localStorage
      try {
        const savedCart = localStorage.getItem('cart');
        let currentCart = savedCart ? JSON.parse(savedCart) : [];
        
        if (!Array.isArray(currentCart)) {
          currentCart = [];
        }
        
        const cartProduct = {
          id: product.id,
          name: product.name || 'Product',
          price: Number(product.price) || 0,
          selling_price: Number(product.selling_price || product.price) || 0,
          original_price: Number(getOriginalPrice(product)) || Number(product.price) || 0,
          quantity: 1,
          stock: Number(product.stock || product.qty) || 10,
          image: product.image,
          image_url: product.image_url,
          category: product.category,
          category_name: product.category?.name || product.category_name || 'Uncategorized'
        };
        
        console.log('Cart product prepared:', cartProduct);
        
        const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex !== -1) {
          currentCart[existingProductIndex] = {
            ...currentCart[existingProductIndex],
            quantity: (currentCart[existingProductIndex].quantity || 1) + 1
          };
          toast.success(`🛒 ${product.name} quantity updated in cart`);
        } else {
          currentCart.push(cartProduct);
          toast.success(`🛒 ${product.name} added to cart`);
        }
        
        const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        localStorage.setItem('cart', JSON.stringify(currentCart));
        console.log('Cart saved to localStorage:', currentCart);
        console.log('Total items:', totalItems);
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { 
            count: totalItems,
            cart: currentCart,
            productId: product.id,
            action: 'add'
          } 
        }));
        
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshCart', { 
            detail: { timestamp: Date.now() } 
          }));
        }, 50);
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      }
      return;
    }

    // Handle authenticated users with API
    try {
      console.log('Adding to cart via API:', product.id);
      const response = await apiAddToCart(product.id, 1);
      console.log('API Response:', response);
      
      if (response && response.is_admin_error) {
        toast.info('👑 Admin: You cannot add to cart', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
        return;
      }
      
      if (response && response.status === true) {
        toast.success(`🛒 ${product.name} added to cart`);
        
        const savedCart = localStorage.getItem('cart');
        let currentCart = savedCart ? JSON.parse(savedCart) : [];
        const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0) + 1;
        
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { 
            count: totalItems,
            productId: product.id, 
            action: 'add'
          } 
        }));
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshCart', { 
            detail: { timestamp: Date.now() } 
          }));
        }, 100);
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Cart API error:', error);
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot add to cart', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserRole(null);
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];
    
    switch(sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => 
          (a.selling_price || a.price || 0) - (b.selling_price || b.price || 0)
        );
      case 'price-high':
        return sorted.sort((a, b) => 
          (b.selling_price || b.price || 0) - (a.selling_price || a.price || 0)
        );
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      default:
        return sorted;
    }
  };

  const displayedProducts = sortProducts(products);

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading products...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Container>
        <div className="py-4 lg:py-4">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {categoryName || "Category Products"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
                {isAdmin && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                    <span>👑</span> You are in admin mode - viewing only
                  </p>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {displayedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No products in this category</p>
                <Link 
                  to="/products" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {displayedProducts.map((product) => {
                const price = product.selling_price || product.price || 0;
                const originalPrice = getOriginalPrice(product);
                const discount = calculateDiscount(product);
                const isInWishlist = wishlist.some(item => item.id === product.id);

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
                  >
                    <Link to={`/products/${product.id}`} className="block">
                      {/* Image Container */}
                      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=400&length=2`;
                          }}
                        />
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => toggleWishlist(product, e)}
                          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
                          title={isAdmin ? "Admins cannot add to wishlist" : (!isAuthenticated ? "Login to add to wishlist" : "")}
                        >
                          {isInWishlist ? (
                            <HeartIconSolid className={`w-5 h-5 ${isAdmin ? 'text-gray-400' : 'text-red-500'}`} />
                          ) : (
                            <HeartIcon className={`w-5 h-5 ${isAdmin ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-red-500'} transition-colors`} />
                          )}
                        </button>

                        {/* Discount Badge */}
                        {discount && !isAdmin && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Price Section */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(price)}
                            </span>
                            {originalPrice && originalPrice > price && !isAdmin && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {/* Savings Badge */}
                          {originalPrice && originalPrice > price && !isAdmin && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                              Save {formatCurrency(originalPrice - price)}
                            </p>
                          )}
                          
                          {/* Admin View Only Badge */}
                          {isAdmin && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1 flex items-center gap-1">
                              <span>👑</span> Admin view only
                            </p>
                          )}
                        </div>

                        {/* Quick Add Button */}
                        <button 
                          className={`w-full py-2.5 rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md ${
                            isAdmin
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
                          }`}
                          onClick={(e) => addToCart(product, e)}
                          disabled={isAdmin}
                          title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : "")}
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                          {!isAuthenticated ? 'Add to Cart' : (isAdmin ? 'Admin View Only' : 'Add to Cart')}
                        </button>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Count */}
          {displayedProducts.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Showing {displayedProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}