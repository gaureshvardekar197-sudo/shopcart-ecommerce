import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "../layout/Container";
import { getProducts } from "../API/api-products";
import { getWishlist, addToWishlist, removeFromWishlist } from "../API/api-wishlist";
import { addToCart as apiAddToCart } from "../API/api-cart";
import sizeApi from "../API/api-Product_sizes";
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
  const [addingToCart, setAddingToCart] = useState({});

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

  // Add this useEffect to load wishlist when authentication changes
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      loadWishlist();
    }
  }, [isAuthenticated]);

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
          const parsed = JSON.parse(savedWishlist);
          setWishlist(parsed);
          
          // Dispatch event for navbar on initial load
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: parsed.length } 
          }));
        } catch (error) {
          console.error('Error parsing wishlist:', error);
          setWishlist([]);
        }
      }
      return;
    }

    try {
      const response = await getWishlist();
      let wishlistData = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        wishlistData = response.data;
      } else if (Array.isArray(response)) {
        wishlistData = response;
      }
      
      setWishlist(wishlistData);
      
      // Update localStorage
      localStorage.setItem('wishlist', JSON.stringify(wishlistData));
      
      // Dispatch event for navbar
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: wishlistData.length } 
      }));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          setWishlist(parsed);
          
          // Dispatch event for navbar
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
            detail: { count: parsed.length } 
          }));
        } catch (parseError) {
          console.error('Error parsing wishlist:', parseError);
          setWishlist([]);
        }
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

      // Fetch sizes for each product
      const productsWithSizes = await Promise.all(
        filtered.map(async (product) => {
          try {
            const sizesResponse = await sizeApi.getProductSizes(product.id);
            if (sizesResponse?.data?.sizes) {
              return {
                ...product,
                sizes: sizesResponse.data.sizes
              };
            }
          } catch (error) {
            console.error(`Error fetching sizes for product ${product.id}:`, error);
          }
          return product;
        })
      );

      setProducts(productsWithSizes);

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
    if (!product) return 0;
    
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
    return 0;
  };

  // Get default size price for a product
  const getDefaultSizePrice = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0;
    }
    return product.selling_price || product.price || 0;
  };

  // Get default size original price - FIXED
  const getDefaultSizeOriginalPrice = (product) => {
    // First check if product has sizes
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      
      // Check size-specific original price
      if (defaultSize?.original_price && defaultSize.original_price > 0) {
        return Number(defaultSize.original_price);
      }
      if (defaultSize?.effective_original_price && defaultSize.effective_original_price > 0) {
        return Number(defaultSize.effective_original_price);
      }
    }
    
    // If no size original price, get product's original price
    const productOriginalPrice = getOriginalPrice(product);
    if (productOriginalPrice && productOriginalPrice > 0) {
      return Number(productOriginalPrice);
    }
    
    // No original price found
    return 0;
  };

  // Calculate discount based on default size - FIXED
  const calculateDefaultSizeDiscount = (product) => {
    const price = getDefaultSizePrice(product);
    const originalPrice = getDefaultSizeOriginalPrice(product);
    
    // Only calculate discount if original price exists and is greater than selling price
    if (originalPrice && originalPrice > 0 && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  };

  // Check stock based on default size
  const isDefaultSizeInStock = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.stock > 0;
    }
    return (product.stock > 0 || product.qty > 0);
  };

  // Get default size name
  const getDefaultSizeName = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.size || null;
    }
    return null;
  };

  // Check if product has multiple sizes
  const hasMultipleSizes = (product) => {
    return product?.sizes && product.sizes.length > 1;
  };

  const formatCurrency = (value) => {
    const numValue = Number(value) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Handle wishlist toggle with login redirect
  const toggleWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

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

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to wishlist', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return;
    }

    // Get the default size from the product
    const defaultSize = product?.sizes?.[0];
    
    // Check if in wishlist (considering size)
    const isInWishlist = wishlist.some(item => {
      if (item.id !== product.id) return false;
      
      if (item.pivot?.size_id || item.selected_size_id) {
        return item.pivot?.size_id === defaultSize?.id || item.selected_size_id === defaultSize?.id;
      }
      return false;
    });

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product.id, defaultSize?.id);
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot modify wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return;
        }
        
        const updatedWishlist = wishlist.filter(item => {
          if (item.id !== product.id) return true;
          if (defaultSize?.id) {
            return item.pivot?.size_id !== defaultSize?.id && item.selected_size_id !== defaultSize?.id;
          }
          return false;
        });
        
        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        // Dispatch event for navbar
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }));
        
        toast.success(`❤️ ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} removed from wishlist`);
      } else {
        const response = await addToWishlist(product.id, defaultSize?.size, defaultSize?.id);
        
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You cannot add to wishlist', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return;
        }
        
        // Fetch updated wishlist
        const wishlistResponse = await getWishlist();
        const wishlistData = wishlistResponse?.data || wishlistResponse || [];
        setWishlist(wishlistData);
        localStorage.setItem('wishlist', JSON.stringify(wishlistData));
        
        // Dispatch event for navbar
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: wishlistData.length } 
        }));
        
        toast.success(`❤️ ${product.name}${defaultSize?.size ? ` (Size: ${defaultSize.size})` : ''} added to wishlist`);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot modify wishlist', {
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
        toast.error('Failed to update wishlist. Please try again.');
      }
    }
  };

  // Handle add to cart with login redirect and size info
  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding to cart:', product);

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

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to cart', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return;
    }
    
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    // Get the default size from the product
    const defaultSize = product?.sizes?.[0];
    const sizeId = defaultSize?.id || null;
    const sizeName = defaultSize?.size || null;
    
    try {
      console.log('Adding to cart via API:', product.id, 'Size:', sizeName, 'Size ID:', sizeId);
      const response = await apiAddToCart(product.id, 1, sizeName, sizeId);
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
        toast.success(`🛒 ${product.name}${sizeName ? ` (Size: ${sizeName})` : ''} added to cart`);
        
        // Fetch updated cart
        try {
          const { getCart } = await import('../API/api-cart');
          const cartResponse = await getCart();
          
          if (cartResponse?.data) {
            let cartData = [];
            if (Array.isArray(cartResponse.data)) {
              cartData = cartResponse.data;
            } else if (cartResponse.data.data && Array.isArray(cartResponse.data.data)) {
              cartData = cartResponse.data.data;
            }
            
            localStorage.setItem('cart', JSON.stringify(cartData));
            
            const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
              detail: { count: totalItems, cart: cartData } 
            }));
          }
        } catch (cartError) {
          console.error('Error fetching updated cart:', cartError);
          
          // Fallback: increment existing cart count
          const savedCart = localStorage.getItem('cart');
          let currentCart = savedCart ? JSON.parse(savedCart) : [];
          const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0) + 1;
          
          window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { count: totalItems }
          }));
        }
        
        window.dispatchEvent(new Event('storage'));
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
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];
    
    switch(sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => 
          getDefaultSizePrice(a) - getDefaultSizePrice(b)
        );
      case 'price-high':
        return sorted.sort((a, b) => 
          getDefaultSizePrice(b) - getDefaultSizePrice(a)
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

  // Debug log to check values
  useEffect(() => {
    displayedProducts.forEach(product => {
      console.log(`Product: ${product.name}`, {
        price: getDefaultSizePrice(product),
        originalPrice: getDefaultSizeOriginalPrice(product),
        discount: calculateDefaultSizeDiscount(product)
      });
    });
  }, [displayedProducts]);

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
                const defaultSizePrice = getDefaultSizePrice(product);
                const defaultSizeOriginalPrice = getDefaultSizeOriginalPrice(product);
                const discount = calculateDefaultSizeDiscount(product);
                const defaultSizeName = getDefaultSizeName(product);
                const hasSizes = product?.sizes && product.sizes.length > 0;
                const inStock = isDefaultSizeInStock(product);
                const isInWishlist = wishlist.some(item => item.id === product.id);

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <Link to={`/products/${product.id}`} className="flex flex-col h-full">
                      {/* Image Container - Fixed height */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 flex-shrink-0">
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
                        {discount > 0 && !isAdmin && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info - Flex grow to fill remaining space */}
                      <div className="p-5 flex flex-col flex-grow">
                        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {product.category?.name || 'Uncategorized'}
                        </span>

                        <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Size Badge - Show if product has sizes */}
                        {hasSizes && defaultSizeName && (
                          <div className="">
                            <span className="hidden">Size:</span>
                            <span className="hidden">{defaultSizeName}</span>
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(defaultSizePrice)}
                            </span>
                            {defaultSizeOriginalPrice > 0 && defaultSizeOriginalPrice > defaultSizePrice && !isAdmin && (
                              <span className="text-sm text-red-600 line-through">
                                {formatCurrency(defaultSizeOriginalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {/* Savings Badge */}
                          {defaultSizeOriginalPrice > 0 && defaultSizeOriginalPrice > defaultSizePrice && !isAdmin && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                              Save {formatCurrency(defaultSizeOriginalPrice - defaultSizePrice)}
                            </p>
                          )}
                          
                          {/* Multiple sizes indicator */}
                          {hasMultipleSizes(product) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              +{product.sizes.length - 1} more sizes available
                            </p>
                          )}
                          
                          {/* Admin View Only Badge */}
                          {isAdmin && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1 flex items-center gap-1">
                              <span>👑</span> Admin view only
                            </p>
                          )}
                        </div>

                        {/* Add to Cart Button - Auto margin top to push to bottom */}
                        <div className="mt-auto">
                          <button 
                            className={`w-full py-2.5 rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md ${
                              isAdmin
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                                : !inStock
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
                            }`}
                            onClick={(e) => addToCart(product, e)}
                            disabled={isAdmin || !inStock || addingToCart[product.id]}
                            title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : (!inStock ? "Out of Stock" : ""))}
                          >
                            {addingToCart[product.id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Adding...</span>
                              </>
                            ) : isAdmin ? (
                              'Admin View Only'
                            ) : !inStock ? (
                              'Out of Stock'
                            ) : (
                              <>
                                <ShoppingCartIcon className="w-4 h-4" />
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
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