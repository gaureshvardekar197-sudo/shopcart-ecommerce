// pages/CategoryProducts.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "../layout/Container";
import { getProducts } from "../API/api-products";
import { getWishlist, addToWishlist, removeFromWishlist } from "../API/api-wishlist";
import { addToCart as apiAddToCart } from "../API/api-cart";
import sizeApi from "../API/api-Product_sizes";
import { getCategoryBySlug } from "../API/api-categories";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8000";

export default function CategoryProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    checkAuth();
    
    window.addEventListener('login', handleLogin);
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

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
        setIsAdmin(userData.role === 1);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const handleLogin = () => {
    checkAuth();
    loadWishlist();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setWishlist([]);
  };

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching category with slug:', slug);
      
      const categoryResponse = await getCategoryBySlug(slug);
      console.log('Category response:', categoryResponse);
      
      const categoryData = categoryResponse?.data;
      
      if (categoryData) {
        setCategory(categoryData);
        setCategoryName(categoryData.name);
        await fetchProducts(categoryData.id);
      } else {
        toast.error('Category not found');
      }
      
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

const fetchProducts = async (categoryId) => {
  try {
    // Remove the token parameter - getProducts doesn't need it
    const res = await getProducts(); // Just call without parameters
    
    // Or if you want to pass params, pass an object:
    // const res = await getProducts({ limit: 50 }); // Optional: add any filters
    
    // Extract products array
    const allProducts = res?.data || res || [];
    
    // Filter products by category ID
    const filtered = allProducts.filter((product) => {
      if (product.category_id) {
        return Number(product.category_id) === Number(categoryId);
      }
      if (product.category?.id) {
        return Number(product.category.id) === Number(categoryId);
      }
      return false;
    });

    // Fetch sizes for each product
    const productsWithSizes = await Promise.all(
      filtered.map(async (product) => {
        try {
          const sizesResponse = await sizeApi.getProductSizes(product.id);
          if (sizesResponse?.data?.sizes) {
            return { ...product, sizes: sizesResponse.data.sizes };
          }
        } catch (error) {
          console.error(`Error fetching sizes for product ${product.id}:`, error);
        }
        return product;
      })
    );

    setProducts(productsWithSizes);
    await loadWishlist();
    
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error("Failed to load products");
  }
};

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          setWishlist(parsed);
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
      const wishlistData = response?.data || response || [];
      setWishlist(wishlistData);
      localStorage.setItem('wishlist', JSON.stringify(wishlistData));
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { count: wishlistData.length } 
      }));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const getImageUrl = (product) => {
    if (product.image_url) return product.image_url;
    
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      if (product.image.startsWith('products/')) {
        return `${API_URL}/storage/${product.image}`;
      }
      return `${API_URL}/storage/products/${product.image}`;
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=400&length=2`;
  };

  const getProductPrice = (product) => {
    if (product?.sizes?.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0;
    }
    return product.selling_price || product.price || 0;
  };

  const getProductOriginalPrice = (product) => {
    if (product?.sizes?.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      if (defaultSize?.original_price) return Number(defaultSize.original_price);
    }
    
    // Check for original price in product
    const possibleFields = ['original_price', 'mrp', 'compare_at_price', 'regular_price', 'old_price'];
    for (const field of possibleFields) {
      if (product[field] && Number(product[field]) > 0) {
        return Number(product[field]);
      }
    }
    return 0;
  };

  const calculateDiscount = (product) => {
    const price = getProductPrice(product);
    const originalPrice = getProductOriginalPrice(product);
    
    if (originalPrice > 0 && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  };

  const isInStock = (product) => {
    if (product?.sizes?.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.stock > 0;
    }
    return (product.stock > 0 || product.qty > 0);
  };

  const getDefaultSizeName = (product) => {
    if (product?.sizes?.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0];
      return defaultSize?.size || null;
    }
    return null;
  };

  const hasMultipleSizes = (product) => {
    return product?.sizes?.length > 1;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const toggleWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to wishlist');
      return;
    }

    const defaultSize = product?.sizes?.[0];
    const isInWishlist = wishlist.some(item => item.id === product.id);

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, defaultSize?.id);
        const updatedWishlist = wishlist.filter(item => item.id !== product.id);
        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: updatedWishlist.length } 
        }));
        toast.success(`❤️ ${product.name} removed from wishlist`);
      } else {
        await addToWishlist(product.id, defaultSize?.size, defaultSize?.id);
        const wishlistResponse = await getWishlist();
        const wishlistData = wishlistResponse?.data || wishlistResponse || [];
        setWishlist(wishlistData);
        localStorage.setItem('wishlist', JSON.stringify(wishlistData));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { count: wishlistData.length } 
        }));
        toast.success(`❤️ ${product.name} added to wishlist`);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsAdmin(false);
      } else {
        toast.error('Failed to update wishlist');
      }
    }
  };

  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('🛒 Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (isAdmin) {
      toast.info('👑 Admin: You cannot add to cart');
      return;
    }
    
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    const defaultSize = product?.sizes?.[0];
    const sizeId = defaultSize?.id || null;
    const sizeName = defaultSize?.size || null;
    
    try {
      const response = await apiAddToCart(product.id, 1, sizeName, sizeId);
      
      if (response?.status === true) {
        toast.success(`🛒 ${product.name}${sizeName ? ` (Size: ${sizeName})` : ''} added to cart`);
        
        // Update cart count
        try {
          const { getCart } = await import('../API/api-cart');
          const cartResponse = await getCart();
          
          if (cartResponse?.data) {
            const cartData = Array.isArray(cartResponse.data) ? cartResponse.data : cartResponse.data.data || [];
            localStorage.setItem('cart', JSON.stringify(cartData));
            const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
              detail: { count: totalItems } 
            }));
          }
        } catch (cartError) {
          console.error('Error updating cart count:', cartError);
        }
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Cart error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsAdmin(false);
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
        return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      case 'price-high':
        return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Container>
        <div className="py-4">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/categories" className="hover:text-blue-600">Categories</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{categoryName}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {categoryName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
                {isAdmin && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    👑 Admin mode - viewing only
                  </p>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
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
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => {
                  const price = getProductPrice(product);
                  const originalPrice = getProductOriginalPrice(product);
                  const discount = calculateDiscount(product);
                  const sizeName = getDefaultSizeName(product);
                  const inStock = isInStock(product);
                  const isInWishlist = wishlist.some(item => item.id === product.id);

                  return (
                    <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                      <Link to={`/products/${product.id}`} className="block">
                        {/* Image */}
                        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
                          >
                            {isInWishlist ? (
                              <HeartIconSolid className={`w-5 h-5 ${isAdmin ? 'text-gray-400' : 'text-red-500'}`} />
                            ) : (
                              <HeartIcon className={`w-5 h-5 ${isAdmin ? 'text-gray-400' : 'text-gray-600 hover:text-red-500'} transition-colors`} />
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

                        {/* Product Info */}
                        <div className="p-5">
                          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {categoryName}
                          </span>

                          <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {product.name}
                          </h3>

                          {sizeName && (
                            <div className="mt-1">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Size: {sizeName}
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="mt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(price)}
                              </span>
                              {originalPrice > 0 && originalPrice > price && !isAdmin && (
                                <span className="text-sm text-gray-400 line-through">
                                  {formatCurrency(originalPrice)}
                                </span>
                              )}
                            </div>
                            
                            {hasMultipleSizes(product) && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                +{product.sizes.length - 1} more sizes
                              </p>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button 
                            className={`w-full mt-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                              !inStock || isAdmin
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
                            }`}
                            onClick={(e) => addToCart(product, e)}
                            disabled={isAdmin || !inStock || addingToCart[product.id]}
                          >
                            {addingToCart[product.id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Adding...</span>
                              </>
                            ) : isAdmin ? (
                              'Admin View'
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
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Results Count */}
              <div className="mt-8 text-center text-sm text-gray-500">
                Showing {displayedProducts.length} of {products.length} products
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}